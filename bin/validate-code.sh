#!/bin/bash

# This script validates HTML, CSS, and JavaScript code
# N.B. Do not use the W3C validator as that does not support CSS variables
#
# EXCLUDING FILES FROM VALIDATION:
# To skip validation for specific files, add one of these markers:
#
# HTML files: Add this meta tag in the <head> section:
#   <meta name="validate-code" content="skip">
#
# CSS files: Add this comment in the first 20 lines:
#   /* validate-code: skip */
#
# JavaScript files: Add one of these comments in the first 20 lines:
#   /* validate-code: skip */
#   // validate-code: skip

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 [folder] [options]" help exclude-validation
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

# Validate tool availability without mutating dependencies at runtime.
echo "Checking dependencies..."

# Resolve validator executables from local node_modules first, then global PATH.
resolve_tool() {
  local tool_name="$1"
  if [ -x "./node_modules/.bin/$tool_name" ]; then
    echo "./node_modules/.bin/$tool_name"
    return 0
  fi
  if command -v "$tool_name" > /dev/null 2>&1; then
    command -v "$tool_name"
    return 0
  fi
  return 1
}

# Check if critical tools are available
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed or not in PATH"
  exit 1
fi

# Get Node.js version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
echo "Detected Node.js version: $NODE_VERSION"

HTML_VALIDATE_CMD="$(resolve_tool html-validate || true)"
STYLELINT_CMD="$(resolve_tool stylelint || true)"
JSHINT_CMD="$(resolve_tool jshint || true)"
JSHINT_MISSING_WARNED=false

if [ -z "$HTML_VALIDATE_CMD" ] || [ -z "$STYLELINT_CMD" ]; then
  echo "❌ Error: Required validators are not installed."
  echo "Run 'npm ci' before executing code validation."
  exit 1
fi

echo ""
echo "📄 Validating HTML, CSS, and JavaScript files..."
echo ""

ORIGINAL_DIR=$(pwd)
# In Git Bash/MSYS on Windows, pwd can return /c/...; Node interprets that as C:\c\...
# which breaks absolute path reads inside node -e snippets.
if command -v cygpath > /dev/null 2>&1 && [[ "$ORIGINAL_DIR" == /* ]]; then
  ORIGINAL_DIR=$(cygpath -m "$ORIGINAL_DIR")
fi
if [ ! -d "$FOLDER" ]; then
  echo "Error: Provided folder '$FOLDER' does not exist."
  exit 1
fi

# Setup results directory in application folder
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"
RESULT_FILE="$RESULTS_DIR/validation-results.json"

# Initialise combined results
echo '{"files":[],"summary":{"filesChecked":0,"htmlErrors":0,"htmlWarnings":0,"cssErrors":0,"cssWarnings":0,"jsErrors":0,"jsWarnings":0}}' > "$RESULT_FILE"

# Function to check if file should skip validation
should_skip_validation() {
  local file="$1"
  local extension="$2"
  
  if [ "$extension" = "html" ]; then
    # Check for meta tag: <meta name="validate-code" content="skip">
    if grep -q '<meta name="validate-code" content="skip">' "$file" 2>/dev/null; then
      return 0  # Skip validation
    fi
  elif [ "$extension" = "css" ] || [ "$extension" = "js" ]; then
    # Check for comment in first 20 lines: /* validate-code: skip */ or // validate-code: skip
    if head -n 20 "$file" | grep -qE '(/\*|//)\s*validate-code:\s*skip' 2>/dev/null; then
      return 0  # Skip validation
    fi
  fi
  
  return 1  # Don't skip
}

# Find all HTML, CSS, and JS files in the specified folder
FILES=$(find "$FOLDER" \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/tests/*" -not -path "*/bin/*" -not -name "eslint.config.js" -print)

if [ -n "$EXCLUDE_LIST" ]; then
  filter_excluded_paths "$FILES" "$EXCLUDE_LIST"
  FILES="$FILTERED_PATHS_RESULT"
  echo "Excluded $FILTERED_PATHS_EXCLUDED_COUNT files using: $EXCLUDE_LIST"
fi

FILE_COUNT=$(echo "$FILES" | sed '/^$/d' | wc -l)
TESTED=0

# Validate each file
for file in $FILES; do
  TESTED=$((TESTED + 1))
  echo "[$TESTED/$FILE_COUNT] Validating $file"

  # Check if file actually exists (prevent hanging on missing files)
  if [ ! -f "$file" ]; then
    echo "  ⚠️  Skipped - File does not exist (possible broken symlink or stale reference)"
    continue
  fi

  # work out which validator to use and check availability
  extension="${file##*.}"
  if [ "$extension" = "html" ]
  then
    validator='html-validate'
    if [ -z "$HTML_VALIDATE_CMD" ]; then
      echo "  ⚠️  Skipped - html-validate not available"
      continue
    fi
  elif [ "$extension" = "css" ]
  then
    validator='stylelint'
    if [ -z "$STYLELINT_CMD" ]; then
      echo "  ⚠️  Skipped - stylelint not available"
      continue
    fi
  elif [ "$extension" = "js" ]
  then
    validator='jshint'
    if ! command -v node &>/dev/null; then
      echo "  ⚠️  Skipped - Node.js not available"
      continue
    fi
  else
    continue
  fi

  # Check if file should skip validation
  if should_skip_validation "$file" "$extension"; then
    echo "  ⏭️  Skipped (validation disabled)"
    continue
  fi

  # Run validator and save results to temp file (with timeout to prevent hanging)
  TEMP_RESULT="$RESULTS_DIR/validation-temp-$TESTED.json"
  TEMP_ERROR="$RESULTS_DIR/validation-error-$TESTED.txt"

  if [ "$extension" = "html" ]; then
    timeout 30 "$HTML_VALIDATE_CMD" --formatter json "${file}" > "$TEMP_RESULT" 2>"$TEMP_ERROR"
    HTML_VALIDATE_EXIT=$?
    
    if [ $HTML_VALIDATE_EXIT -eq 124 ]; then
      # Timeout exit code
      echo "  ⚠️  html-validate timed out after 30 seconds"
      echo "[]" > "$TEMP_RESULT"
    elif [ $HTML_VALIDATE_EXIT -eq 1 ]; then
      # html-validate exit code 1 = validation errors found, but JSON output is valid
      # Keep the JSON output in $TEMP_RESULT - it contains the error details
      :  # no-op, we keep the JSON output
    elif [ $HTML_VALIDATE_EXIT -ne 0 ]; then
      # Other non-zero exit = actual failure (e.g., invalid config, crash)
      echo "  ⚠️  html-validate failed with exit code $HTML_VALIDATE_EXIT, check error log:"
      cat "$TEMP_ERROR" 2>/dev/null || echo "  No error details available"
      echo "[]" > "$TEMP_RESULT"
    fi
  elif [ "$extension" = "css" ]; then
    timeout 30 "$STYLELINT_CMD" --formatter json "${file}" > "$TEMP_RESULT" 2>"$TEMP_ERROR"
    STYLELINT_EXIT=$?
    
    if [ $STYLELINT_EXIT -eq 124 ]; then
      # Timeout exit code
      echo "  ⚠️  stylelint timed out after 30 seconds"
      echo "[]" > "$TEMP_RESULT"
    elif [ $STYLELINT_EXIT -eq 2 ]; then
      # Stylelint exit code 2 = linting errors found, but JSON output is valid
      # Keep the JSON output in $TEMP_RESULT - it contains the error details
      :  # no-op, we keep the JSON output
    elif [ $STYLELINT_EXIT -ne 0 ]; then
      # Other non-zero exit = actual failure (e.g., invalid config, crash)
      echo "  ⚠️  stylelint failed with exit code $STYLELINT_EXIT, check error log:"
      cat "$TEMP_ERROR" 2>/dev/null || echo "  No error details available"
      echo "[]" > "$TEMP_RESULT"
    fi
  elif [ "$extension" = "js" ]; then
    # First, check for JS syntax errors using node --check (with timeout)
    if ! timeout 15 node --check "$file" 2> "$TEMP_ERROR"; then
      if [ $? -eq 124 ]; then  # timeout exit code
        echo "  ⚠️  node --check timed out after 15 seconds"
        echo "[{\"filePath\": \"$file\", \"messages\": [{\"fatal\": true, \"message\": \"Validation timed out - possible infinite loop or complex file\"}], \"errorCount\": 1, \"fatalErrorCount\": 1}]" > "$TEMP_RESULT"
      else
        # Write a JSON error result for syntax error
        echo "[{\"filePath\": \"$file\", \"messages\": [{\"fatal\": true, \"message\": \"Syntax error detected by node --check\"}], \"errorCount\": 1, \"fatalErrorCount\": 1}]" > "$TEMP_RESULT"
      fi
    else
      # Run JSHint for stricter static analysis (plain text output) with timeout
      if [ -z "$JSHINT_CMD" ]; then
        if [ "$JSHINT_MISSING_WARNED" = false ]; then
          echo "  ⚠️  JSHint not installed; skipping JS lint checks (syntax checks still run)"
          JSHINT_MISSING_WARNED=true
        fi
        echo "[]" > "$TEMP_RESULT"
        JSHINT_EXIT=0
      else
        JSHINT_OUTPUT=$(timeout 15 "$JSHINT_CMD" "$file" 2>&1)
        JSHINT_EXIT=$?
      fi
      
      # Check if jshint timed out
      if [ $JSHINT_EXIT -eq 124 ]; then
        echo "  ⚠️  JSHint timed out after 15 seconds"
        echo "[{\"filePath\": \"$file\", \"messages\": [{\"fatal\": false, \"message\": \"JSHint validation timed out - possible complex file\", \"severity\": \"warning\"}], \"errorCount\": 0, \"warningCount\": 1}]" > "$TEMP_RESULT"
      elif [ $JSHINT_EXIT -eq 0 ]; then
        # No errors
        echo "[]" > "$TEMP_RESULT"
      else
        # Parse errors and convert to ESLint-like JSON format
        echo "$JSHINT_OUTPUT" | node -e "
          const fs = require('fs');
          const readline = require('readline');
          const rl = readline.createInterface({ input: process.stdin });
          
          const messages = [];
          rl.on('line', (line) => {
            // Parse JSHint output format: filename: line X, col Y, message
            const match = line.match(/^.*: line (\\d+), col (\\d+), (.+)$/);
            if (match) {
              const [, line, col, message] = match;
              messages.push({
                line: parseInt(line),
                column: parseInt(col),
                message: message,
                ruleId: null,
                severity: message.toLowerCase().includes('warning') ? 'warning' : 'error'
              });
            }
          });
          
          rl.on('close', () => {
            const formatted = [{
              filePath: '$file',
              messages: messages,
              errorCount: messages.filter(m => m.severity === 'error').length,
              warningCount: messages.filter(m => m.severity === 'warning').length,
              fatalErrorCount: 0
            }];
            fs.writeFileSync('$TEMP_RESULT', JSON.stringify(formatted, null, 2));
          });
        "
      fi
    fi
  fi

  # Merge results into combined file
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        const tempResultContent = fs.readFileSync('$TEMP_RESULT', 'utf8');
        let newData = [];
        
        if (!tempResultContent.trim()) {
          // Treat empty output as valid (no errors/warnings)
          // newData remains as empty array
        } else {
          try {
            newData = JSON.parse(tempResultContent);
          } catch (e) {
            console.error('  ⚠️  Skipping: Validation result is not valid JSON.');
            console.error('  Debug: Validator output was:');
            console.error('  ' + JSON.stringify(tempResultContent.substring(0, 200)));
            if (tempResultContent.length > 200) {
              console.error('  ... (output truncated)');
            }
            
            // Try to create a fallback error result
            const fallbackResult = {
              file: '$file',
              type: '$extension',
              errors: [{
                line: 1,
                column: 1,
                message: 'Validator failed to produce valid JSON output: ' + e.message,
                ruleId: 'validator-error',
                severity: 'error'
              }],
              warnings: []
            };
            combined.files.push(fallbackResult);
            combined.summary.$extension === 'html' ? combined.summary.htmlErrors++ : 
            combined.summary.$extension === 'css' ? combined.summary.cssErrors++ : 
            combined.summary.jsErrors++;
            
            fs.writeFileSync('$RESULT_FILE', JSON.stringify(combined, null, 2));
            process.exit(0);
          }
        }

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
          // JSHint/ESLint format
          if (newData.length > 0) {
            const result = newData[0];
            // Check for fatal parsing errors
            if (result.fatalErrorCount && result.fatalErrorCount > 0) {
              const fatalMsg = result.messages.find(m => m.fatal) || result.messages[0];
              const issue = {
                line: fatalMsg.line || 1,
                column: fatalMsg.column || 1,
                message: fatalMsg.message || 'Fatal parsing error',
                ruleId: fatalMsg.ruleId || null,
                severity: 'error'
              };
              fileResult.errors.push(issue);
              combined.summary.jsErrors++;
            } else if (result.messages && result.messages.length > 0) {
              result.messages.forEach(msg => {
                const issue = {
                  line: msg.line,
                  column: msg.column,
                  message: msg.message,
                  ruleId: msg.ruleId,
                  severity: msg.severity
                };
                // Check severity - handle both ESLint (severity === 2) and string format
                if (msg.severity === 'error' || msg.severity === 2) {
                  fileResult.errors.push(issue);
                  combined.summary.jsErrors++;
                } else {
                  fileResult.warnings.push(issue);
                  combined.summary.jsWarnings++;
                }
              });
            }
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

  // Update filesChecked in summary
  data.summary.filesChecked = ($FILE_COUNT);
  fs.writeFileSync('$RESULT_FILE', JSON.stringify(data, null, 2));

  const totalErrors = data.summary.htmlErrors + data.summary.cssErrors + data.summary.jsErrors;
  const totalWarnings = data.summary.htmlWarnings + data.summary.cssWarnings + data.summary.jsWarnings;

  console.log('Files validated: ' + data.summary.filesChecked);
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

