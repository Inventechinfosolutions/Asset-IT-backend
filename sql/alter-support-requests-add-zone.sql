-- Add zone ENUM column to support_requests (after title)
USE AdminUsers;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'support_requests'
     AND COLUMN_NAME = 'zone') = 0,
  'ALTER TABLE support_requests ADD COLUMN zone ENUM(''North'', ''South'', ''East'', ''West'', ''Head Office'') NOT NULL DEFAULT ''Head Office'' AFTER title',
  'SELECT ''zone already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
