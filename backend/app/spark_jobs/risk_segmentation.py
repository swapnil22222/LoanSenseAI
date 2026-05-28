"""
PySpark job: risk segmentation analysis.
Segments loan applications by risk level based on credit score bands.
Falls back to pandas if Spark is unavailable.
"""

import pandas as pd

from app.spark_jobs.spark_etl import load_data_spark, load_data_pandas, get_spark_session

_spark_available = True
try:
    from pyspark.sql import functions as F
    from pyspark.sql.functions import when, col
except ImportError:
    _spark_available = False


def _assign_risk_band_pandas(credit_score: int) -> str:
    if credit_score >= 750:
        return "Low Risk"
    elif credit_score >= 650:
        return "Medium Risk"
    elif credit_score >= 550:
        return "High Risk"
    else:
        return "Very High Risk"


def compute_risk_segmentation_spark() -> dict | None:
    """Compute risk segmentation using PySpark."""
    if not _spark_available:
        return None

    spark = get_spark_session()
    df, spark = load_data_spark(spark)
    if df is None:
        return None

    try:
        # Add risk band column
        df = df.withColumn(
            "risk_band",
            when(col("credit_score") >= 750, "Low Risk")
            .when(col("credit_score") >= 650, "Medium Risk")
            .when(col("credit_score") >= 550, "High Risk")
            .otherwise("Very High Risk"),
        )

        # Aggregate by risk band
        segments = (
            df.groupBy("risk_band")
            .agg(
                F.count("*").alias("count"),
                F.avg("salary").alias("avg_salary"),
                F.avg("loan_amount").alias("avg_loan_amount"),
                F.avg("credit_score").alias("avg_credit_score"),
                F.avg("debt_ratio").alias("avg_debt_ratio"),
                F.avg("approved").alias("approval_rate"),
            )
            .collect()
        )

        result = []
        for row in segments:
            result.append(
                {
                    "risk_band": row["risk_band"],
                    "count": row["count"],
                    "avg_salary": round(row["avg_salary"], 2),
                    "avg_loan_amount": round(row["avg_loan_amount"], 2),
                    "avg_credit_score": round(row["avg_credit_score"], 2),
                    "avg_debt_ratio": round(row["avg_debt_ratio"], 2),
                    "approval_rate": round(row["approval_rate"] * 100, 2),
                }
            )

        # Sort by risk band order
        order = {"Low Risk": 0, "Medium Risk": 1, "High Risk": 2, "Very High Risk": 3}
        result.sort(key=lambda x: order.get(x["risk_band"], 4))

        return {"engine": "spark", "segments": result}
    except Exception:
        return None


def compute_risk_segmentation_pandas() -> dict | None:
    """Fallback: compute risk segmentation using pandas."""
    df = load_data_pandas()
    if df is None or len(df) == 0:
        return None

    df["risk_band"] = df["credit_score"].apply(_assign_risk_band_pandas)

    grouped = df.groupby("risk_band")
    segments_agg = grouped.agg(
        count=("salary", "size"),
        avg_salary=("salary", "mean"),
        avg_loan_amount=("loan_amount", "mean"),
        avg_credit_score=("credit_score", "mean"),
        avg_debt_ratio=("debt_ratio", "mean"),
        approval_rate=("approved", "mean"),
    ).reset_index()

    result = []
    for _, row in segments_agg.iterrows():
        result.append(
            {
                "risk_band": row["risk_band"],
                "count": int(row["count"]),
                "avg_salary": round(row["avg_salary"], 2),
                "avg_loan_amount": round(row["avg_loan_amount"], 2),
                "avg_credit_score": round(row["avg_credit_score"], 2),
                "avg_debt_ratio": round(row["avg_debt_ratio"], 2),
                "approval_rate": round(row["approval_rate"] * 100, 2),
            }
        )

    order = {"Low Risk": 0, "Medium Risk": 1, "High Risk": 2, "Very High Risk": 3}
    result.sort(key=lambda x: order.get(x["risk_band"], 4))

    return {"engine": "pandas", "segments": result}


def get_risk_segmentation() -> dict:
    """Get risk segmentation, trying Spark first, falling back to pandas."""
    result = compute_risk_segmentation_spark()
    if result is not None:
        return result

    result = compute_risk_segmentation_pandas()
    if result is not None:
        return result

    return {"engine": "none", "segments": [], "error": "No data available"}
