#!/bin/bash

# Browser compatibility testing script
# Installs required Selenium dependencies and runs the tests

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Install required npm packages for Selenium testing
echo "Installing Selenium WebDriver dependencies..."
npm install selenium-webdriver chromedriver geckodriver msedgedriver > /dev/null 2>&1

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
