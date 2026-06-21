from datetime import datetime, timezone
from typing import List
# pyrefly: ignore [missing-import]
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database


async def get_alerts(user_id: str, dismissed: bool = False) -> List[dict]:
    """Get all alerts for a user."""
    db = get_database()
    cursor = db.alerts.find(
        {"user_id": user_id, "dismissed": dismissed}
    ).sort("created_at", -1)

    alerts = []
    async for alert in cursor:
        # Get asset name
        asset_name = None
        if alert.get("asset_id"):
            asset = await db.assets.find_one({"_id": ObjectId(alert["asset_id"])})
            asset_name = asset["name"] if asset else "Activo eliminado"

        alerts.append({
            "id": str(alert["_id"]),
            "user_id": alert["user_id"],
            "asset_id": alert.get("asset_id"),
            "asset_name": asset_name,
            "type": alert["type"],
            "severity": alert["severity"],
            "message": alert["message"],
            "dismissed": alert["dismissed"],
            "created_at": alert["created_at"],
        })

    return alerts


async def dismiss_alert(alert_id: str, user_id: str) -> bool:
    """Dismiss an alert."""
    db = get_database()
    result = await db.alerts.update_one(
        {"_id": ObjectId(alert_id), "user_id": user_id},
        {"$set": {"dismissed": True, "dismissed_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return True


async def get_alert_count(user_id: str) -> int:
    """Get count of active (non-dismissed) alerts."""
    db = get_database()
    return await db.alerts.count_documents(
        {"user_id": user_id, "dismissed": False}
    )


async def generate_depreciation_alerts(user_id: str):
    """Generate alerts for assets with high depreciation (>80% of value lost)."""
    db = get_database()
    from app.assets.service import get_asset_financial_data

    async for asset in db.assets.find({"user_id": user_id, "status": "activo"}):
        financial = await get_asset_financial_data(asset)
        dep_pct = (
            financial["accumulated_depreciation"] / asset["initial_investment"] * 100
            if asset["initial_investment"] > 0
            else 0
        )

        if dep_pct >= 80:
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "asset_id": str(asset["_id"]),
                "type": "depreciacion_alta",
                "dismissed": False,
            })
            if not existing:
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "asset_id": str(asset["_id"]),
                    "type": "depreciacion_alta",
                    "severity": "media",
                    "message": f"El activo '{asset['name']}' ha perdido el {dep_pct:.0f}% de su valor por depreciación.",
                    "dismissed": False,
                    "created_at": datetime.now(timezone.utc),
                })
