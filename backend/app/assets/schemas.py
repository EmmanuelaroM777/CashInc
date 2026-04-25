from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class AssetCreate(BaseModel):
    """Schema for creating a new asset."""
    name: str
    type: str  # "edificio", "maquinaria", "sucursal", "proyecto", "equipo", "instalacion"
    description: str = ""
    location: str = ""
    acquisition_date: datetime
    initial_investment: float = Field(gt=0)
    useful_life_years: int = Field(gt=0)
    salvage_value: float = Field(ge=0, default=0)
    status: str = "activo"  # activo, inactivo, en_mantenimiento
    tags: List[str] = []


class AssetUpdate(BaseModel):
    """Schema for updating an asset."""
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    salvage_value: Optional[float] = None


class AssetResponse(BaseModel):
    """Schema for asset response with computed financial data."""
    id: str
    user_id: str
    name: str
    type: str
    description: str
    location: str
    acquisition_date: datetime
    initial_investment: float
    useful_life_years: int
    salvage_value: float
    status: str
    tags: List[str]
    current_value: float
    accumulated_depreciation: float
    total_maintenance_cost: float
    total_operating_cost: float
    total_income: float
    roi: float
    created_at: datetime
    updated_at: datetime


class AssetSummary(BaseModel):
    """Schema for a financial summary of an asset."""
    asset_id: str
    asset_name: str
    initial_investment: float
    current_value: float
    accumulated_depreciation: float
    depreciation_rate: float
    total_expenses: float
    total_income: float
    net_result: float
    roi: float
    monthly_depreciation: float
    remaining_life_years: float
