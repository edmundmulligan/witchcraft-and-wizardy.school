#!/bin/bash

# This script clears the test results directory

RESULTS_DIR="tests/results"

# Remove the directory if it exists
if [ -d "$RESULTS_DIR" ]; then
  echo "🗑️  Removing existing results directory..."
  rm -rf "$RESULTS_DIR"
fi

# Create fresh directory
echo "📁 Creating results directory..."
mkdir -p "$RESULTS_DIR"

echo "✅ Test results directory cleared"
