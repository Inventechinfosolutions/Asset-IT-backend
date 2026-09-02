-- Rename username/name to aliasName and drop employmentType from user_profiles
-- Safe to re-run.
USE AdminUsers;

-- Sync profile alias from login alias before column rename (only if username still exists)
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'users'
     AND COLUMN_NAME = 'username') > 0
  AND (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'name') > 0,
  'UPDATE user_profiles p INNER JOIN users u ON u.id = p.userId SET p.name = u.username WHERE u.username IS NOT NULL',
  'SELECT ''profile alias sync skipped'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- users.username -> aliasName
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'users'
     AND COLUMN_NAME = 'username') > 0,
  'ALTER TABLE users CHANGE COLUMN username aliasName VARCHAR(100) NOT NULL',
  'SELECT ''users.aliasName already migrated'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- user_profiles.name -> aliasName
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'name') > 0,
  'ALTER TABLE user_profiles CHANGE COLUMN name aliasName VARCHAR(255) NOT NULL',
  'SELECT ''user_profiles.aliasName already migrated'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Keep profile alias in sync after rename
UPDATE user_profiles p
INNER JOIN users u ON u.id = p.userId
SET p.aliasName = u.aliasName
WHERE u.aliasName IS NOT NULL
  AND (p.aliasName IS NULL OR p.aliasName <> u.aliasName);

-- Drop employmentType
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'employmentType') > 0,
  'ALTER TABLE user_profiles DROP COLUMN employmentType',
  'SELECT ''employmentType already dropped'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
