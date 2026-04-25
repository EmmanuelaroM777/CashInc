from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime
from app.auth.service import get_current_user, require_admin
from app.finances.schemas import (
    TransactionCreate,
    TransactionResponse,
    BudgetCreate,
    BudgetResponse,
    FinancialSummary,
    ViabilityAnalysis,
)
from app.finances.service import (
    create_transaction,
    get_transactions,
    delete_transaction,
    create_budget,
    get_budgets,
    delete_budget,
    get_financial_summary,
    analyze_viability,
)

router = APIRouter()


# ─────────────────────────────── TRANSACTIONS ───────────────────────────────


@router.post("/transactions", status_code=201)
async def add_transaction(
    data: TransactionCreate,
    current_user: dict = Depends(require_admin),
):
    """Create a new transaction. Admin only."""
    tx = await create_transaction(current_user["tenant_id"], data.model_dump())
    return TransactionResponse(
        id=str(tx["_id"]),
        asset_id=tx["asset_id"],
        asset_name=tx["asset_name"],
        user_id=tx["user_id"],
        type=tx["type"],
        category=tx["category"],
        amount=tx["amount"],
        date=tx["date"],
        description=tx["description"],
        recurring=tx["recurring"],
        frequency=tx.get("frequency"),
        created_at=tx["created_at"],
    )


@router.get("/transactions")
async def list_transactions(
    asset_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """List transactions with optional filters. Available to all users."""
    txs = await get_transactions(
        user_id=current_user["tenant_id"],
        asset_id=asset_id,
        tx_type=type,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    return [
        TransactionResponse(
            id=str(tx["_id"]),
            asset_id=tx["asset_id"],
            asset_name=tx["asset_name"],
            user_id=tx["user_id"],
            type=tx["type"],
            category=tx["category"],
            amount=tx["amount"],
            date=tx["date"],
            description=tx["description"],
            recurring=tx["recurring"],
            frequency=tx.get("frequency"),
            created_at=tx["created_at"],
        )
        for tx in txs
    ]


@router.delete("/transactions/{tx_id}")
async def remove_transaction(
    tx_id: str,
    current_user: dict = Depends(require_admin),
):
    """Delete a transaction. Admin only."""
    await delete_transaction(tx_id, current_user["tenant_id"])
    return {"message": "Transacción eliminada correctamente"}


# ─────────────────────────────── BUDGETS ───────────────────────────────


@router.post("/budgets", status_code=201)
async def add_budget(
    data: BudgetCreate,
    current_user: dict = Depends(require_admin),
):
    """Create a new budget. Admin only."""
    budget = await create_budget(current_user["tenant_id"], data.model_dump())
    return {
        "id": str(budget["_id"]),
        "message": "Presupuesto creado correctamente",
    }


@router.get("/budgets")
async def list_budgets(
    year: Optional[int] = Query(None),
    asset_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List budgets with optional filters. Available to all users."""
    budgets = await get_budgets(
        user_id=current_user["tenant_id"],
        year=year,
        asset_id=asset_id,
    )
    return [
        BudgetResponse(
            id=str(b["_id"]),
            user_id=b["user_id"],
            asset_id=b.get("asset_id"),
            asset_name=b.get("asset_name"),
            name=b["name"],
            year=b["year"],
            month=b.get("month"),
            planned_amount=b["planned_amount"],
            spent_amount=b["spent_amount"],
            remaining=b["remaining"],
            usage_percentage=b["usage_percentage"],
            category=b.get("category", ""),
            created_at=b["created_at"],
        )
        for b in budgets
    ]


@router.delete("/budgets/{budget_id}")
async def remove_budget(
    budget_id: str,
    current_user: dict = Depends(require_admin),
):
    """Delete a budget. Admin only."""
    await delete_budget(budget_id, current_user["tenant_id"])
    return {"message": "Presupuesto eliminado correctamente"}


# ─────────────────────────────── SUMMARY & ANALYSIS ───────────────────────────────


@router.get("/summary", response_model=FinancialSummary)
async def financial_summary(
    current_user: dict = Depends(get_current_user),
):
    """Get global financial summary. Available to all users."""
    return await get_financial_summary(current_user["tenant_id"])


@router.get("/viability/{asset_id}", response_model=ViabilityAnalysis)
async def viability_analysis(
    asset_id: str,
    discount_rate: float = Query(0.10, description="Tasa de descuento anual"),
    current_user: dict = Depends(get_current_user),
):
    """Analyze financial viability of an asset. Available to all users."""
    return await analyze_viability(current_user["tenant_id"], asset_id, discount_rate)
