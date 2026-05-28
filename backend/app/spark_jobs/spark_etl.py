"""
PySpark ETL job: loads loan data CSV into a Spark DataFrame,
performs basic cleaning/transformation, and returns the DataFrame.
Falls back to pandas if Spark is unavailable.
"""

import os
import pandas as pd

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BACKEND_DIR, "data", "loan_data.csv")

_spark_available = True
try:
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.types import (
        StructType,
        StructField,
        FloatType,
        IntegerType,
    )
except ImportError:
    _spark_available = False


def get_spark_session():
    """Create or get existing SparkSession in local mode."""
    if not _spark_available:
        return None
    try:
        spark = (
            SparkSession.builder.master("local[*]")
            .appName("LoanSense-ETL")
            .config("spark.driver.memory", "1g")
            .config("spark.sql.shuffle.partitions", "4")
            .getOrCreate()
        )
        # Suppress excessive logging
        spark.sparkContext.setLogLevel("WARN")
        return spark
    except Exception:
        return None


def load_data_spark(spark=None):
    """
    Load loan data into a Spark DataFrame.
    Returns (spark_df, spark_session) or (None, None) if Spark unavailable.
    """
    if spark is None:
        spark = get_spark_session()

    if spark is None or not os.path.exists(DATA_PATH):
        return None, None

    try:
        df = spark.read.csv(DATA_PATH, header=True, inferSchema=True)
        # Basic cleaning: drop nulls, ensure types
        df = df.dropna()
        return df, spark
    except Exception:
        return None, None


def load_data_pandas() -> pd.DataFrame | None:
    """Fallback: load loan data with pandas."""
    if not os.path.exists(DATA_PATH):
        return None
    try:
        df = pd.read_csv(DATA_PATH)
        df = df.dropna()
        return df
    except Exception:
        return None
