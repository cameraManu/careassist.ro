USE careassist;

CREATE TABLE IF NOT EXISTS alerts (
  lid INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NULL,
  user_id INT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  INDEX idx_alerts_timestamp (timestamp),
  INDEX idx_alerts_user (user_id),
  INDEX idx_alerts_device (device_id),
  CONSTRAINT fk_alerts_device FOREIGN KEY (device_id)
    REFERENCES devices(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_alerts_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS acknowledged_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS acknowledged_by INT NULL;

SET @has_idx_alerts_status_timestamp := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alerts'
    AND INDEX_NAME = 'idx_alerts_status_timestamp'
);

SET @sql_alerts_status_idx := IF(
  @has_idx_alerts_status_timestamp = 0,
  'CREATE INDEX idx_alerts_status_timestamp ON alerts (status, timestamp)',
  'SELECT 1'
);

PREPARE stmt_alerts_status_idx FROM @sql_alerts_status_idx;
EXECUTE stmt_alerts_status_idx;
DEALLOCATE PREPARE stmt_alerts_status_idx;

SET @has_fk_alerts_acknowledged_by := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alerts'
    AND CONSTRAINT_NAME = 'fk_alerts_acknowledged_by'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql_alerts_acknowledged_by_fk := IF(
  @has_fk_alerts_acknowledged_by = 0,
  'ALTER TABLE alerts ADD CONSTRAINT fk_alerts_acknowledged_by FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt_alerts_acknowledged_by_fk FROM @sql_alerts_acknowledged_by_fk;
EXECUTE stmt_alerts_acknowledged_by_fk;
DEALLOCATE PREPARE stmt_alerts_acknowledged_by_fk;
