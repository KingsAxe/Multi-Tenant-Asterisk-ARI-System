-- Insert Test Data for Demo
-- Run this to populate the system

USE ivr_system;

-- Clear existing test data (optional)
-- DELETE FROM cdr WHERE uniqueid LIKE 'test-%';
-- DELETE FROM active_calls WHERE uniqueid LIKE 'test-%';

-- Insert test CDR records for the last 7 days
-- This creates realistic call history for the dashboard

-- Day 1 (Today) - Morning calls
INSERT INTO cdr (tenant_id, uniqueid, call_date, clid, src, dst, dcontext, channel, duration, billsec, disposition, recording_file) VALUES
(1, 'test-001', DATE_SUB(NOW(), INTERVAL 2 HOUR), '"Kingsley" <+12125551001>', '+12125551001', '100', 'tenant-1', 'PJSIP/trunk-001', 180, 175, 'ANSWERED', 'rec-001.wav'),
(1, 'test-002', DATE_SUB(NOW(), INTERVAL 3 HOUR), '"Innocent" <+12125551002>', '+12125551002', '101', 'tenant-1', 'PJSIP/trunk-002', 245, 240, 'ANSWERED', 'rec-002.wav'),
(1, 'test-003', DATE_SUB(NOW(), INTERVAL 4 HOUR), '"Brown" <+12125551003>', '+12125551003', '100', 'tenant-1', 'PJSIP/trunk-003', 0, 0, 'NO ANSWER', NULL),
(2, 'test-004', DATE_SUB(NOW(), INTERVAL 2 HOUR), '"Sunday" <+13105552001>', '+13105552001', '200', 'tenant-2', 'PJSIP/trunk-004', 320, 315, 'ANSWERED', 'rec-004.wav'),
(2, 'test-005', DATE_SUB(NOW(), INTERVAL 3 HOUR), '"David" <+13105552002>', '+13105552002', '201', 'tenant-2', 'PJSIP/trunk-005', 155, 150, 'ANSWERED', NULL);

-- Day 1 (Today) - Afternoon calls
INSERT INTO cdr (tenant_id, uniqueid, call_date, clid, src, dst, dcontext, channel, duration, billsec, disposition, recording_file) VALUES
(1, 'test-006', DATE_SUB(NOW(), INTERVAL 1 HOUR), '"Robert Mbu" <+12125551004>', '+12125551004', '102', 'tenant-1', 'PJSIP/trunk-006', 420, 415, 'ANSWERED', 'rec-006.wav'),
(1, 'test-007', DATE_SUB(NOW(), INTERVAL 30 MINUTE), '"Lisa Garcia" <+12125551005>', '+12125551005', '100', 'tenant-1', 'PJSIP/trunk-007', 0, 0, 'BUSY', NULL),
(1, 'test-008', DATE_SUB(NOW(), INTERVAL 15 MINUTE), '"James Martinez" <+12125551006>', '+12125551006', '103', 'tenant-1', 'PJSIP/trunk-008', 280, 275, 'ANSWERED', 'rec-008.wav'),
(2, 'test-009', DATE_SUB(NOW(), INTERVAL 1 HOUR), '"Jennifer Anderson" <+13105552003>', '+13105552003', '200', 'tenant-2', 'PJSIP/trunk-009', 190, 185, 'ANSWERED', 'rec-009.wav');

-- Yesterday's calls
INSERT INTO cdr (tenant_id, uniqueid, call_date, clid, src, dst, dcontext, channel, duration, billsec, disposition) VALUES
(1, 'test-010', DATE_SUB(NOW(), INTERVAL 1 DAY), '"Customer A" <+12125551010>', '+12125551010', '100', 'tenant-1', 'PJSIP/trunk-010', 300, 295, 'ANSWERED'),
(1, 'test-011', DATE_SUB(NOW(), INTERVAL 1 DAY), '"Customer B" <+12125551011>', '+12125551011', '101', 'tenant-1', 'PJSIP/trunk-011', 0, 0, 'NO ANSWER'),
(1, 'test-012', DATE_SUB(NOW(), INTERVAL 1 DAY), '"Customer C" <+12125551012>', '+12125551012', '102', 'tenant-1', 'PJSIP/trunk-012', 450, 445, 'ANSWERED'),
(2, 'test-013', DATE_SUB(NOW(), INTERVAL 1 DAY), '"Client X" <+13105552010>', '+13105552010', '200', 'tenant-2', 'PJSIP/trunk-013', 220, 215, 'ANSWERED'),
(2, 'test-014', DATE_SUB(NOW(), INTERVAL 1 DAY), '"Client Y" <+13105552011>', '+13105552011', '201', 'tenant-2', 'PJSIP/trunk-014', 0, 0, 'FAILED');

-- Last week's calls (for volume chart)
INSERT INTO cdr (tenant_id, uniqueid, call_date, clid, src, dst, dcontext, channel, duration, billsec, disposition) VALUES
-- 2 days ago
(1, 'test-015', DATE_SUB(NOW(), INTERVAL 2 DAY), '"Call 1" <+12125551020>', '+12125551020', '100', 'tenant-1', 'PJSIP/trunk-015', 200, 195, 'ANSWERED'),
(1, 'test-016', DATE_SUB(NOW(), INTERVAL 2 DAY), '"Call 2" <+12125551021>', '+12125551021', '101', 'tenant-1', 'PJSIP/trunk-016', 350, 345, 'ANSWERED'),
-- 3 days ago
(1, 'test-017', DATE_SUB(NOW(), INTERVAL 3 DAY), '"Call 3" <+12125551030>', '+12125551030', '100', 'tenant-1', 'PJSIP/trunk-017', 180, 175, 'ANSWERED'),
(1, 'test-018', DATE_SUB(NOW(), INTERVAL 3 DAY), '"Call 4" <+12125551031>', '+12125551031', '102', 'tenant-1', 'PJSIP/trunk-018', 0, 0, 'NO ANSWER'),
-- 4 days ago
(1, 'test-019', DATE_SUB(NOW(), INTERVAL 4 DAY), '"Call 5" <+12125551040>', '+12125551040', '100', 'tenant-1', 'PJSIP/trunk-019', 420, 415, 'ANSWERED'),
-- 5 days ago
(1, 'test-020', DATE_SUB(NOW(), INTERVAL 5 DAY), '"Call 6" <+12125551050>', '+12125551050', '101', 'tenant-1', 'PJSIP/trunk-020', 260, 255, 'ANSWERED'),
-- 6 days ago
(1, 'test-021', DATE_SUB(NOW(), INTERVAL 6 DAY), '"Call 7" <+12125551060>', '+12125551060', '100', 'tenant-1', 'PJSIP/trunk-021', 190, 185, 'ANSWERED'),
(1, 'test-022', DATE_SUB(NOW(), INTERVAL 6 DAY), '"Call 8" <+12125551061>', '+12125551061', '103', 'tenant-1', 'PJSIP/trunk-022', 0, 0, 'BUSY');

-- Insert test extensions
INSERT INTO extensions (tenant_id, extension, name, type, destination, status) VALUES
(1, '100', 'Sales Department', 'queue', 'queue:sales', 'active'),
(1, '101', 'Support Team', 'queue', 'queue:support', 'active'),
(1, '102', 'John Smith', 'user', 'PJSIP/john', 'active'),
(1, '103', 'Sarah Johnson', 'user', 'PJSIP/sarah', 'active'),
(2, '200', 'Main Reception', 'ivr', 'ivr:main', 'active'),
(2, '201', 'Sales', 'user', 'PJSIP/sales', 'active');

-- Insert test IVR flows
INSERT INTO ivr_flows (tenant_id, name, description, flow_json, is_default, status) VALUES
(1, 'Main Menu', 'Primary customer greeting and menu', 
 '{
   "nodes": [
     {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Call Start"}},
     {"id": "greeting", "type": "greeting", "position": {"x": 300, "y": 100}, "data": {"label": "Welcome", "audio": "welcome.wav"}},
     {"id": "menu", "type": "menu", "position": {"x": 500, "y": 100}, "data": {"label": "Main Menu", "options": {"1": "sales", "2": "support", "0": "operator"}}}
   ],
   "connections": [
     {"from": "start", "to": "greeting"},
     {"from": "greeting", "to": "menu"}
   ]
 }',
 TRUE, 'active'),
 
(1, 'After Hours', 'Voicemail and callback options',
 '{
   "nodes": [
     {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Call Start"}},
     {"id": "greeting", "type": "greeting", "position": {"x": 300, "y": 100}, "data": {"label": "Closed Message", "audio": "closed.wav"}},
     {"id": "voicemail", "type": "voicemail", "position": {"x": 500, "y": 100}, "data": {"label": "Leave Message"}}
   ],
   "connections": [
     {"from": "start", "to": "greeting"},
     {"from": "greeting", "to": "voicemail"}
   ]
 }',
 FALSE, 'active'),
 
(2, 'Tech Support Flow', 'Technical support routing',
 '{
   "nodes": [
     {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Call Start"}},
     {"id": "menu", "type": "menu", "position": {"x": 300, "y": 100}, "data": {"label": "Support Menu", "options": {"1": "billing", "2": "technical", "3": "sales"}}}
   ],
   "connections": [
     {"from": "start", "to": "menu"}
   ]
 }',
 TRUE, 'active');

-- Insert test users (for dashboard access)
INSERT INTO users (tenant_id, email, password_hash, name, role, status) VALUES
(1, 'admin@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMW9EkZCZxVe', 'Admin User', 'admin', 'active'),
(1, 'manager@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMW9EkZCZxVe', 'Sales Manager', 'manager', 'active'),
(2, 'admin@techsol.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5OMW9EkZCZxVe', 'Tech Admin', 'admin', 'active');

-- Summary query to verify data
SELECT 
    'Tenants' as entity,
    COUNT(*) as count
FROM tenants
UNION ALL
SELECT 'DIDs', COUNT(*) FROM dids
UNION ALL
SELECT 'CDR Records', COUNT(*) FROM cdr
UNION ALL
SELECT 'Extensions', COUNT(*) FROM extensions
UNION ALL
SELECT 'IVR Flows', COUNT(*) FROM ivr_flows
UNION ALL
SELECT 'Users', COUNT(*) FROM users;

-- Show recent calls per tenant
SELECT 
    t.name as tenant,
    COUNT(*) as total_calls,
    SUM(CASE WHEN c.disposition = 'ANSWERED' THEN 1 ELSE 0 END) as answered,
    SUM(CASE WHEN c.disposition = 'NO ANSWER' THEN 1 ELSE 0 END) as missed,
    ROUND(AVG(c.duration), 0) as avg_duration_sec
FROM cdr c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.call_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY t.id, t.name;

-- Success message
SELECT '✅ Test data inserted successfully!' as status;