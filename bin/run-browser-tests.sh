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

# Verify Playwright installation integrity before running tests.
if ! node -e "require.resolve('playwright'); require.resolve('playwright-core/lib/utils/isomorphic/imageUtils')" >/dev/null 2>&1; then
    echo "⚠️  Playwright installation appears incomplete. Repairing with npm ci..."
    if ! npm ci --no-audit --no-fund >/dev/null 2>&1; then
        echo "❌ Error: Failed to repair Playwright dependencies via npm ci"
        exit 1
    fi
fi

# Install all browsers
echo "Installing browsers (Chromium, Firefox, WebKit)..."
npx playwright install > /dev/null 2>&1

# Install system dependencies for WebKit (works in GitHub Actions)
echo "Checking WebKit system dependencies..."
# Check if webkit deps are already installed by trying to run a quick playwright check
if npx playwright install-deps webkit --dry-run 2>&1 | grep -q "All browsers are already installed"; then
    echo "✓ WebKit dependencies already installed"
elif command -v sudo &> /dev/null; then
    # Running locally with sudo available - try non-interactive installation
    # Use -n flag to prevent sudo from prompting for password
    echo "Installing WebKit system dependencies (non-interactive)..."
    if sudo -n npx playwright install-deps webkit > /dev/null 2>&1; then
        echo "✓ WebKit dependencies installed"
    else
        echo "⚠️  WebKit dependencies installation skipped (requires sudo password or permissions)"
        echo "   To enable WebKit tests, run: sudo npx playwright install-deps webkit"
    fi
else
    # Running in CI/GitHub Actions (already has permissions)
    echo "Installing WebKit system dependencies..."
    npx playwright install-deps webkit > /dev/null 2>&1 && echo "✓ WebKit dependencies installed" || echo "⚠️  WebKit dependencies installation failed"
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"

# Run the browser tests - pass the original folder path as an environment variable
echo "Running browser compatibility tests..."
TEST_URL="$TEST_URL" BROWSER_TEST_FOLDER="$ORIGINAL_DIR/$FOLDER" BROWSER_TEST_EXCLUDES="$EXCLUDE_LIST" node "$SCRIPT_DIR/run-browser-tests.js"
EXIT_CODE=$?

# Stop server if we started it
stop_server_if_started

exit $EXIT_CODE
