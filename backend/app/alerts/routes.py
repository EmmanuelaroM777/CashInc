from fastapi import APIRouter, Depends, Query
from app.auth.service import get_current_user, require_admin
from app.alerts.service import get_alerts, dismiss_alert, get_alert_count, generate_depreciation_alerts

router = APIRouter()


@router.get("")
async def list_alerts(
    dismissed: bool = Query(False, description="Mostrar alertas descartadas"),
    current_user: dict = Depends(get_current_user),
):
    """List all alerts. Available to all users."""
    alerts = await get_alerts(current_user["tenant_id"], dismissed)
    count = await get_alert_count(current_user["tenant_id"])
    return {
        "alerts": alerts,
        "active_count": count,
    }


@router.put("/{alert_id}/dismiss")
async def dismiss(
    alert_id: str,
    current_user: dict = Depends(require_admin),
):
    """Dismiss an alert. Admin only."""
    await dismiss_alert(alert_id, current_user["tenant_id"])
    return {"message": "Alerta descartada"}


@router.post("/check-depreciation")
async def check_depreciation(
    current_user: dict = Depends(get_current_user),
):
    """Manually trigger depreciation alert check."""
    await generate_depreciation_alerts(current_user["tenant_id"])
    return {"message": "Verificación de depreciación completada"}


@router.get("/count")
async def alert_count(
    current_user: dict = Depends(get_current_user),
):
    """Get count of active alerts."""
    count = await get_alert_count(current_user["tenant_id"])
    return {"count": count}
