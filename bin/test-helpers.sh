#!/bin/bash

# Common helper functions for accessibility testing scripts

# Normalise exclude arguments (comma-separated and/or space-separated) into a space list
normalise_exclude_list() {
  local normalised=""
  local item=""

  for item in "$@"; do
    if [ -n "$item" ]; then
      normalised="$normalised ${item//,/ }"
    fi
  done

  # Trim leading whitespace
  echo "$normalised" | sed 's/^ *//'
}

path_matches_exclude() {
  local input_path="${1#./}"
  local exclude_path="${2#./}"
  local input_base="$(basename "$input_path")"
  local exclude_base="$(basename "$exclude_path")"

  exclude_path="${exclude_path%/}"

  if [ "$input_base" = "$exclude_base" ] || [ "$input_path" = "$exclude_path" ] || [ "$input_path" = "./$exclude_path" ] || [[ "$input_path" == "$exclude_path/"* ]]; then
    return 0
  fi

  return 1
}

filter_excluded_paths() {
  local input_paths="${1:-}"
  local exclude_list="$(normalise_exclude_list "${2:-}")"
  local filtered_paths=""
  local excluded_count=0
  local -a exclude_items=()

  FILTERED_PATHS_RESULT="$input_paths"
  FILTERED_PATHS_EXCLUDED_COUNT=0

  if [ -z "$exclude_list" ]; then
    return 0
  fi

  local old_ifs="$IFS"
  IFS=' '
  read -r -a exclude_items <<< "$exclude_list"
  IFS="$old_ifs"

  while IFS= read -r input_path; do
    [ -z "$input_path" ] && continue

    local excluded=false
    local exclude_item=""

    for exclude_item in "${exclude_items[@]}"; do
      if path_matches_exclude "$input_path" "$exclude_item"; then
        excluded=true
        excluded_count=$((excluded_count + 1))
        break
      fi
    done

    if [ "$excluded" = false ]; then
      if [ -z "$filtered_paths" ]; then
        filtered_paths="$input_path"
      else
        filtered_paths="$filtered_paths
$input_path"
      fi
    fi
  done <<< "$input_paths"

  FILTERED_PATHS_RESULT="$filtered_paths"
  FILTERED_PATHS_EXCLUDED_COUNT=$excluded_count
}

print_standard_option() {
  case "$1" in
    help)
      echo "  -h, --help           Show this help message and exit"
      ;;
    quick)
      echo "  -q, --quick          Limit testing scope for faster runs"
      ;;
    quick-all)
      echo "  -q, --quick          Skip Wave and Lighthouse tests for faster runs"
      ;;
    url)
      echo "  -u, --url URL        Specify the local web server URL (default: http://localhost:8080)"
      ;;
    exclude-discovery)
      echo "  -x, --exclude VALUE  Exclude one or more files/folders from page discovery"
      ;;
    exclude-validation)
      echo "  -x, --exclude VALUE  Exclude one or more files/folders from validation"
      ;;
    exclude-checks)
      echo "  -x, --exclude VALUE  Exclude one or more files/folders from checks"
      ;;
    exclude-tests)
      echo "  -x, --exclude VALUE  Exclude one or more files/folders from tests"
      ;;
    run-wave)
      echo "  -w, --run-wave       Include Wave accessibility tests"
      ;;
    *)
      echo "Unknown usage option key: $1" >&2
      return 1
      ;;
  esac
}

print_standard_usage() {
  local usage="$1"
  shift

  echo "Usage: $usage"
  echo "Options:"

  local option_key=""
  for option_key in "$@"; do
    print_standard_option "$option_key" || return 1
  done
}

# Parse command line options for test URL
parse_test_options() {
  local OPTIND
  while getopts ":hu:x:" opt
  do
    case $opt in
      h)
        print_standard_usage "$0 [options]" help url exclude-discovery
        exit 0
        ;;
      u)
        TEST_URL="$OPTARG"
        ;;
      x)
        EXCLUDE_LIST="$(normalise_exclude_list "$EXCLUDE_LIST" "$OPTARG")"
        ;;
      \?)
        echo "Invalid option: -$OPTARG" >&2
        exit 1
        ;;
    esac
  done
}

# Start local server if not running
start_server_if_needed() {
  local url="$1"

  if ! curl -s -f "$url" > /dev/null 2>&1
  then
    echo "⚠️  No server detected at $url"
    echo "Starting local server..."
    npx serve . -l 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    STOP_SERVER=true
  else
    echo "✓ Server is running at $url"
    STOP_SERVER=false
  fi
}

# Stop server if we started it
stop_server_if_started() {
  if [ "$STOP_SERVER" = true ]; then
    echo "Stopping local server..."
    kill $SERVER_PID 2>/dev/null
  fi
}

# Find all HTML files to test
discover_html_pages() {
  local folder="${1:-.}"
  local exclude_list="$(normalise_exclude_list "${2:-}")"

  echo "Discovering pages to test in $folder..."
  if [ ! -d "$folder" ]; then
    echo "Error: Provided folder '$folder' does not exist."
    PAGES=""
    PAGE_COUNT=0
    return
  fi
  PAGES=$(find "$folder" -name "*.html" -not -path "*/node_modules/*" -not -path "*/tests/*" -not -path "*/diagnostics/*" -print)

  if [ -n "$exclude_list" ]; then
    filter_excluded_paths "$PAGES" "$exclude_list"
    PAGES="$FILTERED_PATHS_RESULT"
    echo "Excluded $FILTERED_PATHS_EXCLUDED_COUNT pages using: $exclude_list"
  fi

  PAGE_COUNT=$(echo "$PAGES" | sed '/^$/d' | wc -l)
  echo "Found $PAGE_COUNT pages to test"
}

# Setup results directory
setup_results_dir() {
  RESULTS_DIR="tests/results"
  mkdir -p "$RESULTS_DIR"
}
