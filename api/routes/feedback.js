/**
 * **********************************************************************
 * File       : api/routes/feedback.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Feedback form submission endpoint. Receives feedback data,
 *   formats it, and sends via email.
 * **********************************************************************
 */

import express from 'express';
import { sendFeedbackEmail } from '../services/emailService.js';
import {
  markFeedbackEmailFailed,
  markFeedbackEmailSent,
  saveFeedbackSubmission,
  isMariaDbFeedbackStoreEnabled,
} from '../services/feedbackStore.js';
import { sanitizeFeedbackData, validateFeedbackData } from '../validators/feedbackValidator.js';

const router = express.Router();

function isValidEmailAddress(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const email = value.trim();
  if (!email || email.includes(' ')) {
    return false;
  }

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex !== email.lastIndexOf('@') || atIndex === email.length - 1) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);
  if (!localPart || !domainPart || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  const dotIndex = domainPart.indexOf('.');
  if (dotIndex <= 0 || dotIndex === domainPart.length - 1) {
    return false;
  }

  return true;
}

/**
 * POST /api/send-feedback
 * Send feedback form data via email
 */
router.post('/send-feedback', async (req, res, next) => {
  try {
    const { to, cc, subject, text, attachment } = req.body;
    let sanitizedFeedbackData = null;

    // Validate required fields
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, text',
      });
    }

    // Validate email addresses with deterministic string checks to avoid regex backtracking on untrusted input
    if (!isValidEmailAddress(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient email address',
      });
    }

    if (cc && !isValidEmailAddress(cc)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CC email address',
      });
    }

    // Validate feedback data if included
    if (attachment && attachment.content) {
      try {
        const feedbackData = JSON.parse(attachment.content);
        sanitizedFeedbackData = sanitizeFeedbackData(feedbackData);
        const validation = validateFeedbackData(feedbackData);
        if (!validation.valid) {
          console.warn('Feedback data validation warnings:', validation.warnings);
        }
      } catch (e) {
        console.error('Failed to parse feedback JSON:', e);
      }
    }

    let feedbackRecordId = null;
    if (isMariaDbFeedbackStoreEnabled()) {
      try {
        feedbackRecordId = await saveFeedbackSubmission({
          to,
          cc: cc || null,
          subject,
          text,
          attachmentFilename: attachment?.filename || null,
          feedbackData: sanitizedFeedbackData,
          requestIp: req.ip,
          userAgent: req.get('user-agent') || null,
        });
        console.log(`💾 Feedback stored in MariaDB (id=${feedbackRecordId})`);
      } catch (storeError) {
        console.warn('⚠️ Failed to persist feedback in MariaDB. Continuing with email delivery.', storeError);
      }
    }

    // Send email
    let result;
    try {
      result = await sendFeedbackEmail({
        to,
        cc: cc || null,
        subject,
        text,
        attachment: attachment || null,
      });
      if (feedbackRecordId) {
        try {
          await markFeedbackEmailSent(feedbackRecordId, result.messageId);
        } catch (storeStatusError) {
          console.warn('⚠️ Failed to update feedback email status in MariaDB after successful send.', storeStatusError);
        }
      }
    } catch (emailError) {
      if (feedbackRecordId) {
        try {
          await markFeedbackEmailFailed(feedbackRecordId, emailError.message || emailError);
        } catch (storeStatusError) {
          console.warn('⚠️ Failed to update feedback email failure status in MariaDB.', storeStatusError);
        }
      }
      throw emailError;
    }

    // Log success
    console.log(`✅ Feedback email sent successfully to ${to}${cc ? ` (CC: ${cc})` : ''}`);

    res.json({
      success: true,
      message: 'Feedback sent successfully',
      messageId: result.messageId,
      ...(feedbackRecordId ? { feedbackRecordId } : {}),
    });
  } catch (error) {
    console.error('Error sending feedback email:', error);
    next(error);
  }
});

export default router;
