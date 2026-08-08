from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth.service import get_current_user, require_admin
from app.audit.service import get_audit_logs, get_audit_logs_count

router = APIRouter()


@router.get("")
async def list_audit_logs(
    action: Optional[str] = Query(None, description="Filtrar por tipo de acción"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin),  # Only admins can view audit logs
):
    """List administrative and financial audit logs. Admin only."""
    logs = await get_audit_logs(
        user_id=current_user["tenant_id"],
        action=action,
        skip=skip,
        limit=limit,
    )
    total = await get_audit_logs_count(current_user["tenant_id"])

    return {
        "logs": [
            {
                "id": log["id"],
                "user_id": log["user_id"],
                "action": log["action"],
                "details": log["details"],
                "timestamp": log["timestamp"],
            }
            for log in logs
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }
