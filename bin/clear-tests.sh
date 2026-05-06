#!/bin/bash

# This script clears the test results directory

# Accept application folder parameter
APP_FOLDER="${1:-.}"

if [ ! -d "$APP_FOLDER" ]; then
  echo "❌ Error: '$APP_FOLDER' is not a valid directory"
  exit 1
fi

RESULTS_DIR="$APP_FOLDER/diagnostics/test-results"

# Remove the directory if it exists
if [ -d "$RESULTS_DIR" ]; then
  echo "🗑️  Removing existing results directory..."
  rm -rf "$RESULTS_DIR"
fi

# Create fresh directory
echo "📁 Creating results directory..."
mkdir -p "$RESULTS_DIR"

echo "✅ Test results directory cleared"
