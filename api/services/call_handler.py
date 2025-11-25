import asyncio
from typing import Dict
from services.asterisk_ari import AsteriskARIClient

class CallHandler:
    """Handles incoming calls via ARI"""
    
    def __init__(self, ari_client: AsteriskARIClient):
        self.ari = ari_client
        self.active_calls: Dict[str, dict] = {}
        self.running = False
    
    async def start(self):
        """Start listening for call events"""
        self.running = True
        try:
            await self.ari.connect_websocket("ivr-handler")
            await self.ari.listen_events(self.handle_event)
        except Exception as e:
            print(f"❌ Call handler error: {e}")
    
    async def stop(self):
        """Stop the call handler"""
        self.running = False
        await self.ari.close()
    
    async def handle_event(self, event: dict):
        """Route events to appropriate handlers"""
        event_type = event.get('type')
        
        handlers = {
            'StasisStart': self.on_stasis_start,
            'StasisEnd': self.on_stasis_end,
            'ChannelDtmfReceived': self.on_dtmf_received,
            'ChannelStateChange': self.on_state_change,
            'PlaybackFinished': self.on_playback_finished,
        }
        
        handler = handlers.get(event_type)
        if handler:
            await handler(event)
    
    async def on_stasis_start(self, event: dict):
        """Handle new call entering Stasis application"""
        channel = event['channel']
        channel_id = channel['id']
        args = event.get('args', [])
        
        # Extract tenant_id and DID from args
        tenant_id = args[0] if len(args) > 0 else None
        did = args[1] if len(args) > 1 else None
        
        print(f"📞 New call: {channel_id} | Tenant: {tenant_id} | DID: {did}")
        
        # Store call info
        self.active_calls[channel_id] = {
            'tenant_id': tenant_id,
            'did': did,
            'caller_id': channel.get('caller', {}).get('number'),
            'state': 'ringing'
        }
        
        # Answer the call
        await self.ari.answer_channel(channel_id)
        
        # Play greeting
        await self.ari.play_media(channel_id, "tt-monkeys")
        
        # TODO: Load IVR flow from database and execute
        # For now, just play a greeting
    
    async def on_stasis_end(self, event: dict):
        """Handle call leaving Stasis"""
        channel_id = event['channel']['id']
        print(f"👋 Call ended: {channel_id}")
        
        if channel_id in self.active_calls:
            del self.active_calls[channel_id]
    
    async def on_dtmf_received(self, event: dict):
        """Handle DTMF digit received"""
        channel_id = event['channel']['id']
        digit = event['digit']
        
        print(f"🔢 DTMF received: {digit} on {channel_id}")
        
        # TODO: Process digit based on IVR state
        # For now, echo back
        if digit == '1':
            await self.ari.play_media(channel_id, "digits/1")
        elif digit == '9':
            await self.ari.hangup_channel(channel_id)
    
    async def on_state_change(self, event: dict):
        """Handle channel state changes"""
        channel_id = event['channel']['id']
        state = event['channel']['state']
        
        if channel_id in self.active_calls:
            self.active_calls[channel_id]['state'] = state
    
    async def on_playback_finished(self, event: dict):
        """Handle playback completion"""
        playback_id = event['playback']['id']
        print(f"▶️ Playback finished: {playback_id}")
        
        # TODO: Continue IVR flow after playback
    
    def get_active_calls(self, tenant_id: int = None):
        """Get active calls, optionally filtered by tenant"""
        if tenant_id:
            return {k: v for k, v in self.active_calls.items() 
                   if v.get('tenant_id') == str(tenant_id)}
        return self.active_calls