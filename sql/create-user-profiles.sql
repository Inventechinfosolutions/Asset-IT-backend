-- Create user_profiles (INT auto id) and move name / employmentType / empNo off users
USE AdminUsers;

CREATE TABLE IF NOT EXISTS user_profiles (
  id INT NOT NULL AUTO_INCREMENT,
  userId CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  employmentType ENUM('PERMANENT', 'CONTRACT') NULL,
  empNo VARCHAR(50) NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_user_profiles_userId (userId),
  UNIQUE KEY UQ_user_profiles_empNo (empNo),
  CONSTRAINT FK_user_profiles_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing profile fields from users (if those columns still exist)
INSERT INTO user_profiles (userId, name, employmentType, empNo)
SELECT id, name, employmentType, empNo
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles p WHERE p.userId = u.id
);

-- Drop moved columns from users
ALTER TABLE users
  DROP COLUMN name,
  DROP COLUMN employmentType,
  DROP COLUMN empNo;
