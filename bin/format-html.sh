#!/bin/bash

# Format HTML files using Prettier, excluding specified folders

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📐 Formatting HTML files..."

# Check if prettier is available
if ! command -v npx prettier &> /dev/null; then
    echo "⚠️  Prettier not found. Installing..."
    npm install --save-dev prettier
fi

# Format all HTML files, excluding lessons and diagnostics folders
npx prettier --write \
    --ignore-path <(echo "lessons/**" && echo "diagnostics/**") \
    "**/*.html" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ HTML files formatted successfully"
    exit 0
else
    echo "⚠️  Some files could not be formatted"
    exit 0  # Don't fail the build if formatting has issues
fi
