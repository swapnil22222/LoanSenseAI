"""
Credit improvement recommendations route: POST /credit-improvement
Supports simulate and goal modes.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.recommendation_service import simulate_improvement, compute_goal

router = APIRouter(tags=["Recommendations"])


class RecommendationRequest(BaseModel):
    # Core inputs
    salary: float = Field(..., gt=0)
    existing_loans: float = Field(..., ge=0)
    credit_score: int = Field(..., ge=300, le=850)
    loan_amount: float = Field(..., gt=0)
    loan_duration: int = Field(12, ge=1, le=360)
    employment_years: float = Field(0, ge=0)

    # Mode selection
    mode: str = Field("simulate", pattern="^(simulate|goal)$")

    # Simulation params (used when mode=simulate)
    new_credit_score: Optional[int] = Field(None, ge=300, le=850)
    new_salary: Optional[float] = Field(None, gt=0)
    new_existing_loans: Optional[float] = Field(None, ge=0)

    # Goal params (used when mode=goal)
    target_approval: Optional[float] = Field(None, ge=0, le=100)


class RecommendedAction(BaseModel):
    action: str
    impact: str
    priority: str


class SimulateResponse(BaseModel):
    current_approval: float
    potential_approval: float
    improvement: float
    current_risk: str
    potential_risk: str
    recommended_actions: list[RecommendedAction]


class GoalResponse(BaseModel):
    target_approval: float
    required_salary: float
    maximum_debt: float
    minimum_credit_score: int
    current_salary: float
    current_debt: float
    current_credit_score: int


@router.post("/credit-improvement")
def credit_improvement(request: RecommendationRequest):
    """
    Get credit improvement recommendations.

    - simulate mode: shows how proposed changes affect approval probability
    - goal mode: calculates what changes are needed to reach a target approval %
    """
    try:
        if request.mode == "simulate":
            result = simulate_improvement(
                salary=request.salary,
                existing_loans=request.existing_loans,
                credit_score=request.credit_score,
                loan_amount=request.loan_amount,
                loan_duration=request.loan_duration,
                employment_years=request.employment_years,
                new_credit_score=request.new_credit_score,
                new_salary=request.new_salary,
                new_existing_loans=request.new_existing_loans,
            )
            return result

        elif request.mode == "goal":
            target = request.target_approval if request.target_approval is not None else 75.0
            result = compute_goal(
                salary=request.salary,
                existing_loans=request.existing_loans,
                credit_score=request.credit_score,
                loan_amount=request.loan_amount,
                loan_duration=request.loan_duration,
                employment_years=request.employment_years,
                target_approval=target,
            )
            return result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Recommendation failed: {str(e)}"
        )
