-- Admin comment when updating request status
USE AdminUsers;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'support_requests'
     AND COLUMN_NAME = 'adminComment') = 0,
  'ALTER TABLE support_requests ADD COLUMN adminComment TEXT NULL AFTER selectedAssets',
  'SELECT ''adminComment already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
