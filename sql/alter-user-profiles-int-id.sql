-- If user_profiles was already created with UUID ids, convert id to INT 1,2,3…
USE AdminUsers;

-- Drop FK temporarily if needed (recreated below only if dropped)
-- Recreate table with INT ids while keeping data

CREATE TABLE user_profiles_new (
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
  CONSTRAINT FK_user_profiles_user_new
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO user_profiles_new (userId, name, employmentType, empNo, createdAt, updatedAt)
SELECT userId, name, employmentType, empNo, createdAt, updatedAt
FROM user_profiles
ORDER BY createdAt ASC;

DROP TABLE user_profiles;
RENAME TABLE user_profiles_new TO user_profiles;
