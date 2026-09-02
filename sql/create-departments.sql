-- Departments master table
USE AdminUsers;

CREATE TABLE IF NOT EXISTS departments (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_departments_name (name)
);

-- Seed from existing employee profile department strings
INSERT INTO departments (name, isActive)
SELECT DISTINCT TRIM(department), TRUE
FROM user_profiles
WHERE department IS NOT NULL AND TRIM(department) <> ''
ON DUPLICATE KEY UPDATE name = VALUES(name);
