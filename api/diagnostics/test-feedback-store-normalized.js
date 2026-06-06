/**
 * **********************************************************************
 * File       : api/diagnostics/test-feedback-store-normalized.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Integration diagnostic for normalized MariaDB feedback persistence.
 * **********************************************************************
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import { closeFeedbackStore, saveFeedbackSubmission } from '../services/feedbackStore.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isCleanupEnabled() {
  const value = (process.env.DIAGNOSTIC_CLEANUP || '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function getDbConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  };
}

async function querySingleValue(connection, sql, params) {
  const [rows] = await connection.execute(sql, params);
  return rows?.[0] || null;
}

async function run() {
  if ((process.env.FEEDBACK_STORE_PROVIDER || '').toLowerCase() !== 'mariadb') {
    throw new Error('Set FEEDBACK_STORE_PROVIDER=mariadb to run this diagnostic.');
  }

  const config = getDbConfig();
  const cleanupEnabled = isCleanupEnabled();
  assert(config.user, 'Missing DB_USER');
  assert(config.password, 'Missing DB_PASSWORD');
  assert(config.database, 'Missing DB_NAME');

  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const uniqueEmail = `diagnostic-${suffix}@example.com`;
  const uniqueOtherRole = `Role ${suffix}`;
  const uniqueOtherLocation = `Location ${suffix}`;
  const uniqueOtherLanguage = `Language ${suffix}`;
  const uniqueOtherComputer = `Computer ${suffix}`;
  const uniqueOtherBrowser = `Browser ${suffix}`;

  const feedbackData = {
    personal: {
      name: 'Diagnostic User',
      email: uniqueEmail,
      role: 'Other',
      otherRole: uniqueOtherRole,
      age: '18-24 years old',
      gender: 'Prefer not to say',
    },
    technical: {
      languages: ['Python', 'Python', 'Other'],
      otherLanguages: uniqueOtherLanguage,
      computer: ['Linux Computer', 'Linux Computer', 'Other'],
      otherComputer: uniqueOtherComputer,
      browser: ['Mozilla Firefox', 'Mozilla Firefox', 'Other'],
      otherBrowser: uniqueOtherBrowser,
      location: ['At home', 'At home', 'Other'],
      otherLocation: uniqueOtherLocation,
    },
    course: {
      helpful: 'yes',
      completedLessons: ['6-10 lessons'],
      lessonDuration: '1-2 hours',
      enjoyment: 'Enjoyed most of it',
      likes: 'Diagnostics test likes',
      dislikes: 'Diagnostics test dislikes',
      suggestions: 'Diagnostics test suggestions',
    },
    feedback: {
      message: 'Diagnostics additional message',
    },
    consent: 'yes',
    timestamp: new Date().toISOString(),
  };

  let feedbackResponseId = null;
  let db = null;

  try {
    feedbackResponseId = await saveFeedbackSubmission({
      to: 'feedback@embodied-mind.org',
      cc: null,
      subject: `Diagnostic ${suffix}`,
      feedbackData,
      requestIp: '127.0.0.1',
      userAgent: 'diagnostic-test',
    });

    db = await mysql.createPool(config);
    const connection = await db.getConnection();

    try {
      const responseRow = await querySingleValue(
        connection,
        'SELECT id FROM feedback_responses WHERE id = ? LIMIT 1',
        [feedbackResponseId]
      );
      assert(responseRow, 'No row inserted into feedback_responses.');

      const feedbackRow = await querySingleValue(
        connection,
        `
          SELECT user_email, text_like, text_dislike, text_learning, text_other
          FROM feedback
          WHERE feedback_response_id = ?
          LIMIT 1
        `,
        [feedbackResponseId]
      );
      assert(feedbackRow, 'No row inserted into feedback.');
      assert(feedbackRow.user_email === uniqueEmail, 'feedback.user_email did not match test payload.');

      const locationCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_locations WHERE feedback_response_id = ?',
        [feedbackResponseId]
      );
      assert(Number(locationCount.total) === 1, 'Expected exactly 1 deduped row in feedback_locations.');

      const languageCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_languages WHERE feedback_response_id = ?',
        [feedbackResponseId]
      );
      assert(Number(languageCount.total) === 1, 'Expected exactly 1 deduped row in feedback_languages.');

      const computerCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_computers WHERE feedback_response_id = ?',
        [feedbackResponseId]
      );
      assert(Number(computerCount.total) === 1, 'Expected exactly 1 deduped row in feedback_computers.');

      const browserCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_browsers WHERE feedback_response_id = ?',
        [feedbackResponseId]
      );
      assert(Number(browserCount.total) === 1, 'Expected exactly 1 deduped row in feedback_browsers.');

      const roleOtherCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_roles_others WHERE feedback_response_id = ? AND other_role = ?',
        [feedbackResponseId, uniqueOtherRole]
      );
      assert(Number(roleOtherCount.total) === 1, 'Expected 1 row in feedback_roles_others.');

      const locationOtherCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_locations_others WHERE feedback_response_id = ? AND other_location = ?',
        [feedbackResponseId, uniqueOtherLocation]
      );
      assert(Number(locationOtherCount.total) === 1, 'Expected 1 row in feedback_locations_others.');

      const languageOtherCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_languages_others WHERE feedback_response_id = ? AND other_language = ?',
        [feedbackResponseId, uniqueOtherLanguage]
      );
      assert(Number(languageOtherCount.total) === 1, 'Expected 1 row in feedback_languages_others.');

      const computerOtherCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_computers_others WHERE feedback_response_id = ? AND other_computer = ?',
        [feedbackResponseId, uniqueOtherComputer]
      );
      assert(Number(computerOtherCount.total) === 1, 'Expected 1 row in feedback_computers_others.');

      const browserOtherCount = await querySingleValue(
        connection,
        'SELECT COUNT(*) AS total FROM feedback_browsers_others WHERE feedback_response_id = ? AND other_browser = ?',
        [feedbackResponseId, uniqueOtherBrowser]
      );
      assert(Number(browserOtherCount.total) === 1, 'Expected 1 row in feedback_browsers_others.');

      console.log('PASS: normalized feedback persistence test passed.');
      console.log(`feedback_response_id=${feedbackResponseId}`);
    } finally {
      connection.release();
    }
  } finally {
    if (cleanupEnabled && feedbackResponseId) {
      try {
        // Delete the parent response row; child rows are removed via ON DELETE CASCADE.
        const cleanupPool = db || (await mysql.createPool(config));
        const [result] = await cleanupPool.execute('DELETE FROM feedback_responses WHERE id = ?', [
          feedbackResponseId,
        ]);

        if (Number(result.affectedRows) === 1) {
          console.log(`CLEANUP: deleted feedback_response_id=${feedbackResponseId}`);
        } else {
          console.warn(
            `CLEANUP: expected to delete 1 row for feedback_response_id=${feedbackResponseId}, deleted ${result.affectedRows}`
          );
        }

        if (!db) {
          await cleanupPool.end();
        }
      } catch (cleanupError) {
        console.warn(`CLEANUP: failed for feedback_response_id=${feedbackResponseId}`);
        console.warn(cleanupError.message || cleanupError);
      }
    }

    if (db) {
      await db.end();
    }
    await closeFeedbackStore();
  }
}

run().catch((error) => {
  console.error('FAIL: normalized feedback persistence test failed.');
  console.error(error.message || error);
  process.exitCode = 1;
});
