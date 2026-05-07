#!/bin/bash

# Capture Responsive Screenshots
# Captures a webpage at common responsive breakpoints
# Usage: ./capture-responsive.sh <url> <base-name> [options]
#
# Options are passed through to capture-webpage.js
# Examples:
#   ./bin/capture-responsive.sh http://localhost:8080 homepage
#   ./bin/capture-responsive.sh http://localhost:8080 page --click "#menu-btn"

set -e

# Colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${YELLOW}Usage: $0 <url> <base-name> [options]${NC}"
    echo
    echo "Captures webpage at multiple responsive breakpoints:"
    echo "  - Mobile (375x667)"
    echo "  - Mobile Large (428x926)"
    echo "  - Tablet (768x1024)"
    echo "  - Desktop (1366x768)"
    echo "  - Desktop Large (1920x1080)"
    echo
    echo "Examples:"
    echo "  $0 http://localhost:8080 homepage"
    echo "  $0 http://localhost:8080 page --click '#menu-btn'"
    echo "  $0 http://localhost:8080/students/lesson-01.html lesson-01 --click '#light-button'"
    exit 1
fi

URL="$1"
BASE_NAME="$2"
shift 2
EXTRA_OPTS="$@"

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}  Responsive Screenshot Capture${NC}"
echo -e "${BLUE}===================================================${NC}"
echo
echo -e "${CYAN}URL:${NC} $URL"
echo -e "${CYAN}Base name:${NC} $BASE_NAME"
if [ -n "$EXTRA_OPTS" ]; then
    echo -e "${CYAN}Extra options:${NC} $EXTRA_OPTS"
fi
echo

# Define breakpoints
declare -A BREAKPOINTS=(
    ["mobile-small"]="375 667"
    ["mobile"]="390 844"
    ["mobile-large"]="428 926"
    ["tablet"]="768 1024"
    ["tablet-large"]="1024 1366"
    ["desktop"]="1366 768"
    ["desktop-large"]="1920 1080"
)

# Capture each breakpoint
TOTAL=${#BREAKPOINTS[@]}
COUNT=0

for BREAKPOINT in "${!BREAKPOINTS[@]}"; do
    COUNT=$((COUNT + 1))
    DIMS=(${BREAKPOINTS[$BREAKPOINT]})
    WIDTH=${DIMS[0]}
    HEIGHT=${DIMS[1]}
    OUTPUT="${BASE_NAME}-${BREAKPOINT}"
    
    echo -e "${YELLOW}[$COUNT/$TOTAL] Capturing ${BREAKPOINT} (${WIDTH}x${HEIGHT})...${NC}"
    
    node bin/capture-webpage.js "$URL" "$OUTPUT" \
        --width "$WIDTH" \
        --height "$HEIGHT" \
        $EXTRA_OPTS \
        2>&1 | grep -E "✓|✗|Output file|Size:" || true
    
    echo
done

echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}All captures complete!${NC}"
echo -e "${BLUE}===================================================${NC}"
echo
echo -e "${CYAN}Output files:${NC}"
cd diagnostics/screenshots 2>/dev/null || true
ls -lh "${BASE_NAME}"-*.png 2>/dev/null | awk '{printf "  %-40s %6s\n", $9, $5}' || echo "  (files in diagnostics/screenshots/ directory)"
cd - > /dev/null 2>&1 || true
echo
echo -e "${GREEN}Done! 📱💻${NC}"
