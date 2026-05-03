# Feedback Form Email Integration

## Overview

The feedback form now includes functionality to send email submissions to `feedback@embodied-mind.org` with an optional copy to the sender. The form data is sent in both human-readable format and as a JSON attachment.

## Current Implementation

The client-side code in `scripts/feedbackForm.js` is complete and includes:

1. **Form Data Collection**: Collects all form fields into a structured object
2. **Data Formatting**: Converts form data to both human-readable text and JSON
3. **Email Sending Logic**: Prepares email content and attachments
4. **Confirmation Modal**: Shows success or error message after submission
5. **Form Reset**: Clears the form after successful submission

## Backend Integration Required

To enable actual email sending, you need to implement a backend API endpoint. The current code includes a placeholder at line 328 of `feedbackForm.js`.

### Option 1: Custom Backend API

Create an API endpoint (e.g., `/api/send-feedback`) that accepts:

**Request Body:**
```json
{
  "to": "feedback@embodied-mind.org",
  "cc": "user@example.com",  // Optional, only if sendCopy is true
  "subject": "Web Witchcraft and Wizardry Feedback",
  "text": "Human-readable feedback content...",
  "attachment": {
    "filename": "feedback.json",
    "content": "{...JSON data...}"
  }
}
```

**Example Implementation (Node.js with Express and Nodemailer):**

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-password'
  }
});

app.post('/api/send-feedback', async (req, res) => {
  try {
    const { to, cc, subject, text, attachment } = req.body;
    
    const mailOptions = {
      from: 'noreply@embodied-mind.org',
      to: to,
      cc: cc || undefined,
      subject: subject,
      text: text,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: 'application/json'
        }
      ]
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3000);
```

### Option 2: Email Service (EmailJS, SendGrid, etc.)

#### Using EmailJS (Client-side solution)

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service and template
3. Update `sendFeedbackEmail()` function:

```javascript
async function sendFeedbackEmail(recipientEmail, senderEmail, sendCopy, humanReadable, jsonData) {
  emailjs.init('YOUR_PUBLIC_KEY');
  
  const templateParams = {
    to_email: recipientEmail,
    from_email: senderEmail,
    reply_to: senderEmail,
    message: humanReadable,
    json_data: jsonData,
    send_copy: sendCopy
  };
  
  return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
}
```

#### Using SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API endpoint that uses SendGrid API:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-feedback', async (req, res) => {
  const { to, cc, subject, text, attachment } = req.body;
  
  const msg = {
    to: to,
    cc: cc || undefined,
    from: 'feedback@embodied-mind.org',
    subject: subject,
    text: text,
    attachments: [
      {
        content: Buffer.from(attachment.content).toString('base64'),
        filename: attachment.filename,
        type: 'application/json',
        disposition: 'attachment'
      }
    ]
  };
  
  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Option 3: Form Submission Service (Formspree, Netlify Forms, etc.)

#### Using Formspree

1. Sign up at [Formspree](https://formspree.io/)
2. Create a form endpoint
3. Update the form submission:

```javascript
async function sendFeedbackEmail(recipientEmail, senderEmail, sendCopy, humanReadable, jsonData) {
  const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: senderEmail,
      message: humanReadable,
      _replyto: senderEmail,
      _subject: 'Web Witchcraft and Wizardry Feedback',
      _cc: sendCopy ? senderEmail : undefined,
      feedback_data: jsonData
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send feedback');
  }
  
  return response.json();
}
```

## Testing

Currently, the code logs all email content to the browser console for testing purposes. Check the browser console after submitting the form to see:

- Recipient email
- CC email (if copy is requested)
- Human-readable content
- JSON attachment content

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on the backend to prevent spam
2. **Validation**: Validate all input on the backend
3. **CORS**: Configure CORS properly if using a separate API server
4. **Email Verification**: Consider adding email verification for the "send copy" feature
5. **API Keys**: Never expose API keys in client-side code; use environment variables on the server

## Form Data Structure

The submitted data includes:

- **Personal Information**: Name, email, role, age, gender
- **Technical Information**: Programming languages, computer type, browser, location
- **Course Feedback**: Helpfulness, completed lessons, duration, enjoyment rating
- **Text Feedback**: Likes, dislikes, suggestions
- **Additional**: User message, consent status, timestamp

## Modal Confirmation

After submission, a modal appears with:
- **Success**: "Feedback Sent Successfully!" message with thank you text
- **Error**: "Error Sending Feedback" with error details

The modal can be closed by clicking the "Close" button, and successful submissions reset the form.
