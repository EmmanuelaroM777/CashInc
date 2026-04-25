from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class TransactionCreate(BaseModel):
    """Schema for creating a new transaction."""
    asset_id: str
    type: str  # "mantenimiento", "operativo", "ingreso", "mejora"
    category: str = ""
    amount: float = Field(gt=0)
    date: datetime
    description: str = ""
    recurring: bool = False
    frequency: Optional[str] = None  # "mensual", "trimestral", "anual"


class TransactionResponse(BaseModel):
    """Schema for transaction response."""
    id: str
    asset_id: str
    asset_name: str
    user_id: str
    type: str
    category: str
    amount: float
    date: datetime
    description: str
    recurring: bool
    frequency: Optional[str]
    created_at: datetime


class BudgetCreate(BaseModel):
    """Schema for creating a new budget."""
    asset_id: Optional[str] = None  # None = global budget
    name: str
    year: int
    month: Optional[int] = None
    planned_amount: float = Field(gt=0)
    category: str = ""


class BudgetResponse(BaseModel):
    """Schema for budget response."""
    id: str
    user_id: str
    asset_id: Optional[str]
    asset_name: Optional[str]
    name: str
    year: int
    month: Optional[int]
    planned_amount: float
    spent_amount: float
    remaining: float
    usage_percentage: float
    category: str
    created_at: datetime


class FinancialSummary(BaseModel):
    """Schema for global financial summary."""
    total_investment: float
    total_current_value: float
    total_depreciation: float
    total_expenses: float
    total_income: float
    net_result: float
    average_roi: float
    total_assets: int
    budget_usage_percentage: float
    monthly_expenses: List[dict]
    expenses_by_category: List[dict]
    top_assets_by_cost: List[dict]


class ViabilityAnalysis(BaseModel):
    """Schema for financial viability analysis."""
    asset_id: str
    asset_name: str
    initial_investment: float
    total_income: float
    total_expenses: float
    net_present_value: float
    payback_period_months: float
    monthly_cash_flow: float
    is_viable: bool
    recommendation: str
