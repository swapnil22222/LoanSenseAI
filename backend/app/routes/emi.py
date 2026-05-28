"""
EMI calculation route: POST /emi
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.emi_service import compute_emi_details

router = APIRouter(tags=["EMI"])


class EMIRequest(BaseModel):
    principal: float = Field(..., gt=0, description="Loan principal amount")
    interest_rate: float = Field(..., ge=0, le=50, description="Annual interest rate (%)")
    tenure_months: int = Field(..., ge=1, le=360, description="Loan tenure in months")


class AmortizationEntry(BaseModel):
    month: int
    emi: float
    principal_component: float
    interest_component: float
    remaining_balance: float


class TenureComparison(BaseModel):
    tenure_months: int
    emi: float
    total_payment: float
    total_interest: float


class EMIResponse(BaseModel):
    emi_amount: float
    total_payment: float
    total_interest: float
    amortization_schedule: list[AmortizationEntry]
    tenure_comparison: list[TenureComparison]


@router.post("/emi", response_model=EMIResponse)
def calculate_emi(request: EMIRequest):
    """
    Calculate EMI, total payment, interest, amortization schedule,
    and tenure comparison for different loan terms.
    """
    try:
        result = compute_emi_details(
            principal=request.principal,
            interest_rate=request.interest_rate,
            tenure_months=request.tenure_months,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EMI calculation failed: {str(e)}")
