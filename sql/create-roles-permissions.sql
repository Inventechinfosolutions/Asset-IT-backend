-- Create RBAC tables: roles, permissions, role_permissions
USE AdminUsers;

CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_roles_name (name)
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_permissions_name (name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id INT NOT NULL AUTO_INCREMENT,
  roleId INT NOT NULL,
  permissionId INT NOT NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_role_permission (roleId, permissionId),
  CONSTRAINT FK_role_permissions_role
    FOREIGN KEY (roleId) REFERENCES roles (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_role_permissions_permission
    FOREIGN KEY (permissionId) REFERENCES permissions (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed roles
INSERT INTO roles (name, description)
VALUES
  ('ADMIN', 'Full admin access'),
  ('USER', 'BDA user / request portal access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Seed permissions
INSERT INTO permissions (name, description)
VALUES
  ('users.view', 'View users list'),
  ('users.create', 'Create users'),
  ('users.update', 'Edit user details'),
  ('users.activate', 'Activate or deactivate users'),
  ('requests.view_all', 'View all support requests'),
  ('requests.view_own', 'View own support requests'),
  ('requests.create', 'Create support requests'),
  ('requests.approve', 'Approve or reject support requests'),
  ('dashboard.view', 'View admin dashboard')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Map ADMIN -> all permissions
INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE roleId = roleId;

-- Map USER -> portal permissions
INSERT INTO role_permissions (roleId, permissionId)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
  'requests.view_own',
  'requests.create'
)
WHERE r.name = 'USER'
ON DUPLICATE KEY UPDATE roleId = roleId;
