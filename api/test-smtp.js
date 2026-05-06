#!/usr/bin/env node
/**
 * **********************************************************************
 * File       : api/test-smtp.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Tests the SMTP configuration without sending an actual email.
 *   Usage: node api/test-smtp.js
 * **********************************************************************
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testSMTP() {
  console.log('\n🧪 Testing SMTP Configuration...\n');

  // Display configuration (without password)
  console.log('Configuration:');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  Secure:', process.env.SMTP_SECURE);
  console.log('  User:', process.env.SMTP_USER);
  console.log(
    '  Pass:',
    process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'
  );
  console.log('');

  // Check for placeholder password
  if (
    process.env.SMTP_PASS === 'your-Rand0m.Admin' ||
    process.env.SMTP_PASS.includes('your-') ||
    process.env.SMTP_PASS.includes('password') ||
    process.env.SMTP_PASS.includes('example')
  ) {
    console.log('⚠️  WARNING: Your password looks like a placeholder!');
    console.log('   Please update SMTP_PASS in your .env file with your actual OVH password.\n');
  }

  // Test configuration 1: Current settings
  console.log('📡 Test 1: Verifying current configuration...');
  const config1 = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  };

  try {
    const transporter1 = nodemailer.createTransport(config1);
    await transporter1.verify();
    console.log('✅ Success! SMTP connection verified with current settings.\n');
    process.exit(0);
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('');
  }

  // Test configuration 2: Try port 587 with STARTTLS
  console.log('📡 Test 2: Trying port 587 with STARTTLS...');
  const config2 = {
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  };

  try {
    const transporter2 = nodemailer.createTransport(config2);
    await transporter2.verify();
    console.log('✅ Success with port 587!');
    console.log('   Update your .env file:');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false\n');
    process.exit(0);
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('');
  }

  // Provide troubleshooting tips
  console.log('🔍 Troubleshooting Tips:');
  console.log('');
  console.log('1. Verify your OVH email password:');
  console.log('   - Log in to https://www.ovh.com/manager/');
  console.log('   - Go to Web Cloud > Emails');
  console.log('   - Check/reset your email password');
  console.log('');
  console.log('2. OVH SMTP Settings:');
  console.log('   - Outgoing server: smtp.mail.ovh.net or ssl0.ovh.net');
  console.log('   - Port 465 (SSL) or 587 (STARTTLS)');
  console.log('   - Username: your full email address');
  console.log('');
  console.log('3. Check if OVH requires:');
  console.log('   - Two-factor authentication to be disabled for SMTP');
  console.log('   - An application-specific password');
  console.log('   - SMTP to be enabled in your email settings');
  console.log('');
  console.log('4. Alternative: Try ssl0.ovh.net instead of smtp.mail.ovh.net');
  console.log('');

  process.exit(1);
}

testSMTP().catch((error) => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
