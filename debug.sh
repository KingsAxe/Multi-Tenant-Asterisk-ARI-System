#!/bin/bash

echo "🔍 IVR System - Debug Information"
echo "=================================="
echo ""

# Check container status
echo "📦 Container Status:"
docker-compose ps
echo ""

# Check API logs for errors
echo "🔴 API Errors (last 20 lines):"
docker-compose logs api --tail=20 | grep -i error
echo ""

# Check if API is actually running
echo "🔍 API Process:"
docker exec ivr_api ps aux | grep python
echo ""

# Check API health endpoint
echo "🏥 API Health Check:"
curl -s http://localhost:8000/health || echo "API not responding"
echo ""

# Check Asterisk process
echo "📞 Asterisk Status:"
docker exec ivr_asterisk ps aux | grep asterisk || echo "Asterisk process not found"
echo ""

# Try Asterisk CLI
echo "📞 Asterisk CLI Test:"
docker exec ivr_asterisk asterisk -rx "core show version" 2>&1 || echo "Asterisk CLI not responding"
echo ""

# Check database tables
echo "🗄️  Database Tables:"
docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "SHOW TABLES;" 2>&1 | grep -v "Warning"
echo ""

# Check frontend
echo "🎨 Frontend Status:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000
echo ""

# Check ports
echo "🔌 Open Ports:"
netstat -tuln 2>/dev/null | grep -E '3000|3306|5060|6379|8000|8088' || lsof -i :3000,:8000,:8088 2>/dev/null
echo ""

echo "=================================="
echo "💡 Common Fixes:"
echo "1. API not responding → docker-compose restart api"
echo "2. Asterisk issues → docker-compose restart asterisk"
echo "3. Database connection → docker-compose restart mysql"
echo "4. Frontend not updating → docker-compose restart frontend"
echo "5. Complete reset → docker-compose down && docker-compose up -d"
echo ""