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
    physical_state: str = "excelente"  # excelente, bueno, regular, malo, critico
    brand: Optional[str] = ""
    model: Optional[str] = ""
    serial_number: Optional[str] = ""
    tags: List[str] = []


class AssetUpdate(BaseModel):
    """Schema for updating an asset."""
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    physical_state: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
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
    physical_state: str
    brand: str
    model: str
    serial_number: str
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


class MaintenanceCreate(BaseModel):
    """Schema for scheduling a new maintenance."""
    asset_id: str
    type: str  # "preventivo", "correctivo"
    title: str
    description: str = ""
    scheduled_date: datetime
    responsible: str
    estimated_cost: float = Field(ge=0, default=0)


class MaintenanceUpdate(BaseModel):
    """Schema for updating a maintenance job."""
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    responsible: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    status: Optional[str] = None  # "pendiente", "en_progreso", "completado", "cancelado"
    notes: Optional[str] = None
    completed_date: Optional[datetime] = None


class MaintenanceResponse(BaseModel):
    """Schema for returning maintenance details."""
    id: str
    user_id: str
    asset_id: str
    asset_name: str
    type: str
    title: str
    description: str
    scheduled_date: datetime
    responsible: str
    estimated_cost: float
    actual_cost: float
    status: str
    notes: str
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
