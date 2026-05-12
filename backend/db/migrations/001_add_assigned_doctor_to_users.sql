USE careassist;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS assigned_doctor_id INT NULL;

SET @has_fk_users_assigned_doctor := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND CONSTRAINT_NAME = 'fk_users_assigned_doctor'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql_users_assigned_doctor_fk := IF(
  @has_fk_users_assigned_doctor = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_assigned_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt_users_assigned_doctor_fk FROM @sql_users_assigned_doctor_fk;
EXECUTE stmt_users_assigned_doctor_fk;
DEALLOCATE PREPARE stmt_users_assigned_doctor_fk;
