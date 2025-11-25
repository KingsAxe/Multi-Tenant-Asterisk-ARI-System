from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from pydantic import BaseModel

from database import get_db
from models.ivr_flow import IVRFlow

router = APIRouter()

# Schemas
class IVRFlowCreate(BaseModel):
    tenant_id: int
    name: str
    description: str | None = None
    flow_json: Dict[str, Any]
    is_default: bool = False

class IVRFlowResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    description: str | None
    flow_json: Dict[str, Any]
    is_default: bool
    status: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[IVRFlowResponse])
async def list_ivr_flows(tenant_id: int, db: AsyncSession = Depends(get_db)):
    """List IVR flows for a tenant"""
    result = await db.execute(
        select(IVRFlow).where(IVRFlow.tenant_id == tenant_id)
    )
    flows = result.scalars().all()
    return flows

@router.get("/{flow_id}", response_model=IVRFlowResponse)
async def get_ivr_flow(flow_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific IVR flow"""
    result = await db.execute(select(IVRFlow).where(IVRFlow.id == flow_id))
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(status_code=404, detail="IVR flow not found")
    
    return flow

@router.post("/", response_model=IVRFlowResponse, status_code=201)
async def create_ivr_flow(flow: IVRFlowCreate, db: AsyncSession = Depends(get_db)):
    """Create new IVR flow"""
    new_flow = IVRFlow(**flow.dict())
    db.add(new_flow)
    await db.flush()
    await db.refresh(new_flow)
    
    return new_flow

@router.put("/{flow_id}", response_model=IVRFlowResponse)
async def update_ivr_flow(
    flow_id: int, 
    flow_data: IVRFlowCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Update IVR flow"""
    result = await db.execute(select(IVRFlow).where(IVRFlow.id == flow_id))
    flow = result.scalar_one_or_none()
    
    if not flow:
        raise HTTPException(status_code=404, detail="IVR flow not found")
    
    for key, value in flow_data.dict(exclude_unset=True).items():
        setattr(flow, key, value)
    
    await db.flush()
    await db.refresh(flow)
    
    return flow