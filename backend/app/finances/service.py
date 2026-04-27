from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database


# ─────────────────────────────── TRANSACTIONS ───────────────────────────────


async def create_transaction(user_id: str, data: dict) -> dict:
    """Create a new transaction."""
    db = get_database()

    # Verify asset exists
    asset = await db.assets.find_one({"_id": ObjectId(data["asset_id"])})
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    doc = {
        "user_id": user_id,
        "asset_id": data["asset_id"],
        "type": data["type"],
        "category": data.get("category", ""),
        "amount": data["amount"],
        "date": data["date"],
        "description": data.get("description", ""),
        "recurring": data.get("recurring", False),
        "frequency": data.get("frequency"),
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.transactions.insert_one(doc)
    doc["_id"] = result.inserted_id
    doc["asset_name"] = asset["name"]

    # Check budget alerts
    await check_budget_alerts(user_id, data["asset_id"])

    return doc


async def get_transactions(
    user_id: str,
    asset_id: Optional[str] = None,
    tx_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[dict]:
    """Get transactions with optional filters."""
    db = get_database()
    query = {"user_id": user_id}

    if asset_id:
        query["asset_id"] = asset_id
    if tx_type:
        query["type"] = tx_type
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter

    cursor = db.transactions.find(query).sort("date", -1).skip(skip).limit(limit)
    transactions = []

    async for tx in cursor:
        # Get asset name
        asset = await db.assets.find_one({"_id": ObjectId(tx["asset_id"])})
        tx["asset_name"] = asset["name"] if asset else "Activo eliminado"
        transactions.append(tx)

    return transactions


async def delete_transaction(tx_id: str, user_id: str) -> bool:
    """Delete a transaction."""
    db = get_database()
    result = await db.transactions.delete_one(
        {"_id": ObjectId(tx_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return True


# ─────────────────────────────── BUDGETS ───────────────────────────────


async def create_budget(user_id: str, data: dict) -> dict:
    """Create a new budget."""
    db = get_database()

    doc = {
        "user_id": user_id,
        "asset_id": data.get("asset_id"),
        "name": data["name"],
        "year": data["year"],
        "month": data.get("month"),
        "planned_amount": data["planned_amount"],
        "category": data.get("category", ""),
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.budgets.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_budgets(
    user_id: str,
    year: Optional[int] = None,
    asset_id: Optional[str] = None,
) -> List[dict]:
    """Get budgets with optional filters."""
    db = get_database()
    query = {"user_id": user_id}

    if year:
        query["year"] = year
    if asset_id:
        query["asset_id"] = asset_id

    cursor = db.budgets.find(query).sort("created_at", -1)
    budgets = []

    async for budget in cursor:
        # Calculate spent amount
        spent = await calculate_budget_spent(budget)
        budget["spent_amount"] = spent
        budget["remaining"] = budget["planned_amount"] - spent
        budget["usage_percentage"] = round(
            (spent / budget["planned_amount"] * 100) if budget["planned_amount"] > 0 else 0, 2
        )

        # Get asset name if linked
        if budget.get("asset_id"):
            asset = await db.assets.find_one({"_id": ObjectId(budget["asset_id"])})
            budget["asset_name"] = asset["name"] if asset else "Activo eliminado"
        else:
            budget["asset_name"] = None

        budgets.append(budget)

    return budgets


async def delete_budget(budget_id: str, user_id: str) -> bool:
    """Delete a budget."""
    db = get_database()
    result = await db.budgets.delete_one(
        {"_id": ObjectId(budget_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return True


async def calculate_budget_spent(budget: dict) -> float:
    """Calculate how much of a budget has been spent."""
    db = get_database()

    # Build date range for the budget period
    year = budget["year"]
    month = budget.get("month")

    date_query = {}
    if month:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        date_query = {"date": {"$gte": start, "$lt": end}}
    else:
        start = datetime(year, 1, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        date_query = {"date": {"$gte": start, "$lt": end}}

    query = {
        "user_id": budget["user_id"],
        "type": {"$in": ["mantenimiento", "operativo", "mejora"]},
        **date_query,
    }

    if budget.get("asset_id"):
        query["asset_id"] = budget["asset_id"]
    if budget.get("category"):
        query["category"] = budget["category"]

    pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]

    async for doc in db.transactions.aggregate(pipeline):
        return doc["total"]

    return 0


# ─────────────────────────────── FINANCIAL SUMMARY ───────────────────────────────


async def get_financial_summary(user_id: str) -> dict:
    """Get global financial summary for dashboard."""
    db = get_database()

    # Assets summary
    assets_cursor = db.assets.find({"user_id": user_id})
    total_investment = 0
    total_current_value = 0
    total_depreciation = 0
    asset_count = 0
    total_roi = 0

    from app.assets.service import get_asset_financial_data

    asset_costs = []
    async for asset in assets_cursor:
        financial = await get_asset_financial_data(asset)
        total_investment += asset["initial_investment"]
        total_current_value += financial["current_value"]
        total_depreciation += financial["accumulated_depreciation"]
        total_roi += financial["roi"]
        asset_count += 1
        asset_costs.append({
            "name": asset["name"],
            "total_cost": financial["total_expenses"],
            "roi": financial["roi"],
        })

    avg_roi = round(total_roi / asset_count, 2) if asset_count > 0 else 0

    # Transaction summary
    expense_pipeline = [
        {"$match": {"user_id": user_id, "type": {"$in": ["mantenimiento", "operativo", "mejora"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    total_expenses = 0
    async for doc in db.transactions.aggregate(expense_pipeline):
        total_expenses = doc["total"]

    income_pipeline = [
        {"$match": {"user_id": user_id, "type": "ingreso"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    total_income = 0
    async for doc in db.transactions.aggregate(income_pipeline):
        total_income = doc["total"]

    # Monthly data (expenses + income, last 12 months)
    monthly_exp_pipeline = [
        {"$match": {"user_id": user_id, "type": {"$in": ["mantenimiento", "operativo", "mejora"]}}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"},
                },
                "total": {"$sum": "$amount"},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    monthly_inc_pipeline = [
        {"$match": {"user_id": user_id, "type": "ingreso"}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"},
                },
                "total": {"$sum": "$amount"},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]

    # Collect expenses by month
    monthly_map = {}
    async for doc in db.transactions.aggregate(monthly_exp_pipeline):
        key = (doc["_id"]["year"], doc["_id"]["month"])
        monthly_map[key] = {"year": key[0], "month": key[1], "expenses": round(doc["total"], 2), "income": 0}

    # Merge income by month
    async for doc in db.transactions.aggregate(monthly_inc_pipeline):
        key = (doc["_id"]["year"], doc["_id"]["month"])
        if key in monthly_map:
            monthly_map[key]["income"] = round(doc["total"], 2)
        else:
            monthly_map[key] = {"year": key[0], "month": key[1], "expenses": 0, "income": round(doc["total"], 2)}

    monthly_expenses = [v for k, v in sorted(monthly_map.items())]

    # Expenses by category
    category_pipeline = [
        {"$match": {"user_id": user_id, "type": {"$in": ["mantenimiento", "operativo", "mejora"]}}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    expenses_by_category = []
    async for doc in db.transactions.aggregate(category_pipeline):
        expenses_by_category.append({
            "category": doc["_id"],
            "total": round(doc["total"], 2),
        })

    # Budget usage
    budgets = await get_budgets(user_id, year=datetime.now().year)
    total_planned = sum(b["planned_amount"] for b in budgets)
    total_spent = sum(b["spent_amount"] for b in budgets)
    budget_usage = round(
        (total_spent / total_planned * 100) if total_planned > 0 else 0, 2
    )

    # Top assets by cost
    asset_costs.sort(key=lambda x: x["total_cost"], reverse=True)

    return {
        "total_investment": round(total_investment, 2),
        "total_current_value": round(total_current_value, 2),
        "total_depreciation": round(total_depreciation, 2),
        "total_expenses": round(total_expenses, 2),
        "total_income": round(total_income, 2),
        "net_result": round(total_income - total_expenses, 2),
        "average_roi": avg_roi,
        "total_assets": asset_count,
        "budget_usage_percentage": budget_usage,
        "monthly_expenses": monthly_expenses,
        "expenses_by_category": expenses_by_category,
        "top_assets_by_cost": asset_costs[:5],
    }


# ─────────────────────────────── VIABILITY ───────────────────────────────


async def analyze_viability(user_id: str, asset_id: str, discount_rate: float = 0.10) -> dict:
    """Perform financial viability analysis for an asset."""
    db = get_database()

    asset = await db.assets.find_one(
        {"_id": ObjectId(asset_id), "user_id": user_id}
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    # Get all transactions for this asset
    income_pipeline = [
        {"$match": {"asset_id": asset_id, "type": "ingreso"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    expense_pipeline = [
        {"$match": {"asset_id": asset_id, "type": {"$in": ["mantenimiento", "operativo", "mejora"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]

    total_income = 0
    income_count = 0
    async for doc in db.transactions.aggregate(income_pipeline):
        total_income = doc["total"]
        income_count = doc["count"]

    total_expenses = 0
    expense_count = 0
    async for doc in db.transactions.aggregate(expense_pipeline):
        total_expenses = doc["total"]
        expense_count = doc["count"]

    # Calculate months since acquisition
    now = datetime.now(timezone.utc)
    acq = asset["acquisition_date"]
    if acq.tzinfo is None:
        acq = acq.replace(tzinfo=timezone.utc)
    months_elapsed = max(1, (now - acq).days / 30.44)

    # Monthly averages
    monthly_income = total_income / months_elapsed if months_elapsed > 0 else 0
    monthly_expense = total_expenses / months_elapsed if months_elapsed > 0 else 0
    monthly_cash_flow = monthly_income - monthly_expense

    # Payback period
    if monthly_cash_flow > 0:
        payback_months = asset["initial_investment"] / monthly_cash_flow
    else:
        payback_months = float("inf")

    # Simple NPV calculation (Net Present Value)
    project_months = asset["useful_life_years"] * 12
    monthly_discount_rate = discount_rate / 12
    npv = -asset["initial_investment"]

    for month in range(1, int(project_months) + 1):
        npv += monthly_cash_flow / ((1 + monthly_discount_rate) ** month)

    npv = round(npv, 2)
    is_viable = npv > 0

    if is_viable:
        recommendation = "El activo es financieramente viable. El VAN es positivo, lo que indica que generará valor."
    elif monthly_cash_flow > 0:
        recommendation = "El activo genera flujo positivo pero el VAN es negativo. Considere optimizar costos o incrementar ingresos."
    else:
        recommendation = "El activo no es viable financieramente. Los costos superan los ingresos. Se recomienda reevaluar la estrategia."

    return {
        "asset_id": asset_id,
        "asset_name": asset["name"],
        "initial_investment": asset["initial_investment"],
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_present_value": npv,
        "payback_period_months": round(payback_months, 1) if payback_months != float("inf") else -1,
        "monthly_cash_flow": round(monthly_cash_flow, 2),
        "is_viable": is_viable,
        "recommendation": recommendation,
    }


# ─────────────────────────────── ALERTS ───────────────────────────────


async def check_budget_alerts(user_id: str, asset_id: str):
    """Check if any budget has been exceeded and create alerts."""
    db = get_database()

    budgets = await get_budgets(user_id, asset_id=asset_id)

    for budget in budgets:
        if budget["usage_percentage"] >= 100:
            # Check if alert already exists
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "asset_id": asset_id,
                "type": "sobrecosto",
                "dismissed": False,
                "related_budget": str(budget["_id"]),
            })
            if not existing:
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "asset_id": asset_id,
                    "type": "sobrecosto",
                    "severity": "alta",
                    "message": f"El presupuesto '{budget['name']}' ha sido superado. Uso: {budget['usage_percentage']}%",
                    "dismissed": False,
                    "related_budget": str(budget["_id"]),
                    "created_at": datetime.now(timezone.utc),
                })
        elif budget["usage_percentage"] >= 80:
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "asset_id": asset_id,
                "type": "presupuesto_alto",
                "dismissed": False,
                "related_budget": str(budget["_id"]),
            })
            if not existing:
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "asset_id": asset_id,
                    "type": "presupuesto_alto",
                    "severity": "media",
                    "message": f"El presupuesto '{budget['name']}' está al {budget['usage_percentage']}% de uso.",
                    "dismissed": False,
                    "related_budget": str(budget["_id"]),
                    "created_at": datetime.now(timezone.utc),
                })
