-- Add employee profile fields: firstName, lastName, mobile, department
USE AdminUsers;

ALTER TABLE user_profiles
  ADD COLUMN firstName VARCHAR(100) NULL AFTER name,
  ADD COLUMN lastName VARCHAR(100) NULL AFTER firstName,
  ADD COLUMN mobile VARCHAR(20) NULL AFTER lastName,
  ADD COLUMN department VARCHAR(100) NULL AFTER mobile;

UPDATE user_profiles
SET firstName = name
WHERE firstName IS NULL OR firstName = '';

UPDATE user_profiles
SET department = 'General'
WHERE department IS NULL OR department = '';

ALTER TABLE user_profiles
  MODIFY firstName VARCHAR(100) NOT NULL,
  MODIFY department VARCHAR(100) NOT NULL;
