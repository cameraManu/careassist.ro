USE careassist;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted DATETIME NULL;

-- Populate missing identity data only when needed (safe defaults for legacy rows).
UPDATE users
SET username = CONCAT('user_', id)
WHERE username IS NULL OR username = '';

UPDATE users
SET email = CONCAT('user_', id, '@careassist.local')
WHERE email IS NULL OR email = '';

ALTER TABLE users
  MODIFY COLUMN username VARCHAR(100) NOT NULL,
  MODIFY COLUMN email VARCHAR(150) NOT NULL;

SET @has_uq_users_username := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'uq_users_username'
);

SET @sql_uq_users_username := IF(
  @has_uq_users_username = 0,
  'ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username)',
  'SELECT 1'
);

PREPARE stmt_uq_users_username FROM @sql_uq_users_username;
EXECUTE stmt_uq_users_username;
DEALLOCATE PREPARE stmt_uq_users_username;

SET @has_uq_users_email := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'uq_users_email'
);

SET @sql_uq_users_email := IF(
  @has_uq_users_email = 0,
  'ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email)',
  'SELECT 1'
);

PREPARE stmt_uq_users_email FROM @sql_uq_users_email;
EXECUTE stmt_uq_users_email;
DEALLOCATE PREPARE stmt_uq_users_email;
