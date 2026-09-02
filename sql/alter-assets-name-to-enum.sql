-- Convert assets.name from VARCHAR to ENUM (safe if already ENUM)
USE AdminUsers;

ALTER TABLE assets
  MODIFY COLUMN name ENUM(
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
  ) NOT NULL;
