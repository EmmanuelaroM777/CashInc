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
                msg = f"El activo '{asset['name']}' ha perdido el {dep_pct:.0f}% de su valor por depreciación."
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "asset_id": str(asset["_id"]),
                    "type": "depreciacion_alta",
                    "severity": "media",
                    "message": msg,
                    "dismissed": False,
                    "created_at": datetime.now(timezone.utc),
                })
                await send_external_notification(user_id, "media", msg)


async def generate_budget_alerts(user_id: str):
    """Generate alerts for budgets exceeding threshold limits."""
    db = get_database()
    cursor = db.budgets.find({"user_id": user_id})
    async for b in cursor:
        planned = b["planned_amount"]
        spent = b["spent_amount"]
        pct = (spent / planned * 100) if planned > 0 else 0

        # Critical Overdraft Alert (>= 100%)
        if pct >= 100:
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "budget_id": str(b["_id"]),
                "type": "presupuesto_excedido",
                "dismissed": False
            })
            if not existing:
                msg = f"El presupuesto '{b['name']}' ha sido excedido (${spent:,.2f} / ${planned:,.2f})."
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "budget_id": str(b["_id"]),
                    "type": "presupuesto_excedido",
                    "severity": "alta",
                    "message": msg,
                    "dismissed": False,
                    "created_at": datetime.now(timezone.utc)
                })
                await send_external_notification(user_id, "alta", msg)

        # Warning Alert (>= 85% and < 100%)
        elif pct >= 85:
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "budget_id": str(b["_id"]),
                "type": "presupuesto_limite",
                "dismissed": False
            })
            if not existing:
                msg = f"El presupuesto '{b['name']}' ha consumido el {pct:.0f}% de su límite (${spent:,.2f} / ${planned:,.2f})."
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "budget_id": str(b["_id"]),
                    "type": "presupuesto_limite",
                    "severity": "media",
                    "message": msg,
                    "dismissed": False,
                    "created_at": datetime.now(timezone.utc)
                })
                await send_external_notification(user_id, "media", msg)


async def generate_maintenance_alerts(user_id: str):
    """Generate alerts for late or upcoming physical asset maintenance."""
    db = get_database()
    now = datetime.now(timezone.utc)
    cursor = db.maintenances.find({"user_id": user_id, "status": "pendiente"})
    async for m in cursor:
        sched_date = m["scheduled_date"]
        if sched_date.tzinfo is None:
            sched_date = sched_date.replace(tzinfo=timezone.utc)

        # Overdue maintenance alert
        if sched_date < now:
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "maintenance_id": str(m["_id"]),
                "type": "mantenimiento_atrasado",
                "dismissed": False
            })
            if not existing:
                msg = f"El mantenimiento '{m['title']}' para el activo '{m['asset_name']}' está atrasado."
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "maintenance_id": str(m["_id"]),
                    "type": "mantenimiento_atrasado",
                    "severity": "alta",
                    "message": msg,
                    "dismissed": False,
                    "created_at": now
                })
                await send_external_notification(user_id, "alta", msg)

        # Upcoming in less than 2 days
        elif sched_date < now + timedelta(days=2):
            existing = await db.alerts.find_one({
                "user_id": user_id,
                "maintenance_id": str(m["_id"]),
                "type": "mantenimiento_proximo",
                "dismissed": False
            })
            if not existing:
                msg = f"El mantenimiento '{m['title']}' para '{m['asset_name']}' está programado para pronto ({sched_date.strftime('%Y-%m-%d')})."
                await db.alerts.insert_one({
                    "user_id": user_id,
                    "maintenance_id": str(m["_id"]),
                    "type": "mantenimiento_proximo",
                    "severity": "media",
                    "message": msg,
                    "dismissed": False,
                    "created_at": now
                })
                await send_external_notification(user_id, "media", msg)


async def generate_expense_alerts(user_id: str):
    """Generate alerts for out of range expenses flagged as anomalies."""
    db = get_database()
    from app.ai.service import get_anomaly_detection
    anomalies = await get_anomaly_detection(user_id)
    
    for anom in anomalies:
        existing = await db.alerts.find_one({
            "user_id": user_id,
            "transaction_id": anom["transaction_id"],
            "type": "gasto_anomalo",
            "dismissed": False
        })
        if not existing:
            msg = f"Alerta Gasto Anómalo: {anom['reason']} en el activo '{anom['asset_name']}'."
            await db.alerts.insert_one({
                "user_id": user_id,
                "transaction_id": anom["transaction_id"],
                "type": "gasto_anomalo",
                "severity": anom["severity"],
                "message": msg,
                "dismissed": False,
                "created_at": datetime.now(timezone.utc)
            })
            await send_external_notification(user_id, anom["severity"], msg)


async def run_all_alert_checks(user_id: str):
    """Run all background check calculations to generate alerts in real time."""
    await generate_depreciation_alerts(user_id)
    await generate_budget_alerts(user_id)
    await generate_maintenance_alerts(user_id)
    await generate_expense_alerts(user_id)


async def send_external_notification(user_id: str, severity: str, message: str):
    """Sends real email (SMTP) and Twilio WhatsApp notifications if secrets are set, otherwise logs to console."""
    import os
    import urllib.request
    import urllib.parse
    import base64
    from bson import ObjectId
    
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return
        
    email_dest = user.get("email")
    phone_dest = user.get("phone", "")

    # Email notification (SMTP)
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if smtp_server and smtp_user and smtp_password and email_dest:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.header import Header
            
            msg = MIMEText(message, 'plain', 'utf-8')
            msg['Subject'] = Header(f"⚠️ Alerta Crítica de InfraControl - {severity.upper()}", 'utf-8')
            msg['From'] = smtp_user
            msg['To'] = email_dest
            
            s = smtplib.SMTP(smtp_server, int(smtp_port))
            s.starttls()
            s.login(smtp_user, smtp_password)
            s.sendmail(smtp_user, [email_dest], msg.as_string())
            s.quit()
            print(f"📧 [NOTIFICATION EMAIL SENT] to {email_dest}")
        except Exception as e:
            print(f"Failed to send email alert: {e}")
            
    # WhatsApp notification (Twilio)
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO") or (f"whatsapp:{phone_dest}" if phone_dest else None)
    
    if twilio_sid and twilio_token and whatsapp_to:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            auth_str = f"{twilio_sid}:{twilio_token}"
            encoded_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            
            data = urllib.parse.urlencode({
                "From": twilio_from,
                "To": whatsapp_to,
                "Body": f"⚠️ *Alerta de InfraControl ({severity.upper()})*\n\n{message}"
            }).encode("utf-8")
            
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Authorization", f"Basic {encoded_auth}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            
            with urllib.request.urlopen(req, timeout=5) as response:
                print(f"💬 [NOTIFICATION WHATSAPP SENT] to {whatsapp_to}")
        except Exception as e:
            print(f"Failed to send WhatsApp alert: {e}")
            
    print(f"📢 [EXTERNAL NOTIFICATION LOG] (Severity: {severity}) Destination: {email_dest} - Msg: {message}")
