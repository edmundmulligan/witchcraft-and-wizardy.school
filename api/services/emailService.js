/**
 * **********************************************************************
 * File       : api/services/emailService.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Email service for sending feedback notifications.
 * **********************************************************************
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create email transporter
 * Supports multiple email providers via SMTP
 */
function createTransporter() {
  // Check if we're in development mode (log emails instead of sending)
  if (process.env.NODE_ENV === 'development' && process.env.EMAIL_PROVIDER === 'console') {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  // Production email configuration
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    tls: {
      // Don't fail on invalid certs (some providers need this)
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug output
    logger: true, // Log to console
  };

  // Log connection attempt (without showing password)
  console.log('📧 Attempting SMTP connection:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  });

  // Validate configuration
  if (!config.host || !config.auth.user || !config.auth.pass) {
    console.error('❌ Missing email configuration. Check your .env file.');
    throw new Error('Email service not configured properly');
  }

  return nodemailer.createTransport(config);
}

/**
 * Send feedback email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.cc - CC email address (optional)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email body (plain text)
 * @param {Object} options.attachment - Attachment object (optional)
 * @returns {Promise<Object>} - Send result with messageId
 */
export async function sendFeedbackEmail(options) {
  const { to, cc, subject, text, attachment } = options;

  const transporter = createTransporter();

  // Prepare mail options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@embodied-mind.org',
    to: to,
    subject: subject,
    text: text,
  };

  // Add CC if provided
  if (cc) {
    mailOptions.cc = cc;
  }

  // Add attachment if provided
  if (attachment && attachment.content) {
    mailOptions.attachments = [
      {
        filename: attachment.filename || 'feedback.json',
        content: attachment.content,
        contentType: 'application/json',
      },
    ];
  }

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);

    // In development mode with console transport, log the email
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_PROVIDER === 'console') {
      console.log('\n📧 === EMAIL PREVIEW ===');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      if (mailOptions.cc) console.log('CC:', mailOptions.cc);
      console.log('Subject:', mailOptions.subject);
      console.log('\n--- Email Body ---');
      console.log(info.message.toString());
      console.log('==================\n');
    }

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    return false;
  }
}
