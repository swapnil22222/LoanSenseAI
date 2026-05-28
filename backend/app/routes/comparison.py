"""
Loan comparison route: POST /loan-compare
Compares eligibility across different loan types.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ml.predict import predict_eligibility
from app.services.emi_service import calculate_emi

router = APIRouter(tags=["Comparison"])


class ComparisonRequest(BaseModel):
    salary: float = Field(..., gt=0)
    existing_loans: float = Field(..., ge=0)
    credit_score: int = Field(..., ge=300, le=850)
    loan_amount: float = Field(..., gt=0)
    employment_years: float = Field(0, ge=0)


class LoanTypeComparison(BaseModel):
    loan_type: str
    approval_chance: float
    risk_level: str
    interest_rate: float
    emi: float
    total_payment: float
    max_tenure_months: int


class ComparisonResponse(BaseModel):
    comparisons: list[LoanTypeComparison]


# Loan type configurations
LOAN_TYPES = {
    "Home Loan": {
        "rate_low": 7.5, "rate_med": 9.0, "rate_high": 11.0,
        "tenure": 240, "multiplier": 1.0,
    },
    "Car Loan": {
        "rate_low": 8.5, "rate_med": 10.5, "rate_high": 13.0,
        "tenure": 84, "multiplier": 0.4,
    },
    "Education Loan": {
        "rate_low": 8.0, "rate_med": 10.0, "rate_high": 12.5,
        "tenure": 120, "multiplier": 0.6,
    },
    "Personal Loan": {
        "rate_low": 10.5, "rate_med": 14.0, "rate_high": 18.0,
        "tenure": 60, "multiplier": 0.25,
    },
}


@router.post("/loan-compare", response_model=ComparisonResponse)
def compare_loans(request: ComparisonRequest):
    """
    Compare loan eligibility across Home, Car, Education, and Personal loan types.
    Each type has different interest rates, tenures, and typical loan amounts.
    """
    try:
        comparisons = []

        for loan_type, config in LOAN_TYPES.items():
            # Adjust loan amount based on loan type
            adjusted_amount = request.loan_amount * config["multiplier"]

            result = predict_eligibility(
                salary=request.salary,
                existing_loans=request.existing_loans,
                credit_score=request.credit_score,
                loan_amount=adjusted_amount,
                loan_duration=config["tenure"],
                employment_years=request.employment_years,
            )

            # Select interest rate based on risk
            risk = result["risk_category"]
            if risk == "Low":
                rate = config["rate_low"]
            elif risk == "Medium":
                rate = config["rate_med"]
            else:
                rate = config["rate_high"]

            emi = calculate_emi(adjusted_amount, rate, config["tenure"])
            total_payment = round(emi * config["tenure"], 2)

            comparisons.append(
                LoanTypeComparison(
                    loan_type=loan_type,
                    approval_chance=result["approval_probability"],
                    risk_level=risk,
                    interest_rate=rate,
                    emi=emi,
                    total_payment=total_payment,
                    max_tenure_months=config["tenure"],
                )
            )

        # Sort by approval chance descending
        comparisons.sort(key=lambda x: x.approval_chance, reverse=True)

        return ComparisonResponse(comparisons=comparisons)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
