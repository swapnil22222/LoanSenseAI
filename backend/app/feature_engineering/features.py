"""
Feature engineering for loan eligibility prediction.
Computes derived features from raw application data that improve model performance.
"""

import numpy as np


def compute_features(
    salary: float,
    existing_loans: float,
    credit_score: int,
    loan_amount: float,
    loan_duration: int = 12,
    employment_years: float = 0.0,
) -> dict:
    """
    Compute engineered features from raw loan application inputs.

    Returns a dict with both raw and engineered features ready for ML input.
    """
    # Prevent division by zero
    safe_salary = max(salary, 1.0)

    # Debt-to-income ratio (0-100 scale)
    # How much of monthly salary goes to existing loan payments
    monthly_salary = safe_salary / 12.0
    debt_ratio = min((existing_loans / monthly_salary) * 100.0, 100.0)

    # Income stability score (0-100)
    # Based on employment years: longer employment = more stable
    # Caps at ~15 years for max stability
    income_stability = min((employment_years / 15.0) * 100.0, 100.0)

    # Credit utilization proxy (0-100)
    # Higher credit score = lower utilization assumed
    # Maps 300-850 range to 100-0 utilization
    credit_utilization = max(0.0, min(100.0, ((850 - credit_score) / 550.0) * 100.0))

    # Loan-to-income ratio
    # How many months of salary is the requested loan
    loan_to_income = loan_amount / safe_salary

    return {
        "salary": salary,
        "existing_loans": existing_loans,
        "credit_score": credit_score,
        "loan_amount": loan_amount,
        "loan_duration": loan_duration,
        "employment_years": employment_years,
        "debt_ratio": round(debt_ratio, 4),
        "income_stability": round(income_stability, 4),
        "credit_utilization": round(credit_utilization, 4),
        "loan_to_income": round(loan_to_income, 4),
    }


def features_to_array(features: dict) -> list:
    """
    Convert feature dict to ordered list for model input.
    Must match the order used during training.
    """
    return [
        features["salary"],
        features["existing_loans"],
        features["credit_score"],
        features["loan_amount"],
        features["loan_duration"],
        features["employment_years"],
        features["debt_ratio"],
        features["income_stability"],
        features["credit_utilization"],
        features["loan_to_income"],
    ]


FEATURE_NAMES = [
    "salary",
    "existing_loans",
    "credit_score",
    "loan_amount",
    "loan_duration",
    "employment_years",
    "debt_ratio",
    "income_stability",
    "credit_utilization",
    "loan_to_income",
]
