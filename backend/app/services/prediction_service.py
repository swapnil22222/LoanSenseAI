"""
Prediction service: orchestrates ML prediction and database persistence.
"""

from sqlalchemy.orm import Session

from app.ml.predict import predict_eligibility
from app.database.models import LoanApplication


def run_prediction(
    salary: float,
    existing_loans: float,
    credit_score: int,
    loan_amount: float,
    loan_duration: int,
    employment_years: float,
    db: Session,
) -> dict:
    """
    Run the ML prediction, save to database, and return results.
    """
    # Get prediction from ML model
    result = predict_eligibility(
        salary=salary,
        existing_loans=existing_loans,
        credit_score=credit_score,
        loan_amount=loan_amount,
        loan_duration=loan_duration,
        employment_years=employment_years,
    )

    features = result["features"]

    # Save to database
    application = LoanApplication(
        salary=salary,
        existing_loans=existing_loans,
        credit_score=credit_score,
        loan_amount=loan_amount,
        loan_duration=loan_duration,
        employment_years=employment_years,
        debt_ratio=features["debt_ratio"],
        income_stability=features["income_stability"],
        credit_utilization=features["credit_utilization"],
        loan_to_income=features["loan_to_income"],
        approval_probability=result["approval_probability"],
        risk_category=result["risk_category"],
        recommended_emi=result["recommended_emi"],
        suggested_loan_amount=result["suggested_loan_amount"],
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "id": application.id,
        "approval_probability": result["approval_probability"],
        "risk_category": result["risk_category"],
        "recommended_emi": result["recommended_emi"],
        "suggested_loan_amount": result["suggested_loan_amount"],
        "features": {
            "debt_ratio": features["debt_ratio"],
            "income_stability": features["income_stability"],
            "credit_utilization": features["credit_utilization"],
            "loan_to_income": features["loan_to_income"],
        },
    }
