#!/bin/bash

# This script validates code locally before pushing changes.
# N.B. Do not use the W3C validator as that does not support CSS variables

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
parse_test_options "$@"

# silently install dependencies if not already installed
npm install html-validate stylelint stylelint-config-standard > /dev/null 2>&1

# Initialize error counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
FILE_ERRORS=0
FILE_WARNINGS=0

# Determine severity filter based on flag
if [ "$INCLUDE_WARNINGS" = true ]
then
  SEVERITY_FILTER="m.severity >= 1"
  SEVERITY_TEXT="errors and warnings"
else
  SEVERITY_FILTER="m.severity === 2"
  SEVERITY_TEXT="errors"
fi

# Validate HTML files using standalone validator
for file in $(find . \( -name "*.html" -o -name "*.css" \) -print)
do
  echo "Validating $file"

  # work out which validator to use
  extension="${file##*.}"
  if [ "$extension" = "html" ]
  then
    validator='html-validate'
  elif [ "$extension" = "css" ]
  then
    validator='stylelint'
  else
    continue
  fi

  # Run validator and save results to a file
  resultFile="tests/results/${validator}.${file//\//_}.json"
  if [ "$extension" = "html" ]; then
    npx ${validator} --formatter json "${file}" > "$resultFile"
  else
    npx ${validator} --formatter json "${file}" > "$resultFile" 2>&1
  fi

  # Parse and display errors with severity and line numbers
  if [ "$extension" = "html" ]; then
    # html-validate format
    node -e "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        const severityMap = { 1: 'warning', 2: 'error' };
        const includeWarnings = ${INCLUDE_WARNINGS};
      
        if (results.length > 0 && results[0].messages) {
          const filtered = results[0].messages.filter(m => includeWarnings ? m.severity >= 1 : m.severity === 2);
          filtered.forEach(msg => {
            const icon = msg.severity === 2 ? '❌' : '⚠️';
            console.log(icon + ' [' + severityMap[msg.severity] + '] Line ' + msg.line + ':' + msg.column + ' - ' + msg.message + ' (rule: ' + msg.ruleId + ')');
          });
          if (filtered.length > 0) {
            console.log('Found ' + filtered.length + ' ' + (includeWarnings ? 'issues' : 'errors'));
          }
        }
      } catch (e) {
        // Handle case where validator output is not valid JSON
      }
    "
    # Count errors (and warnings if flag is set)
    ERRORS=$(node -p "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        const includeWarnings = ${INCLUDE_WARNINGS};
        results.length > 0 && results[0].messages 
          ? results[0].messages.filter(m => includeWarnings ? m.severity >= 1 : m.severity === 2).length 
          : 0;
      } catch { 0; }
    ")
    
    # Count warnings separately for reporting
    WARNINGS=$(node -p "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        results.length > 0 && results[0].messages 
          ? results[0].messages.filter(m => m.severity === 1).length 
          : 0;
      } catch { 0; }
    ")
  else
    # stylelint format
    node -e "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        const includeWarnings = ${INCLUDE_WARNINGS};
      
        if (results.length > 0 && results[0].warnings) {
          const filtered = results[0].warnings.filter(w => includeWarnings ? true : w.severity === 'error');
          filtered.forEach(w => {
            const icon = w.severity === 'error' ? '❌' : '⚠️';
            console.log(icon + ' [' + w.severity + '] Line ' + w.line + ':' + w.column + ' - ' + w.text + ' (rule: ' + w.rule + ')');
          });
          if (filtered.length > 0) {
            console.log('Found ' + filtered.length + ' ' + (includeWarnings ? 'issues' : 'errors'));
          }
        }
      } catch (e) {
        // Handle case where validator output is not valid JSON
      }
    "
    # Count errors
    ERRORS=$(node -p "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        const includeWarnings = ${INCLUDE_WARNINGS};
        results.length > 0 && results[0].warnings 
          ? results[0].warnings.filter(w => includeWarnings ? true : w.severity === 'error').length 
          : 0;
      } catch { 0; }
    ")
    
    # Count warnings separately for reporting
    WARNINGS=$(node -p "
      try {
        const results = JSON.parse(require('fs').readFileSync('$resultFile'));
        results.length > 0 && results[0].warnings 
          ? results[0].warnings.filter(w => w.severity === 'warning').length 
          : 0;
      } catch { 0; }
    ")
  fi
  
  TOTAL_ERRORS=$((TOTAL_ERRORS + ERRORS))
  TOTAL_WARNINGS=$((TOTAL_WARNINGS + WARNINGS))
  
  if [ "$ERRORS" -gt 0 ]
  then
    FILE_ERRORS=$((FILE_ERRORS + 1))
  fi

  if [ "$WARNINGS" -gt 0 ]
  then
    FILE_WARNINGS=$((FILE_WARNINGS + 1))
  fi
done
    
echo ""
echo "📄 Validation Results:"
echo "  Files with ${SEVERITY_TEXT}: $FILE_ERRORS"
echo "  Total errors: $((TOTAL_ERRORS - TOTAL_WARNINGS))"
if [ "$INCLUDE_WARNINGS" = true ]
then
  echo "  Total warnings: $TOTAL_WARNINGS"
  echo "  Total issues: $TOTAL_ERRORS"
fi
    
if [ "$TOTAL_ERRORS" -gt 0 ]; then
  echo "❌ Validation errors found"
  exit 1
else
  echo "✅ All files are valid"
fi

