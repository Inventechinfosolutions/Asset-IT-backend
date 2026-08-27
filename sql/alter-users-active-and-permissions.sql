-- Add isActive to users + new permissions for edit/activate
USE AdminUsers;

ALTER TABLE users
  ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1;

INSERT INTO permissions (name, description)
VALUES
  ('users.update', 'Edit user details'),
  ('users.activate', 'Activate or deactivate users')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Give ADMIN the new permissions
INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('users.update', 'users.activate')
WHERE r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE roleId = roleId;
