from datetime import datetime, timezone
from typing import List, Optional
from app.database import get_database


async def log_action(user_id: str, action: str, details: str = "") -> dict:
    """Insert a new action into the audit logs."""
    db = get_database()
    now = datetime.now(timezone.utc)

    doc = {
        "user_id": user_id,
        "action": action,
        "details": details,
        "timestamp": now,
    }

    await db.audit_logs.insert_one(doc)
    return doc


async def get_audit_logs(
    user_id: str,
    action: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[dict]:
    """Get audit logs for a tenant/user."""
    db = get_database()
    query = {"user_id": user_id}

    if action:
        query["action"] = action

    cursor = db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = []
    async for log in cursor:
        log["id"] = str(log["_id"])
        logs.append(log)
    return logs


async def get_audit_logs_count(user_id: str) -> int:
    """Get count of audit logs."""
    db = get_database()
    return await db.audit_logs.count_documents({"user_id": user_id})
