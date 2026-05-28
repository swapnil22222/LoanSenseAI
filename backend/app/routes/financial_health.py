"""
Financial health assessment route: POST /financial-health
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.health_service import compute_financial_health

router = APIRouter(tags=["Financial Health"])


class FinancialHealthRequest(BaseModel):
    salary: float = Field(..., gt=0, description="Monthly salary")
    existing_loans: float = Field(..., ge=0, description="Total existing loans")
    credit_score: int = Field(..., ge=300, le=850)
    monthly_expenses: float = Field(..., ge=0, description="Total monthly expenses")
    savings: float = Field(0, ge=0, description="Total savings")


@router.post("/financial-health")
def assess_financial_health(request: FinancialHealthRequest):
    """
    Assess financial health across multiple dimensions.
    Returns overall_score, dimensions array, and metrics array.
    """
    try:
        result = compute_financial_health(
            salary=request.salary,
            existing_loans=request.existing_loans,
            credit_score=request.credit_score,
            monthly_expenses=request.monthly_expenses,
            savings=request.savings,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Health assessment failed: {str(e)}"
        )
