from fastapi import APIRouter, Depends, Query, Body
from typing import Optional
from app.auth.service import get_current_user, require_admin
from app.ai.service import (
    get_predictive_analysis,
    get_anomaly_detection,
    query_chatbot,
)

router = APIRouter()


@router.get("/predictive/{asset_id}")
async def predictive_analysis(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get wear-scaled financial depreciation and maintenance projections for an asset."""
    analysis = await get_predictive_analysis(current_user["tenant_id"], asset_id)
    return analysis


@router.get("/anomalies")
async def anomaly_detection(
    current_user: dict = Depends(require_admin),
):
    """Detect outlier transactions exceeding historical categories. Admin only."""
    anomalies = await get_anomaly_detection(current_user["tenant_id"])
    return {"anomalies": anomalies}


@router.post("/chatbot")
async def chatbot_query(
    payload: dict = Body(..., example={"prompt": "Recomendaciones para mis activos"}),
    current_user: dict = Depends(get_current_user),
):
    """Query EMAI chatbot for context-aware assistance."""
    prompt = payload.get("prompt", "")
    response = await query_chatbot(current_user["tenant_id"], prompt)
    return {"response": response}
