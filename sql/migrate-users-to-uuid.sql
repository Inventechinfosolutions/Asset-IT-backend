-- Migrate users.id and support_requests.userId from INT to UUID (CHAR(36))
USE AdminUsers;

-- 1) Drop FK from support_requests -> users (name may vary)
SET @fk_name := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'support_requests'
    AND COLUMN_NAME = 'userId'
    AND REFERENCED_TABLE_NAME = 'users'
  LIMIT 1
);

SET @sql := IF(
  @fk_name IS NULL,
  'SELECT ''No FK on support_requests.userId'' AS info',
  CONCAT('ALTER TABLE support_requests DROP FOREIGN KEY `', @fk_name, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Add temporary UUID columns
ALTER TABLE users ADD COLUMN new_id CHAR(36) NULL;
ALTER TABLE support_requests ADD COLUMN new_userId CHAR(36) NULL;

SET SQL_SAFE_UPDATES = 0;

UPDATE users
SET new_id = UUID()
WHERE id > 0 AND new_id IS NULL;

UPDATE support_requests sr
JOIN users u ON u.id = sr.userId
SET sr.new_userId = u.new_id
WHERE sr.id > 0;

SET SQL_SAFE_UPDATES = 1;

-- 3) Replace primary key on users
ALTER TABLE users MODIFY COLUMN id INT NOT NULL;
ALTER TABLE users DROP PRIMARY KEY;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users CHANGE COLUMN new_id id CHAR(36) NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);

-- 4) Replace userId on support_requests
ALTER TABLE support_requests DROP COLUMN userId;
ALTER TABLE support_requests CHANGE COLUMN new_userId userId CHAR(36) NOT NULL;

-- 5) Recreate foreign key
ALTER TABLE support_requests
  ADD CONSTRAINT FK_support_requests_user
  FOREIGN KEY (userId) REFERENCES users (id)
  ON DELETE CASCADE ON UPDATE CASCADE;
