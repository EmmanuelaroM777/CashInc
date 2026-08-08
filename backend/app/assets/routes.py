from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth.service import get_current_user, require_admin
from app.assets.schemas import AssetCreate, AssetUpdate, AssetResponse, AssetSummary
from app.assets.service import (
    create_asset,
    get_assets,
    get_asset_by_id,
    update_asset,
    delete_asset,
    get_asset_financial_data,
    get_assets_count,
)

router = APIRouter()


@router.get("")
async def list_assets(
    type: Optional[str] = Query(None, description="Filtrar por tipo"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    search: Optional[str] = Query(None, description="Buscar por nombre/descripción"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List all assets with optional filters. Available to all authenticated users."""
    assets = await get_assets(
        user_id=current_user["tenant_id"],
        asset_type=type,
        asset_status=status,
        search=search,
        skip=skip,
        limit=limit,
    )
    total = await get_assets_count(current_user["tenant_id"])

    return {
        "assets": [
            AssetResponse(
                id=str(a["_id"]),
                user_id=a["user_id"],
                name=a["name"],
                type=a["type"],
                description=a["description"],
                location=a["location"],
                acquisition_date=a["acquisition_date"],
                initial_investment=a["initial_investment"],
                useful_life_years=a["useful_life_years"],
                salvage_value=a["salvage_value"],
                status=a["status"],
                physical_state=a["physical_state"],
                brand=a["brand"],
                model=a["model"],
                serial_number=a["serial_number"],
                tags=a["tags"],
                current_value=a["current_value"],
                accumulated_depreciation=a["accumulated_depreciation"],
                total_maintenance_cost=a["total_maintenance_cost"],
                total_operating_cost=a["total_operating_cost"],
                total_income=a["total_income"],
                roi=a["roi"],
                created_at=a["created_at"],
                updated_at=a["updated_at"],
            )
            for a in assets
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{asset_id}")
async def get_asset(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single asset by ID. Available to all authenticated users."""
    asset = await get_asset_by_id(asset_id, current_user["tenant_id"])
    return AssetResponse(
        id=str(asset["_id"]),
        user_id=asset["user_id"],
        name=asset["name"],
        type=asset["type"],
        description=asset["description"],
        location=asset["location"],
        acquisition_date=asset["acquisition_date"],
        initial_investment=asset["initial_investment"],
        useful_life_years=asset["useful_life_years"],
        salvage_value=asset["salvage_value"],
        status=asset["status"],
        physical_state=asset["physical_state"],
        brand=asset["brand"],
        model=asset["model"],
        serial_number=asset["serial_number"],
        tags=asset["tags"],
        current_value=asset["current_value"],
        accumulated_depreciation=asset["accumulated_depreciation"],
        total_maintenance_cost=asset["total_maintenance_cost"],
        total_operating_cost=asset["total_operating_cost"],
        total_income=asset["total_income"],
        roi=asset["roi"],
        created_at=asset["created_at"],
        updated_at=asset["updated_at"],
    )


@router.get("/{asset_id}/summary")
async def get_asset_summary(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get financial summary for an asset. Available to all authenticated users."""
    asset = await get_asset_by_id(asset_id, current_user["tenant_id"])
    return AssetSummary(
        asset_id=str(asset["_id"]),
        asset_name=asset["name"],
        initial_investment=asset["initial_investment"],
        current_value=asset["current_value"],
        accumulated_depreciation=asset["accumulated_depreciation"],
        depreciation_rate=asset.get("depreciation_rate", 0),
        total_expenses=asset.get("total_expenses", 0),
        total_income=asset["total_income"],
        net_result=asset.get("net_result", 0),
        roi=asset["roi"],
        monthly_depreciation=asset.get("monthly_depreciation", 0),
        remaining_life_years=asset.get("remaining_life_years", 0),
    )


@router.post("", status_code=201)
async def create_new_asset(
    asset_data: AssetCreate,
    current_user: dict = Depends(require_admin),
):
    """Create a new asset. Admin only."""
    asset = await create_asset(current_user["tenant_id"], asset_data.model_dump())
    financial = await get_asset_financial_data(asset)
    return AssetResponse(
        id=str(asset["_id"]),
        user_id=asset["user_id"],
        name=asset["name"],
        type=asset["type"],
        description=asset["description"],
        location=asset["location"],
        acquisition_date=asset["acquisition_date"],
        initial_investment=asset["initial_investment"],
        useful_life_years=asset["useful_life_years"],
        salvage_value=asset["salvage_value"],
        status=asset["status"],
        physical_state=asset.get("physical_state", "excelente"),
        brand=asset.get("brand", ""),
        model=asset.get("model", ""),
        serial_number=asset.get("serial_number", ""),
        tags=asset["tags"],
        current_value=financial["current_value"],
        accumulated_depreciation=financial["accumulated_depreciation"],
        total_maintenance_cost=financial["total_maintenance_cost"],
        total_operating_cost=financial["total_operating_cost"],
        total_income=financial["total_income"],
        roi=financial["roi"],
        created_at=asset["created_at"],
        updated_at=asset["updated_at"],
    )


@router.put("/{asset_id}")
async def update_existing_asset(
    asset_id: str,
    asset_data: AssetUpdate,
    current_user: dict = Depends(require_admin),
):
    """Update an asset. Admin only."""
    asset = await update_asset(asset_id, current_user["tenant_id"], asset_data.model_dump())
    return AssetResponse(
        id=str(asset["_id"]),
        user_id=asset["user_id"],
        name=asset["name"],
        type=asset["type"],
        description=asset["description"],
        location=asset["location"],
        acquisition_date=asset["acquisition_date"],
        initial_investment=asset["initial_investment"],
        useful_life_years=asset["useful_life_years"],
        salvage_value=asset["salvage_value"],
        status=asset["status"],
        physical_state=asset["physical_state"],
        brand=asset["brand"],
        model=asset["model"],
        serial_number=asset["serial_number"],
        tags=asset["tags"],
        current_value=asset["current_value"],
        accumulated_depreciation=asset["accumulated_depreciation"],
        total_maintenance_cost=asset["total_maintenance_cost"],
        total_operating_cost=asset["total_operating_cost"],
        total_income=asset["total_income"],
        roi=asset["roi"],
        created_at=asset["created_at"],
        updated_at=asset["updated_at"],
    )


@router.delete("/{asset_id}")
async def delete_existing_asset(
    asset_id: str,
    current_user: dict = Depends(require_admin),
):
    """Delete an asset. Admin only."""
    await delete_asset(asset_id, current_user["tenant_id"])
    return {"message": "Activo eliminado correctamente"}
