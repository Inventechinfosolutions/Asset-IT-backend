-- Force password change after user create / admin password reset.
-- Run against AdminUsers database.

ALTER TABLE users
  ADD COLUMN mustChangePassword TINYINT(1) NOT NULL DEFAULT 0
  AFTER isActive;
