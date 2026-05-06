#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/run-all-tests.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Runs all test suites in sequence, continuing even if individual
 *   tests fail. Collects failures and reports at the end.
 *   Supports continue mode to resume interrupted test runs.
 **********************************************************************
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
let folder = '.';
let excludeList = 'lessons diagnostics';
let quickMode = false;
let runWave = false;
let continueMode = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: node run-all-tests.js [folder] [options]');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help       Show this help message');
    console.log('  -c, --continue   Continue from last interrupted test run');
    console.log('  -q, --quick      Quick mode: skip Lighthouse and Wave tests');
    console.log('  -w, --run-wave   Include Wave accessibility tests');
    console.log('  -x, --exclude    Exclude specific files/folders from testing');
    process.exit(0);
  } else if (arg === '-c' || arg === '--continue') {
    continueMode = true;
  } else if (arg === '-q' || arg === '--quick') {
    quickMode = true;
  } else if (arg === '-w' || arg === '--run-wave') {
    runWave = true;
  } else if (arg === '-x' || arg === '--exclude') {
    i++;
    const excludes = [];
    while (i < args.length && !args[i].startsWith('-')) {
      excludes.push(args[i]);
      i++;
    }
    i--; // Back up one since the loop will increment
    excludeList = excludes.join(' ');
  } else if (!arg.startsWith('-')) {
    folder = arg;
  }
}

// State file for tracking test progress
const stateFile = path.join(folder, 'diagnostics', 'test-results', '.test-progress.json');

// Load or initialise test state
let testState = {
  completed: [],
  failed: [],
  quickMode: quickMode,
  runWave: runWave,
};

if (continueMode && fs.existsSync(stateFile)) {
  try {
    const savedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    testState = savedState;
    console.log('🔄 Resuming from previous test run...');
    console.log(`   Completed: ${testState.completed.length} tests`);
    console.log(`   Failed: ${testState.failed.length} tests`);
    console.log('');
  } catch (error) {
    console.log('⚠️  Could not load test state, starting fresh...');
  }
} else if (!continueMode && fs.existsSync(stateFile)) {
  // Clear state file if not in continue mode
  try {
    fs.unlinkSync(stateFile);
  } catch (error) {
    // Ignore errors deleting state file
  }
}

// Save state after each test
function saveState() {
  try {
    const dir = path.dirname(stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(stateFile, JSON.stringify(testState, null, 2));
  } catch (error) {
    // Ignore errors saving state
  }
}

// Check if a test should be run
function shouldRunTest(testName) {
  if (!continueMode) {
    return true;
  }
  return !testState.completed.includes(testName);
}

// Mark test as completed
function markTestCompleted(testName, passed) {
  if (!testState.completed.includes(testName)) {
    testState.completed.push(testName);
  }
  if (!passed && !testState.failed.includes(testName)) {
    testState.failed.push(testName);
  }
  saveState();
}

// Helper to run a command and handle errors
function runTest(testName, description, command, options = {}) {
  if (!shouldRunTest(testName)) {
    console.log(
      `\n⏭️  Skipping ${description.replace(/^.*?(?:Running|Checking)\s+/i, '')} (already completed)`
    );
    return !testState.failed.includes(testName);
  }

  console.log(`\n${description}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options,
    });
    markTestCompleted(testName, true);
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      console.log(`⚠️  ${description.replace(/^.*?(?:Running|Checking)\s+/i, '')} failed`);
    }
    markTestCompleted(testName, false);
    return false;
  }
}

// Track test results
let failedTests = 0;

console.log('Running all tests...');
if (quickMode) {
  console.log('⚡ Quick mode enabled: Skipping Wave and Lighthouse tests');
}
if (continueMode && testState.completed.length === 0) {
  console.log('💡 Tip: Use --continue to resume interrupted test runs');
}
console.log('');

const excludeArgs = excludeList ? `-x ${excludeList}` : '';

// For audit-colour-usage, prefix excludes with folder path
const auditExcludes = excludeList 
  ? excludeList.split(' ').map(item => `${folder}/${item}`).join(' ')
  : '';
const auditExcludeArgs = auditExcludes ? `-x ${auditExcludes}` : '';

// Run all tests in sequence
if (
  !runTest('clear', '📄 Clearing previous test results...', `bin/clear-tests.sh ${folder}`, {
    ignoreError: true,
  })
) {
  // Don't count clear as a failure
}

if (
  !runTest(
    'validate-code',
    '📄 Running code validation...',
    `bin/validate-code.sh ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (
  !runTest(
    'audit-colour',
    '🎨 Running colour usage audit...',
    `node bin/audit-colour-usage.js ${folder} ${auditExcludeArgs}`
  )
) {
  failedTests++;
}

if (
  !runTest(
    'check-comments',
    '📝 Running comments check...',
    `bin/check-file-comments.sh ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (
  !runTest(
    'check-links',
    '🔗 Running link checks...',
    `bin/check-links.sh ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (
  !runTest(
    'axe-tests',
    '🪓 Running axe accessibility tests...',
    `bin/run-axe-tests.sh -q ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (!quickMode) {
  if (
    !runTest(
      'lighthouse-tests',
      '🏮 Running lighthouse accessibility tests...',
      `bin/run-lighthouse-tests.sh -q ${folder} ${excludeArgs}`
    )
  ) {
    failedTests++;
  }
} else {
  console.log('\n⏭️  Skipping Lighthouse tests (quick mode enabled)');
}

if (
  !runTest(
    'pa11y-tests',
    '🦜 Running pa11y accessibility tests...',
    `bin/run-pa11y-tests.sh -q ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (runWave && !quickMode) {
  if (
    !runTest(
      'wave-tests',
      '🌊 Running Wave accessibility tests...',
      `bin/run-wave-tests.sh -q ${folder} ${excludeArgs}`
    )
  ) {
    failedTests++;
  }
} else {
  console.log(
    '\n⏭️  Skipping Wave accessibility tests' +
      (quickMode ? ' (quick mode enabled)' : ' (use -w or --run-wave to enable)')
  );
}

if (
  !runTest(
    'reading-age',
    '📖 Running reading age checks...',
    `bin/check-reading-age.sh ${folder} ${excludeArgs}`
  )
) {
  failedTests++;
}

if (
  !runTest(
    'browser-tests',
    '🌐 Running cross-browser tests...',
    `bin/run-browser-tests.sh ${folder}`
  )
) {
  failedTests++;
}

// Always run summary at the end
console.log('\n📊 Generating test summary...');
try {
  execSync(`bin/summarise-tests.sh ${folder}`, { stdio: 'inherit' });
} catch (error) {
  // Don't fail if summary fails
}

// Report final results
console.log('');
if (failedTests > 0) {
  console.log(`❌ ${failedTests} test suite${failedTests > 1 ? 's' : ''} failed!`);
  console.log('💡 Run with --continue to resume from where you left off');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  // Clean up state file on success
  if (fs.existsSync(stateFile)) {
    try {
      fs.unlinkSync(stateFile);
    } catch (error) {
      // Ignore errors deleting state file
    }
  }
  process.exit(0);
}
