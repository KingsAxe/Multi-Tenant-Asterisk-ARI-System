
from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey
from datetime import datetime
from database import Base

class CDR(Base):
    __tablename__ = "cdr"
    
    id = Column(BigInteger, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    uniqueid = Column(String(150), nullable=False, index=True)
    call_date = Column(DateTime, nullable=False, index=True, primary_key=True)
    clid = Column(String(80))
    src = Column(String(80))
    dst = Column(String(80))
    dcontext = Column(String(80))
    channel = Column(String(80))
    dstchannel = Column(String(80))
    lastapp = Column(String(80))
    lastdata = Column(String(80))
    duration = Column(Integer, default=0)
    billsec = Column(Integer, default=0)
    disposition = Column(String(45))
    amaflags = Column(Integer)
    accountcode = Column(String(20))
    userfield = Column(String(255))
    recording_file = Column(String(255))