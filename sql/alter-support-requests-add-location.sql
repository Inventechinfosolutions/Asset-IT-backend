-- Add location (address) to support_requests
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'support_requests'
    AND COLUMN_NAME = 'location'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE support_requests ADD COLUMN location VARCHAR(500) NOT NULL DEFAULT '''' AFTER title',
  'SELECT ''location column already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'location column ready' AS status;
