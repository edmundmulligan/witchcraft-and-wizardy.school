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
import { validateFeedbackData } from '../validators/feedbackValidator.js';

const router = express.Router();

/**
 * POST /api/send-feedback
 * Send feedback form data via email
 */
router.post('/send-feedback', async (req, res, next) => {
  try {
    const { to, cc, subject, text, attachment } = req.body;
    
    // Validate required fields
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, text'
      });
    }
    
    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient email address'
      });
    }
    
    if (cc && !emailRegex.test(cc)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CC email address'
      });
    }
    
    // Validate feedback data if included
    if (attachment && attachment.content) {
      try {
        const feedbackData = JSON.parse(attachment.content);
        const validation = validateFeedbackData(feedbackData);
        if (!validation.valid) {
          console.warn('Feedback data validation warnings:', validation.warnings);
        }
      } catch (e) {
        console.error('Failed to parse feedback JSON:', e);
      }
    }
    
    // Send email
    const result = await sendFeedbackEmail({
      to,
      cc: cc || null,
      subject,
      text,
      attachment: attachment || null
    });
    
    // Log success
    console.log(`✅ Feedback email sent successfully to ${to}${cc ? ` (CC: ${cc})` : ''}`);
    
    res.json({
      success: true,
      message: 'Feedback sent successfully',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('Error sending feedback email:', error);
    next(error);
  }
});

export default router;
