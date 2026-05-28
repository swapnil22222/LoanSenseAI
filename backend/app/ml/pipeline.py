"""
Scikit-learn ML pipeline: StandardScaler + RandomForestClassifier.
"""

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier


def create_pipeline(n_estimators: int = 200, random_state: int = 42) -> Pipeline:
    """
    Create the loan eligibility prediction pipeline.

    StandardScaler normalizes features, then RandomForest classifies
    loan applications as approved (1) or rejected (0).
    """
    pipeline = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=n_estimators,
                    max_depth=12,
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=random_state,
                    n_jobs=-1,
                    class_weight="balanced",
                ),
            ),
        ]
    )
    return pipeline
