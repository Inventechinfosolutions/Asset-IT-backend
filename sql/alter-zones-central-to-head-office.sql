-- Rename zone "Central" to "Head Office".
-- Run against AdminUsers database.

-- zones table
ALTER TABLE zones
  MODIFY COLUMN name ENUM(
    'North',
    'South',
    'East',
    'West',
    'Central',
    'Head Office'
  ) NOT NULL;

UPDATE zones
SET name = 'Head Office'
WHERE name = 'Central';

ALTER TABLE zones
  MODIFY COLUMN name ENUM(
    'North',
    'South',
    'East',
    'West',
    'Head Office'
  ) NOT NULL;

-- support_requests.zone
ALTER TABLE support_requests
  MODIFY COLUMN zone ENUM(
    'North',
    'South',
    'East',
    'West',
    'Central',
    'Head Office'
  ) NOT NULL DEFAULT 'Head Office';

UPDATE support_requests
SET zone = 'Head Office'
WHERE zone = 'Central';

ALTER TABLE support_requests
  MODIFY COLUMN zone ENUM(
    'North',
    'South',
    'East',
    'West',
    'Head Office'
  ) NOT NULL DEFAULT 'Head Office';
