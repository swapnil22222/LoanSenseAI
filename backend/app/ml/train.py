"""
Training script for the loan eligibility model.

Generates realistic synthetic data, engineers features, trains a
RandomForestClassifier pipeline, evaluates accuracy, and saves the model.

Run from backend/ directory:
    python -m app.ml.train
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Ensure backend/ is on sys.path when run as __main__
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ml.pipeline import create_pipeline
from app.feature_engineering.features import compute_features, FEATURE_NAMES


def generate_synthetic_data(n_samples: int = 1500, seed: int = 42) -> pd.DataFrame:
    """
    Generate realistic synthetic loan application data.

    The approval logic mirrors real-world lending criteria:
    - Higher salary relative to loan → more likely approved
    - Lower existing debt → more likely approved
    - Higher credit score → more likely approved
    - Longer employment → more likely approved
    """
    rng = np.random.RandomState(seed)

    # --- Raw features with realistic distributions ---
    salary = rng.lognormal(mean=10.8, sigma=0.6, size=n_samples).clip(15000, 500000)
    existing_loans = rng.exponential(scale=8000, size=n_samples).clip(0, 80000)
    credit_score = rng.normal(loc=650, scale=80, size=n_samples).clip(300, 850).astype(int)
    employment_years = rng.exponential(scale=5, size=n_samples).clip(0, 35).round(1)

    # Loan amount depends somewhat on salary (people request relative to income)
    loan_amount = (salary * rng.uniform(0.3, 3.0, size=n_samples)).clip(10000, 1500000)
    loan_duration = rng.choice([6, 12, 24, 36, 48, 60, 84, 120, 180, 240], size=n_samples)

    # --- Engineer features ---
    records = []
    for i in range(n_samples):
        feats = compute_features(
            salary=salary[i],
            existing_loans=existing_loans[i],
            credit_score=credit_score[i],
            loan_amount=loan_amount[i],
            loan_duration=int(loan_duration[i]),
            employment_years=employment_years[i],
        )
        records.append(feats)

    df = pd.DataFrame(records)

    # --- Generate realistic approval labels ---
    # Score each application; higher = more likely approved
    approval_score = np.zeros(n_samples)

    # Credit score contribution (300-850 → 0-35 points)
    approval_score += (df["credit_score"].values - 300) / 550.0 * 35

    # Low debt ratio is good (0-100 → 25-0 points)
    approval_score += (100 - df["debt_ratio"].values) / 100.0 * 25

    # Income stability (0-100 → 0-15 points)
    approval_score += df["income_stability"].values / 100.0 * 15

    # Loan-to-income ratio penalty (lower is better, 0-5 → 25-0 points)
    lti = df["loan_to_income"].values.clip(0, 5)
    approval_score += (5 - lti) / 5.0 * 25

    # Add some noise for realism
    approval_score += rng.normal(0, 5, size=n_samples)

    # Threshold at ~50 to get roughly 55-60% approval rate
    threshold = 48
    approved = (approval_score >= threshold).astype(int)

    df["approved"] = approved

    return df


def train_model():
    """Main training function."""
    print("=" * 60)
    print("LoanSense AI - Model Training")
    print("=" * 60)

    # 1. Generate synthetic data
    print("\n[1/5] Generating synthetic data...")
    df = generate_synthetic_data(n_samples=1500)
    print(f"  Generated {len(df)} samples")
    print(f"  Approval rate: {df['approved'].mean():.1%}")
    print(f"  Features: {FEATURE_NAMES}")

    # 2. Save training data to CSV
    data_dir = os.path.join(BACKEND_DIR, "data")
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "loan_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"\n[2/5] Saved training data to {csv_path}")

    # 3. Prepare features and labels
    print("\n[3/5] Preparing train/test split...")
    X = df[FEATURE_NAMES].values
    y = df["approved"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train)} samples")
    print(f"  Test:  {len(X_test)} samples")

    # 4. Train the pipeline
    print("\n[4/5] Training RandomForest pipeline...")
    pipeline = create_pipeline(n_estimators=200, random_state=42)
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n  Accuracy: {accuracy:.4f}")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Rejected", "Approved"]))

    # 5. Save the model
    model_dir = os.path.join(SCRIPT_DIR, "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "loan_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"[5/5] Model saved to {model_path}")

    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)

    return pipeline, accuracy


if __name__ == "__main__":
    train_model()
