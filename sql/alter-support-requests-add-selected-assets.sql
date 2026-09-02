-- Add selectedAssets JSON column for asset requests
USE AdminUsers;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'support_requests'
     AND COLUMN_NAME = 'selectedAssets') = 0,
  'ALTER TABLE support_requests ADD COLUMN selectedAssets JSON NULL AFTER description',
  'SELECT ''selectedAssets already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
