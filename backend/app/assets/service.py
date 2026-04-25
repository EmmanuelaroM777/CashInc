from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database


def calculate_double_declining_depreciation(
    initial_investment: float,
    salvage_value: float,
    useful_life_years: int,
    years_elapsed: float,
) -> dict:
    """
    Calculate depreciation using Double Declining Balance method.
    Returns accumulated depreciation and current book value.
    """
    if useful_life_years <= 0:
        return {"accumulated": 0, "current_value": initial_investment}

    rate = 2.0 / useful_life_years  # Double the straight-line rate
    book_value = initial_investment
    accumulated = 0.0
    full_years = int(years_elapsed)
    fractional = years_elapsed - full_years

    for year in range(full_years):
        depreciation = book_value * rate
        # Don't depreciate below salvage value
        if book_value - depreciation < salvage_value:
            depreciation = book_value - salvage_value
        accumulated += depreciation
        book_value -= depreciation
        if book_value <= salvage_value:
            break

    # Fractional year depreciation
    if fractional > 0 and book_value > salvage_value:
        depreciation = book_value * rate * fractional
        if book_value - depreciation < salvage_value:
            depreciation = book_value - salvage_value
        accumulated += depreciation
        book_value -= depreciation

    return {
        "accumulated": round(accumulated, 2),
        "current_value": round(max(book_value, salvage_value), 2),
        "rate": round(rate * 100, 2),
        "monthly": round((initial_investment * rate) / 12, 2),
    }


async def get_asset_financial_data(asset: dict) -> dict:
    """Calculate all financial metrics for an asset."""
    db = get_database()
    asset_id = asset["_id"]

    # Calculate years elapsed
    now = datetime.now(timezone.utc)
    acquisition = asset["acquisition_date"]
    if acquisition.tzinfo is None:
        acquisition = acquisition.replace(tzinfo=timezone.utc)
    years_elapsed = (now - acquisition).days / 365.25

    # Calculate depreciation (double declining balance)
    dep = calculate_double_declining_depreciation(
        initial_investment=asset["initial_investment"],
        salvage_value=asset.get("salvage_value", 0),
        useful_life_years=asset["useful_life_years"],
        years_elapsed=years_elapsed,
    )

    # Get transaction totals from DB
    pipeline = [
        {"$match": {"asset_id": str(asset_id)}},
        {
            "$group": {
                "_id": "$type",
                "total": {"$sum": "$amount"},
            }
        },
    ]
    totals = {}
    async for doc in db.transactions.aggregate(pipeline):
        totals[doc["_id"]] = doc["total"]

    total_maintenance = totals.get("mantenimiento", 0)
    total_operating = totals.get("operativo", 0)
    total_income = totals.get("ingreso", 0)
    total_mejora = totals.get("mejora", 0)

    total_expenses = total_maintenance + total_operating + total_mejora
    net_result = total_income - total_expenses

    # ROI = (Net Result / Initial Investment) * 100
    roi = (net_result / asset["initial_investment"] * 100) if asset["initial_investment"] > 0 else 0

    remaining_life = max(0, asset["useful_life_years"] - years_elapsed)

    return {
        "current_value": dep["current_value"],
        "accumulated_depreciation": dep["accumulated"],
        "depreciation_rate": dep["rate"],
        "monthly_depreciation": dep["monthly"],
        "total_maintenance_cost": round(total_maintenance, 2),
        "total_operating_cost": round(total_operating, 2),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_result": round(net_result, 2),
        "roi": round(roi, 2),
        "remaining_life_years": round(remaining_life, 2),
    }


async def create_asset(user_id: str, asset_data: dict) -> dict:
    """Create a new asset in the database."""
    db = get_database()
    now = datetime.now(timezone.utc)

    doc = {
        "user_id": user_id,
        "name": asset_data["name"],
        "type": asset_data["type"],
        "description": asset_data.get("description", ""),
        "location": asset_data.get("location", ""),
        "acquisition_date": asset_data["acquisition_date"],
        "initial_investment": asset_data["initial_investment"],
        "useful_life_years": asset_data["useful_life_years"],
        "salvage_value": asset_data.get("salvage_value", 0),
        "status": asset_data.get("status", "activo"),
        "tags": asset_data.get("tags", []),
        "created_at": now,
        "updated_at": now,
    }

    result = await db.assets.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_assets(
    user_id: str,
    asset_type: Optional[str] = None,
    asset_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[dict]:
    """Get all assets for a user with optional filters."""
    db = get_database()
    query = {"user_id": user_id}

    if asset_type:
        query["type"] = asset_type
    if asset_status:
        query["status"] = asset_status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.assets.find(query).sort("created_at", -1).skip(skip).limit(limit)
    assets = []
    async for asset in cursor:
        financial = await get_asset_financial_data(asset)
        assets.append({**asset, **financial})
    return assets


async def get_asset_by_id(asset_id: str, user_id: str) -> dict:
    """Get a single asset by ID."""
    db = get_database()
    try:
        asset = await db.assets.find_one(
            {"_id": ObjectId(asset_id), "user_id": user_id}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="ID de activo inválido")

    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    financial = await get_asset_financial_data(asset)
    return {**asset, **financial}


async def update_asset(asset_id: str, user_id: str, update_data: dict) -> dict:
    """Update an asset."""
    db = get_database()

    # Remove None values
    update_fields = {k: v for k, v in update_data.items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db.assets.update_one(
        {"_id": ObjectId(asset_id), "user_id": user_id},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    return await get_asset_by_id(asset_id, user_id)


async def delete_asset(asset_id: str, user_id: str) -> bool:
    """Delete an asset and its related transactions, budgets, and alerts."""
    db = get_database()

    result = await db.assets.delete_one(
        {"_id": ObjectId(asset_id), "user_id": user_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    # Clean up related data
    await db.transactions.delete_many({"asset_id": asset_id})
    await db.budgets.delete_many({"asset_id": asset_id})
    await db.alerts.delete_many({"asset_id": asset_id})

    return True


async def get_assets_count(user_id: str) -> int:
    """Get total count of assets for a user."""
    db = get_database()
    return await db.assets.count_documents({"user_id": user_id})
