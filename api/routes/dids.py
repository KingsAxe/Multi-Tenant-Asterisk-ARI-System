from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from database import get_db
from models.did import DID

router = APIRouter()

# Schemas
class DIDCreate(BaseModel):
    tenant_id: int
    number: str
    country_code: str | None = None
    description: str | None = None

class DIDResponse(BaseModel):
    id: int
    tenant_id: int
    number: str
    country_code: str | None
    description: str | None
    status: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[DIDResponse])
async def list_dids(tenant_id: int | None = None, db: AsyncSession = Depends(get_db)):
    """List DIDs, optionally filtered by tenant"""
    query = select(DID)
    if tenant_id:
        query = query.where(DID.tenant_id == tenant_id)
    
    result = await db.execute(query)
    dids = result.scalars().all()
    return dids

@router.post("/", response_model=DIDResponse, status_code=201)
async def create_did(did: DIDCreate, db: AsyncSession = Depends(get_db)):
    """Create new DID"""
    # Check if number exists
    result = await db.execute(select(DID).where(DID.number == did.number))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="DID number already exists")
    
    new_did = DID(**did.dict())
    db.add(new_did)
    await db.flush()
    await db.refresh(new_did)
    
    return new_did

@router.delete("/{did_id}")
async def delete_did(did_id: int, db: AsyncSession = Depends(get_db)):
    """Delete DID"""
    result = await db.execute(select(DID).where(DID.id == did_id))
    did = result.scalar_one_or_none()
    
    if not did:
        raise HTTPException(status_code=404, detail="DID not found")
    
    await db.delete(did)
    
    return {"message": "DID deleted successfully"}