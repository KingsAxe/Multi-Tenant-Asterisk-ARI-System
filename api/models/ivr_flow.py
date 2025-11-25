from sqlalchemy import Column, Integer, String, Text, Boolean, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class IVRFlow(Base):
    __tablename__ = "ivr_flows"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    flow_json = Column(JSON, nullable=False)
    is_default = Column(Boolean, default=False)
    status = Column(Enum('active', 'inactive'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    tenant = relationship("Tenant", back_populates="ivr_flows")