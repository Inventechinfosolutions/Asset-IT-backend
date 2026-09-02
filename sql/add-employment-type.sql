-- Add employmentType (Permanent / Contract) to user_profiles
-- Safe to re-run.
USE AdminUsers;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'employmentType') = 0,
  'ALTER TABLE user_profiles ADD COLUMN employmentType ENUM(''Permanent'', ''Contract'') NOT NULL DEFAULT ''Permanent'' AFTER department',
  'SELECT ''employmentType already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
