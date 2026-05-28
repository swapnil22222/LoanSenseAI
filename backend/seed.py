import os
import sys
import random
import datetime

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.db import SessionLocal
from app.database.models import LoanApplication
from app.ml.predict import predict_eligibility

def seed_database():
    db = SessionLocal()
    
    # Check if we already have records
    count = db.query(LoanApplication).count()
    print(f"Database currently has {count} records. Adding 150 more...")

    print("Generating 150 historical loan applications for the Dashboard...")
    
    names = ["Rajesh Kumar", "Sneha Patel", "Amit Shah", "Priya Mehta", "Vikram Singh", 
             "Kavita Joshi", "Arjun Nair", "Meera Reddy", "Rohan Gupta", "Anjali Desai",
             "Sanjay Verma", "Pooja Sharma", "Deepak Chawla", "Neha Kapoor", "Rahul Bhatia"]
             
    now = datetime.datetime.now()
    
    for i in range(150):
        # Generate realistic random data
        salary = random.randint(30000, 250000)
        existing_loans = random.randint(0, salary * 5)
        credit_score = random.randint(550, 850)
        loan_amount = random.randint(100000, 3000000)
        loan_duration = random.choice([12, 24, 36, 48, 60, 84, 120])
        employment_years = round(random.uniform(0.5, 15.0), 1)
        
        # Run prediction
        res = predict_eligibility(
            salary=salary,
            existing_loans=existing_loans,
            credit_score=credit_score,
            loan_amount=loan_amount,
            loan_duration=loan_duration,
            employment_years=employment_years
        )
        
        feats = res["features"]
        
        # Backdate the created_at by randomly subtracting up to 30 days
        days_ago = random.randint(0, 30)
        created_at = now - datetime.timedelta(days=days_ago, hours=random.randint(0, 23))
        
        app = LoanApplication(
            salary=salary,
            existing_loans=existing_loans,
            credit_score=credit_score,
            loan_amount=loan_amount,
            loan_duration=loan_duration,
            employment_years=employment_years,
            debt_ratio=feats["debt_ratio"],
            income_stability=feats["income_stability"],
            credit_utilization=feats["credit_utilization"],
            loan_to_income=feats["loan_to_income"],
            approval_probability=res["approval_probability"],
            risk_category=res["risk_category"],
            recommended_emi=res["recommended_emi"],
            suggested_loan_amount=res["suggested_loan_amount"]
        )
        # Override the created_at for historical charts
        app.created_at = created_at
        
        db.add(app)
        
    db.commit()
    print("Database seeded successfully with 150 records!")

if __name__ == "__main__":
    seed_database()
