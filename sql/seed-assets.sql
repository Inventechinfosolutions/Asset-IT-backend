-- Seed asset types (safe to re-run)
USE AdminUsers;

INSERT INTO assets (name, isActive)
VALUES
  ('Laptop', TRUE),
  ('Desktop Computer', TRUE),
  ('All-in-One Computer', TRUE),
  ('Printer', TRUE),
  ('Scanner', TRUE),
  ('UPS', TRUE),
  ('Monitor', TRUE),
  ('Keyboard', TRUE),
  ('Mouse', TRUE),
  ('Other', TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  isActive = VALUES(isActive);
