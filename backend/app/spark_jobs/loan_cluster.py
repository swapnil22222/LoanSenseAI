"""
PySpark job: loan clustering / distribution analysis.
Analyzes loan amount distributions and salary-loan relationships.
Falls back to pandas if Spark is unavailable.
"""

import numpy as np
import pandas as pd

from app.spark_jobs.spark_etl import load_data_spark, load_data_pandas, get_spark_session

_spark_available = True
try:
    from pyspark.sql import functions as F
    from pyspark.sql.functions import when, col, floor as spark_floor
except ImportError:
    _spark_available = False


def _bucket_loan_amount(amount: float) -> str:
    if amount < 100000:
        return "< 1L"
    elif amount < 300000:
        return "1L - 3L"
    elif amount < 500000:
        return "3L - 5L"
    elif amount < 1000000:
        return "5L - 10L"
    else:
        return "10L+"


def compute_loan_clusters_spark() -> dict | None:
    """Compute loan distribution analysis using PySpark."""
    if not _spark_available:
        return None

    spark = get_spark_session()
    df, spark = load_data_spark(spark)
    if df is None:
        return None

    try:
        # Loan amount distribution buckets
        df = df.withColumn(
            "loan_bucket",
            when(col("loan_amount") < 100000, "< 1L")
            .when(col("loan_amount") < 300000, "1L - 3L")
            .when(col("loan_amount") < 500000, "3L - 5L")
            .when(col("loan_amount") < 1000000, "5L - 10L")
            .otherwise("10L+"),
        )

        # Distribution by loan bucket
        bucket_stats = (
            df.groupBy("loan_bucket")
            .agg(
                F.count("*").alias("count"),
                F.avg("approved").alias("approval_rate"),
                F.avg("credit_score").alias("avg_credit_score"),
                F.avg("salary").alias("avg_salary"),
            )
            .collect()
        )

        loan_distribution = []
        for row in bucket_stats:
            loan_distribution.append(
                {
                    "bucket": row["loan_bucket"],
                    "count": row["count"],
                    "approval_rate": round(row["approval_rate"] * 100, 2),
                    "avg_credit_score": round(row["avg_credit_score"], 2),
                    "avg_salary": round(row["avg_salary"], 2),
                }
            )

        # Salary vs loan amount correlation bins
        salary_bins = (
            df.withColumn("salary_bin", (spark_floor(col("salary") / 50000) * 50000).cast("int"))
            .groupBy("salary_bin")
            .agg(
                F.count("*").alias("count"),
                F.avg("loan_amount").alias("avg_loan_amount"),
                F.avg("approved").alias("approval_rate"),
            )
            .orderBy("salary_bin")
            .collect()
        )

        salary_loan_correlation = []
        for row in salary_bins:
            salary_loan_correlation.append(
                {
                    "salary_range": f"₹{row['salary_bin']:,}+",
                    "count": row["count"],
                    "avg_loan_amount": round(row["avg_loan_amount"], 2),
                    "approval_rate": round(row["approval_rate"] * 100, 2),
                }
            )

        return {
            "engine": "spark",
            "loan_distribution": loan_distribution,
            "salary_loan_correlation": salary_loan_correlation,
        }
    except Exception:
        return None


def compute_loan_clusters_pandas() -> dict | None:
    """Fallback: compute loan clusters using pandas."""
    df = load_data_pandas()
    if df is None or len(df) == 0:
        return None

    # Loan amount distribution
    df["loan_bucket"] = df["loan_amount"].apply(_bucket_loan_amount)
    bucket_stats = df.groupby("loan_bucket").agg(
        count=("salary", "size"),
        approval_rate=("approved", "mean"),
        avg_credit_score=("credit_score", "mean"),
        avg_salary=("salary", "mean"),
    ).reset_index()

    loan_distribution = []
    for _, row in bucket_stats.iterrows():
        loan_distribution.append(
            {
                "bucket": row["loan_bucket"],
                "count": int(row["count"]),
                "approval_rate": round(row["approval_rate"] * 100, 2),
                "avg_credit_score": round(row["avg_credit_score"], 2),
                "avg_salary": round(row["avg_salary"], 2),
            }
        )

    # Salary correlation
    df["salary_bin"] = (df["salary"] // 50000 * 50000).astype(int)
    salary_stats = df.groupby("salary_bin").agg(
        count=("loan_amount", "size"),
        avg_loan_amount=("loan_amount", "mean"),
        approval_rate=("approved", "mean"),
    ).reset_index().sort_values("salary_bin")

    salary_loan_correlation = []
    for _, row in salary_stats.iterrows():
        salary_loan_correlation.append(
            {
                "salary_range": f"₹{int(row['salary_bin']):,}+",
                "count": int(row["count"]),
                "avg_loan_amount": round(row["avg_loan_amount"], 2),
                "approval_rate": round(row["approval_rate"] * 100, 2),
            }
        )

    return {
        "engine": "pandas",
        "loan_distribution": loan_distribution,
        "salary_loan_correlation": salary_loan_correlation,
    }


def get_loan_clusters() -> dict:
    """Get loan clusters, trying Spark first, falling back to pandas."""
    result = compute_loan_clusters_spark()
    if result is not None:
        return result

    result = compute_loan_clusters_pandas()
    if result is not None:
        return result

    return {"engine": "none", "loan_distribution": [], "salary_loan_correlation": []}
