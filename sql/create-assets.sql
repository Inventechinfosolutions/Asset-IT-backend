-- Assets master table (name stored as ENUM)
USE AdminUsers;

CREATE TABLE IF NOT EXISTS assets (
  id INT NOT NULL AUTO_INCREMENT,
  name ENUM(
    'Laptop',
    'Desktop Computer',
    'All-in-One Computer',
    'Printer',
    'Scanner',
    'UPS',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Other'
  ) NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_assets_name (name)
);
