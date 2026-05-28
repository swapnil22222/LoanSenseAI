"""
Eligibility prediction route: POST /predict
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.prediction_service import run_prediction

router = APIRouter(tags=["Eligibility"])


class PredictionRequest(BaseModel):
    salary: float = Field(..., gt=0, description="Annual salary in INR")
    existing_loans: float = Field(..., ge=0, description="Total existing loan EMI per month")
    credit_score: int = Field(..., ge=300, le=850, description="Credit score (300-850)")
    loan_amount: float = Field(..., gt=0, description="Requested loan amount")
    loan_duration: int = Field(12, ge=1, le=360, description="Loan tenure in months")
    employment_years: float = Field(0, ge=0, description="Years of employment")


class PredictionFeatures(BaseModel):
    debt_ratio: float
    income_stability: float
    credit_utilization: float
    loan_to_income: float


class PredictionResponse(BaseModel):
    id: int
    approval_probability: float
    risk_category: str
    recommended_emi: float
    suggested_loan_amount: float
    features: PredictionFeatures


@router.post("/predict", response_model=PredictionResponse)
def predict_eligibility(request: PredictionRequest, db: Session = Depends(get_db)):
    """
    Predict loan eligibility using the trained ML model.

    Returns approval probability (0-100), risk category, recommended EMI,
    and a suggested loan amount the applicant can comfortably repay.
    """
    try:
        result = run_prediction(
            salary=request.salary,
            existing_loans=request.existing_loans,
            credit_score=request.credit_score,
            loan_amount=request.loan_amount,
            loan_duration=request.loan_duration,
            employment_years=request.employment_years,
            db=db,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
