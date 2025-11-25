from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class DID(Base):
    __tablename__ = "dids"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    number = Column(String(20), unique=True, nullable=False, index=True)
    country_code = Column(String(5))
    description = Column(String(255))
    status = Column(Enum('active', 'inactive'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    tenant = relationship("Tenant", back_populates="dids")