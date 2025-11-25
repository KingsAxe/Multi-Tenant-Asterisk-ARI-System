from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, Set

from config import settings
from database import engine, Base
from routes import tenants, calls, analytics, dids, extensions, ivr_flows
from services.asterisk_ari import AsteriskARIClient
from services.call_handler import CallHandler

# Import all models to ensure they're registered
from models import Tenant, DID, IVRFlow, Extension, User, CDR

# WebSocket connections for real-time updates
active_connections: Dict[int, Set[WebSocket]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize ARI client
    app.state.ari_client = AsteriskARIClient(
        base_url=settings.ASTERISK_ARI_URL,
        username=settings.ASTERISK_ARI_USER,
        password=settings.ASTERISK_ARI_PASSWORD
    )
    
    # Start call handler
    app.state.call_handler = CallHandler(app.state.ari_client)
    asyncio.create_task(app.state.call_handler.start())
    
    print("🚀 IVR System API Started")
    print(f"📞 Asterisk ARI: {settings.ASTERISK_ARI_URL}")
    
    yield
    
    # Shutdown
    await app.state.call_handler.stop()
    print("👋 IVR System API Stopped")

app = FastAPI(
    title="Multi-Tenant IVR System",
    description="Production-ready IVR platform with multi-tenancy",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["Tenants"])
app.include_router(calls.router, prefix="/api/v1/calls", tags=["Calls"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "service": "Multi-Tenant IVR System",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health():
    ari_status = "connected" if app.state.ari_client.is_connected else "disconnected"
    return {
        "status": "healthy",
        "asterisk_ari": ari_status,
        "database": "connected"
    }

# WebSocket for real-time call updates
@app.websocket("/ws/{tenant_id}")
async def websocket_endpoint(websocket: WebSocket, tenant_id: int):
    await websocket.accept()
    
    if tenant_id not in active_connections:
        active_connections[tenant_id] = set()
    active_connections[tenant_id].add(websocket)
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[tenant_id].remove(websocket)
        if not active_connections[tenant_id]:
            del active_connections[tenant_id]

async def broadcast_call_event(tenant_id: int, event: dict):
    """Broadcast call events to connected WebSocket clients"""
    if tenant_id in active_connections:
        for connection in active_connections[tenant_id]:
            try:
                await connection.send_json(event)
            except:
                pass

# Store broadcast function in app state for use by call handler
app.state.broadcast_call_event = broadcast_call_event