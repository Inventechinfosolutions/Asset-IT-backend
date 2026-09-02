-- Unique display request code (REQ-01, REQ-02, ...)
-- Safe to re-run. Compatible with MySQL Workbench safe update mode.
USE AdminUsers;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'support_requests'
     AND COLUMN_NAME = 'requestCode') = 0,
  'ALTER TABLE support_requests ADD COLUMN requestCode VARCHAR(20) NULL AFTER id',
  'SELECT ''requestCode already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE support_requests
SET requestCode = CONCAT('REQ-', LPAD(id, 2, '0'))
WHERE id > 0
  AND (requestCode IS NULL OR requestCode = '');

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'support_requests'
     AND INDEX_NAME = 'UQ_support_requests_requestCode') = 0,
  'ALTER TABLE support_requests ADD UNIQUE KEY UQ_support_requests_requestCode (requestCode)',
  'SELECT ''requestCode unique index already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
