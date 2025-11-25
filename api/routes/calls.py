from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db

router = APIRouter()

@router.get("/active")
async def get_active_calls(
    tenant_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get currently active calls"""
    # This would query the active_calls table
    # For now, return from call handler state
    from main import app
    
    if hasattr(app.state, 'call_handler'):
        active = app.state.call_handler.get_active_calls(tenant_id)
        return {"calls": list(active.values())}
    
    return {"calls": []}

@router.get("/cdr")
async def get_cdr_records(
    tenant_id: int = Query(...),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db)
):
    """Get Call Detail Records"""
    # Import CDR model (you'll need to create this)
    # This is a placeholder - implement actual CDR query
    
    return {
        "records": [],
        "total": 0,
        "limit": limit,
        "offset": offset
    }

@router.post("/{channel_id}/hangup")
async def hangup_call(channel_id: str):
    """Hangup an active call"""
    from main import app
    
    if hasattr(app.state, 'ari_client'):
        await app.state.ari_client.hangup_channel(channel_id)
        return {"message": "Call hungup successfully"}
    
    return {"error": "ARI client not available"}, 503

@router.post("/{channel_id}/transfer")
async def transfer_call(channel_id: str, destination: str):
    """Transfer a call to another destination"""
    from main import app
    
    if hasattr(app.state, 'ari_client'):
        # Implement call transfer logic
        return {"message": f"Call transferred to {destination}"}
    
    return {"error": "ARI client not available"}, 503