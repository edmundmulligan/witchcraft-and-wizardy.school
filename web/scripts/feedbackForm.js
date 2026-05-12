/**
 * **********************************************************************
 * File       : feedbackForm.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handle conditional field display in the feedback form.
 *   Shows/hides "other" input fields based on select dropdown values.
 * **********************************************************************
 */

/**
 * Initialize feedback form conditional field logic
 */
function initFeedbackForm() {
  // Configuration for conditional fields
  const conditionalFields = [
    {
      triggerName: 'sender-role',
      targetDivId: 'sender-other-role-div',
      showValue: 'other',
      isRadioGroup: true,
    },
    {
      triggerName: 'sender-languages',
      targetDivId: 'sender-other-languages-div',
      showValue: 'other',
      isCheckboxGroup: true,
    },
    {
      triggerName: 'sender-computer',
      targetDivId: 'sender-other-computer-div',
      showValue: 'other',
      isCheckboxGroup: true,
    },
    {
      triggerName: 'sender-browser',
      targetDivId: 'sender-other-browser-div',
      showValue: 'other',
      isCheckboxGroup: true,
    },
    {
      triggerName: 'sender-location',
      targetDivId: 'sender-other-location-div',
      showValue: 'other',
      isCheckboxGroup: true,
    },
    {
      triggerName: 'course-enjoyment',
      targetDivId: 'course-likes-div',
      hideValue: '1',
      hideWhenEmpty: true,
      isRadioGroup: true,
    },
    {
      triggerName: 'course-enjoyment',
      targetDivId: 'course-dislikes-div',
      hideValue: '7',
      hideWhenEmpty: true,
      isRadioGroup: true,
    },
    {
      triggerName: 'course-enjoyment',
      targetDivId: 'course-suggestions-div',
      hideWhenEmpty: true,
      isRadioGroup: true,
    },
  ];

  /**
   * Toggle visibility of conditional field
   * @param {HTMLElement|NodeList} trigger - The element(s) that trigger the change
   * @param {HTMLElement} targetDiv - The div to show/hide
   * @param {string} showValue - The value that triggers showing the field
   * @param {boolean} isMultiple - Whether the trigger is a multiple select
   * @param {boolean} isCheckboxGroup - Whether the trigger is a checkbox group
   * @param {boolean} isRadioGroup - Whether the trigger is a radio button group
   * @param {string} hideValue - The value that triggers hiding the field
   * @param {boolean} hideWhenEmpty - Whether to hide when nothing is selected
   */
  function toggleConditionalField(
    trigger,
    targetDiv,
    showValue,
    isMultiple = false,
    isCheckboxGroup = false,
    isRadioGroup = false,
    hideValue = null,
    hideWhenEmpty = false
  ) {
    if (!trigger || !targetDiv) {
      return;
    }

    if (isRadioGroup) {
      // For radio button groups
      const radios = Array.isArray(trigger) ? trigger : Array.from(trigger);
      const checkedRadio = radios.find((radio) => radio.checked);

      if (hideValue !== null || hideWhenEmpty) {
        // Hide logic: hide if hideValue matches OR nothing selected (when hideWhenEmpty is true)
        const shouldHide =
          (!checkedRadio && hideWhenEmpty) || (checkedRadio && checkedRadio.value === hideValue);
        targetDiv.style.display = shouldHide ? 'none' : '';
      } else {
        // Show logic: show if showValue matches
        const isChecked = radios.some((radio) => radio.value === showValue && radio.checked);
        targetDiv.style.display = isChecked ? '' : 'none';
      }
    } else if (isCheckboxGroup) {
      // For checkbox groups, check if any checkbox with the showValue is checked
      const checkboxes = Array.isArray(trigger) ? trigger : Array.from(trigger);
      const isChecked = checkboxes.some((cb) => cb.value === showValue && cb.checked);
      targetDiv.style.display = isChecked ? '' : 'none';
    } else if (isMultiple) {
      // For multiple selects, check if "other" is among selected values
      const selectedValues = Array.from(trigger.selectedOptions).map((opt) => opt.value);
      if (selectedValues.includes(showValue)) {
        targetDiv.style.display = '';
      } else {
        targetDiv.style.display = 'none';
      }
    } else {
      // For single selects, check if value matches
      if (trigger.value === showValue) {
        targetDiv.style.display = '';
      } else {
        targetDiv.style.display = 'none';
      }
    }
  }

  /**
   * Set up a conditional field
   * @param {Object} config - Configuration object
   */
  function setupConditionalField(config) {
    const targetDiv = document.getElementById(config.targetDivId);

    if (!targetDiv) {
      return;
    }

    let trigger;

    if (config.isRadioGroup) {
      // For radio button groups, get all radio buttons with the given name
      trigger = document.querySelectorAll(`input[name="${config.triggerName}"]`);

      if (!trigger || trigger.length === 0) {
        return;
      }

      // Set initial state
      targetDiv.style.display = 'none';

      // Add change listener to each radio button
      trigger.forEach((radio) => {
        radio.addEventListener('change', () => {
          toggleConditionalField(
            trigger,
            targetDiv,
            config.showValue,
            false,
            false,
            true,
            config.hideValue,
            config.hideWhenEmpty
          );
        });
      });

      // Check initial state (in case form is pre-filled)
      toggleConditionalField(
        trigger,
        targetDiv,
        config.showValue,
        false,
        false,
        true,
        config.hideValue,
        config.hideWhenEmpty
      );
    } else if (config.isCheckboxGroup) {
      // For checkbox groups, get all checkboxes with the given name
      trigger = document.querySelectorAll(`input[name="${config.triggerName}"]`);

      if (!trigger || trigger.length === 0) {
        return;
      }

      // Set initial state
      targetDiv.style.display = 'none';

      // Add change listener to each checkbox
      trigger.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          toggleConditionalField(trigger, targetDiv, config.showValue, false, true, false);
        });
      });

      // Check initial state (in case form is pre-filled)
      toggleConditionalField(trigger, targetDiv, config.showValue, false, true, false);
    } else {
      // For select elements
      trigger = document.getElementById(config.triggerId);

      if (!trigger) {
        return;
      }

      // Set initial state
      targetDiv.style.display = 'none';

      // Add change listener
      trigger.addEventListener('change', () => {
        toggleConditionalField(trigger, targetDiv, config.showValue, config.isMultiple);
      });

      // Check initial state (in case form is pre-filled)
      toggleConditionalField(trigger, targetDiv, config.showValue, config.isMultiple);
    }
  }

  // Set up all conditional fields
  conditionalFields.forEach(setupConditionalField);

  // Handle consent radio buttons and submit button
  const consentRadios = document.querySelectorAll('input[name="consent"]');
  const submitButton = document.getElementById('send-information-btn');

  if (consentRadios.length > 0 && submitButton) {
    consentRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const consentYes = document.getElementById('consent-yes');
        submitButton.disabled = !consentYes || !consentYes.checked;
      });
    });
  }

  // Handle form submission
  const form = document.getElementById('feedback-form-element');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

/**
 * Handle form submission
 * @param {Event} event - The submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Collect form data
  const data = collectFormData(formData);

  // Create human-readable and JSON versions
  const humanReadable = formatHumanReadable(data);
  const jsonData = JSON.stringify(data, null, 2);

  // Get email addresses
  const recipientEmail = 'feedback@embodied-mind.org';
  const senderEmail = formData.get('sender-email') || '';
  const sendCopy = formData.get('send-copy') === 'yes';

  try {
    // Send email (this requires a backend API endpoint)
    // For now, we'll use mailto as a fallback or log to console
    await sendFeedbackEmail(recipientEmail, senderEmail, sendCopy, humanReadable, jsonData);

    // Show confirmation modal
    showConfirmationModal();
  } catch (error) {
    console.error('Error sending feedback:', error);
    showErrorModal(error.message);
  }
}

/**
 * Collect all form data into a structured object
 * @param {FormData} formData - The form data
 * @returns {Object} - Structured form data
 */
function collectFormData(formData) {
  const data = {
    personal: {
      name: formData.get('sender-name') || '',
      email: formData.get('sender-email') || '',
      role: formData.get('sender-role') || '',
      otherRole: formData.get('sender-other-role') || '',
      age: formData.get('sender-age') || '',
      gender: formData.get('sender-gender') || '',
    },
    technical: {
      languages: formData.getAll('sender-languages'),
      otherLanguages: formData.get('sender-other-languages') || '',
      computer: formData.getAll('sender-computer'),
      otherComputer: formData.get('sender-other-computer') || '',
      browser: formData.getAll('sender-browser'),
      otherBrowser: formData.get('sender-other-browser') || '',
      location: formData.getAll('sender-location'),
      otherLocation: formData.get('sender-other-location') || '',
    },
    course: {
      helpful: formData.get('course-helpful') || '',
      completedLessons: formData.getAll('completed-lessons'),
      lessonDuration: formData.get('lesson-duration') || '',
      enjoyment: formData.get('course-enjoyment') || '',
      likes: formData.get('course-likes') || '',
      dislikes: formData.get('course-dislikes') || '',
      suggestions: formData.get('course-suggestions') || '',
    },
    feedback: {
      message: formData.get('sender-message') || '',
    },
    consent: formData.get('consent') || '',
    sendCopy: formData.get('send-copy') === 'yes',
    timestamp: new Date().toISOString(),
  };

  return data;
}

/**
 * Format data as human-readable text
 * @param {Object} data - The form data
 * @returns {string} - Human-readable text
 */
function formatHumanReadable(data) {
  let text = 'FEEDBACK FORM SUBMISSION\n';
  text += '========================\n\n';
  text += `Submitted: ${new Date(data.timestamp).toLocaleString()}\n\n`;

  text += 'PERSONAL INFORMATION\n';
  text += '--------------------\n';
  text += `Name: ${data.personal.name || 'Not provided'}\n`;
  text += `Email: ${data.personal.email || 'Not provided'}\n`;
  text += `Role: ${data.personal.role}${data.personal.otherRole ? ' (' + data.personal.otherRole + ')' : ''}\n`;
  text += `Age Range: ${data.personal.age || 'Not provided'}\n`;
  text += `Gender: ${data.personal.gender || 'Not provided'}\n\n`;

  text += 'TECHNICAL INFORMATION\n';
  text += '---------------------\n';
  text += `Programming Languages: ${data.technical.languages.join(', ')}${data.technical.otherLanguages ? ' (' + data.technical.otherLanguages + ')' : ''}\n`;
  text += `Computer: ${data.technical.computer.join(', ')}${data.technical.otherComputer ? ' (' + data.technical.otherComputer + ')' : ''}\n`;
  text += `Browser: ${data.technical.browser.join(', ')}${data.technical.otherBrowser ? ' (' + data.technical.otherBrowser + ')' : ''}\n`;
  text += `Location: ${data.technical.location.join(', ')}${data.technical.otherLocation ? ' (' + data.technical.otherLocation + ')' : ''}\n\n`;

  text += 'COURSE FEEDBACK\n';
  text += '---------------\n';
  text += `Was the course helpful? ${data.course.helpful}\n`;
  text += `Completed lessons: ${data.course.completedLessons.join(', ')}\n`;
  text += `Lesson duration: ${data.course.lessonDuration}\n`;
  text += `Enjoyment level: ${data.course.enjoyment}/7\n\n`;

  if (data.course.likes) {
    text += `What did you like?\n${data.course.likes}\n\n`;
  }

  if (data.course.dislikes) {
    text += `What did you dislike?\n${data.course.dislikes}\n\n`;
  }

  if (data.course.suggestions) {
    text += `Suggestions for improvement:\n${data.course.suggestions}\n\n`;
  }

  if (data.feedback.message) {
    text += 'ADDITIONAL FEEDBACK\n';
    text += '-------------------\n';
    text += `${data.feedback.message}\n\n`;
  }

  text += `Consent given: ${data.consent}\n`;

  return text;
}

/**
 * Send feedback email
 * @param {string} recipientEmail - The recipient email address
 * @param {string} senderEmail - The sender's email address
 * @param {boolean} sendCopy - Whether to send a copy to the sender
 * @param {string} humanReadable - Human-readable text
 * @param {string} jsonData - JSON data
 */
async function sendFeedbackEmail(recipientEmail, senderEmail, sendCopy, humanReadable, jsonData) {
  // Determine API endpoint based on environment
  const apiUrl =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api/send-feedback'
      : 'https://web.witchcraft-and-wizardry.school/api/send-feedback';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        cc: sendCopy && senderEmail ? senderEmail : null,
        subject: 'Web Witchcraft and Wizardry Feedback',
        text: humanReadable,
        attachment: {
          filename: 'feedback.json',
          content: jsonData,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Log for debugging
    console.error('Failed to send feedback:', error);

    // Re-throw with user-friendly message
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Could not connect to server. Please check your internet connection and try again.'
      );
    }
    throw error;
  }
}

/**
 * Show confirmation modal
 */
function showConfirmationModal() {
  const modal = createModal(
    'Feedback Sent Successfully!',
    'Thank you for your feedback. We appreciate you taking the time to help us improve our courses.',
    'success'
  );
  document.body.appendChild(modal);
}

/**
 * Show error modal
 * @param {string} message - The error message
 */
function showErrorModal(message) {
  const modal = createModal(
    'Error Sending Feedback',
    `We're sorry, but there was an error sending your feedback: ${message}. Please try again or contact us directly at feedback@embodied-mind.org.`,
    'error'
  );
  document.body.appendChild(modal);
}

/**
 * Create a modal dialog
 * @param {string} title - The modal title
 * @param {string} message - The modal message
 * @param {string} type - The modal type ('success' or 'error')
 * @returns {HTMLElement} - The modal element
 */
function createModal(title, message, type = 'success') {
  const modal = document.createElement('div');
  modal.className = 'feedback-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.setAttribute('aria-describedby', 'modal-message');

  const modalContent = document.createElement('div');
  modalContent.className = `feedback-modal-content ${type}`;

  const modalTitle = document.createElement('h3');
  modalTitle.id = 'modal-title';
  modalTitle.textContent = title;

  const modalMessage = document.createElement('p');
  modalMessage.id = 'modal-message';
  modalMessage.textContent = message;

  const modalButton = document.createElement('button');
  modalButton.textContent = 'Close';
  modalButton.className = 'button-rectangle';
  modalButton.addEventListener('click', () => {
    modal.remove();
    if (type === 'success') {
      // Reset form on success
      const form = document.getElementById('feedback-form-element');
      if (form) {
        form.reset();
        // Re-disable submit button
        const submitButton = document.getElementById('send-information-btn');
        if (submitButton) {
          submitButton.disabled = true;
        }
      }
    }
  });

  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalMessage);
  modalContent.appendChild(modalButton);
  modal.appendChild(modalContent);

  return modal;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeedbackForm);
} else {
  initFeedbackForm();
}
