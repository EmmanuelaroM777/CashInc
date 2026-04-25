from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime
from app.auth.service import get_current_user
from app.reports.service import (
    get_comparison_report,
    get_period_report,
    get_top_assets,
    export_report_excel,
    export_report_pdf,
)

router = APIRouter()


@router.get("/comparison")
async def comparison_report(
    asset_ids: Optional[str] = Query(None, description="Comma-separated asset IDs"),
    current_user: dict = Depends(get_current_user),
):
    """Get comparison report for multiple assets."""
    ids = asset_ids.split(",") if asset_ids else None
    return await get_comparison_report(current_user["tenant_id"], ids)


@router.get("/period")
async def period_report(
    start_date: datetime = Query(..., description="Fecha de inicio"),
    end_date: datetime = Query(..., description="Fecha de fin"),
    current_user: dict = Depends(get_current_user),
):
    """Get financial report for a specific period."""
    return await get_period_report(current_user["tenant_id"], start_date, end_date)


@router.get("/top-assets")
async def top_assets_report(
    metric: str = Query("roi", description="Metric to rank by: roi, total_expenses, net_result"),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    """Get top assets by a specific metric."""
    return await get_top_assets(current_user["tenant_id"], metric, limit)


@router.get("/export/excel")
async def export_excel(
    report_type: str = Query("comparison", description="comparison or period"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Export report as Excel file."""
    kwargs = {}
    if start_date:
        kwargs["start_date"] = start_date
    if end_date:
        kwargs["end_date"] = end_date

    output = await export_report_excel(current_user["tenant_id"], report_type, **kwargs)
    filename = f"infracontrol_reporte_{report_type}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/export/pdf")
async def export_pdf(
    report_type: str = Query("comparison", description="comparison or period"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Export report as PDF file."""
    kwargs = {}
    if start_date:
        kwargs["start_date"] = start_date
    if end_date:
        kwargs["end_date"] = end_date

    output = await export_report_pdf(current_user["tenant_id"], report_type, **kwargs)
    filename = f"infracontrol_reporte_{report_type}_{datetime.now().strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
