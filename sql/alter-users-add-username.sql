-- Login identity: username instead of email
-- Safe to re-run: skips steps that are already applied.

-- 1) Add username only if missing
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'username'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE users ADD COLUMN username VARCHAR(100) NULL AFTER id',
  'SELECT ''username column already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Backfill username from email local-part where empty (only if email still exists)
SET @email_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email'
);

SET @sql := IF(
  @email_exists > 0,
  'UPDATE users SET username = LOWER(SUBSTRING_INDEX(email, ''@'', 1)) WHERE (username IS NULL OR username = '''') AND email IS NOT NULL AND email <> ''''',
  'SELECT ''skip backfill (no email column)'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Resolve duplicate usernames
UPDATE users u
JOIN (
  SELECT username, MIN(id) AS keep_id
  FROM users
  WHERE username IS NOT NULL AND username <> ''
  GROUP BY username
  HAVING COUNT(*) > 1
) d ON u.username = d.username AND u.id <> d.keep_id
SET u.username = CONCAT(u.username, '_', LEFT(REPLACE(u.id, '-', ''), 8));

-- 4) Ensure NOT NULL
ALTER TABLE users
  MODIFY COLUMN username VARCHAR(100) NOT NULL;

-- 5) Unique index only if missing
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'uk_users_username'
);

SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE users ADD UNIQUE KEY uk_users_username (username)',
  'SELECT ''uk_users_username already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6) Drop email column if still present
SET @email_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email'
);

SET @sql := IF(
  @email_exists > 0,
  'ALTER TABLE users DROP COLUMN email',
  'SELECT ''email column already dropped'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed' AS status;
