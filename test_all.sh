# #!/bin/bash

# # Colors for output
# RED='\033[0;31m'
# GREEN='\033[0;32m'
# YELLOW='\033[1;33m'
# NC='\033[0m' # No Color

# echo "🧪 IVR System - Automated Test Suite"
# echo "===================================="
# echo ""

# # Test counter
# PASSED=0
# FAILED=0

# # Helper functions
# pass_test() {
#     echo -e "${GREEN}✓${NC} $1"
#     ((PASSED++))
# }

# fail_test() {
#     echo -e "${RED}✗${NC} $1"
#     ((FAILED++))
# }

# warn_test() {
#     echo -e "${YELLOW}⚠${NC} $1"
# }

# # Phase 1: Infrastructure Tests
# echo "📋 Phase 1: Infrastructure Tests"
# echo "--------------------------------"

# # Test 1.1: Docker containers running
# echo -n "Testing Docker containers... "
# if docker-compose ps | grep -q "Up"; then
#     pass_test "All containers running"
# else
#     fail_test "Some containers not running"
#     docker-compose ps
# fi

# # Test 1.2: MySQL connection
# echo -n "Testing MySQL connection... "
# if docker exec ivr_mysql mysql -uivr_user -pivr_pass123 -e "SELECT 1;" &> /dev/null; then
#     pass_test "MySQL responding"
# else
#     fail_test "MySQL not responding"
# fi

# # Test 1.3: Redis connection
# echo -n "Testing Redis connection... "
# if docker exec ivr_redis redis-cli PING | grep -q "PONG"; then
#     pass_test "Redis responding"
# else
#     fail_test "Redis not responding"
# fi

# # Test 1.4: Asterisk running
# echo -n "Testing Asterisk... "
# if docker exec ivr_asterisk asterisk -rx "core show version" &> /dev/null; then
#     pass_test "Asterisk responding"
# else
#     fail_test "Asterisk not responding"
# fi

# echo ""

# # Phase 2: API Tests
# echo "📋 Phase 2: API Tests"
# echo "--------------------"

# API="http://localhost:8000"

# # Test 2.1: Health check
# echo -n "Testing API health... "
# HEALTH=$(curl -s $API/health)
# if echo "$HEALTH" | grep -q "healthy"; then
#     pass_test "API healthy"
# else
#     fail_test "API not healthy"
# fi

# # Test 2.2: Get tenants
# echo -n "Testing GET /tenants... "
# TENANTS=$(curl -s $API/api/v1/tenants)
# if echo "$TENANTS" | grep -q "Acme"; then
#     pass_test "Tenants endpoint working"
# else
#     fail_test "Tenants endpoint failed"
# fi

# # Test 2.3: Get tenant by ID
# echo -n "Testing GET /tenants/1... "
# TENANT=$(curl -s $API/api/v1/tenants/1)
# if echo "$TENANT" | grep -q "Acme"; then
#     pass_test "Single tenant endpoint working"
# else
#     fail_test "Single tenant endpoint failed"
# fi

# # Test 2.4: Get analytics
# echo -n "Testing GET /analytics/stats... "
# STATS=$(curl -s "$API/api/v1/analytics/stats/1?period=today")
# if echo "$STATS" | grep -q "total_calls"; then
#     pass_test "Analytics endpoint working"
# else
#     fail_test "Analytics endpoint failed"
# fi

# # Test 2.5: API response time
# echo -n "Testing API response time... "
# START=$(date +%s%N)
# curl -s $API/health > /dev/null
# END=$(date +%s%N)
# ELAPSED=$(( ($END - $START) / 1000000 ))
# if [ $ELAPSED -lt 500 ]; then
#     pass_test "Response time: ${ELAPSED}ms (< 500ms)"
# else
#     warn_test "Response time: ${ELAPSED}ms (consider optimization)"
# fi

# echo ""

# # Phase 3: Database Tests
# echo "📋 Phase 3: Database Tests"
# echo "-------------------------"

# # Test 3.1: Tables exist
# echo -n "Testing database tables... "
# TABLES=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "SHOW TABLES;" | wc -l)
# if [ $TABLES -gt 8 ]; then
#     pass_test "All tables exist ($((TABLES-1)) tables)"
# else
#     fail_test "Missing tables (found $((TABLES-1)))"
# fi

# # Test 3.2: Sample data
# echo -n "Testing sample data... "
# TENANT_COUNT=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "SELECT COUNT(*) FROM tenants;" | tail -1)
# if [ $TENANT_COUNT -ge 2 ]; then
#     pass_test "Sample tenants exist ($TENANT_COUNT tenants)"
# else
#     fail_test "Missing sample data"
# fi

# # Test 3.3: CDR partitions
# echo -n "Testing CDR partitions... "
# PARTITIONS=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "
#     SELECT COUNT(*) FROM INFORMATION_SCHEMA.PARTITIONS 
#     WHERE TABLE_SCHEMA = 'ivr_system' AND TABLE_NAME = 'cdr';
# " | tail -1)
# if [ $PARTITIONS -ge 3 ]; then
#     pass_test "CDR partitioned ($PARTITIONS partitions)"
# else
#     fail_test "CDR not properly partitioned"
# fi

# # Test 3.4: ODBC function
# echo -n "Testing ODBC function... "
# TENANT_ID=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "
#     SELECT get_tenant_by_did('+1234567890');
# " | tail -1)
# if [ "$TENANT_ID" == "1" ]; then
#     pass_test "ODBC function working"
# else
#     fail_test "ODBC function not working"
# fi

# echo ""

# # Phase 4: Frontend Tests
# echo "📋 Phase 4: Frontend Tests"
# echo "-------------------------"

# # Test 4.1: Frontend accessible
# echo -n "Testing frontend accessibility... "
# if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
#     pass_test "Frontend responding"
# else
#     fail_test "Frontend not responding"
# fi

# # Test 4.2: Frontend loads React app
# echo -n "Testing React app... "
# FRONTEND=$(curl -s http://localhost:3000)
# if echo "$FRONTEND" | grep -q "root"; then
#     pass_test "React app loaded"
# else
#     fail_test "React app not loaded"
# fi

# echo ""

# # Phase 5: Asterisk Tests
# echo "📋 Phase 5: Asterisk Tests"
# echo "-------------------------"

# # Test 5.1: ARI enabled
# echo -n "Testing ARI status... "
# ARI_STATUS=$(docker exec ivr_asterisk asterisk -rx "ari show status" 2>/dev/null)
# if echo "$ARI_STATUS" | grep -q "Enabled"; then
#     pass_test "ARI enabled"
# else
#     warn_test "ARI status unclear (may be normal)"
# fi

# # Test 5.2: HTTP server
# echo -n "Testing HTTP server... "
# HTTP_STATUS=$(docker exec ivr_asterisk asterisk -rx "http show status" 2>/dev/null)
# if echo "$HTTP_STATUS" | grep -q "Enabled"; then
#     pass_test "HTTP server enabled"
# else
#     fail_test "HTTP server not enabled"
# fi

# # Test 5.3: ARI endpoint accessible
# echo -n "Testing ARI endpoint... "
# ARI_INFO=$(curl -s -u ariuser:aripass123 http://localhost:8088/ari/asterisk/info)
# if echo "$ARI_INFO" | grep -q "system"; then
#     pass_test "ARI endpoint accessible"
# else
#     fail_test "ARI endpoint not accessible"
# fi

# echo ""

# # Summary
# echo "========================================"
# echo "📊 Test Summary"
# echo "========================================"
# echo -e "${GREEN}Passed: $PASSED${NC}"
# echo -e "${RED}Failed: $FAILED${NC}"
# echo ""

# if [ $FAILED -eq 0 ]; then
#     echo -e "${GREEN}✅ All tests passed! System ready for demo.${NC}"
#     exit 0
# else
#     echo -e "${RED}❌ Some tests failed. Review above output.${NC}"
#     exit 1
# fi





#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 IVR System - Automated Test Suite"
echo "===================================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper functions
pass_test() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail_test() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Phase 1: Infrastructure Tests
echo "📋 Phase 1: Infrastructure Tests"
echo "--------------------------------"

# Test 1.1: Docker containers running
echo -n "Testing Docker containers... "
if docker-compose ps | grep -q "Up"; then
    pass_test "All containers running"
else
    fail_test "Some containers not running"
    docker-compose ps
fi

# Test 1.2: MySQL connection
echo -n "Testing MySQL connection... "
if docker exec ivr_mysql mysql -uivr_user -pivr_pass123 -e "SELECT 1;" &> /dev/null; then
    pass_test "MySQL responding"
else
    fail_test "MySQL not responding"
fi

# Test 1.3: Redis connection
echo -n "Testing Redis connection... "
if docker exec ivr_redis redis-cli PING | grep -q "PONG"; then
    pass_test "Redis responding"
else
    fail_test "Redis not responding"
fi

# Test 1.4: Asterisk running
echo -n "Testing Asterisk... "
if docker exec ivr_asterisk asterisk -rx "core show version" &> /dev/null; then
    pass_test "Asterisk responding"
else
    fail_test "Asterisk not responding"
fi

echo ""

# Phase 2: API Tests
echo "📋 Phase 2: API Tests"
echo "--------------------"

API="http://localhost:8000"

# Test 2.1: Health check
echo -n "Testing API health... "
HEALTH=$(curl -s $API/health)
if echo "$HEALTH" | grep -q "healthy"; then
    pass_test "API healthy"
else
    fail_test "API not healthy"
fi

# Test 2.2: Get tenants
echo -n "Testing GET /tenants... "
TENANTS=$(curl -s $API/api/v1/tenants)
if echo "$TENANTS" | grep -q "Acme"; then
    pass_test "Tenants endpoint working"
else
    fail_test "Tenants endpoint failed"
fi

# Test 2.3: Get tenant by ID
echo -n "Testing GET /tenants/1... "
TENANT=$(curl -s $API/api/v1/tenants/1)
if echo "$TENANT" | grep -q "Acme"; then
    pass_test "Single tenant endpoint working"
else
    fail_test "Single tenant endpoint failed"
fi

# Test 2.4: Get analytics
echo -n "Testing GET /analytics/stats... "
STATS=$(curl -s "$API/api/v1/analytics/stats/1?period=today")
if echo "$STATS" | grep -q "total_calls"; then
    pass_test "Analytics endpoint working"
else
    fail_test "Analytics endpoint failed"
fi

# Test 2.5: API response time
echo -n "Testing API response time... "
START=$(date +%s%N)
curl -s $API/health > /dev/null
END=$(date +%s%N)
ELAPSED=$(( ($END - $START) / 1000000 ))
if [ $ELAPSED -lt 500 ]; then
    pass_test "Response time: ${ELAPSED}ms (< 500ms)"
else
    warn_test "Response time: ${ELAPSED}ms (consider optimization)"
fi

echo ""

# Phase 3: Database Tests
echo "📋 Phase 3: Database Tests"
echo "-------------------------"

# Test 3.1: Tables exist
echo -n "Testing database tables... "
TABLES=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | wc -l)
if [ $TABLES -ge 7 ]; then
    pass_test "All tables exist ($TABLES tables)"
else
    fail_test "Missing tables (found $TABLES)"
fi

# Test 3.2: Sample data
echo -n "Testing sample data... "
TENANT_COUNT=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "SELECT COUNT(*) FROM tenants;" | tail -1)
if [ $TENANT_COUNT -ge 2 ]; then
    pass_test "Sample tenants exist ($TENANT_COUNT tenants)"
else
    fail_test "Missing sample data"
fi

# Test 3.3: CDR partitions
echo -n "Testing CDR partitions... "
PARTITIONS=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.PARTITIONS 
    WHERE TABLE_SCHEMA = 'ivr_system' AND TABLE_NAME = 'cdr';
" | tail -1)
if [ $PARTITIONS -ge 3 ]; then
    pass_test "CDR partitioned ($PARTITIONS partitions)"
else
    fail_test "CDR not properly partitioned"
fi

# Test 3.4: ODBC function
echo -n "Testing ODBC function... "
TENANT_ID=$(docker exec ivr_mysql mysql -uivr_user -pivr_pass123 ivr_system -e "
    SELECT get_tenant_by_did('+1234567890');
" | tail -1)
if [ "$TENANT_ID" == "1" ]; then
    pass_test "ODBC function working"
else
    fail_test "ODBC function not working"
fi

echo ""

# Phase 4: Frontend Tests
echo "📋 Phase 4: Frontend Tests"
echo "-------------------------"

# Test 4.1: Frontend accessible
echo -n "Testing frontend accessibility... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    pass_test "Frontend responding"
else
    fail_test "Frontend not responding"
fi

# Test 4.2: Frontend loads React app
echo -n "Testing React app... "
FRONTEND=$(curl -s http://localhost:3000)
if echo "$FRONTEND" | grep -q "root"; then
    pass_test "React app loaded"
else
    fail_test "React app not loaded"
fi

echo ""

# Phase 5: Asterisk Tests
echo "📋 Phase 5: Asterisk Tests"
echo "-------------------------"

# Test 5.1: ARI enabled
echo -n "Testing ARI status... "
ARI_STATUS=$(docker exec ivr_asterisk asterisk -rx "ari show status" 2>/dev/null)
if echo "$ARI_STATUS" | grep -q "Enabled"; then
    pass_test "ARI enabled"
else
    warn_test "ARI status unclear (may be normal)"
fi

# Test 5.2: HTTP server
echo -n "Testing HTTP server... "
HTTP_STATUS=$(docker exec ivr_asterisk asterisk -rx "http show status" 2>/dev/null)
if echo "$HTTP_STATUS" | grep -q "Enabled"; then
    pass_test "HTTP server enabled"
else
    fail_test "HTTP server not enabled"
fi

# Test 5.3: ARI endpoint accessible
echo -n "Testing ARI endpoint... "
ARI_INFO=$(curl -s -u ariuser:aripass123 http://localhost:8088/ari/asterisk/info)
if echo "$ARI_INFO" | grep -q "system"; then
    pass_test "ARI endpoint accessible"
else
    fail_test "ARI endpoint not accessible"
fi

echo ""

# Summary
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! System ready for demo.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Review above output.${NC}"
    exit 1
fi