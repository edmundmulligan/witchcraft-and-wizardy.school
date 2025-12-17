#!/bin/bash

# This script checks that all HTML, CSS, and JS files have proper header comments
# with required fields: File, Author, Copyright, License, Description

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Setup results directory
setup_results_dir
RESULT_FILE="$RESULTS_DIR/file-comments-check-results.txt"

# Initialize counters
TOTAL_FILES=0
FILES_WITH_ISSUES=0
MISSING_HEADER=0
MISSING_FIELDS=0

# Required fields in header comments
REQUIRED_FIELDS=("File" "Author" "Copyright" "License" "Description")

echo "📝 Checking file header comments..."
echo ""

# Find all HTML, CSS, and JS files (excluding node_modules and tests)
FILES=$(find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/tests/*" \
    | sort)

# Initialize results file
echo "File Header Comments Check Results" > "$RESULT_FILE"
echo "===================================" >> "$RESULT_FILE"
echo "" >> "$RESULT_FILE"

for file in $FILES; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    FILE_HAS_ISSUES=0
    ISSUES=""
    
    # Determine comment style based on file extension
    if [[ $file == *.html ]]; then
        # HTML uses <!-- --> comments
        HEADER=$(head -20 "$file" | grep -A 15 "<!--")
    else
        # CSS and JS use /* */ comments
        HEADER=$(head -20 "$file" | grep -A 15 "/\*")
    fi
    
    # Check if header comment block exists
    if [ -z "$HEADER" ]; then
        MISSING_HEADER=$((MISSING_HEADER + 1))
        FILE_HAS_ISSUES=1
        ISSUES="  ❌ Missing header comment block"
    else
        # Check for required fields
        MISSING=""
        for field in "${REQUIRED_FIELDS[@]}"; do
            if ! echo "$HEADER" | grep -qi "^\s*\*\?\s*$field\s*:" && \
               ! echo "$HEADER" | grep -qi "^\s*$field\s*:"; then
                if [ -z "$MISSING" ]; then
                    MISSING="$field"
                else
                    MISSING="$MISSING, $field"
                fi
            fi
        done
        
        if [ -n "$MISSING" ]; then
            MISSING_FIELDS=$((MISSING_FIELDS + 1))
            FILE_HAS_ISSUES=1
            ISSUES="  ⚠️  Missing required fields: $MISSING"
        fi
    fi
    
    # Report results
    if [ $FILE_HAS_ISSUES -eq 1 ]; then
        FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
        echo "❌ $file"
        echo "$ISSUES"
        echo ""
        
        # Write to results file
        echo "$file" >> "$RESULT_FILE"
        echo "$ISSUES" >> "$RESULT_FILE"
        echo "" >> "$RESULT_FILE"
    else
        echo "✅ $file"
    fi
done

# Summary
echo ""
echo "======================================"
echo "📊 File Comments Check Summary"
echo "======================================"
echo "Total files checked: $TOTAL_FILES"
echo "Files with issues: $FILES_WITH_ISSUES"
echo "  Missing header blocks: $MISSING_HEADER"
echo "  Missing required fields: $MISSING_FIELDS"
echo ""

# Write summary to results file
echo "" >> "$RESULT_FILE"
echo "=====================================" >> "$RESULT_FILE"
echo "Summary" >> "$RESULT_FILE"
echo "=====================================" >> "$RESULT_FILE"
echo "Total files checked: $TOTAL_FILES" >> "$RESULT_FILE"
echo "Files with issues: $FILES_WITH_ISSUES" >> "$RESULT_FILE"
echo "  Missing header blocks: $MISSING_HEADER" >> "$RESULT_FILE"
echo "  Missing required fields: $MISSING_FIELDS" >> "$RESULT_FILE"

if [ $FILES_WITH_ISSUES -eq 0 ]; then
    echo "✅ All files have proper header comments!"
    echo ""
    exit 0
else
    echo "❌ Some files are missing proper header comments!"
    echo "Detailed results saved to: $RESULT_FILE"
    echo ""
    exit 1
fi
