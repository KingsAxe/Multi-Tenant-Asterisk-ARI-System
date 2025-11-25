const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private tenantId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private callbacks: ((data: any) => void)[] = [];

  connect(tenantId: number) {
    if (this.ws?.readyState === WebSocket.OPEN && this.tenantId === tenantId) {
      return;
    }

    this.tenantId = tenantId;
    this.ws = new WebSocket(`${WS_URL}/${tenantId}`);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.tenantId) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        if (this.tenantId) {
          this.connect(this.tenantId);
        }
      }, this.reconnectInterval);
    }
  }

  subscribe(callback: (data: any) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.tenantId = null;
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsService = new WebSocketService();