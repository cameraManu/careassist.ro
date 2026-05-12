USE careassist;

-- Demo doctor and patients assignment.
-- Expected IDs in local dev setup:
--   doctor Marcel: id = 2
--   patients: Roxana (id = 1), Mihai (id = 3)
UPDATE users
SET assigned_doctor_id = 2
WHERE id IN (1, 3);

-- Insert sample alerts for current doctor scope.
INSERT INTO alerts (device_id, user_id, alert_type, severity, status, acknowledged_at, acknowledged_by)
VALUES
  (1, 1, 'HIGH_HEART_RATE', 'high', 'active', NULL, NULL),
  (2, 3, 'GAS_DETECTED', 'critical', 'active', NULL, NULL),
  (1, 1, 'ROOM_TEMPERATURE_SPIKE', 'medium', 'acknowledged', NOW(), 2);
