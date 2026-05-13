/**
 * **********************************************************************
 * File       : api/server.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Express server for handling API requests, including feedback
 *   form submissions.
 * **********************************************************************
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import feedbackRouter from './routes/feedback.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_PORT = process.env.STATIC_PORT || 8000;

// Middleware
app.use(
  cors({
    origin: [
      `http://localhost:${STATIC_PORT}`,
      'http://127.0.0.1:${STATIC_PORT}',
      'https://web.witchcraft-and-wizardry.school',
      'https://www.witchcraft-and-wizardry.school',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', feedbackRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  // Preserve Express error-handler signature while keeping lint clean.
  void next;
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📧 Feedback endpoint: http://localhost:${PORT}/api/send-feedback`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`\n🌐 Make sure your static site is running on http://localhost:${STATIC_PORT}`);
  console.log(`   Run: npm run dev\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
