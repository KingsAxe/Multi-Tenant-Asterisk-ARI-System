from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from database import get_db
from models.extension import Extension

router = APIRouter()

# Schemas
class ExtensionCreate(BaseModel):
    tenant_id: int
    extension: str
    name: str
    type: str = "user"
    destination: str | None = None

class ExtensionResponse(BaseModel):
    id: int
    tenant_id: int
    extension: str
    name: str
    type: str
    destination: str | None
    status: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[ExtensionResponse])
async def list_extensions(tenant_id: int, db: AsyncSession = Depends(get_db)):
    """List extensions for a tenant"""
    result = await db.execute(
        select(Extension).where(Extension.tenant_id == tenant_id)
    )
    extensions = result.scalars().all()
    return extensions

@router.post("/", response_model=ExtensionResponse, status_code=201)
async def create_extension(ext: ExtensionCreate, db: AsyncSession = Depends(get_db)):
    """Create new extension"""
    new_ext = Extension(**ext.dict())
    db.add(new_ext)
    await db.flush()
    await db.refresh(new_ext)
    
    return new_ext