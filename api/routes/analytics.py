from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from typing import List

from database import get_db

router = APIRouter()

@router.get("/stats/{tenant_id}")
async def get_tenant_stats(
    tenant_id: int,
    period: str = Query("today", regex="^(today|week|month)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get call statistics for a tenant"""
    
    # Calculate date range
    now = datetime.utcnow()
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    else:  # month
        start_date = now - timedelta(days=30)
    
    # Mock data for now - replace with actual database queries
    stats = {
        "total_calls": 1247,
        "answered_calls": 1153,
        "missed_calls": 71,
        "abandoned_calls": 23,
        "avg_duration_seconds": 245,
        "total_duration_seconds": 305915,
        "answer_rate": 92.5,
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat()
    }
    
    return stats

@router.get("/call-volume/{tenant_id}")
async def get_call_volume(
    tenant_id: int,
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db)
):
    """Get call volume data for charts"""
    
    # Mock data for now - replace with actual time-series query
    data = []
    now = datetime.utcnow()
    
    for i in range(0, hours, 4):
        time_point = now - timedelta(hours=hours-i)
        data.append({
            "time": time_point.strftime("%H:%M"),
            "answered": 45 - (i % 20),
            "missed": 5 + (i % 3),
            "abandoned": 2 + (i % 2)
        })
    
    return {"data": data}

@router.get("/performance/{tenant_id}")
async def get_performance_metrics(
    tenant_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed performance metrics"""
    
    metrics = {
        "avg_wait_time": 18.5,
        "avg_talk_time": 245.3,
        "service_level": 87.2,  # % answered within threshold
        "abandonment_rate": 1.8,
        "busiest_hour": "14:00",
        "slowest_hour": "03:00"
    }
    
    return metrics