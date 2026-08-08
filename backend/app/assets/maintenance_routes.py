from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from app.auth.service import get_current_user
from app.assets.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.assets.maintenance_service import (
    create_maintenance,
    get_maintenances,
    get_maintenance_by_id,
    update_maintenance,
    delete_maintenance,
    get_maintenances_count,
)

router = APIRouter()


@router.post("", status_code=201)
async def schedule_maintenance(
    data: MaintenanceCreate,
    current_user: dict = Depends(get_current_user),
):
    """Schedule a new maintenance job. Available to all authenticated users (workers/admin)."""
    # Note: Workers can request/schedule maintenance, admin will verify or complete it
    m = await create_maintenance(current_user["tenant_id"], data.model_dump())
    return MaintenanceResponse(
        id=str(m["_id"]),
        user_id=m["user_id"],
        asset_id=m["asset_id"],
        asset_name=m["asset_name"],
        type=m["type"],
        title=m["title"],
        description=m["description"],
        scheduled_date=m["scheduled_date"],
        responsible=m["responsible"],
        estimated_cost=m["estimated_cost"],
        actual_cost=m["actual_cost"],
        status=m["status"],
        notes=m["notes"],
        completed_date=m["completed_date"],
        created_at=m["created_at"],
        updated_at=m["updated_at"],
    )


@router.get("")
async def list_maintenances(
    asset_id: Optional[str] = Query(None, description="Filtrar por ID de activo"),
    status: Optional[str] = Query(None, description="Filtrar por estado (pendiente, completado, etc.)"),
    search: Optional[str] = Query(None, description="Buscar por título, responsable o activo"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List maintenance tasks with filters."""
    maintenances = await get_maintenances(
        user_id=current_user["tenant_id"],
        asset_id=asset_id,
        maintenance_status=status,
        search=search,
        skip=skip,
        limit=limit,
    )
    total = await get_maintenances_count(current_user["tenant_id"])

    return {
        "maintenances": [
            MaintenanceResponse(
                id=str(m["_id"]),
                user_id=m["user_id"],
                asset_id=m["asset_id"],
                asset_name=m["asset_name"],
                type=m["type"],
                title=m["title"],
                description=m["description"],
                scheduled_date=m["scheduled_date"],
                responsible=m["responsible"],
                estimated_cost=m["estimated_cost"],
                actual_cost=m["actual_cost"],
                status=m["status"],
                notes=m["notes"],
                completed_date=m["completed_date"],
                created_at=m["created_at"],
                updated_at=m["updated_at"],
            )
            for m in maintenances
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
async def get_maintenance(
    maintenance_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a single maintenance job."""
    m = await get_maintenance_by_id(maintenance_id, current_user["tenant_id"])
    return MaintenanceResponse(
        id=str(m["_id"]),
        user_id=m["user_id"],
        asset_id=m["asset_id"],
        asset_name=m["asset_name"],
        type=m["type"],
        title=m["title"],
        description=m["description"],
        scheduled_date=m["scheduled_date"],
        responsible=m["responsible"],
        estimated_cost=m["estimated_cost"],
        actual_cost=m["actual_cost"],
        status=m["status"],
        notes=m["notes"],
        completed_date=m["completed_date"],
        created_at=m["created_at"],
        updated_at=m["updated_at"],
    )


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
async def update_existing_maintenance(
    maintenance_id: str,
    data: MaintenanceUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a maintenance task. Can be used to change status, set actual cost, add notes, etc."""
    m = await update_maintenance(maintenance_id, current_user["tenant_id"], data.model_dump(exclude_unset=True))
    return MaintenanceResponse(
        id=str(m["_id"]),
        user_id=m["user_id"],
        asset_id=m["asset_id"],
        asset_name=m["asset_name"],
        type=m["type"],
        title=m["title"],
        description=m["description"],
        scheduled_date=m["scheduled_date"],
        responsible=m["responsible"],
        estimated_cost=m["estimated_cost"],
        actual_cost=m["actual_cost"],
        status=m["status"],
        notes=m["notes"],
        completed_date=m["completed_date"],
        created_at=m["created_at"],
        updated_at=m["updated_at"],
    )


@router.delete("/{maintenance_id}")
async def remove_maintenance(
    maintenance_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a scheduled maintenance job."""
    await delete_maintenance(maintenance_id, current_user["tenant_id"])
    return {"message": "Mantenimiento eliminado con éxito"}
