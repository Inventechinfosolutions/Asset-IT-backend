-- Create persistent in-app notifications
USE AdminUsers;

CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  userId VARCHAR(36) NOT NULL,
  type ENUM('REQUEST_CREATED', 'REQUEST_STATUS_CHANGED') NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  requestId INT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_notifications_user_read_created (userId, isRead, createdAt),
  CONSTRAINT FK_notifications_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_notifications_request
    FOREIGN KEY (requestId) REFERENCES support_requests (id)
    ON DELETE SET NULL ON UPDATE CASCADE
);
