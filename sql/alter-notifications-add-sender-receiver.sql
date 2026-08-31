-- Add explicit sender and receiver columns to existing notifications
USE AdminUsers;

ALTER TABLE notifications
  DROP FOREIGN KEY FK_notifications_user,
  DROP INDEX IDX_notifications_user_read_created,
  CHANGE COLUMN userId receiverId VARCHAR(36) NOT NULL,
  ADD COLUMN senderId VARCHAR(36) NULL AFTER receiverId,
  ADD KEY IDX_notifications_receiver_read_created (receiverId, isRead, createdAt),
  ADD CONSTRAINT FK_notifications_sender
    FOREIGN KEY (senderId) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT FK_notifications_receiver
    FOREIGN KEY (receiverId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE;
