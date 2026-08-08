from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from fastapi import HTTPException, status
from app.database import get_database


async def create_maintenance(user_id: str, data: dict) -> dict:
    """Create a new maintenance job for an asset."""
    db = get_database()
    now = datetime.now(timezone.utc)

    # Validate asset exists for user
    try:
        asset = await db.assets.find_one({"_id": ObjectId(data["asset_id"]), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="ID de activo inválido")

    if not asset:
        raise HTTPException(status_code=404, detail="El activo especificado no existe o no tiene permisos")

    doc = {
        "user_id": user_id,
        "asset_id": data["asset_id"],
        "asset_name": asset["name"],
        "type": data["type"],  # "preventivo" o "correctivo"
        "title": data["title"],
        "description": data.get("description", ""),
        "scheduled_date": data["scheduled_date"],
        "responsible": data["responsible"],
        "estimated_cost": float(data.get("estimated_cost", 0)),
        "actual_cost": 0.0,
        "status": "pendiente",  # "pendiente", "en_progreso", "completado", "cancelado"
        "notes": "",
        "completed_date": None,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.maintenances.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    # Register audit log
    from app.audit.service import log_action
    await log_action(
        user_id=user_id,
        action="mantenimiento_creado",
        details=f"Programado mantenimiento {doc['type']} para '{doc['asset_name']}': {doc['title']}"
    )

    return doc


async def get_maintenances(
    user_id: str,
    asset_id: Optional[str] = None,
    maintenance_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[dict]:
    """Get list of maintenance jobs for a user with optional filters."""
    db = get_database()
    query = {"user_id": user_id}

    if asset_id:
        query["asset_id"] = asset_id
    if maintenance_status:
        query["status"] = maintenance_status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"responsible": {"$regex": search, "$options": "i"}},
            {"asset_name": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.maintenances.find(query).sort("scheduled_date", 1).skip(skip).limit(limit)
    maintenances = []
    async for m in cursor:
        m["id"] = str(m["_id"])
        maintenances.append(m)
    return maintenances


async def get_maintenance_by_id(maintenance_id: str, user_id: str) -> dict:
    """Get single maintenance job by ID."""
    db = get_database()
    try:
        m = await db.maintenances.find_one({"_id": ObjectId(maintenance_id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mantenimiento inválido")

    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    m["id"] = str(m["_id"])
    return m


async def update_maintenance(maintenance_id: str, user_id: str, update_data: dict) -> dict:
    """Update a maintenance job. Links completed costs to finances."""
    db = get_database()
    now = datetime.now(timezone.utc)

    # Clean None fields
    update_fields = {k: v for k, v in update_data.items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    try:
        m = await db.maintenances.find_one({"_id": ObjectId(maintenance_id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mantenimiento inválido")

    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    was_pending = m.get("status") != "completado"
    is_completing = update_fields.get("status") == "completado"

    update_fields["updated_at"] = now
    if is_completing and was_pending:
        update_fields["completed_date"] = now
        # Fall back actual cost to estimated if not supplied
        actual_cost = float(update_fields.get("actual_cost") or m.get("estimated_cost") or 0)
        update_fields["actual_cost"] = actual_cost

        # Automatic Integration: Insert a transaction for the cost of completed maintenance
        tx_doc = {
            "user_id": user_id,
            "asset_id": m["asset_id"],
            "asset_name": m["asset_name"],
            "type": "mantenimiento",
            "category": "mantenimiento_" + m["type"],
            "amount": actual_cost,
            "date": now,
            "description": f"Mantenimiento completado: {m['title']}",
            "recurring": False,
            "created_at": now
        }
        await db.transactions.insert_one(tx_doc)

        # Trigger audit log
        from app.audit.service import log_action
        await log_action(
            user_id=user_id,
            action="mantenimiento_completado",
            details=f"Completado mantenimiento '{m['title']}' en '{m['asset_name']}' con costo de ${actual_cost:.2f}"
        )

    await db.maintenances.update_one(
        {"_id": ObjectId(maintenance_id), "user_id": user_id},
        {"$set": update_fields}
    )

    return await get_maintenance_by_id(maintenance_id, user_id)


async def delete_maintenance(maintenance_id: str, user_id: str) -> bool:
    """Delete a maintenance job."""
    db = get_database()
    try:
        m = await db.maintenances.find_one({"_id": ObjectId(maintenance_id), "user_id": user_id})
        if not m:
            raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

        result = await db.maintenances.delete_one({"_id": ObjectId(maintenance_id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="ID de mantenimiento inválido")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    # Log action
    from app.audit.service import log_action
    await log_action(
        user_id=user_id,
        action="mantenimiento_eliminado",
        details=f"Eliminado mantenimiento programado '{m['title']}' para '{m['asset_name']}'"
    )

    return True


async def get_maintenances_count(user_id: str) -> int:
    """Get total count of maintenance tasks."""
    db = get_database()
    return await db.maintenances.count_documents({"user_id": user_id})
