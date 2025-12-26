#!/bin/bash

# Browser compatibility testing script
# Installs required Selenium dependencies and runs the tests

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Accept optional folder parameter
FOLDER="${1:-.}"
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Get any command line options (skip folder parameter)
TEST_URL="http://localhost:8080"
shift
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

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"

# Run the browser tests - pass the original folder path as an environment variable
echo "Running browser compatibility tests..."
BROWSER_TEST_FOLDER="$ORIGINAL_DIR/$FOLDER" node "$SCRIPT_DIR/run-browser-tests.js" "$@"
EXIT_CODE=$?

# Stop server if we started it
stop_server_if_started

exit $EXIT_CODE
