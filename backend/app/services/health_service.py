"""
Financial health scoring service.
Computes a multi-dimensional financial health profile.
Returns dimensions and metrics arrays for the frontend.
"""


def compute_financial_health(
    salary: float,
    existing_loans: float,
    credit_score: int,
    monthly_expenses: float,
    savings: float,
) -> dict:
    """
    Compute a comprehensive financial health score.

    Returns:
        overall_score, dimensions[], and metrics[] for frontend rendering.
    """
    safe_salary = max(salary, 1.0)
    safe_monthly_expenses = max(monthly_expenses, 1.0)

    # --- Dimension Scores (0-100) ---

    # Income Score
    income_score = min(100.0, (safe_salary / 100000) * 100.0)

    # Debt Score (lower debt = higher score)
    dti = existing_loans / (safe_salary * 12) * 100 if existing_loans > 0 else 5
    debt_score = max(0.0, 100.0 - dti * 2)

    # Credit Score (map 300-850 to 0-100)
    credit_norm = max(0.0, min(100.0, (credit_score - 300) / 550.0 * 100.0))

    # Savings Score
    savings_ratio = savings / (safe_salary * 12) * 100
    savings_score = min(100.0, savings_ratio * 5)

    # Expense Score (lower expense ratio = better)
    expense_ratio = (monthly_expenses / safe_salary) * 100
    expense_score = max(0.0, 100.0 - expense_ratio)

    # --- Overall Score (weighted average) ---
    overall_score = (
        income_score * 0.20
        + debt_score * 0.25
        + credit_norm * 0.25
        + savings_score * 0.15
        + expense_score * 0.15
    )
    overall_score = max(0.0, min(100.0, overall_score))

    # --- Build response matching frontend interface ---
    def label_for(score):
        if score >= 70:
            return "Strong"
        elif score >= 40:
            return "Moderate"
        return "Low"

    dimensions = [
        {"name": "Income", "score": round(income_score), "label": label_for(income_score)},
        {"name": "Debt", "score": round(debt_score), "label": "Healthy" if debt_score >= 70 else "Moderate" if debt_score >= 40 else "High"},
        {"name": "Credit", "score": round(credit_norm), "label": "Excellent" if credit_norm >= 70 else "Fair" if credit_norm >= 40 else "Poor"},
        {"name": "Savings", "score": round(savings_score), "label": "Strong" if savings_score >= 70 else "Growing" if savings_score >= 40 else "Low"},
        {"name": "Expenses", "score": round(expense_score), "label": "Efficient" if expense_score >= 70 else "Moderate" if expense_score >= 40 else "High"},
    ]

    emergency_months = savings / safe_monthly_expenses if safe_monthly_expenses > 0 else 0
    net_surplus = safe_salary - monthly_expenses

    metrics = [
        {
            "label": "Debt-to-Income Ratio",
            "value": f"{dti:.1f}%",
            "status": "good" if dti < 30 else "warning" if dti < 50 else "critical",
        },
        {
            "label": "Savings Ratio",
            "value": f"{savings_ratio:.1f}%",
            "status": "good" if savings_ratio > 20 else "warning" if savings_ratio > 10 else "critical",
        },
        {
            "label": "Expense Ratio",
            "value": f"{expense_ratio:.1f}%",
            "status": "good" if expense_ratio < 50 else "warning" if expense_ratio < 70 else "critical",
        },
        {
            "label": "Credit Score",
            "value": str(credit_score),
            "status": "good" if credit_score >= 700 else "warning" if credit_score >= 600 else "critical",
        },
        {
            "label": "Emergency Fund",
            "value": f"{emergency_months:.1f} months",
            "status": "good" if emergency_months >= 6 else "warning" if emergency_months >= 3 else "critical",
        },
        {
            "label": "Net Monthly Surplus",
            "value": f"₹{net_surplus:,.0f}",
            "status": "good" if net_surplus > 20000 else "warning" if net_surplus > 0 else "critical",
        },
    ]

    return {
        "overall_score": round(overall_score),
        "dimensions": dimensions,
        "metrics": metrics,
    }
