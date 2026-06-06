#!/bin/bash

# This script validates accessibility using pa11y.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 [folder] [options]" help quick url exclude-discovery
}

# Get any command line options
TEST_URL="http://localhost:8080"
QUICK_MODE=false
EXCLUDE_LIST=""

# Parse command line arguments
FOLDER=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      print_usage
      exit 0
      ;;
    -q|--quick)
      QUICK_MODE=true
      shift
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
        echo "❌ Error: Unexpected argument '$1'"
        print_usage
        exit 1
      fi
      shift
      ;;
  esac
done

# Verify pa11y dependency is available from the existing install.
if ! node -e "require('pa11y')" > /dev/null 2>&1; then
  echo "❌ Error: pa11y dependency is unavailable."
  echo "Run 'npm ci' before executing pa11y tests."
  exit 1
fi

# Set default folder if not provided
if [ -z "$FOLDER" ]; then
  FOLDER="."
fi
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(normalise_path_for_node "$(pwd)")
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
if ! start_server_if_needed "$TEST_URL"; then
  echo "❌ pa11y tests aborted: local server did not start"
  exit 1
fi
discover_html_pages "." "$EXCLUDE_LIST"

# Initialise combined results
echo '{"pages":[],"failures":[]}' > "$RESULTS_DIR/pa11y-results.json"

# Define viewport widths to test
if [ "$QUICK_MODE" = true ]; then
  VIEWPORTS=(900)
  echo "⚡ Quick mode: Testing only at 900px viewport width"
else
  VIEWPORTS=(150 400 900 1300)
fi

# Define styles to test
STYLES=(normal subdued vibrant)

TOTAL_TESTS=$((PAGE_COUNT * 6 * ${#VIEWPORTS[@]}))

# Test each page at different viewport widths, in all theme/style combinations
TESTED=0
for VIEWPORT in "${VIEWPORTS[@]}"; do
  echo ""
  echo "📐 Testing at ${VIEWPORT}px width..."
  echo ""
  
  for STYLE in "${STYLES[@]}"; do
    echo "  🎨 $STYLE style"
    
    for THEME in light dark; do
      echo "    💡 $THEME mode"
      
      for page in $PAGES; do
        TESTED=$((TESTED + 1))
        # Convert file path to URL path
        URL_PATH="${page#./}"
        
        # Add theme and style parameters to URL
        if [[ "$URL_PATH" == *"?"* ]]; then
          FULL_URL="$TEST_URL/$URL_PATH&theme=$THEME&style=$STYLE"
        else
          FULL_URL="$TEST_URL/$URL_PATH?theme=$THEME&style=$STYLE"
        fi

        echo "    [$TESTED/$TOTAL_TESTS] Testing $URL_PATH (${VIEWPORT}px, $STYLE-$THEME)"

        if ! ensure_server_running "$TEST_URL"; then
          echo "      Failed: unable to reach local server"
          node -e "
            const fs = require('fs');
            const resultsFile = '$RESULTS_DIR/pa11y-results.json';
            const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            if (!Array.isArray(data.failures)) {
              data.failures = [];
            }
            data.failures.push({
              url: '$URL_PATH',
              theme: '$THEME',
              style: '$STYLE',
              viewport: '$VIEWPORT',
              error: 'local server unavailable before pa11y run'
            });
            fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
          "
          continue
        fi

        # Run pa11y on this page using inline Node.js
        TEMP_RESULT="$RESULTS_DIR/pa11y-temp-$TESTED.json"
        node -e "
          (async () => {
            const pa11y = require('pa11y');
            const fs = require('fs');

            try {
              const results = await pa11y('$FULL_URL', {
                standard: 'WCAG2AA',
                timeout: 30000,
                wait: 5000,
                viewport: {
                  width: $VIEWPORT,
                  height: 768
                },
                emulateMediaFeatures: [
                  { name: 'prefers-color-scheme', value: '$THEME' }
                ],
                chromeLaunchConfig: {
                  args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                  ]
                }
              });

          fs.writeFileSync('$TEMP_RESULT', JSON.stringify(results, null, 2));

          const errors = results.issues.filter(i => i.type === 'error').length;
          const warnings = results.issues.filter(i => i.type === 'warning').length;
          console.log('      Errors: ' + errors + ', Warnings: ' + warnings);

        } catch (error) {
          console.error('      Failed: ' + error.message);
          process.exit(1);
        }
      })();
    "

      # Merge results into combined file if temp file exists
      if [ -f "$TEMP_RESULT" ]; then
        node -e "
          try {
            const fs = require('fs');

            // Ensure results file exists
            if (!fs.existsSync('$RESULTS_DIR/pa11y-results.json')) {
              fs.writeFileSync('$RESULTS_DIR/pa11y-results.json', JSON.stringify({ pages: [], failures: [] }));
            }

            const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/pa11y-results.json'));
            const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

            if (!Array.isArray(combined.failures)) {
              combined.failures = [];
            }

            const pageResult = {
              url: '$URL_PATH',
              theme: '$THEME',
              style: '$STYLE',
              viewport: '$VIEWPORT',
              documentTitle: newData.documentTitle,
              pageUrl: newData.pageUrl,
              issues: (newData.issues || []).map(issue => {
                // Downgrade errors to warnings for 150px viewport
                if ('$VIEWPORT' === '150' && issue.type === 'error') {
                  return {
                    ...issue,
                    type: 'warning',
                    originalType: 'error',
                    downgradedFrom150px: true
                  };
                }
                return issue;
              })
            };

            combined.pages.push(pageResult);
            fs.writeFileSync('$RESULTS_DIR/pa11y-results.json', JSON.stringify(combined, null, 2));
            fs.unlinkSync('$TEMP_RESULT');
          } catch (e) {
            console.error('Error merging results for $URL_PATH:', e.message);
          }
        "
      else
        node -e "
          const fs = require('fs');
          const resultsFile = '$RESULTS_DIR/pa11y-results.json';
          const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
          if (!Array.isArray(data.failures)) {
            data.failures = [];
          }
          data.failures.push({
            url: '$URL_PATH',
            theme: '$THEME',
            style: '$STYLE',
            viewport: '$VIEWPORT',
            error: 'pa11y run failed or no result file generated'
          });
          fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
        "
      fi
      done
    done
  done
done

# Stop server if we started it
stop_server_if_started

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/pa11y-results.json"
echo ""
echo "📊 Pa11y Accessibility Results:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

  if (!data.pages || data.pages.length === 0) {
    console.log('  No pages tested');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalNotices = 0;

  data.pages.forEach(page => {
    totalErrors += page.issues.filter(i => i.type === 'error').length;
    totalWarnings += page.issues.filter(i => i.type === 'warning').length;
    totalNotices += page.issues.filter(i => i.type === 'notice').length;
  });

  console.log('  Pages tested: ' + data.pages.length);
  console.log('  Errors: ' + totalErrors);
  console.log('  Warnings: ' + totalWarnings);
  console.log('  Notices: ' + totalNotices);
  console.log('');

  const pagesWithErrors = data.pages.filter(p => p.issues.some(i => i.type === 'error'));

  if (pagesWithErrors.length > 0) {
    console.log('  Pages with errors:');
    pagesWithErrors.slice(0, 10).forEach(page => {
      const errors = page.issues.filter(i => i.type === 'error');
      console.log('  [' + page.viewport + 'px] ' + page.url + ' (' + errors.length + ' errors)');
    });
    if (pagesWithErrors.length > 10) {
      console.log('  ... and ' + (pagesWithErrors.length - 10) + ' more pages with errors');
    }
  }

  console.log('');
"

# Check if any pages have errors or failed runs
HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.issues.some(i => i.type === 'error')) ? 1 : 0")
HAS_FAILURES=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); Array.isArray(data.failures) && data.failures.length > 0 ? 1 : 0")

if [ "$HAS_FAILURES" -eq 1 ]; then
  echo "❌ Some pa11y runs failed to execute."
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
    (data.failures || []).slice(0, 10).forEach(f => {
      console.log('  - ' + f.url + ' [' + f.viewport + 'px, ' + f.style + '-' + f.theme + ']');
    });
    if ((data.failures || []).length > 10) {
      console.log('  ... and ' + (data.failures.length - 10) + ' more failed runs');
    }
  "
  exit 1
fi

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo "✅ All pages passed pa11y tests (no errors)."
  exit 0
else
  echo "❌ Some pages have accessibility errors."
  exit 1
fi
