"""
Financial health assessment route: POST /financial-health
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.health_service import compute_financial_health

router = APIRouter(tags=["Financial Health"])


class FinancialHealthRequest(BaseModel):
    salary: float = Field(..., gt=0, description="Annual salary")
    existing_loans: float = Field(..., ge=0, description="Monthly EMI for existing loans")
    credit_score: int = Field(..., ge=300, le=850)
    monthly_expenses: float = Field(..., ge=0, description="Total monthly expenses")
    savings: float = Field(0, ge=0, description="Total savings")
    assets: float = Field(0, ge=0, description="Total asset value")


class FinancialHealthResponse(BaseModel):
    income_stability: float
    debt_ratio: float
    credit_history: float
    risk_score: float
    overall_score: float


@router.post("/financial-health", response_model=FinancialHealthResponse)
def assess_financial_health(request: FinancialHealthRequest):
    """
    Assess financial health across multiple dimensions.

    Returns scores (0-100) for income stability, debt ratio,
    credit history, risk, and an overall composite score.
    """
    try:
        result = compute_financial_health(
            salary=request.salary,
            existing_loans=request.existing_loans,
            credit_score=request.credit_score,
            monthly_expenses=request.monthly_expenses,
            savings=request.savings,
            assets=request.assets,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Health assessment failed: {str(e)}"
        )
