/**
 * **********************************************************************
 * File       : api/validators/feedbackValidator.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Validation for feedback form data.
 * **********************************************************************
 */

/**
 * Validate feedback data structure
 * @param {Object} data - Feedback data to validate
 * @returns {Object} - Validation result
 */
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

export function validateFeedbackData(data) {
  const warnings = [];

  // Check for required sections
  if (!data.personal) warnings.push('Missing personal information section');
  if (!data.technical) warnings.push('Missing technical information section');
  if (!data.course) warnings.push('Missing course feedback section');

  // Check consent
  if (data.consent !== 'yes') {
    warnings.push('Consent not given or invalid');
  }

  // Validate email format if provided
  if (data.personal && data.personal.email) {
    if (!isValidEmailAddress(data.personal.email)) {
      warnings.push('Invalid email format in personal information');
    }
  }

  // Validate timestamp
  if (!data.timestamp) {
    warnings.push('Missing timestamp');
  } else {
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      warnings.push('Invalid timestamp format');
    }
  }

  return {
    valid: warnings.length === 0,
    warnings: warnings,
  };
}

/**
 * Sanitize feedback data (remove any potentially harmful content)
 * @param {Object} data - Feedback data to sanitize
 * @returns {Object} - Sanitized data
 */
export function sanitizeFeedbackData(data) {
  // Basic XSS prevention - remove any HTML-like content
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  };

  return sanitizeObject(data);
}
