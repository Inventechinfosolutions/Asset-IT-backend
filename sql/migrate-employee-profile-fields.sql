-- Employee profile fields: firstName, lastName, mobile, department
-- Safe to re-run: skips columns that already exist.
USE AdminUsers;

-- firstName
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'firstName') = 0,
  'ALTER TABLE user_profiles ADD COLUMN firstName VARCHAR(100) NULL AFTER name',
  'SELECT ''firstName already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- lastName
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'lastName') = 0,
  'ALTER TABLE user_profiles ADD COLUMN lastName VARCHAR(100) NULL AFTER firstName',
  'SELECT ''lastName already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- mobile
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'mobile') = 0,
  'ALTER TABLE user_profiles ADD COLUMN mobile VARCHAR(20) NULL AFTER lastName',
  'SELECT ''mobile already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- department
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'user_profiles'
     AND COLUMN_NAME = 'department') = 0,
  'ALTER TABLE user_profiles ADD COLUMN department VARCHAR(100) NULL AFTER mobile',
  'SELECT ''department already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill existing rows
UPDATE user_profiles
SET firstName = name
WHERE firstName IS NULL OR TRIM(firstName) = '';

UPDATE user_profiles
SET department = 'General'
WHERE department IS NULL OR TRIM(department) = '';

-- Required fields
ALTER TABLE user_profiles
  MODIFY firstName VARCHAR(100) NOT NULL,
  MODIFY department VARCHAR(100) NOT NULL;
