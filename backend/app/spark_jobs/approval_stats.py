"""
PySpark job: compute approval statistics.
Falls back to pandas if Spark is unavailable.
"""

import pandas as pd

from app.spark_jobs.spark_etl import load_data_spark, load_data_pandas, get_spark_session

_spark_available = True
try:
    from pyspark.sql import functions as F
except ImportError:
    _spark_available = False


def compute_approval_stats_spark() -> dict | None:
    """Compute approval statistics using PySpark."""
    if not _spark_available:
        return None

    spark = get_spark_session()
    df, spark = load_data_spark(spark)
    if df is None:
        return None

    try:
        total = df.count()
        if total == 0:
            return None

        approved_count = df.filter(F.col("approved") == 1).count()
        rejected_count = total - approved_count
        approval_rate = round((approved_count / total) * 100, 2)

        # Average metrics for approved vs rejected
        approved_df = df.filter(F.col("approved") == 1)
        rejected_df = df.filter(F.col("approved") == 0)

        avg_salary_approved = approved_df.agg(F.avg("salary")).collect()[0][0]
        avg_salary_rejected = rejected_df.agg(F.avg("salary")).collect()[0][0]

        avg_credit_approved = approved_df.agg(F.avg("credit_score")).collect()[0][0]
        avg_credit_rejected = rejected_df.agg(F.avg("credit_score")).collect()[0][0]

        avg_loan_approved = approved_df.agg(F.avg("loan_amount")).collect()[0][0]
        avg_loan_rejected = rejected_df.agg(F.avg("loan_amount")).collect()[0][0]

        avg_debt_ratio_approved = approved_df.agg(F.avg("debt_ratio")).collect()[0][0]
        avg_debt_ratio_rejected = rejected_df.agg(F.avg("debt_ratio")).collect()[0][0]

        return {
            "engine": "spark",
            "total_applications": total,
            "approved": approved_count,
            "rejected": rejected_count,
            "approval_rate": approval_rate,
            "avg_salary_approved": round(avg_salary_approved, 2) if avg_salary_approved else 0,
            "avg_salary_rejected": round(avg_salary_rejected, 2) if avg_salary_rejected else 0,
            "avg_credit_approved": round(avg_credit_approved, 2) if avg_credit_approved else 0,
            "avg_credit_rejected": round(avg_credit_rejected, 2) if avg_credit_rejected else 0,
            "avg_loan_approved": round(avg_loan_approved, 2) if avg_loan_approved else 0,
            "avg_loan_rejected": round(avg_loan_rejected, 2) if avg_loan_rejected else 0,
            "avg_debt_ratio_approved": round(avg_debt_ratio_approved, 2) if avg_debt_ratio_approved else 0,
            "avg_debt_ratio_rejected": round(avg_debt_ratio_rejected, 2) if avg_debt_ratio_rejected else 0,
        }
    except Exception:
        return None


def compute_approval_stats_pandas() -> dict | None:
    """Fallback: compute approval statistics using pandas."""
    df = load_data_pandas()
    if df is None or len(df) == 0:
        return None

    total = len(df)
    approved = df[df["approved"] == 1]
    rejected = df[df["approved"] == 0]

    return {
        "engine": "pandas",
        "total_applications": total,
        "approved": len(approved),
        "rejected": len(rejected),
        "approval_rate": round((len(approved) / total) * 100, 2),
        "avg_salary_approved": round(approved["salary"].mean(), 2) if len(approved) > 0 else 0,
        "avg_salary_rejected": round(rejected["salary"].mean(), 2) if len(rejected) > 0 else 0,
        "avg_credit_approved": round(approved["credit_score"].mean(), 2) if len(approved) > 0 else 0,
        "avg_credit_rejected": round(rejected["credit_score"].mean(), 2) if len(rejected) > 0 else 0,
        "avg_loan_approved": round(approved["loan_amount"].mean(), 2) if len(approved) > 0 else 0,
        "avg_loan_rejected": round(rejected["loan_amount"].mean(), 2) if len(rejected) > 0 else 0,
        "avg_debt_ratio_approved": round(approved["debt_ratio"].mean(), 2) if len(approved) > 0 else 0,
        "avg_debt_ratio_rejected": round(rejected["debt_ratio"].mean(), 2) if len(rejected) > 0 else 0,
    }


def get_approval_stats() -> dict:
    """Get approval stats, trying Spark first, falling back to pandas."""
    result = compute_approval_stats_spark()
    if result is not None:
        return result

    result = compute_approval_stats_pandas()
    if result is not None:
        return result

    return {"engine": "none", "error": "No data available"}
