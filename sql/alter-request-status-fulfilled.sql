-- Add FULFILLED status for asset requests
USE AdminUsers;

ALTER TABLE support_requests
  MODIFY COLUMN status ENUM(
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'FULFILLED'
  ) NOT NULL DEFAULT 'SUBMITTED';
