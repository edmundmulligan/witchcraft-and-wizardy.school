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

  try {
    // Least-privilege mode: schema is provisioned out-of-band, no runtime DDL.
    await db.execute('SELECT 1 FROM feedback_responses LIMIT 1');
  } catch (error) {
    if (error && (error.code === 'ER_NO_SUCH_TABLE' || error.errno === 1146)) {
      throw new Error('feedback_responses table does not exist. Provision schema first.');
    }
    throw error;
  }

  schemaReady = true;
}

function cleanString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstArrayValue(values) {
  if (!Array.isArray(values)) {
    return cleanString(values);
  }

  for (const value of values) {
    const cleaned = cleanString(value);
    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

function normalizeYesNo(value) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return null;
  }

  const lowered = cleaned.toLowerCase();
  if (lowered === 'yes') {
    return 'Yes';
  }
  if (lowered === 'no') {
    return 'No';
  }
  return null;
}

async function getLookupId(connection, tableName, columnName, rawValue) {
  const value = cleanString(rawValue);
  if (!value) {
    return null;
  }

  const [rows] = await connection.execute(
    `
      SELECT id
      FROM ${tableName}
      WHERE LOWER(${columnName}) = LOWER(?)
      LIMIT 1
    `,
    [value]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0].id;
}

function dedupeValues(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const unique = [];
  const seen = new Set();
  for (const value of values) {
    const cleaned = cleanString(value);
    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(cleaned);
    }
  }

  return unique;
}

async function insertJoinValues({
  connection,
  feedbackResponseId,
  values,
  lookupTable,
  lookupColumn,
  joinTable,
  joinColumn,
  othersTable,
  typedOtherValue,
}) {
  const knownValues = dedupeValues(values);
  let shouldStoreOtherValue = false;
  let otherColumn = null;
  if (othersTable === 'feedback_roles_others') otherColumn = 'other_role';
  if (othersTable === 'feedback_locations_others') otherColumn = 'other_location';
  if (othersTable === 'feedback_languages_others') otherColumn = 'other_language';
  if (othersTable === 'feedback_computers_others') otherColumn = 'other_computer';
  if (othersTable === 'feedback_browsers_others') otherColumn = 'other_browser';

  for (const value of knownValues) {
    if (value.toLowerCase() === 'other') {
      shouldStoreOtherValue = true;
      continue;
    }

    const lookupId = await getLookupId(connection, lookupTable, lookupColumn, value);
    if (lookupId) {
      await connection.execute(
        `
          INSERT IGNORE INTO ${joinTable}
          (feedback_response_id, ${joinColumn})
          VALUES (?, ?)
        `,
        [feedbackResponseId, lookupId]
      );
    } else {
      shouldStoreOtherValue = true;
      if (othersTable && otherColumn) {
        await connection.execute(
          `
            INSERT IGNORE INTO ${othersTable}
            (feedback_response_id, ${otherColumn})
            VALUES (?, ?)
          `,
          [feedbackResponseId, value]
        );
      }
    }
  }

  const cleanedOther = cleanString(typedOtherValue);
  if (othersTable && otherColumn && (shouldStoreOtherValue || cleanedOther)) {
    if (cleanedOther) {
      await connection.execute(
        `
          INSERT IGNORE INTO ${othersTable}
          (feedback_response_id, ${otherColumn})
          VALUES (?, ?)
        `,
        [feedbackResponseId, cleanedOther]
      );
    }
  }
}

export async function saveFeedbackSubmission({
  to,
  cc,
  subject,
  feedbackData,
  requestIp,
  userAgent,
}) {
  await ensureSchema();
  const db = await getPool();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [responseResult] = await connection.execute(
      `
        INSERT INTO feedback_responses
        (
          recipient_to,
          recipient_cc,
          subject,
          feedback_payload,
          request_ip,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        to,
        cc,
        subject,
        feedbackData ? JSON.stringify(feedbackData) : null,
        requestIp || null,
        userAgent || null,
      ]
    );

    const feedbackResponseId = responseResult.insertId;

    if (feedbackData && typeof feedbackData === 'object') {
      const personal = feedbackData.personal && typeof feedbackData.personal === 'object' ? feedbackData.personal : {};
      const technical = feedbackData.technical && typeof feedbackData.technical === 'object' ? feedbackData.technical : {};
      const course = feedbackData.course && typeof feedbackData.course === 'object' ? feedbackData.course : {};
      const additionalFeedback =
        feedbackData.feedback && typeof feedbackData.feedback === 'object' ? feedbackData.feedback : {};

      const userRoleId = await getLookupId(connection, 'user_roles', 'role_name', personal.role);
      const userAgeId = await getLookupId(connection, 'user_ages', 'age_category', personal.age);
      const userGenderId = await getLookupId(connection, 'user_genders', 'gender_name', personal.gender);
      const courseHelpfulId = await getLookupId(
        connection,
        'course_yesno',
        'yesno_value',
        normalizeYesNo(course.helpful)
      );
      const consentId = await getLookupId(
        connection,
        'course_yesno',
        'yesno_value',
        normalizeYesNo(feedbackData.consent)
      );
      const fallbackConsentId = await getLookupId(connection, 'course_yesno', 'yesno_value', 'No');
      const courseNumLessonsId = await getLookupId(
        connection,
        'course_num_lessons',
        'num_lessons_category',
        firstArrayValue(course.completedLessons)
      );
      const courseDurationId = await getLookupId(
        connection,
        'course_durations',
        'duration_category',
        course.lessonDuration
      );
      const courseEnjoymentId = await getLookupId(
        connection,
        'course_enjoyments',
        'enjoyment_value',
        course.enjoyment
      );

      await connection.execute(
        `
          INSERT INTO feedback
          (
            feedback_response_id,
            user_name,
            user_email,
            user_role,
            user_age,
            user_gender,
            course_helpful,
            course_num_lessons,
            course_duration,
            course_enjoyment,
            course_actual_difficulty,
            course_desired_difficulty,
            text_like,
            text_dislike,
            text_learning,
            text_missing,
            text_other,
            consent
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            user_name = VALUES(user_name),
            user_email = VALUES(user_email),
            user_role = VALUES(user_role),
            user_age = VALUES(user_age),
            user_gender = VALUES(user_gender),
            course_helpful = VALUES(course_helpful),
            course_num_lessons = VALUES(course_num_lessons),
            course_duration = VALUES(course_duration),
            course_enjoyment = VALUES(course_enjoyment),
            course_actual_difficulty = VALUES(course_actual_difficulty),
            course_desired_difficulty = VALUES(course_desired_difficulty),
            text_like = VALUES(text_like),
            text_dislike = VALUES(text_dislike),
            text_learning = VALUES(text_learning),
            text_missing = VALUES(text_missing),
            text_other = VALUES(text_other),
            consent = VALUES(consent)
        `,
        [
          feedbackResponseId,
          cleanString(personal.name) || 'Unknown',
          cleanString(personal.email) || 'unknown@example.invalid',
          userRoleId,
          userAgeId,
          userGenderId,
          courseHelpfulId,
          courseNumLessonsId,
          courseDurationId,
          courseEnjoymentId,
          null,
          null,
          cleanString(course.likes),
          cleanString(course.dislikes),
          cleanString(course.suggestions),
          null,
          cleanString(additionalFeedback.message),
          consentId || fallbackConsentId,
        ]
      );

      const roleValue = cleanString(personal.role);
      const otherRole = cleanString(personal.otherRole);
      if ((!userRoleId && roleValue) || otherRole) {
        await connection.execute(
          `
            INSERT IGNORE INTO feedback_roles_others
            (feedback_response_id, other_role)
            VALUES (?, ?)
          `,
          [feedbackResponseId, otherRole || roleValue]
        );
      }

      await insertJoinValues({
        connection,
        feedbackResponseId,
        values: technical.location,
        lookupTable: 'technology_locations',
        lookupColumn: 'location_name',
        joinTable: 'feedback_locations',
        joinColumn: 'technology_location_id',
        othersTable: 'feedback_locations_others',
        typedOtherValue: technical.otherLocation,
      });

      await insertJoinValues({
        connection,
        feedbackResponseId,
        values: technical.languages,
        lookupTable: 'technology_languages',
        lookupColumn: 'language_name',
        joinTable: 'feedback_languages',
        joinColumn: 'technology_language_id',
        othersTable: 'feedback_languages_others',
        typedOtherValue: technical.otherLanguages,
      });

      await insertJoinValues({
        connection,
        feedbackResponseId,
        values: technical.computer,
        lookupTable: 'technology_computers',
        lookupColumn: 'computer_name',
        joinTable: 'feedback_computers',
        joinColumn: 'technology_computer_id',
        othersTable: 'feedback_computers_others',
        typedOtherValue: technical.otherComputer,
      });

      await insertJoinValues({
        connection,
        feedbackResponseId,
        values: technical.browser,
        lookupTable: 'technology_browsers',
        lookupColumn: 'browser_name',
        joinTable: 'feedback_browsers',
        joinColumn: 'technology_browser_id',
        othersTable: 'feedback_browsers_others',
        typedOtherValue: technical.otherBrowser,
      });
    }

    await connection.commit();
    return feedbackResponseId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
