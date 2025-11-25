from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    status = Column(Enum('active', 'suspended', 'inactive'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - NOW FULLY DEFINED!
    dids = relationship("DID", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin")
    ivr_flows = relationship("IVRFlow", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin")
    extensions = relationship("Extension", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin")
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin")