"""
SQLAlchemy ORM model for loan applications.
Stores every prediction request and its results for history/analytics.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from sqlalchemy.sql import func

from app.database.db import Base


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Input fields
    salary = Column(Float, nullable=False)
    existing_loans = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    loan_amount = Column(Float, nullable=False)
    loan_duration = Column(Integer, nullable=False, default=12)
    employment_years = Column(Float, nullable=False, default=0)

    # Computed features
    debt_ratio = Column(Float, nullable=True)
    income_stability = Column(Float, nullable=True)
    credit_utilization = Column(Float, nullable=True)
    loan_to_income = Column(Float, nullable=True)

    # Prediction results
    approval_probability = Column(Float, nullable=True)
    risk_category = Column(String(20), nullable=True)
    recommended_emi = Column(Float, nullable=True)
    suggested_loan_amount = Column(Float, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "salary": self.salary,
            "existing_loans": self.existing_loans,
            "credit_score": self.credit_score,
            "loan_amount": self.loan_amount,
            "loan_duration": self.loan_duration,
            "employment_years": self.employment_years,
            "debt_ratio": self.debt_ratio,
            "income_stability": self.income_stability,
            "credit_utilization": self.credit_utilization,
            "loan_to_income": self.loan_to_income,
            "approval_probability": self.approval_probability,
            "risk_category": self.risk_category,
            "recommended_emi": self.recommended_emi,
            "suggested_loan_amount": self.suggested_loan_amount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
