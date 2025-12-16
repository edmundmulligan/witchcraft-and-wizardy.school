#!/bin/bash

# This script validates HTML, CSS, and JavaScript code
# N.B. Do not use the W3C validator as that does not support CSS variables

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
parse_test_options "$@"

# Silently install dependencies if not already installed
echo "Installing dependencies..."
npm install html-validate stylelint stylelint-config-standard eslint > /dev/null 2>&1

# Setup results directory
setup_results_dir
RESULT_FILE="$RESULTS_DIR/validation-results.json"

# Initialize combined results
echo '{"files":[],"summary":{"htmlErrors":0,"htmlWarnings":0,"cssErrors":0,"cssWarnings":0,"jsErrors":0,"jsWarnings":0}}' > "$RESULT_FILE"

echo ""
echo "📄 Validating HTML, CSS, and JavaScript files..."
echo ""

# Find all HTML, CSS, and JS files
FILES=$(find . \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/tests/*" -not -path "*/bin/*" -not -name "eslint.config.js" -print)
FILE_COUNT=$(echo "$FILES" | wc -l)
TESTED=0

# Validate each file
for file in $FILES; do
  TESTED=$((TESTED + 1))
  echo "[$TESTED/$FILE_COUNT] Validating $file"

  # work out which validator to use
  extension="${file##*.}"
  if [ "$extension" = "html" ]
  then
    validator='html-validate'
  elif [ "$extension" = "css" ]
  then
    validator='stylelint'
  elif [ "$extension" = "js" ]
  then
    validator='eslint'
  else
    continue
  fi

  # Run validator and save results to temp file
  TEMP_RESULT="$RESULTS_DIR/validation-temp-$TESTED.json"
  TEMP_ERROR="$RESULTS_DIR/validation-error-$TESTED.txt"

  if [ "$extension" = "html" ]; then
    npx ${validator} --formatter json "${file}" > "$TEMP_RESULT" 2>&1
  elif [ "$extension" = "css" ]; then
    npx ${validator} --formatter json "${file}" > "$TEMP_RESULT" 2>&1
  else
    npx ${validator} --format json "${file}" > "$TEMP_RESULT" 2>"$TEMP_ERROR"
  fi

  # Merge results into combined file
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT', 'utf8'));

        const fileResult = {
          file: '$file',
          type: '$extension',
          errors: [],
          warnings: []
        };

        if ('$extension' === 'html') {
          // html-validate format
          if (newData.length > 0 && newData[0].messages) {
            newData[0].messages.forEach(msg => {
              const issue = {
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId,
                severity: msg.severity === 2 ? 'error' : 'warning'
              };

              if (msg.severity === 2) {
                fileResult.errors.push(issue);
                combined.summary.htmlErrors++;
              } else {
                fileResult.warnings.push(issue);
                combined.summary.htmlWarnings++;
              }
            });
          }
        } else if ('$extension' === 'css') {
          // stylelint format
          if (newData.length > 0 && newData[0].warnings) {
            newData[0].warnings.forEach(w => {
              const issue = {
                line: w.line,
                column: w.column,
                message: w.text,
                ruleId: w.rule,
                severity: w.severity
              };

              if (w.severity === 'error') {
                fileResult.errors.push(issue);
                combined.summary.cssErrors++;
              } else {
                fileResult.warnings.push(issue);
                combined.summary.cssWarnings++;
              }
            });
          }
        } else if ('$extension' === 'js') {
          // eslint format
          if (newData.length > 0 && newData[0].messages) {
            newData[0].messages.forEach(msg => {
              const issue = {
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId,
                severity: msg.severity === 2 ? 'error' : 'warning'
              };

              if (msg.severity === 2) {
                fileResult.errors.push(issue);
                combined.summary.jsErrors++;
              } else {
                fileResult.warnings.push(issue);
                combined.summary.jsWarnings++;
              }
            });
          }
        }

        // Only add file to results if it has errors or warnings
        if (fileResult.errors.length > 0 || fileResult.warnings.length > 0) {
          combined.files.push(fileResult);
          console.log('  ❌ ' + fileResult.errors.length + ' error(s), ⚠️  ' + fileResult.warnings.length + ' warning(s)');
        } else {
          console.log('  ✅ Valid');
        }

        fs.writeFileSync('$RESULT_FILE', JSON.stringify(combined, null, 2));
      } catch (e) {
        console.error('  ⚠️  Error parsing validation results: ' + e.message);
      }
    "

    rm -f "$TEMP_RESULT" "$TEMP_ERROR"
  fi
done

echo ""
echo "=================================="
echo "     VALIDATION SUMMARY"
echo "=================================="
echo ""

node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));

  const totalErrors = data.summary.htmlErrors + data.summary.cssErrors + data.summary.jsErrors;
  const totalWarnings = data.summary.htmlWarnings + data.summary.cssWarnings + data.summary.jsWarnings;

  console.log('Files validated: ' + ($FILE_COUNT));
  console.log('Files with issues: ' + data.files.length);
  console.log('');
  console.log('HTML errors: ' + data.summary.htmlErrors);
  console.log('HTML warnings: ' + data.summary.htmlWarnings);
  console.log('CSS errors: ' + data.summary.cssErrors);
  console.log('CSS warnings: ' + data.summary.cssWarnings);
  console.log('JavaScript errors: ' + data.summary.jsErrors);
  console.log('JavaScript warnings: ' + data.summary.jsWarnings);
  console.log('');
  console.log('Total errors: ' + totalErrors);
  console.log('Total warnings: ' + totalWarnings);
  console.log('');

  if (totalErrors === 0) {
    console.log('✅ No validation errors found!');
  } else {
    console.log('❌ Files with errors:');
    console.log('');
    data.files.filter(f => f.errors.length > 0).forEach(file => {
      console.log('📄 ' + file.file + ' (' + file.errors.length + ' error(s))');
      file.errors.slice(0, 5).forEach(err => {
        console.log('  ❌ Line ' + err.line + ':' + err.column + ' - ' + err.message);
        console.log('     Rule: ' + err.ruleId);
      });
      if (file.errors.length > 5) {
        console.log('  ... and ' + (file.errors.length - 5) + ' more error(s)');
      }
      console.log('');
    });
  }
"

# Check if we should delete the file
HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); (data.summary.htmlErrors + data.summary.cssErrors + data.summary.jsErrors) > 0 ? 1 : 0")

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo ""
  echo "Detailed results: No errors."
else
  echo ""
  echo "Detailed results saved to: $RESULT_FILE"
  echo ""
  echo "❌ Validation errors found"
  exit 1
fi

exit 0

