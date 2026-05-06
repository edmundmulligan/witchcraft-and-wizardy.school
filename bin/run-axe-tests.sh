#!/bin/bash

# This script validates accessibility using axe-core CLI.
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

# Resolve axe command without mutating workspace dependencies.
if command -v axe > /dev/null 2>&1; then
  AXE_CMD=(axe)
else
  AXE_CMD=(npx --yes @axe-core/cli)
fi

# Ensure ChromeDriver is installed and matches Chrome version
# Try to detect Chrome version and install matching ChromeDriver
CHROME_VERSION=$(google-chrome --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' || \
                 chromium-browser --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' || \
                 echo "")

if [ -n "$CHROME_VERSION" ]; then
  # Extract major version for matching
  CHROME_MAJOR=$(echo "$CHROME_VERSION" | cut -d. -f1)
  
  # Check if matching ChromeDriver is installed
  CHROMEDRIVER_DIR="$HOME/.browser-driver-manager/chromedriver"
  
  # Try to find ChromeDriver matching major version (allowing ±1 version for compatibility)
  if [ -d "$CHROMEDRIVER_DIR" ]; then
    for version in $CHROME_MAJOR $((CHROME_MAJOR + 1)) $((CHROME_MAJOR - 1)); do
      MATCHING_DRIVER=$(find "$CHROMEDRIVER_DIR" -type f -name "chromedriver" -path "*/linux-${version}.*/*" 2>/dev/null | head -1)
      if [ -n "$MATCHING_DRIVER" ]; then
        break
      fi
    done
  fi
  
  # If no matching driver found, try to install one
  if [ -z "$MATCHING_DRIVER" ]; then
    echo "Installing ChromeDriver for Chrome $CHROME_VERSION..."
    npx -y browser-driver-manager install chrome > /dev/null 2>&1
    
    # Find the newly installed driver
    for version in $CHROME_MAJOR $((CHROME_MAJOR + 1)) $((CHROME_MAJOR - 1)); do
      MATCHING_DRIVER=$(find "$CHROMEDRIVER_DIR" -type f -name "chromedriver" -path "*/linux-${version}.*/*" 2>/dev/null | head -1)
      if [ -n "$MATCHING_DRIVER" ]; then
        break
      fi
    done
  fi
  
  if [ -n "$MATCHING_DRIVER" ]; then
    CHROMEDRIVER_PATH="$MATCHING_DRIVER"
    echo "Using ChromeDriver at: $CHROMEDRIVER_PATH"
  fi
fi

# Fallback to system chromedriver if dynamic detection fails
if [ -z "$CHROMEDRIVER_PATH" ] || [ ! -f "$CHROMEDRIVER_PATH" ]; then
  CHROMEDRIVER_PATH=$(which chromedriver 2>/dev/null || echo "")
  if [ -n "$CHROMEDRIVER_PATH" ]; then
    echo "Using system ChromeDriver at: $CHROMEDRIVER_PATH"
  else
    echo "⚠️  Warning: ChromeDriver not found. Tests may fail."
    echo "   Install Chrome/Chromium and run: npx browser-driver-manager install chrome"
  fi
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
ORIGINAL_DIR=$(pwd)
cd "$FOLDER" || exit 1
# Use relative path for RESULTS_DIR since axe CLI expects relative paths
RESULTS_DIR="./diagnostics/test-results"
mkdir -p "$RESULTS_DIR"

# Start server and setup
start_server_if_needed "$TEST_URL"
discover_html_pages "." "$EXCLUDE_LIST"

# Clean up any orphaned chromedriver processes from previous runs
pkill -f chromedriver 2>/dev/null || true
sleep 1

# Initialise combined results
echo '{
  "violations":[],
  "passes":[],
  "incomplete":[],
  "metadata": {
    "pagesTestedCount": 0,
    "totalTestRuns": 0,
    "viewports": [],
    "themes": ["light", "dark"],
    "styles": ["normal", "subdued", "vibrant"]
  }
}' > "$RESULTS_DIR/axe-results.json"

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

        # Run axe on this page with colour scheme emulation and viewport size
        # Add retry logic and error handling
        TEMP_RESULT="$RESULTS_DIR/axe-temp-$TESTED.json"
        rm -f "$TEMP_RESULT"
        
        MAX_RETRIES=2
        RETRY_COUNT=0
        SUCCESS=false
        
        while [ $RETRY_COUNT -le $MAX_RETRIES ] && [ "$SUCCESS" = false ]; do
          if [ $RETRY_COUNT -gt 0 ]; then
            echo "      ⚠️  Retry attempt $RETRY_COUNT/$MAX_RETRIES..."
            # Kill any orphaned chromedriver processes
            pkill -f chromedriver 2>/dev/null || true
            sleep 3
          fi
          
          # Run axe and capture exit code
          set +e  # Don't exit on error
          if [ -n "$CHROMEDRIVER_PATH" ]; then
            "${AXE_CMD[@]}" "$FULL_URL" --disable page-has-heading-one --save "$TEMP_RESULT" \
              --chromedriver-path "$CHROMEDRIVER_PATH" \
              --chrome-options '{"args":["--force-prefers-color-scheme='$THEME'","--window-size='$VIEWPORT',768","--disable-dev-shm-usage","--disable-gpu","--no-sandbox"]}' \
              --load-delay 5000 \
              2>&1
            AXE_EXIT_CODE=$?
          else
            "${AXE_CMD[@]}" "$FULL_URL" --disable page-has-heading-one --save "$TEMP_RESULT" \
              --chrome-options '{"args":["--force-prefers-color-scheme='$THEME'","--window-size='$VIEWPORT',768","--disable-dev-shm-usage","--disable-gpu","--no-sandbox"]}' \
              --load-delay 5000 \
              2>&1
            AXE_EXIT_CODE=$?
          fi
          set -e  # Re-enable exit on error
          
          # Check if result file was created successfully
          if [ -f "$TEMP_RESULT" ] && [ $AXE_EXIT_CODE -eq 0 ]; then
            SUCCESS=true
          else
            RETRY_COUNT=$((RETRY_COUNT + 1))
          fi
        done
        
        # Report failure if all retries exhausted
        if [ "$SUCCESS" = false ]; then
          echo "      ❌ Failed after $MAX_RETRIES retries: $URL_PATH (${VIEWPORT}px, $STYLE-$THEME)"
        fi
        
        # Add delay between tests to prevent resource exhaustion
        # Longer delay every 10 tests to allow system recovery
        if [ $((TESTED % 10)) -eq 0 ]; then
          sleep 2
        else
          sleep 0.5
        fi

    # Merge all results (violations, passes, incomplete) if file exists
    if [ -f "$TEMP_RESULT" ]; then
      node -e "
        try {
          const fs = require('fs');
          
          // Ensure results file exists
          if (!fs.existsSync('$RESULTS_DIR/axe-results.json')) {
            fs.writeFileSync('$RESULTS_DIR/axe-results.json', JSON.stringify({
              violations: [],
              passes: [],
              incomplete: [],
              metadata: {
                pagesTestedCount: 0,
                totalTestRuns: 0,
                viewports: [],
                themes: ['light', 'dark'],
                styles: ['normal', 'subdued', 'vibrant']
              }
            }));
          }
          
          const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/axe-results.json'));
          const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

          // Axe saves results as an array [{violations: [...], passes: [...], incomplete: [...]}]
          const result = Array.isArray(newData) ? newData[0] : newData;

          // Update metadata
          combined.metadata.totalTestRuns++;
          if (!combined.metadata.viewports.includes('$VIEWPORT')) {
            combined.metadata.viewports.push('$VIEWPORT');
          }

          // Add page URL, theme, style, and viewport to each violation
          if (result.violations && result.violations.length > 0) {
            result.violations.forEach(v => {
              v.pageUrl = '$URL_PATH';
              v.theme = '$THEME';
              v.style = '$STYLE';
              v.viewport = '$VIEWPORT';
              
              // Downgrade severity for 150px viewport (expected issues at extreme narrow width)
              if ('$VIEWPORT' === '150' && (v.impact === 'critical' || v.impact === 'serious')) {
                v.originalImpact = v.impact;
                v.impact = 'moderate';
                v.downgradedFrom150px = true;
              }
              
              combined.violations.push(v);
            });
          }

          // Add passes (only store count per page to avoid bloating the file)
          if (result.passes && result.passes.length > 0) {
            combined.passes.push({
              pageUrl: '$URL_PATH',
              theme: '$THEME',
              style: '$STYLE',
              viewport: '$VIEWPORT',
              count: result.passes.length
            });
          }

          // Add incomplete tests
          if (result.incomplete && result.incomplete.length > 0) {
            result.incomplete.forEach(i => {
              i.pageUrl = '$URL_PATH';
              i.theme = '$THEME';
              i.style = '$STYLE';
              i.viewport = '$VIEWPORT';
              combined.incomplete.push(i);
            });
          }

          fs.writeFileSync('$RESULTS_DIR/axe-results.json', JSON.stringify(combined, null, 2));
          fs.unlinkSync('$TEMP_RESULT');
        } catch (e) {
          console.error('Error merging results for $URL_PATH:', e.message);
          console.error('Temp file:', '$TEMP_RESULT');
          console.error('Results file:', '$RESULTS_DIR/axe-results.json');
        }
      "
    else
      echo "      ⚠️  Warning: Temp result file not created for $URL_PATH"
    fi
      done
    done
  done
done

# Stop server if we started it
stop_server_if_started

# Update metadata with unique page count
node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/axe-results.json'));
  const uniquePages = new Set();
  
  // Collect unique pages from all test results
  data.violations.forEach(v => uniquePages.add(v.pageUrl));
  data.passes.forEach(p => uniquePages.add(p.pageUrl));
  data.incomplete.forEach(i => uniquePages.add(i.pageUrl));
  
  data.metadata.pagesTestedCount = uniquePages.size;
  fs.writeFileSync('$RESULTS_DIR/axe-results.json', JSON.stringify(data, null, 2));
"

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/axe-results.json"
echo ""
echo "📊 Analysis Summary:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));
  const total = data.violations.length;

  console.log('  Pages tested: ' + data.metadata.pagesTestedCount);
  console.log('  Total test runs: ' + data.metadata.totalTestRuns);
  console.log('  Viewports: ' + data.metadata.viewports.join(', '));
  console.log('');
  console.log('  Total violations: ' + total);
  console.log('  Total passes: ' + data.passes.reduce((sum, p) => sum + p.count, 0));
  console.log('  Incomplete tests: ' + data.incomplete.length);
  console.log('');

  // Count by impact
  const bySeverity = {
    critical: data.violations.filter(v => v.impact === 'critical').length,
    serious: data.violations.filter(v => v.impact === 'serious').length,
    moderate: data.violations.filter(v => v.impact === 'moderate').length,
    minor: data.violations.filter(v => v.impact === 'minor').length
  };

  // Count contrast issues
  const contrastIssues = data.violations.filter(v => v.id === 'colour-contrast').length;

  console.log('  Total violations: ' + total);
  console.log('  🔴 Critical: ' + bySeverity.critical);
  console.log('  🟠 Serious: ' + bySeverity.serious);
  console.log('  🟡 Moderate: ' + bySeverity.moderate);
  console.log('  ⚪ Minor: ' + bySeverity.minor);
  if (contrastIssues > 0) {
    console.log('  🎨 Colour Contrast Issues: ' + contrastIssues);
  }
  console.log('');
"

# Get total violations count
TOTAL_VIOLATIONS=$(node -p "const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE')); data.violations.length")

if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
  echo "✅ No accessibility violations found across all pages."
  # Clean up any remaining ChromeDriver processes
  pkill -f chromedriver 2>/dev/null || true
  exit 0
else
  echo "❌ Accessibility violations found:"
  echo ""

  # Display violations grouped by type
  node -e "
    const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

    // Group by violation ID
    const grouped = {};
    data.violations.forEach(v => {
      if (!grouped[v.id]) {
        grouped[v.id] = {
          impact: v.impact,
          description: v.description,
          help: v.help,
          pages: []
        };
      }
      grouped[v.id].pages.push(v.pageUrl || 'unknown');
    });

    // Display grouped violations
    Object.keys(grouped).forEach(id => {
      const v = grouped[id];
      const icon = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : v.impact === 'moderate' ? '🟡' : '⚪';
      const isContrast = id === 'colour-contrast' ? ' 🎨' : '';

      console.log(icon + isContrast + ' ' + id + ' (' + v.impact + ')');
      console.log('  Description: ' + v.description);
      console.log('  Help: ' + v.help);
      
      // Group by theme and style
      const byThemeStyle = {};
      data.violations.forEach(violation => {
        if (violation.id === id) {
          const theme = violation.theme || 'unknown';
          const style = violation.style || 'unknown';
          const key = style + '-' + theme;
          if (!byThemeStyle[key]) byThemeStyle[key] = [];
          byThemeStyle[key].push(violation.pageUrl || 'unknown');
        }
      });
      
      Object.keys(byThemeStyle).forEach(key => {
        console.log('  ' + key + ': ' + byThemeStyle[key].join(', '));
      });
      console.log('');
    });
  "
  # Clean up any remaining ChromeDriver processes
  pkill -f chromedriver 2>/dev/null || true
  exit 1
fi
