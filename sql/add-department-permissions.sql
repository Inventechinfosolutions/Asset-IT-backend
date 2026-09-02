-- Department RBAC permissions for ADMIN role
USE AdminUsers;

INSERT INTO permissions (name, description)
VALUES
  ('departments.view', 'View departments list'),
  ('departments.create', 'Create departments'),
  ('departments.update', 'Edit departments'),
  ('departments.activate', 'Activate or deactivate departments')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name LIKE 'departments.%'
WHERE r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE roleId = roleId;
