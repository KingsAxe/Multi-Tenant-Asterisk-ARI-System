import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/1"
    async with websockets.connect(uri) as websocket:
        print("✅ Connected to WebSocket")
        
        # Listen for 10 seconds
        try:
            while True:
                message = await asyncio.wait_for(websocket.recv(), timeout=10)
                print(f"📨 Received: {message}")
        except asyncio.TimeoutError:
            print("⏱️ No messages received (this is normal if no calls)")

asyncio.run(test_websocket())