-- Zones master table (name stored as ENUM; no active/inactive)
USE AdminUsers;

CREATE TABLE IF NOT EXISTS zones (
  id INT NOT NULL AUTO_INCREMENT,
  name ENUM(
    'North',
    'South',
    'East',
    'West',
    'Central'
  ) NOT NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_zones_name (name)
);
