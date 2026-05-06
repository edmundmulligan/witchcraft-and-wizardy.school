#!/bin/bash

# This script checks that all HTML, CSS, and JS files have proper header comments
# with required fields: File, Author, Copyright, License, Description

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
    print_standard_usage "$0 [folder] [options]" help exclude-checks
}

# Parse command line arguments
EXCLUDE_LIST=""
FOLDER=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            print_usage
            exit 0
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
                echo "❌ Error: Unexpected argument '$1'"
                exit 1
            fi
            shift
            ;;
    esac
done

[ -z "$FOLDER" ] && FOLDER="."

# Initialise counters
TOTAL_FILES=0
FILES_WITH_ISSUES=0
MISSING_HEADER=0
MISSING_FIELDS=0

# Required fields in header comments
REQUIRED_FIELDS=("File" "Author" "Copyright" "License" "Description")

# Validate folder parameter
ORIGINAL_DIR=$(pwd)
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Setup results directory in application folder
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"
RESULT_FILE="$RESULTS_DIR/file-comments-check-results.json"

echo "📝 Checking file header comments..."
echo ""

# Find all HTML, CSS, and JS files (excluding node_modules, tests, and lessons)
FILES=$(find "$FOLDER" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/tests/*" \
    ! -path "*/lessons/*" \
    | sort)

if [ -n "$EXCLUDE_LIST" ]; then
    filter_excluded_paths "$FILES" "$EXCLUDE_LIST"
    FILES="$FILTERED_PATHS_RESULT"
    echo "🚫 Excluded $FILTERED_PATHS_EXCLUDED_COUNT files using: $EXCLUDE_LIST"
fi

# Initialise results file
echo '{"files":[],"summary":{"totalFiles":0,"filesWithIssues":0,"missingHeaderBlocks":0,"missingRequiredFields":0}}' > "$RESULT_FILE"

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
        ISSUES_JSON='[{"type":"missing-header","message":"Missing header comment block"}]'
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
            ISSUES_JSON=$(node -e "const fields = (process.argv[1] || '').split(/,\s*/).filter(Boolean); console.log(JSON.stringify([{ type: 'missing-fields', message: 'Missing required fields: ' + fields.join(', '), missingFields: fields }]));" "$MISSING")
        fi
    fi

    # Report results
    if [ $FILE_HAS_ISSUES -eq 1 ]; then
        FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
        echo "❌ $file"
        echo "$ISSUES"
        echo ""

                node -e "
                    const fs = require('fs');
                    const resultFile = process.argv[1];
                    const filePath = process.argv[2];
                    const issues = JSON.parse(process.argv[3]);
                    const data = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
                    data.files.push({ file: filePath, issues });
                    fs.writeFileSync(resultFile, JSON.stringify(data, null, 2));
                " "$RESULT_FILE" "$file" "$ISSUES_JSON"
    else
        echo "✅ $file"
    fi
done

node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    data.summary = {
        totalFiles: Number(process.argv[2]),
        filesWithIssues: Number(process.argv[3]),
        missingHeaderBlocks: Number(process.argv[4]),
        missingRequiredFields: Number(process.argv[5])
    };
    fs.writeFileSync(process.argv[1], JSON.stringify(data, null, 2));
" "$RESULT_FILE" "$TOTAL_FILES" "$FILES_WITH_ISSUES" "$MISSING_HEADER" "$MISSING_FIELDS"

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
