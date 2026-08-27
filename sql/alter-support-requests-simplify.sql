-- Align support_requests with simplified entity
-- Keep: id, userId, requestType, status, description, createdAt, updatedAt

USE AdminUsers;

SET SQL_SAFE_UPDATES = 0;

UPDATE support_requests
SET description = justification
WHERE id > 0
  AND (description IS NULL OR description = '')
  AND justification IS NOT NULL
  AND justification <> '';

UPDATE support_requests
SET description = COALESCE(NULLIF(description, ''), subject, 'No description')
WHERE id > 0
  AND (description IS NULL OR description = '');

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE support_requests
  MODIFY COLUMN description TEXT NOT NULL;

ALTER TABLE support_requests
  DROP COLUMN priority,
  DROP COLUMN justification,
  DROP COLUMN neededBy,
  DROP COLUMN category,
  DROP COLUMN subject,
  DROP COLUMN assetType,
  DROP COLUMN quantity;
