"""
Analytics routes:
  GET /analytics/overview - Live dashboard analytics from SQLite DB
  GET /analytics/spark-stats - PySpark-powered analytics
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.sql import extract

import calendar

from app.database.db import get_db
from app.database.models import LoanApplication

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/overview")
def analytics_overview(db: Session = Depends(get_db)):
    """Live analytics overview — all data pulled from SQLite database."""
    try:
        total = db.query(func.count(LoanApplication.id)).scalar() or 0

        if total == 0:
            return {
                "total_applications": 0, "approved": 0, "rejected": 0, "pending": 0,
                "approval_rate": 0, "avg_loan_amount": 0, "avg_credit_score": 0, "total_disbursed": 0,
                "applications": [], "approval_history": [], "risk_trends": [],
                "recent_activity": [], "risk_distribution": [], "loan_amount_distribution": []
            }

        # --- KPI aggregations ---
        avg_loan = db.query(func.avg(LoanApplication.loan_amount)).scalar() or 0
        avg_credit = db.query(func.avg(LoanApplication.credit_score)).scalar() or 0

        approved_count = db.query(func.count(LoanApplication.id)).filter(
            LoanApplication.approval_probability >= 50
        ).scalar() or 0
        rejected_count = total - approved_count
        approval_rate = round((approved_count / total) * 100, 1) if total > 0 else 0

        total_disbursed = db.query(func.sum(LoanApplication.loan_amount)).filter(
            LoanApplication.approval_probability >= 50
        ).scalar() or 0

        # --- Recent Applications Table (last 20) ---
        recent = db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).limit(20).all()
        applications = []
        recent_activity = []
        for app in recent:
            status = "Approved" if (app.approval_probability or 0) >= 50 else "Rejected"
            applications.append({
                "id": f"APP-{app.id:04d}",
                "name": f"Applicant #{app.id}",
                "amount": app.loan_amount,
                "status": status,
                "risk": app.risk_category or "Unknown",
                "date": app.created_at.strftime("%Y-%m-%d") if app.created_at else "",
                "score": app.credit_score
            })
            recent_activity.append({
                "action": f"Application {status}",
                "details": f"Applicant #{app.id} - ₹{app.loan_amount/100000:.1f}L",
                "time": app.created_at.strftime("%Y-%m-%d %H:%M") if app.created_at else ""
            })

        # --- Monthly Approval History & Risk Trends ---
        monthly_stats = db.query(
            extract('month', LoanApplication.created_at).label('month'),
            func.count(LoanApplication.id).label('total'),
            func.sum(func.case((LoanApplication.approval_probability >= 50, 1), else_=0)).label('approved'),
            func.sum(func.case((LoanApplication.risk_category == 'Low', 1), else_=0)).label('low'),
            func.sum(func.case((LoanApplication.risk_category == 'Medium', 1), else_=0)).label('medium'),
            func.sum(func.case((LoanApplication.risk_category == 'High', 1), else_=0)).label('high')
        ).group_by(extract('month', LoanApplication.created_at)).all()

        approval_history = []
        risk_trends = []

        for stat in sorted(monthly_stats, key=lambda x: x.month or 0):
            m_idx = int(stat.month) if stat.month else 1
            month_name = calendar.month_abbr[m_idx]

            approved = int(stat.approved or 0)
            total_m = int(stat.total or 0)
            rejected = total_m - approved

            approval_history.append({"month": month_name, "approved": approved, "rejected": rejected})
            risk_trends.append({
                "month": month_name,
                "Low": int(stat.low or 0),
                "Medium": int(stat.medium or 0),
                "High": int(stat.high or 0)
            })

        # --- Risk Distribution (for pie/bar charts) ---
        risk_dist = db.query(
            LoanApplication.risk_category,
            func.count(LoanApplication.id).label("count"),
        ).group_by(LoanApplication.risk_category).all()
        risk_distribution = [
            {"category": r[0] or "Unknown", "count": r[1]} for r in risk_dist
        ]

        # --- Loan Amount Distribution (for histogram) ---
        ranges = [
            (0, 100000, "< 1L"),
            (100000, 300000, "1L - 3L"),
            (300000, 500000, "3L - 5L"),
            (500000, 1000000, "5L - 10L"),
            (1000000, float("inf"), "10L+"),
        ]
        loan_amount_distribution = []
        for low, high, label in ranges:
            q = db.query(func.count(LoanApplication.id)).filter(
                LoanApplication.loan_amount >= low
            )
            if high != float("inf"):
                q = q.filter(LoanApplication.loan_amount < high)
            count = q.scalar() or 0
            loan_amount_distribution.append({"range": label, "count": count})

        return {
            "total_applications": total,
            "approved": approved_count,
            "rejected": rejected_count,
            "pending": 0,
            "approval_rate": approval_rate,
            "avg_loan_amount": round(avg_loan, 0),
            "avg_credit_score": round(avg_credit, 0),
            "total_disbursed": round(total_disbursed / 10000000, 2),  # Convert to Crores
            "applications": applications,
            "approval_history": approval_history,
            "risk_trends": risk_trends,
            "recent_activity": recent_activity[:5],
            "risk_distribution": risk_distribution,
            "loan_amount_distribution": loan_amount_distribution,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")


@router.get("/spark-stats")
def spark_analytics(db: Session = Depends(get_db)):
    """Spark-style analytics — also pulled from live DB."""
    try:
        total = db.query(func.count(LoanApplication.id)).scalar() or 0
        avg_loan = db.query(func.avg(LoanApplication.loan_amount)).scalar() or 0
        high_risk = db.query(func.count(LoanApplication.id)).filter(
            LoanApplication.risk_category == "High"
        ).scalar() or 0
        approved = db.query(func.count(LoanApplication.id)).filter(
            LoanApplication.approval_probability >= 50
        ).scalar() or 0
        approval_rate = round((approved / total) * 100, 1) if total > 0 else 0

        risk_dist = db.query(
            LoanApplication.risk_category,
            func.count(LoanApplication.id).label("count"),
        ).group_by(LoanApplication.risk_category).all()

        return {
            "approval_stats": {
                "approval_rate": approval_rate,
                "average_loan": round(avg_loan, 0),
                "high_risk_users": high_risk
            },
            "risk_segmentation": [
                {"category": r[0] or "Unknown", "count": r[1]} for r in risk_dist
            ],
            "loan_clusters": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spark analytics failed: {str(e)}")   