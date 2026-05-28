"""
History routes:
  GET /history - list past loan applications
  GET /history/{id} - get a specific application
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import LoanApplication

router = APIRouter(tags=["History"])


@router.get("/history")
def get_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    Get paginated list of past loan applications, newest first.
    """
    try:
        total = db.query(LoanApplication).count()
        applications = (
            db.query(LoanApplication)
            .order_by(LoanApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "applications": [app.to_dict() for app in applications],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.get("/history/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db)):
    """
    Get a specific loan application by ID.
    """
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    return application.to_dict()
