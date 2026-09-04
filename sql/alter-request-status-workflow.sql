-- Add workflow statuses for admin request handling.
-- Run against AdminUsers database.

ALTER TABLE support_requests
  MODIFY COLUMN status ENUM(
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'IN_PROGRESS',
    'PENDING_USER',
    'PENDING_VENDOR',
    'ON_HOLD',
    'RESOLVED',
    'CLOSED',
    'FULFILLED'
  ) NOT NULL DEFAULT 'SUBMITTED';
