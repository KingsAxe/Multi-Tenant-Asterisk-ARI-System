# Multi-Tenant ARI System

**Enterprise-Grade Cloud Telephony Platform**

This project delivers a **multi-tenant ARI (Asterisk REST Interface) system** that allows multiple businesses to operate independent telephony systems on a shared infrastructure. Think of it as a cloud platform for managing calls, IVR flows, and extensions across multiple tenants.

### 1. React Dashboard
- Real-time call monitoring with WebSocket
- Multi-tenant switching
- Live call statistics
- Call volume charts
- Performance metrics

### 2. IVR Flow Builder
- Visual drag-and-drop interface
- Node types: Greeting, Menu, Extension, Voicemail, Hangup
- Real-time flow visualization
- Connection management
- Properties editor
- Save/load flows

### 3. CDR Reports
- Advanced filtering (date range, status, search)
- Sortable data table
- Pagination
- CSV export
- Summary statistics
- Recording playback

### 4. WebRTC Softphone
- Full-featured softphone UI
- Dialpad with DTMF
- Call controls (mute, hold, transfer)
- Incoming call handling
- Volume control
- Call duration timer
- Floating widget mode

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  React Frontend │────▶│  FastAPI     │────▶│  MySQL DB   │
│  (Port 3000)    │◀────│  (Port 8000) │◀────│  (Port 3306)│
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌──────────────┐
│  WebSocket      │     │  Asterisk    │
│  (Real-time)    │     │  (Port 5060) │
└─────────────────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  ARI/HTTP    │
                        │  (Port 8088) │
                        └──────────────┘
```

## 📦 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + AsyncIO
- **PBX**: Asterisk 20 (pre-built Docker image)
- **Database**: MySQL 8.0 (partitioned CDR)
- **Cache**: Redis 7
- **Real-time**: WebSockets
- **Charts**: Recharts
- **Deployment**: Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Git
- 4GB RAM minimum

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ivr-system

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Copy all artifact files to their directories
# (See file structure below)

# 4. Start the stack
docker-compose up -d

# 5. Check status
docker-compose ps

# 6. View logs
docker-compose logs -f
```

### Access Points

- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Asterisk ARI**: http://localhost:8088/ari/api-docs
- **MySQL**: localhost:3306 (user: ivr_user, password: ivr_pass123)


## 🎯 Features Overview

### Dashboard
- **Real-time Metrics**: Total calls, active calls, answer rate, avg duration
- **Live Call Panel**: See active calls with status, duration, and controls
- **Call Volume Chart**: 24-hour visualization with answered/missed/abandoned
- **WebSocket Updates**: Instant updates when calls start/end

### IVR Flow Builder
- **Drag & Drop**: Move nodes around the canvas
- **Visual Connections**: Connect nodes with arrows
- **Node Types**:
  - Start: Entry point
  - Greeting: Play audio file
  - Menu: DTMF menu options
  - Extension: Transfer to extension
  - Voicemail: Drop to voicemail
  - Hangup: End call
- **Properties Panel**: Edit node settings
- **Save/Load**: Persist flows to database

### CDR Reports
- **Advanced Filters**: Date range, status, search
- **Summary Stats**: Total, answered, missed, avg duration
- **Data Table**: Sortable, paginated records
- **CSV Export**: Download reports
- **Recording Playback**: Listen to call recordings

### WebRTC Softphone
- **Full Dialpad**: Make outbound calls
- **Call Controls**: Mute, hold, transfer
- **Incoming Calls**: Answer/decline
- **Call Timer**: Live duration counter
- **Volume Control**: Adjust audio
- **Floating Mode**: Minimize to corner

## 🔧 Configuration

### SIP Trunk Setup

Edit `asterisk/config/pjsip.conf`:

```ini
[mytrunk](trunk-template)
aors=mytrunk
auth=mytrunk
outbound_auth=mytrunk

[mytrunk](trunk-template-auth)
username=your_sip_username
password=your_sip_password

[mytrunk](trunk-template-aor)
contact=sip:provider.com

[mytrunk](trunk-template-identify)
endpoint=mytrunk
match=provider_ip_address
```

### Environment Variables

Edit `.env`:

```bash
# Database
MYSQL_ROOT_PASSWORD=rootpass123
MYSQL_USER=ivr_user
MYSQL_PASSWORD=ivr_pass123

# Asterisk
ASTERISK_ARI_USER=ariuser
ASTERISK_ARI_PASSWORD=aripass123

# API
JWT_SECRET=change-me-in-production

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## 🧪 Testing

### Test the Dashboard
1. Navigate to http://localhost:3000
2. Select a tenant from dropdown
3. See real-time stats and charts

### Test IVR Flow Builder
1. Click "IVR Flows" in sidebar
2. Drag components from left panel
3. Shift+Click to connect nodes
4. Click nodes to edit properties
5. Click "Save Flow"

### Test CDR Reports
1. Click "Call History" in sidebar
2. Filter by date range
3. Search for numbers
4. Export to CSV

### Test Softphone
1. Click phone icon in header (or click "Softphone" in sidebar)
2. Enter a number on dialpad
3. Click green phone button to call
4. Use "Test Call" button to simulate incoming

### Test API
```bash
# Check health
curl http://localhost:8000/health

# Get tenants
curl http://localhost:8000/api/v1/tenants

# View API docs
open http://localhost:8000/docs
```

## 📊 Database Schema

8 tables with relationships:
- `tenants` - Company accounts
- `dids` - Phone numbers
- `ivr_flows` - IVR configurations
- `extensions` - User extensions
- `cdr` - Call records (partitioned)
- `users` - Dashboard users
- `active_calls` - Real-time call state

## 🔐 Security Notes

**Production Checklist**:
- [ ] Change all default passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Use environment secrets
- [ ] Configure SIP authentication
- [ ] Enable call encryption (SRTP)

## 🐛 Troubleshooting

### Port Already in Use
```bash
docker-compose down
sudo lsof -ti:3000 | xargs kill -9
```

### MySQL Connection Failed
```bash
docker-compose logs mysql
docker-compose restart mysql
```

### Asterisk Won't Start
```bash
docker-compose logs asterisk
# Check config files for syntax errors
```

### Frontend Build Fails
```bash
cd frontend
npm install
npm start
```

## 📝 API Endpoints

### Tenants
- `GET /api/v1/tenants` - List all tenants
- `POST /api/v1/tenants` - Create tenant
- `GET /api/v1/tenants/{id}` - Get tenant
- `DELETE /api/v1/tenants/{id}` - Delete tenant

### Calls
- `GET /api/v1/calls/active` - Active calls
- `GET /api/v1/calls/cdr` - Call history
- `POST /api/v1/calls/{id}/hangup` - Hangup call
- `POST /api/v1/calls/{id}/transfer` - Transfer call

### Analytics
- `GET /api/v1/analytics/stats/{tenant_id}` - Call statistics
- `GET /api/v1/analytics/call-volume/{tenant_id}` - Volume data
- `GET /api/v1/analytics/performance/{tenant_id}` - Performance metrics

### WebSocket
- `ws://localhost:8000/ws/{tenant_id}` - Real-time events

## 🎨 Customization

### Add New IVR Node Type
1. Update `IVRFlowBuilder.tsx` nodeTypes array
2. Add handler in Asterisk dialplan
3. Update backend IVR processor

### Custom Dashboard Widget
1. Create component in `frontend/src/components/`
2. Add to `AppWithRouting.tsx`
3. Fetch data from API

### New Report Type
1. Add API endpoint in `api/routes/analytics.py`
2. Create component in `frontend/src/components/`
3. Add navigation item

## 📚 Resources

- [Asterisk Documentation](https://wiki.asterisk.org/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - Free to use and modify

## 🎉 You're Done!

You now have a complete, production-ready multi-tenant IVR system with:
- Real-time dashboard
- Visual IVR flow builder
- Comprehensive CDR reports
- WebRTC softphone

Start customizing and deploying! 🚀