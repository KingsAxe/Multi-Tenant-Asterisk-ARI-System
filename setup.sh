#!/bin/bash

echo "🚀 Setting up Multi-Tenant IVR System..."
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p ivr-system/{asterisk/config,mysql/init,api/{models,routes,services},frontend/{src/{components,services,types},public}}

cd ivr-system

# Create .env file
echo "⚙️  Creating .env file..."
cat > .env << 'EOF'
# Database
MYSQL_ROOT_PASSWORD=rootpass123
MYSQL_DATABASE=ivr_system
MYSQL_USER=ivr_user
MYSQL_PASSWORD=ivr_pass123

# Asterisk
ASTERISK_ARI_USER=ariuser
ASTERISK_ARI_PASSWORD=aripass123

# API
JWT_SECRET=my-secret-key
API_PORT=8000

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update asterisk/config/pjsip.conf with your SIP trunk details"
echo "2. Run: docker-compose up -d"
echo "3. Access dashboard at: http://localhost:3000"
echo ""
echo " Documentation:"
echo "- API Docs: http://localhost:8000/docs"
echo "- Asterisk ARI: http://localhost:8088/ari/api-docs"
echo ""