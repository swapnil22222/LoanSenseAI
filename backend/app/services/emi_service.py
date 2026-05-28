"""
EMI calculation service.
Provides EMI computation, amortization schedule, and tenure comparison.
"""

import math


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Calculate EMI using the standard reducing-balance formula."""
    if annual_rate == 0:
        return principal / max(tenure_months, 1)

    monthly_rate = annual_rate / 100.0 / 12.0
    emi = (
        principal
        * monthly_rate
        * math.pow(1 + monthly_rate, tenure_months)
    ) / (math.pow(1 + monthly_rate, tenure_months) - 1)
    return round(emi, 2)


def generate_amortization_schedule(
    principal: float, annual_rate: float, tenure_months: int
) -> list[dict]:
    """
    Generate a full month-by-month amortization schedule.
    Returns list of dicts with month, emi, principal_component,
    interest_component, and remaining_balance.
    """
    monthly_rate = annual_rate / 100.0 / 12.0
    emi = calculate_emi(principal, annual_rate, tenure_months)
    balance = principal
    schedule = []

    for month in range(1, tenure_months + 1):
        interest_component = round(balance * monthly_rate, 2)
        principal_component = round(emi - interest_component, 2)

        # Handle last month rounding
        if month == tenure_months:
            principal_component = round(balance, 2)
            emi_actual = principal_component + interest_component
        else:
            emi_actual = emi

        balance = max(0, round(balance - principal_component, 2))

        schedule.append(
            {
                "month": month,
                "emi": round(emi_actual, 2),
                "principal_component": principal_component,
                "interest_component": interest_component,
                "remaining_balance": balance,
            }
        )

    return schedule


def generate_tenure_comparison(
    principal: float, annual_rate: float, base_tenure: int
) -> list[dict]:
    """
    Compare EMI and total payment across different tenure options.
    """
    tenures = sorted(
        set(
            [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, base_tenure]
        )
    )

    comparisons = []
    for tenure in tenures:
        if tenure < 1:
            continue
        emi = calculate_emi(principal, annual_rate, tenure)
        total_payment = round(emi * tenure, 2)
        total_interest = round(total_payment - principal, 2)
        comparisons.append(
            {
                "tenure_months": tenure,
                "emi": emi,
                "total_payment": total_payment,
                "total_interest": total_interest,
            }
        )

    return comparisons


def compute_emi_details(
    principal: float, interest_rate: float, tenure_months: int
) -> dict:
    """
    Full EMI computation: EMI amount, totals, amortization schedule,
    and tenure comparison.
    """
    emi = calculate_emi(principal, interest_rate, tenure_months)
    total_payment = round(emi * tenure_months, 2)
    total_interest = round(total_payment - principal, 2)

    # Only include first 12 months + last month in schedule for large tenures
    full_schedule = generate_amortization_schedule(
        principal, interest_rate, tenure_months
    )

    tenure_comparison = generate_tenure_comparison(
        principal, interest_rate, tenure_months
    )

    return {
        "emi_amount": emi,
        "total_payment": total_payment,
        "total_interest": total_interest,
        "amortization_schedule": full_schedule,
        "tenure_comparison": tenure_comparison,
    }
