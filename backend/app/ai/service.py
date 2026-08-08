import urllib.request
import json
import random
import string
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from app.database import get_database
from app.config import settings


async def get_predictive_analysis(user_id: str, asset_id: str) -> dict:
    """Generate future value and maintenance projections based on physical wear and model math."""
    db = get_database()
    try:
        asset = await db.assets.find_one({"_id": ObjectId(asset_id), "user_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="ID de activo inválido")
    if not asset:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    from app.assets.service import get_asset_financial_data
    financial = await get_asset_financial_data(asset)

    # Adjust degradation rate based on physical state
    state = asset.get("physical_state", "excelente").lower()
    wear_multiplier = 1.0
    if state == "bueno":
        wear_multiplier = 1.15
    elif state == "regular":
        wear_multiplier = 1.35
    elif state == "malo":
        wear_multiplier = 1.70
    elif state == "critico":
        wear_multiplier = 2.30

    projections = []
    initial_investment = asset["initial_investment"]
    salvage_value = asset.get("salvage_value", 0)
    useful_life = asset["useful_life_years"]
    
    # Calculate wear-scaled double declining rate
    rate = (2.0 / useful_life) * wear_multiplier
    current_val = initial_investment
    
    for year in range(1, 11):
        depr_amount = current_val * rate
        if current_val - depr_amount < salvage_value:
            depr_amount = current_val - salvage_value
        current_val = max(current_val - depr_amount, salvage_value)
        
        # Extrapolate maintenance costs (increases compounding with age/wear)
        est_annual_maint = initial_investment * 0.02 * (1.12 ** (year - 1)) * wear_multiplier
        
        projections.append({
            "year": year,
            "projected_value": round(current_val, 2),
            "estimated_maintenance_cost": round(est_annual_maint, 2),
            "accumulated_depreciation": round(initial_investment - current_val, 2)
        })

    # Estimate actual remaining life in years
    remaining_life = max(1, round(useful_life / wear_multiplier))
        
    return {
        "asset_name": asset["name"],
        "physical_state": state,
        "wear_multiplier": wear_multiplier,
        "predicted_replacement_year": remaining_life,
        "current_roi": financial["roi"],
        "projections": projections,
        "recommendation": (
            "El activo se encuentra en excelente estado físico. Mantener cronograma preventivo estándar."
            if state == "excelente" else
            "El activo tiene un desgaste leve. Se aconseja mantenimiento preventivo regular."
            if state == "bueno" else
            "Desgaste moderado. Incrementar frecuencia de mantenimiento preventivo para evitar fallas críticas."
            if state == "regular" else
            "El activo presenta deterioro severo. Planificar reemplazo preventivo a corto plazo."
            if state == "malo" else
            "ESTADO CRÍTICO. Se recomienda detener operaciones y reemplazar el activo de inmediato para mitigar pérdidas."
        )
    }


async def get_anomaly_detection(user_id: str) -> List[dict]:
    """Identify outlying transactions that exceed normal expenditure categories."""
    db = get_database()
    cursor = db.transactions.find({"user_id": user_id})
    txs = []
    async for tx in cursor:
        tx["id"] = str(tx["_id"])
        txs.append(tx)

    if not txs:
        return []

    # Calculate average amount by category
    category_amounts = {}
    for tx in txs:
        cat = tx.get("category", "otros")
        category_amounts.setdefault(cat, []).append(tx["amount"])

    category_stats = {}
    for cat, amounts in category_amounts.items():
        avg = sum(amounts) / len(amounts)
        category_stats[cat] = {
            "avg": avg,
            "threshold": avg * 1.8
        }

    anomalies = []
    for tx in txs:
        cat = tx.get("category", "otros")
        stats = category_stats[cat]
        amount = tx["amount"]
        
        # High value anomaly
        if amount > stats["threshold"] or amount > 25000:
            anomalies.append({
                "transaction_id": tx["id"],
                "asset_name": tx.get("asset_name", "Desconocido"),
                "category": cat,
                "amount": amount,
                "date": tx["date"],
                "description": tx.get("description", ""),
                "reason": (
                    f"El monto de ${amount:,.2f} excede significativamente el promedio de la categoría '{cat}' (${stats['avg']:,.2f})"
                    if amount > stats["threshold"] else f"Gasto único inusualmente alto en la plataforma (${amount:,.2f})"
                ),
                "severity": "alta" if amount > 50000 else "media"
            })
            
    return anomalies


async def query_chatbot(user_id: str, prompt: str) -> str:
    """Connect chatbot queries to real live DB context or OpenAI/Gemini APIs."""
    db = get_database()
    
    # 1. Fetch user data context
    assets_count = await db.assets.count_documents({"user_id": user_id})
    active_alerts = await db.alerts.count_documents({"user_id": user_id, "dismissed": False})
    
    assets_cursor = db.assets.find({"user_id": user_id}).limit(5)
    assets_list = []
    async for a in assets_cursor:
        assets_list.append(f"- {a['name']} ({a['type']}, estado: {a.get('physical_state', 'excelente')})")
        
    recent_txs_cursor = db.transactions.find({"user_id": user_id}).sort("date", -1).limit(3)
    tx_list = []
    async for tx in recent_txs_cursor:
        tx_list.append(f"- {tx.get('asset_name', 'Activo')}: {tx['type']} por ${tx['amount']:,.2f} ({tx.get('category', '')})")
        
    context_str = (
        f"Información de la cuenta del usuario:\n"
        f"- Total de activos: {assets_count}\n"
        f"- Alertas activas: {active_alerts}\n"
        f"- Algunos activos:\n" + ("\n".join(assets_list) if assets_list else "- Sin activos registrados") + "\n"
        f"- Transacciones recientes:\n" + ("\n".join(tx_list) if tx_list else "- Sin transacciones recientes") + "\n"
    )

    # 2. Call Google Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            
            system_instruction = (
                "Eres EMAI, el asistente virtual experto de InfraControl. "
                "Responde a la consulta del usuario basándote en los datos de su empresa expuestos abajo. "
                "Sé claro, profesional, y da recomendaciones inteligentes sobre ROI, depreciación, y optimización de infraestructura. "
                "Responde en español y usa formato Markdown."
            )
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\nContexto de la cuenta:\n{context_str}\n\nPregunta: {prompt}"}
                        ]
                    }
                ]
            }
            
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            
            with urllib.request.urlopen(req, timeout=8) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Error calling Gemini API: {e}")

    # 3. Fallback Smart keyword search
    p_lower = prompt.lower()
    if "activo" in p_lower or "inventario" in p_lower:
        return (
            f"📊 **Análisis de Activos en Vivo:**\n\n"
            f"Actualmente tienes registrados **{assets_count} activos**. "
            f"Aquí tienes los principales:\n" + "\n".join(assets_list) + "\n\n"
            f"¿Te gustaría que analice la depreciación o vida útil de alguno de ellos?"
        )
    elif "alerta" in p_lower or "problema" in p_lower or "desviacion" in p_lower:
        return (
            f"🔔 **Centro de Alertas:**\n\n"
            f"Hay **{active_alerts} alertas activas** en tu cuenta. "
            f"Puedes ver la lista detallada y descartarlas desde el panel de *Alertas*."
        )
    elif "mantenimiento" in p_lower or "mantenimientos" in p_lower or "reparar" in p_lower:
        maint_count = await db.maintenances.count_documents({"user_id": user_id, "status": "pendiente"})
        return (
            f"🛠️ **Estado de Mantenimientos:**\n\n"
            f"Tienes **{maint_count} tareas de mantenimiento pendientes** de ejecutar.\n"
            f"Recuerda que al completar un mantenimiento e ingresar su costo real, la plataforma generará un gasto automático e incrementará el ROI del activo de manera inmediata."
        )
    elif "gasto" in p_lower or "finanza" in p_lower or "roi" in p_lower or "depreciacion" in p_lower:
        return (
            f"💸 **Resumen Financiero:**\n\n"
            f"Tus movimientos recientes son:\n" + "\n".join(tx_list) + "\n\n"
            f"Puedes consultar gráficos de depreciación y flujos mensuales en el *Dashboard* y *Finanzas*."
        )
    else:
        return (
            f"👋 ¡Hola! Soy **EMAI**, tu consultor de infraestructura.\n\n"
            f"Veo que tienes **{assets_count} activos** y **{active_alerts} alertas** pendientes.\n"
            f"¿Tienes alguna duda sobre tus presupuestos, costos de mantenimiento o depreciaciones?"
        )
