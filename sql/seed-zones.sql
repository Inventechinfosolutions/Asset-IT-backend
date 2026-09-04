-- Seed zones (safe to re-run)
USE AdminUsers;

INSERT INTO zones (name)
VALUES
  ('North'),
  ('South'),
  ('East'),
  ('West'),
  ('Head Office')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);
