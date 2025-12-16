#!/bin/bash

# Browser compatibility testing script
# Installs required Selenium dependencies and runs the tests

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Install Playwright for browser testing
echo "Installing Playwright..."
npm install playwright > /dev/null 2>&1

# Install all browsers
echo "Installing browsers (Chromium, Firefox, WebKit)..."
npx playwright install > /dev/null 2>&1

# Install system dependencies for WebKit (works in GitHub Actions)
echo "Installing WebKit system dependencies..."
if command -v sudo &> /dev/null; then
    # Running locally with sudo available
    sudo npx playwright install-deps webkit > /dev/null 2>&1 && echo "✓ WebKit dependencies installed" || echo "⚠️  WebKit dependencies installation skipped (requires sudo)"
else
    # Running in CI/GitHub Actions (already has permissions)
    npx playwright install-deps webkit > /dev/null 2>&1 && echo "✓ WebKit dependencies installed" || echo "⚠️  WebKit dependencies installation failed"
fi

# Start server and setup
start_server_if_needed "$TEST_URL"
setup_results_dir

# Run the browser tests
echo "Running browser compatibility tests..."
node "$SCRIPT_DIR/run-browser-tests.js" "$@"
EXIT_CODE=$?

# Stop server if we started it
stop_server_if_started

exit $EXIT_CODE
