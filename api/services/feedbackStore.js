/**
 * **********************************************************************
 * File       : api/services/feedbackStore.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Optional MariaDB persistence for feedback responses.
 * **********************************************************************
 */

import mysql from 'mysql2/promise';

let pool = null;
let schemaReady = false;

function getStoreProvider() {
  return (process.env.FEEDBACK_STORE_PROVIDER || 'none').trim().toLowerCase();
}

export function isMariaDbFeedbackStoreEnabled() {
  return getStoreProvider() === 'mariadb';
}

function getConnectionConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

function validateConfig(config) {
  const missing = [];
  if (!config.user) missing.push('DB_USER');
  if (!config.password) missing.push('DB_PASSWORD');
  if (!config.database) missing.push('DB_NAME');

  if (missing.length > 0) {
    throw new Error(`Missing MariaDB configuration: ${missing.join(', ')}`);
  }
}

async function getPool() {
  if (pool) {
    return pool;
  }

  const config = getConnectionConfig();
  validateConfig(config);
  pool = mysql.createPool(config);
  return pool;
}

async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  const db = await getPool();
  await db.execute(`
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
  `);

  schemaReady = true;
}

export async function saveFeedbackSubmission({
  to,
  cc,
  subject,
  text,
  attachmentFilename,
  feedbackData,
  requestIp,
  userAgent,
}) {
  await ensureSchema();
  const db = await getPool();

  const [result] = await db.execute(
    `
      INSERT INTO feedback_responses
      (
        recipient_to,
        recipient_cc,
        subject,
        message_text,
        attachment_filename,
        feedback_payload,
        request_ip,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      to,
      cc,
      subject,
      text,
      attachmentFilename || null,
      feedbackData ? JSON.stringify(feedbackData) : null,
      requestIp || null,
      userAgent || null,
    ]
  );

  return result.insertId;
}

export async function markFeedbackEmailSent(recordId, messageId) {
  if (!recordId) {
    return;
  }

  await ensureSchema();
  const db = await getPool();

  await db.execute(
    `
      UPDATE feedback_responses
      SET email_status = 'sent',
          email_message_id = ?,
          email_error = NULL
      WHERE id = ?
    `,
    [messageId || null, recordId]
  );
}

export async function markFeedbackEmailFailed(recordId, error) {
  if (!recordId) {
    return;
  }

  await ensureSchema();
  const db = await getPool();

  await db.execute(
    `
      UPDATE feedback_responses
      SET email_status = 'failed',
          email_error = ?
      WHERE id = ?
    `,
    [error ? String(error).slice(0, 5000) : 'Unknown email error', recordId]
  );
}

export async function closeFeedbackStore() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
  schemaReady = false;
}
