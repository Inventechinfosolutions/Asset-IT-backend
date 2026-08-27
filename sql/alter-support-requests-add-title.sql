-- Add title to support_requests (max 200 characters)
ALTER TABLE support_requests
  ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT '' AFTER status;

UPDATE support_requests
SET title = LEFT(description, 200)
WHERE title = '' OR title IS NULL;
