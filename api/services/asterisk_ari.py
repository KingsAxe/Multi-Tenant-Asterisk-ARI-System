import aiohttp
import asyncio
from typing import Optional, Dict, Any
import json

class AsteriskARIClient:
    """Async client for Asterisk REST Interface (ARI)"""
    
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.auth = aiohttp.BasicAuth(username, password)
        self.session: Optional[aiohttp.ClientSession] = None
        self.ws: Optional[aiohttp.ClientWebSocketResponse] = None
        self.is_connected = False
        
    async def connect(self):
        """Initialize HTTP session"""
        if not self.session:
            self.session = aiohttp.ClientSession(auth=self.auth)
    
    async def close(self):
        """Close connections"""
        if self.ws:
            await self.ws.close()
        if self.session:
            await self.session.close()
    
    async def get(self, endpoint: str) -> Dict[Any, Any]:
        """GET request"""
        await self.connect()
        async with self.session.get(f"{self.base_url}{endpoint}") as resp:
            return await resp.json()
    
    async def post(self, endpoint: str, data: Optional[Dict] = None) -> Dict[Any, Any]:
        """POST request"""
        await self.connect()
        async with self.session.post(f"{self.base_url}{endpoint}", json=data) as resp:
            return await resp.json() if resp.status != 204 else {}
    
    async def delete(self, endpoint: str) -> bool:
        """DELETE request"""
        await self.connect()
        async with self.session.delete(f"{self.base_url}{endpoint}") as resp:
            return resp.status == 204
    
    # WebSocket for events
    async def connect_websocket(self, app_name: str = "ivr-handler"):
        """Connect to ARI WebSocket for real-time events"""
        await self.connect()
        ws_url = f"{self.base_url.replace('http', 'ws')}/events?app={app_name}"
        self.ws = await self.session.ws_connect(ws_url)
        self.is_connected = True
        return self.ws
    
    async def listen_events(self, callback):
        """Listen for ARI events"""
        if not self.ws:
            await self.connect_websocket()
        
        async for msg in self.ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                event = json.loads(msg.data)
                await callback(event)
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print(f"WebSocket error: {self.ws.exception()}")
                break
    
    # Channel operations
    async def answer_channel(self, channel_id: str):
        """Answer a channel"""
        return await self.post(f"/channels/{channel_id}/answer")
    
    async def hangup_channel(self, channel_id: str):
        """Hangup a channel"""
        return await self.delete(f"/channels/{channel_id}")
    
    async def play_media(self, channel_id: str, media: str):
        """Play media to a channel"""
        return await self.post(
            f"/channels/{channel_id}/play",
            {"media": f"sound:{media}"}
        )
    
    async def start_recording(self, channel_id: str, name: str):
        """Start recording a channel"""
        return await self.post(
            f"/channels/{channel_id}/record",
            {
                "name": name,
                "format": "wav",
                "maxDurationSeconds": 3600,
                "maxSilenceSeconds": 5
            }
        )
    
    # Bridge operations
    async def create_bridge(self, bridge_type: str = "mixing"):
        """Create a bridge"""
        return await self.post("/bridges", {"type": bridge_type})
    
    async def add_channel_to_bridge(self, bridge_id: str, channel_id: str):
        """Add channel to bridge"""
        return await self.post(f"/bridges/{bridge_id}/addChannel", {"channel": channel_id})
    
    # Application operations
    async def get_applications(self):
        """List ARI applications"""
        return await self.get("/applications")