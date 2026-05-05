#!/bin/bash

# This script validates accessibility using lighthouse.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 [folder] [options]" help quick url exclude-discovery
}

# Initialise variables
TEST_URL="http://localhost:8080"
QUICK_MODE=false
EXCLUDE_LIST=""

# Parse command line arguments
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

# Silently install dependencies if not already installed
npm install -g lighthouse serve > /dev/null 2>&1


# Accept optional folder parameter
FOLDER="${FOLDER:-.}"
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"

cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"
discover_html_pages "." "$EXCLUDE_LIST"

# Initialise combined results
echo '{"pages":[]}' > "$RESULTS_DIR/lighthouse-results.json"

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
          FULL_URL="$TEST_URL/${URL_PATH}&theme=$THEME&style=$STYLE"
        else
          FULL_URL="$TEST_URL/${URL_PATH}?theme=$THEME&style=$STYLE"
        fi

        echo "    [$TESTED/$TOTAL_TESTS] Testing $URL_PATH (${VIEWPORT}px, $STYLE-$THEME)"

        # Run lighthouse on this page with emulated colour scheme and viewport
        TEMP_RESULT="$RESULTS_DIR/lighthouse-temp-$TESTED.json"
        npx lighthouse "$FULL_URL" --output=json --output-path=$TEMP_RESULT \
          --emulated-form-factor=desktop \
          --screen-emulation-width=$VIEWPORT \
          --screen-emulation-height=768 \
          --chrome-flags="--headless --no-sandbox --force-prefers-color-scheme=$THEME --window-size=${VIEWPORT},768" \
          --quiet 2>&1 | grep -E "(Testing|Runtime)" || true

    # Merge results into combined file if temp file exists
    if [ -f "$TEMP_RESULT" ]; then
      node -e "
        try {
          const fs = require('fs');
          const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/lighthouse-results.json'));
          const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

          // Extract accessibility score and failed audits
          const accessibility = newData.categories?.accessibility;
          const audits = newData.audits || {};

          const pageResult = {
            url: '$URL_PATH',
            theme: '$THEME',
            style: '$STYLE',
            viewport: '$VIEWPORT',
            score: accessibility?.score || 0,
            failedAudits: []
          };

        // Find failed accessibility audits (score < 1 means failed, null means not applicable)
        if (accessibility?.auditRefs) {
          accessibility.auditRefs.forEach(ref => {
            const audit = audits[ref.id];
            // Only count as failed if score exists and is less than 1
            if (audit && audit.score !== null && audit.score < 1) {
              pageResult.failedAudits.push({
                id: ref.id,
                title: audit.title,
                description: audit.description,
                score: audit.score
              });
            }
          });
        }

        combined.pages.push(pageResult);
        fs.writeFileSync('$RESULTS_DIR/lighthouse-results.json', JSON.stringify(combined, null, 2));
        fs.unlinkSync('$TEMP_RESULT');
      } catch (e) {
          console.error('Error merging results for $URL_PATH:', e.message);
        }
      "
    fi
      done
    done
  done
done

# Stop server if we started it
stop_server_if_started

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/lighthouse-results.json"
echo ""
echo "📊 Lighthouse Accessibility Results:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

  if (!data.pages || data.pages.length === 0) {
    console.log('  No pages tested');
    process.exit(0);
  }

  // Calculate average score
  const avgScore = data.pages.reduce((sum, p) => sum + p.score, 0) / data.pages.length;
  const totalFailures = data.pages.reduce((sum, p) => sum + p.failedAudits.length, 0);

  console.log('  Pages tested: ' + data.pages.length);
  console.log('  Average accessibility score: ' + Math.round(avgScore * 100) + '%');
  console.log('  Total failed audits: ' + totalFailures);
  console.log('');

  // Categorise pages by score
  const failures = data.pages.filter(p => p.score < 0.9);
  const warnings = data.pages.filter(p => p.score >= 0.9 && p.score < 1.0);
  const perfect = data.pages.filter(p => p.score === 1.0);

  // Show failures (< 90%)
  if (failures.length > 0) {
    console.log('  ❌ Pages below 90% accessibility threshold:');
    failures.forEach(page => {
      const scorePercent = Math.round(page.score * 100);
      console.log('');
      console.log('  ' + page.url + ' [' + (page.viewport || 'unknown') + 'px, ' + (page.style || 'unknown') + '-' + (page.theme || 'unknown') + ']');
      console.log('  Score: ' + scorePercent + '%');

      if (page.failedAudits.length > 0) {
        page.failedAudits.forEach(audit => {
          console.log('    • ' + audit.title);
        });
      }
    });
    console.log('');
  }

  // Show warnings (>= 90% but < 100%)
  if (warnings.length > 0) {
    console.log('  ⚠️  Pages between 90-99% accessibility:');
    warnings.forEach(page => {
      const scorePercent = Math.round(page.score * 100);
      console.log('');
      console.log('  ' + page.url + ' [' + (page.viewport || 'unknown') + 'px, ' + (page.style || 'unknown') + '-' + (page.theme || 'unknown') + ']');
      console.log('  Score: ' + scorePercent + '%');

      if (page.failedAudits.length > 0) {
        page.failedAudits.forEach(audit => {
          console.log('    • ' + audit.title);
        });
      }
    });
    console.log('');
  }

  // Show perfect pages count
  if (perfect.length === data.pages.length) {
    console.log('  ✨ All pages achieve 100% accessibility!');
  } else if (perfect.length > 0) {
    console.log('  ✅ ' + perfect.length + ' page(s) with 100% accessibility');
  }

  console.log('');
"

# Check accessibility thresholds and set exit code
EXIT_CODE=$(node -p "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
  const failures = data.pages.filter(p => p.score < 0.9).length;
  const warnings = data.pages.filter(p => p.score >= 0.9 && p.score < 1.0).length;
  
  if (failures > 0) {
    process.stderr.write('❌ ' + failures + ' page(s) below 90% accessibility threshold.\\n');
    1; // Exit with error
  } else if (warnings > 0) {
    process.stderr.write('⚠️  ' + warnings + ' page(s) between 90-99% accessibility. Consider improving to 100%.\\n');
    0; // Exit with success but show warning
  } else {
    process.stderr.write('✅ All pages meet 100% accessibility threshold.\\n');
    0; // Exit with success
  }
")

exit $EXIT_CODE
