-- Multi-Tenant IVR Database Schema

CREATE DATABASE IF NOT EXISTS ivr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ivr_system;

-- Tenants (Companies)
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- DIDs (Phone Numbers)
CREATE TABLE dids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    number VARCHAR(20) NOT NULL UNIQUE,
    country_code VARCHAR(5),
    description VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant (tenant_id),
    INDEX idx_number (number)
) ENGINE=InnoDB;

-- IVR Flows
CREATE TABLE ivr_flows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    flow_json JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant (tenant_id),
    INDEX idx_default (tenant_id, is_default)
) ENGINE=InnoDB;

-- Extensions
CREATE TABLE extensions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    extension VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('user', 'queue', 'ivr', 'voicemail') DEFAULT 'user',
    destination VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_ext (tenant_id, extension),
    INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB;

-- Call Detail Records (CDR) - Partitioned by month
CREATE TABLE cdr (
    id BIGINT AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    uniqueid VARCHAR(150) NOT NULL,
    call_date DATETIME NOT NULL,
    clid VARCHAR(80),
    src VARCHAR(80),
    dst VARCHAR(80),
    dcontext VARCHAR(80),
    channel VARCHAR(80),
    dstchannel VARCHAR(80),
    lastapp VARCHAR(80),
    lastdata VARCHAR(80),
    duration INT DEFAULT 0,
    billsec INT DEFAULT 0,
    disposition VARCHAR(45),
    amaflags INT,
    accountcode VARCHAR(20),
    userfield VARCHAR(255),
    recording_file VARCHAR(255),
    PRIMARY KEY (id, call_date),
    INDEX idx_tenant (tenant_id),
    INDEX idx_uniqueid (uniqueid),
    INDEX idx_date (call_date),
    INDEX idx_tenant_date (tenant_id, call_date)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(call_date) * 100 + MONTH(call_date)) (
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p202501 VALUES LESS THAN (202502),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Users (for dashboard access)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant (tenant_id),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Active Calls (for real-time monitoring)
CREATE TABLE active_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    uniqueid VARCHAR(150) NOT NULL UNIQUE,
    channel VARCHAR(80),
    caller_id VARCHAR(80),
    destination VARCHAR(80),
    status ENUM('ringing', 'answered', 'hold') DEFAULT 'ringing',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    INDEX idx_tenant (tenant_id),
    INDEX idx_status (status),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ODBC function for tenant lookup by DID
DELIMITER $$
CREATE FUNCTION get_tenant_by_did(did_number VARCHAR(20))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE tenant INT;
    SELECT tenant_id INTO tenant FROM dids WHERE number = did_number AND status = 'active' LIMIT 1;
    RETURN tenant;
END$$
DELIMITER ;

-- Insert sample data
INSERT INTO tenants (name, slug, email) VALUES 
('Acme Corp', 'acme', 'admin@acme.com'),
('Tech Solutions', 'techsol', 'admin@techsol.com');

INSERT INTO dids (tenant_id, number, country_code, description) VALUES
(1, '+1234567890', '+1', 'Main Number - Acme'),
(2, '+0987654321', '+1', 'Main Number - Tech Solutions');

INSERT INTO ivr_flows (tenant_id, name, description, flow_json, is_default) VALUES
(1, 'Main IVR', 'Default greeting and menu', 
 '{"nodes":[{"id":"start","type":"greeting","audio":"welcome.wav"},{"id":"menu","type":"menu","options":{"1":"sales","2":"support","0":"operator"}}]}', 
 TRUE);

-- Grant permissions for Asterisk ODBC
GRANT SELECT ON ivr_system.* TO 'ivr_user'@'%';
GRANT INSERT, UPDATE ON ivr_system.cdr TO 'ivr_user'@'%';
GRANT INSERT, UPDATE, DELETE ON ivr_system.active_calls TO 'ivr_user'@'%';
FLUSH PRIVILEGES;