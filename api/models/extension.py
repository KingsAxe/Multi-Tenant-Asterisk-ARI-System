from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Extension(Base):
    __tablename__ = "extensions"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    extension = Column(String(20), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(Enum('user', 'queue', 'ivr', 'voicemail'), default='user')
    destination = Column(String(255))
    status = Column(Enum('active', 'inactive'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    tenant = relationship("Tenant", back_populates="extensions")