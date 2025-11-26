#!/bin/bash

# Common helper functions for accessibility testing scripts

# Parse command line options for test URL
parse_test_options() {
  local OPTIND
  while getopts ":hu:" opt
  do
    case $opt in
      h)
        echo "Usage: $0 [-h] [-u URL]"
        echo "  -h        Show this help message and exit"
        echo "  -u URL    Specify the URL of the local web server to test (default: http://localhost:8080)"
        exit 0
        ;;
      u)
        TEST_URL="$OPTARG"
        ;;
      \?)
        echo "Invalid option: -$OPTARG" >&2
        exit 1
        ;;
    esac
  done
}

# Start local server if not running
start_server_if_needed() {
  local url="$1"
  
  if ! curl -s -f "$url" > /dev/null 2>&1
  then
    echo "⚠️  No server detected at $url"
    echo "Starting local server..."
    npx serve . -l 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    STOP_SERVER=true
  else
    echo "✓ Server is running at $url"
    STOP_SERVER=false
  fi
}

# Stop server if we started it
stop_server_if_started() {
  if [ "$STOP_SERVER" = true ]; then
    echo "Stopping local server..."
    kill $SERVER_PID 2>/dev/null
  fi
}

# Find all HTML files to test
discover_html_pages() {
  echo "Discovering pages to test..."
  PAGES=$(find . -name "*.html" -not -path "./node_modules/*" -not -path "./tests/*" -print)
  PAGE_COUNT=$(echo "$PAGES" | wc -l)
  echo "Found $PAGE_COUNT pages to test"
}

# Setup results directory
setup_results_dir() {
  RESULTS_DIR="tests/results"
  mkdir -p "$RESULTS_DIR"
}
