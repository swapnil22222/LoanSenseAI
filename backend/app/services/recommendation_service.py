"""
Recommendation service for credit improvement.
Supports two modes: simulation and goal-based.
"""

from app.ml.predict import predict_eligibility


def simulate_improvement(
    salary: float,
    existing_loans: float,
    credit_score: int,
    loan_amount: float,
    loan_duration: int,
    employment_years: float,
    new_credit_score: int | None = None,
    new_salary: float | None = None,
    new_existing_loans: float | None = None,
) -> dict:
    """
    Simulate how changes to financial profile affect loan approval.

    Compares current approval probability vs. simulated scenario.
    """
    # Current prediction
    current = predict_eligibility(
        salary=salary,
        existing_loans=existing_loans,
        credit_score=credit_score,
        loan_amount=loan_amount,
        loan_duration=loan_duration,
        employment_years=employment_years,
    )

    # Simulated prediction with proposed changes
    sim_salary = new_salary if new_salary is not None else salary
    sim_loans = new_existing_loans if new_existing_loans is not None else existing_loans
    sim_credit = new_credit_score if new_credit_score is not None else credit_score

    simulated = predict_eligibility(
        salary=sim_salary,
        existing_loans=sim_loans,
        credit_score=sim_credit,
        loan_amount=loan_amount,
        loan_duration=loan_duration,
        employment_years=employment_years,
    )

    # Generate actionable recommendations
    actions = []

    if sim_credit > credit_score:
        diff = simulated["approval_probability"] - current["approval_probability"]
        actions.append(
            {
                "action": f"Improve credit score from {credit_score} to {sim_credit}",
                "impact": f"+{diff:.1f}% approval probability",
                "priority": "high" if diff > 10 else "medium",
            }
        )

    if sim_salary > salary:
        actions.append(
            {
                "action": f"Increase income from ₹{salary:,.0f} to ₹{sim_salary:,.0f}",
                "impact": "Reduces loan-to-income ratio",
                "priority": "medium",
            }
        )

    if sim_loans < existing_loans:
        actions.append(
            {
                "action": f"Reduce existing debt from ₹{existing_loans:,.0f} to ₹{sim_loans:,.0f}",
                "impact": "Lowers debt-to-income ratio",
                "priority": "high",
            }
        )

    # Add general recommendations
    if credit_score < 700:
        actions.append(
            {
                "action": "Pay all bills on time for 6+ months",
                "impact": "Gradual credit score improvement of 20-50 points",
                "priority": "high",
            }
        )

    if existing_loans > salary / 12 * 3:
        actions.append(
            {
                "action": "Consolidate or pay down existing high-interest loans",
                "impact": "Reduces debt burden and improves DTI ratio",
                "priority": "high",
            }
        )

    if loan_amount > salary * 2:
        actions.append(
            {
                "action": f"Consider reducing loan amount to ₹{salary * 2:,.0f} or less",
                "impact": "More realistic loan-to-income ratio",
                "priority": "medium",
            }
        )

    return {
        "current_approval": current["approval_probability"],
        "potential_approval": simulated["approval_probability"],
        "improvement": round(
            simulated["approval_probability"] - current["approval_probability"], 2
        ),
        "current_risk": current["risk_category"],
        "potential_risk": simulated["risk_category"],
        "recommended_actions": actions,
    }


def compute_goal(
    salary: float,
    existing_loans: float,
    credit_score: int,
    loan_amount: float,
    loan_duration: int,
    employment_years: float,
    target_approval: float = 75.0,
) -> dict:
    """
    Determine what financial changes are needed to reach a target approval %.

    Uses iterative simulation to find required salary, max debt, and min credit score.
    """
    # Find minimum credit score needed (binary search)
    low_cs, high_cs = credit_score, 850
    min_credit = 850
    for _ in range(20):
        mid = (low_cs + high_cs) // 2
        result = predict_eligibility(
            salary=salary,
            existing_loans=existing_loans,
            credit_score=mid,
            loan_amount=loan_amount,
            loan_duration=loan_duration,
            employment_years=employment_years,
        )
        if result["approval_probability"] >= target_approval:
            min_credit = mid
            high_cs = mid - 1
        else:
            low_cs = mid + 1

    # Find required salary (binary search)
    low_sal, high_sal = salary, salary * 5
    required_salary = salary * 5
    for _ in range(30):
        mid = (low_sal + high_sal) / 2
        result = predict_eligibility(
            salary=mid,
            existing_loans=existing_loans,
            credit_score=credit_score,
            loan_amount=loan_amount,
            loan_duration=loan_duration,
            employment_years=employment_years,
        )
        if result["approval_probability"] >= target_approval:
            required_salary = mid
            high_sal = mid
        else:
            low_sal = mid

        if high_sal - low_sal < 100:
            break

    # Find maximum allowable debt (binary search)
    low_debt, high_debt = 0, existing_loans
    max_debt = 0
    for _ in range(30):
        mid = (low_debt + high_debt) / 2
        result = predict_eligibility(
            salary=salary,
            existing_loans=mid,
            credit_score=credit_score,
            loan_amount=loan_amount,
            loan_duration=loan_duration,
            employment_years=employment_years,
        )
        if result["approval_probability"] >= target_approval:
            max_debt = mid
            low_debt = mid
        else:
            high_debt = mid

        if high_debt - low_debt < 100:
            break

    return {
        "target_approval": target_approval,
        "required_salary": round(required_salary, 2),
        "maximum_debt": round(max_debt, 2),
        "minimum_credit_score": min_credit,
        "current_salary": salary,
        "current_debt": existing_loans,
        "current_credit_score": credit_score,
    }
