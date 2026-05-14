# API Server

Node.js/Express API server for Web Witchcraft and Wizardry website.

## Features

- **Feedback Form Submissions**: Receives and emails feedback from the website
- **Email Service**: Sends formatted emails with JSON attachments
- **CORS Support**: Configured for local development and production domains
- **Input Validation**: Validates and sanitises all incoming data
- **Error Handling**: Comprehensive error handling with appropriate status codes
- **Health Checks**: Monitoring endpoint for server status

## Setup

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

### 3. Email Configuration

#### Development Mode (Console Output)

For development, emails are logged to the console instead of being sent:

```env
NODE_ENV=development
EMAIL_PROVIDER=console
```

#### Production Mode (SMTP)

For production, configure your SMTP server:

**Using Gmail:**
```env
NODE_ENV=production
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@embodied-mind.org
```

**Note**: For Gmail, you'll need to create an [App Password](https://support.google.com/accounts/answer/185833).

**Using Other Providers:**

- **SendGrid**: `smtp.sendgrid.net`, port 587
- **Mailgun**: `smtp.mailgun.org`, port 587
- **AWS SES**: Check AWS documentation for endpoint
- **Custom SMTP**: Use your server's SMTP settings

### 4. Start the Server

#### Development Mode:
```bash
npm run start:dev
```

#### With Static Site:
```bash
# Terminal 1: Static site
cd ..
npm run dev

# Terminal 2: API server
cd api
npm run start:dev
```

#### Production Mode:
```bash
npm start
```

### Standalone API Deployment

When deploying only the API folder, use it as the Node.js app root:

```bash
cd api
npm ci --omit=dev
NODE_ENV=production npm start
```

CI/CD deployment note:
- The deploy workflow copies `api.env` to `.env` on the server.
- Sensitive values are not stored in `api.env`.
- SMTP credentials are injected at runtime from Azure Key Vault.

## API Endpoints

### POST /api/send-feedback

Sends feedback form data via email.

**Request Body:**
```json
{
  "to": "feedback@embodied-mind.org",
  "cc": "user@example.com",
  "subject": "Web Witchcraft and Wizardry Feedback",
  "text": "Human-readable feedback content...",
  "attachment": {
    "filename": "feedback.json",
    "content": "{...JSON data...}"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Feedback sent successfully",
  "messageId": "<message-id@server>"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## Security

### Rate Limiting

Rate limiting is configured to prevent abuse:
- **Window**: 15 minutes (configurable)
- **Max Requests**: 10 per window (configurable)

### Input Validation

All incoming data is validated:
- Email addresses must be valid format
- Required fields are enforced
- Data is sanitised to prevent XSS

### CORS

CORS is configured to allow requests from:
- `http://localhost:8000` (development)
- `https://web.witchcraft-and-wizardry.school` (production)
- Additional origins can be configured in `.env`

In production, app-level CORS is disabled by default to avoid duplicate
`Access-Control-Allow-Origin` headers when a reverse proxy already manages CORS.
Set `APP_ENABLE_CORS=true` to force CORS handling in the Node.js API app.

## Testing

### Automated API Tests

**Quick Start:**

```bash
# Terminal 1: Start API server in development mode (logs emails to console)
NODE_ENV=development EMAIL_PROVIDER=console npm run api

# Terminal 2: Run tests
npm run tests:api
```

**Note:** Tests require the API server to be running with appropriate environment variables. Using `NODE_ENV=development` and `EMAIL_PROVIDER=console` allows testing without configuring SMTP credentials.

This runs automated tests covering:
- Health check endpoint
- Feedback submission with various scenarios
- Input validation
- Error handling
- 404 responses

See [TESTING.md](TESTING.md) for detailed testing documentation, including environment configuration and troubleshooting.

### Manual Testing

#### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

#### Test Feedback Endpoint

```bash
curl -X POST http://localhost:3000/api/send-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "to": "feedback@embodied-mind.org",
    "subject": "Test Feedback",
    "text": "This is a test feedback submission."
  }'
```

## Deployment

### Option 1: Heroku

1. Create Heroku app: `heroku create`
2. Set environment variables: `heroku config:set SMTP_HOST=...`
3. Deploy: `git push heroku main`

### Option 2: Vercel

Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/server.js"
    }
  ]
}
```

### Option 3: DigitalOcean App Platform

1. Connect your repository
2. Configure environment variables
3. Set build command: `npm install`
4. Set run command: `npm run api:prod`

### Option 4: Traditional VPS

1. Install Node.js
2. Clone repository
3. Change to API directory: `cd api`
4. Configure `.env`
5. Install dependencies: `npm install`
  Or for production reproducibility: `npm ci --omit=dev`
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
  pm2 start server.js --name witchcraft-api
   pm2 save
   pm2 startup
   ```

## Monitoring

### Logs

Logs include:
- Incoming requests with timestamps
- Email sending status
- Errors with stack traces (development mode)

### Health Checks

Monitor server health at `/health` endpoint.

## Troubleshooting

### "Email service not configured properly"

- Check that all SMTP_ environment variables are set in `.env`
- Verify SMTP credentials are correct
- Ensure firewall allows outbound connections on SMTP port

### "CORS error"

- Verify the frontend URL is in `ALLOWED_ORIGINS` in `.env`
- Check that the API server is running
- Ensure browser isn't blocking cross-origin requests

### "Failed to send email"

- Check SMTP credentials
- Verify email server is accessible
- Check rate limits on email provider
- Review email service logs for specific errors

## Development

### Project Structure

```
api/
├── server.js              # Main Express server
├── routes/
│   └── feedback.js        # Feedback endpoint routes
├── services/
│   └── emailService.js    # Email sending service
└── validators/
    └── feedbackValidator.js  # Input validation
```

### Adding New Endpoints

1. Create route file in `api/routes/`
2. Import and use in `api/server.js`
3. Update this README with endpoint documentation

## License

MIT License - See LICENSE file for details.
