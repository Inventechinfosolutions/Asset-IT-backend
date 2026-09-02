-- Seed BDA departments (safe to re-run)
USE AdminUsers;

INSERT INTO departments (name, isActive)
VALUES
  ('Administration Section', TRUE),
  ('Allotment Section', TRUE),
  ('Land Acquisition Section', TRUE),
  ('Finance Section', TRUE),
  ('Town Planning Section', TRUE),
  ('Engineering Section', TRUE),
  ('Superintendent of Police Section', TRUE),
  ('C.A. Section', TRUE),
  ('T.D.R. Section', TRUE),
  ('Estate Section', TRUE),
  ('Flats Section', TRUE),
  ('Public Relations Section', TRUE),
  ('Electrical Section', TRUE),
  ('Secretary Section', TRUE),
  ('Horticulture Section', TRUE),
  ('Legal Section', TRUE),
  ('Forest Section', TRUE),
  ('Revenue Section', TRUE),
  ('EDP Section', TRUE),
  ('IT Reforms Cell', TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  isActive = VALUES(isActive);
