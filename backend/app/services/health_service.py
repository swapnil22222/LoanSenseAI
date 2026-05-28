"""
Financial health scoring service.
Computes a multi-dimensional financial health profile.
"""


def compute_financial_health(
    salary: float,
    existing_loans: float,
    credit_score: int,
    monthly_expenses: float,
    savings: float,
    assets: float,
) -> dict:
    """
    Compute a comprehensive financial health score.

    Returns scores (0-100) for:
    - income_stability: based on savings-to-expense ratio
    - debt_ratio: penalizes high debt relative to income
    - credit_history: maps credit score to 0-100
    - risk_score: composite risk assessment
    - overall_score: weighted average of all factors
    """
    safe_salary = max(salary, 1.0)
    monthly_salary = safe_salary / 12.0
    safe_monthly_expenses = max(monthly_expenses, 1.0)

    # --- Income Stability (0-100) ---
    # Based on how many months of expenses are covered by savings + assets
    months_covered = (savings + assets) / safe_monthly_expenses
    income_stability = min(100.0, months_covered * 10.0)  # 10 months = 100

    # --- Debt Ratio Score (0-100, higher is better / less debt) ---
    debt_to_income = existing_loans / monthly_salary
    # 0 debt → 100, heavy debt → 0
    debt_ratio_score = max(0.0, min(100.0, 100.0 - (debt_to_income * 20.0)))

    # --- Credit History Score (0-100) ---
    # Map 300-850 range to 0-100
    credit_history = max(0.0, min(100.0, (credit_score - 300) / 550.0 * 100.0))

    # --- Risk Score (0-100, higher = safer) ---
    # Weighted combo: debt is risky, low savings is risky
    savings_ratio = min(savings / safe_salary, 1.0) * 100.0
    expense_ratio = max(0, 100 - (monthly_expenses / monthly_salary) * 100.0)
    risk_score = (
        credit_history * 0.35
        + debt_ratio_score * 0.30
        + savings_ratio * 0.20
        + expense_ratio * 0.15
    )
    risk_score = max(0.0, min(100.0, risk_score))

    # --- Overall Score ---
    overall_score = (
        income_stability * 0.20
        + debt_ratio_score * 0.25
        + credit_history * 0.30
        + risk_score * 0.25
    )
    overall_score = max(0.0, min(100.0, overall_score))

    return {
        "income_stability": round(income_stability, 2),
        "debt_ratio": round(debt_ratio_score, 2),
        "credit_history": round(credit_history, 2),
        "risk_score": round(risk_score, 2),
        "overall_score": round(overall_score, 2),
    }
