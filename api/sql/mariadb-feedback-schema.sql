-- MariaDB schema for persisting feedback responses
-- Run as a privileged DB user, then grant least-privilege access to the API user.

CREATE DATABASE IF NOT EXISTS witchcraft_feedback
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE witchcraft_feedback;

CREATE TABLE IF NOT EXISTS feedback_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recipient_to VARCHAR(320) NOT NULL,
  recipient_cc VARCHAR(320) NULL,
  subject VARCHAR(255) NOT NULL,
  message_text MEDIUMTEXT NOT NULL,
  attachment_filename VARCHAR(255) NULL,
  feedback_payload JSON NULL,
  email_status VARCHAR(16) NOT NULL DEFAULT 'pending',
  email_message_id VARCHAR(255) NULL,
  email_error TEXT NULL,
  request_ip VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  PRIMARY KEY (id),
  INDEX idx_feedback_created_at (created_at),
  INDEX idx_feedback_email_status (email_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example least-privilege application user grants
-- CREATE USER IF NOT EXISTS 'witchcraft_api'@'%' IDENTIFIED BY 'replace-with-strong-password';
-- GRANT SELECT, INSERT, UPDATE ON witchcraft_feedback.feedback_responses TO 'witchcraft_api'@'%';
-- FLUSH PRIVILEGES;
