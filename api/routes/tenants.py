from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from database import get_db
from models.tenant import Tenant

router = APIRouter()

# Schemas
class TenantCreate(BaseModel):
    name: str
    slug: str
    email: str

class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    email: str
    status: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TenantResponse])
async def list_tenants(db: AsyncSession = Depends(get_db)):
    """List all tenants"""
    result = await db.execute(select(Tenant))
    tenants = result.scalars().all()
    return tenants

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    """Get tenant by ID"""
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return tenant

@router.post("/", response_model=TenantResponse, status_code=201)
async def create_tenant(tenant: TenantCreate, db: AsyncSession = Depends(get_db)):
    """Create new tenant"""
    # Check if slug exists
    result = await db.execute(select(Tenant).where(Tenant.slug == tenant.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    new_tenant = Tenant(**tenant.dict())
    db.add(new_tenant)
    await db.flush()
    await db.refresh(new_tenant)
    
    return new_tenant

@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    """Delete tenant"""
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    await db.delete(tenant)
    
    return {"message": "Tenant deleted successfully"}