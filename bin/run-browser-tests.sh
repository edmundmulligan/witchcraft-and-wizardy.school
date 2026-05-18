#!/bin/bash

# Browser compatibility testing script
# Installs required Selenium dependencies and runs the tests

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
    print_standard_usage "$0 [folder] [options]" help url exclude-discovery
}

TEST_URL="http://localhost:8080"
FOLDER=""
EXCLUDE_LIST="diagnostics lessons"
URL_EXPLICITLY_SET=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_usage
            exit 0
            ;;
        -u|--url)
            shift
            if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
                echo "❌ Error: --url requires a URL argument"
                exit 1
            fi
            TEST_URL="$1"
            URL_EXPLICITLY_SET=true
            shift
            ;;
        -x|--exclude)
            shift
            if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
                echo "❌ Error: --exclude requires at least one file or folder"
                exit 1
            fi
            while [[ $# -gt 0 ]] && [[ "$1" != -* ]]; do
                EXCLUDE_LIST="$(normalise_exclude_list "$EXCLUDE_LIST" "$1")"
                shift
            done
            ;;
        *)
            if [ -z "$FOLDER" ]; then
                FOLDER="$1"
            else
                echo "❌ Error: Unknown option: $1"
                print_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Accept optional folder parameter
FOLDER="${FOLDER:-.}"
if [ ! -d "$FOLDER" ]; then
        echo "❌ Error: '$FOLDER' is not a valid directory"
        exit 1
fi

if [ "$URL_EXPLICITLY_SET" = false ]; then
    case "$FOLDER" in
        web|.) TEST_URL="http://localhost:8080" ;;
        stats) TEST_URL="http://localhost:8081" ;;
        sound) TEST_URL="http://localhost:8082" ;;
        api) TEST_URL="http://localhost:8083" ;;
    esac
fi

# Verify Playwright is available without relying on internal file paths.
if ! node -e "require.resolve('playwright')" >/dev/null 2>&1; then
    echo "❌ Error: Playwright dependency is unavailable."
    echo "Run 'npm ci' before executing browser tests."
    exit 1
fi

# Install all browsers
echo "Installing browsers (Chromium, Firefox, WebKit)..."
if ! node ./node_modules/playwright/cli.js install; then
    echo "⚠️  Playwright browser installation failed. Attempting to continue..."
fi

# Install system dependencies for WebKit (works in GitHub Actions)
echo "Checking WebKit system dependencies..."
if [ "$OS" = "Windows_NT" ]; then
    echo "ℹ️  Skipping WebKit system dependency checks on Windows"
elif node ./node_modules/playwright/cli.js install-deps webkit --dry-run 2>&1 | grep -q "All browsers are already installed"; then
    echo "✓ WebKit dependencies already installed"
elif command -v sudo &> /dev/null; then
    # Running locally with sudo available - try non-interactive installation
    # Use -n flag to prevent sudo from prompting for password
    echo "Installing WebKit system dependencies (non-interactive)..."
    if sudo -n node ./node_modules/playwright/cli.js install-deps webkit > /dev/null 2>&1; then
        echo "✓ WebKit dependencies installed"
    else
        echo "⚠️  WebKit dependencies installation skipped (requires sudo password or permissions)"
        echo "   To enable WebKit tests, run: sudo node ./node_modules/playwright/cli.js install-deps webkit"
    fi
else
    # Running in CI/GitHub Actions (already has permissions)
    echo "Installing WebKit system dependencies..."
    node ./node_modules/playwright/cli.js install-deps webkit > /dev/null 2>&1 && echo "✓ WebKit dependencies installed" || echo "⚠️  WebKit dependencies installation failed"
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(normalise_path_for_node "$(pwd)")
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
if ! start_server_if_needed "$TEST_URL"; then
    echo "❌ Browser tests aborted: local server did not start"
    exit 1
fi

# Run the browser tests - resolve tests from repo root and serve the selected folder.
echo "Running browser compatibility tests..."
TEST_URL="$TEST_URL" BROWSER_TEST_FOLDER="$ORIGINAL_DIR" BROWSER_TEST_APP="$FOLDER" BROWSER_TEST_EXCLUDES="$EXCLUDE_LIST" node "$SCRIPT_DIR/run-browser-tests.js"
EXIT_CODE=$?

# Stop server if we started it
stop_server_if_started

exit $EXIT_CODE
