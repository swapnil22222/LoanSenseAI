"""
Model loading and prediction module.
Loads the trained joblib model and provides prediction functions.
"""

import os
import numpy as np
import joblib

from app.feature_engineering.features import compute_features, features_to_array

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "models", "loan_model.joblib"
)

_model = None


def load_model():
    """Load the trained model from disk. Returns the sklearn Pipeline."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run 'python -m app.ml.train' first."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_eligibility(
    salary: float,
    existing_loans: float,
    credit_score: int,
    loan_amount: float,
    loan_duration: int = 12,
    employment_years: float = 0.0,
) -> dict:
    """
    Predict loan eligibility and return structured results.

    Returns:
        dict with approval_probability, risk_category, recommended_emi,
        suggested_loan_amount, and computed features.
    """
    model = load_model()

    # Compute engineered features
    features = compute_features(
        salary=salary,
        existing_loans=existing_loans,
        credit_score=credit_score,
        loan_amount=loan_amount,
        loan_duration=loan_duration,
        employment_years=employment_years,
    )

    # Prepare input array
    feature_array = np.array([features_to_array(features)])

    # Get probability of approval (class 1)
    probabilities = model.predict_proba(feature_array)[0]
    approval_prob = float(probabilities[1]) * 100  # Convert to 0-100 scale

    # Determine risk category
    if approval_prob >= 70:
        risk_category = "Low"
    elif approval_prob >= 40:
        risk_category = "Medium"
    else:
        risk_category = "High"

    # Calculate recommended EMI (standard reducing balance formula)
    # Use a reasonable interest rate based on risk
    interest_rates = {"Low": 8.5, "Medium": 12.0, "High": 16.5}
    rate = interest_rates[risk_category]
    monthly_rate = rate / 100.0 / 12.0
    tenure = max(loan_duration, 1)

    if monthly_rate > 0:
        emi = (loan_amount * monthly_rate * (1 + monthly_rate) ** tenure) / (
            (1 + monthly_rate) ** tenure - 1
        )
    else:
        emi = loan_amount / tenure

    # Suggested loan amount: cap at what borrower can likely afford
    monthly_salary = salary / 12.0
    affordable_emi = monthly_salary * 0.4  # 40% of monthly income rule
    if monthly_rate > 0:
        suggested_amount = (
            affordable_emi
            * ((1 + monthly_rate) ** tenure - 1)
            / (monthly_rate * (1 + monthly_rate) ** tenure)
        )
    else:
        suggested_amount = affordable_emi * tenure

    suggested_amount = round(min(suggested_amount, loan_amount * 1.5), 2)

    return {
        "approval_probability": round(approval_prob, 2),
        "risk_category": risk_category,
        "recommended_emi": round(emi, 2),
        "suggested_loan_amount": suggested_amount,
        "features": features,
    }
