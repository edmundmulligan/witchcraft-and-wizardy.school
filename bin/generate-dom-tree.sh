#!/bin/bash

###############################################################################
# generate-dom-tree.sh
#
# Generates DOM tree diagrams for HTML files using Graphviz
#
# Usage: ./bin/generate-dom-tree.sh [html-file]
#   If no file specified, generates diagrams for all main HTML files
#
# Requirements:
#   - Node.js with cheerio package
#   - Graphviz (dot command)
#
# Outputs:
#   - .dot files (Graphviz source)
#   - .png files (rendered diagrams)
#   - .svg files (vector diagrams)
###############################################################################

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source common test helpers if available
if [ -f "$SCRIPT_DIR/test-helpers.sh" ]; then
    source "$SCRIPT_DIR/test-helpers.sh"
fi

# Check if Graphviz is installed
if ! command -v dot &> /dev/null; then
    echo "❌ Error: Graphviz is not installed"
    echo "   Install with: sudo apt install graphviz (Ubuntu/Debian)"
    echo "   or: brew install graphviz (macOS)"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if cheerio is installed
if ! node -e "require('cheerio')" 2>/dev/null; then
    echo "❌ Error: cheerio package is not installed"
    echo "   Install with: npm install cheerio"
    exit 1
fi

# Create output directory
OUTPUT_DIR="$PROJECT_ROOT/tests/results/dom-trees"
mkdir -p "$OUTPUT_DIR"

# Function to generate DOM tree for a file
generate_tree() {
    local html_file="$1"
    local filename=$(basename "$html_file" .html)
    local dot_file="$OUTPUT_DIR/${filename}.dot"
    local png_file="$OUTPUT_DIR/${filename}-dom-tree.png"
    local svg_file="$OUTPUT_DIR/${filename}-dom-tree.svg"

    echo "Processing: $html_file"

    # Generate DOT file
    node "$SCRIPT_DIR/generate-dom-tree.js" "$html_file" "$dot_file"

    # Generate PNG
    if dot -Tpng "$dot_file" -o "$png_file" 2>/dev/null; then
        echo "  ✓ PNG diagram: $png_file"
    else
        echo "  ❌ Failed to generate PNG"
    fi

    # Generate SVG
    if dot -Tsvg "$dot_file" -o "$svg_file" 2>/dev/null; then
        echo "  ✓ SVG diagram: $svg_file"
    else
        echo "  ❌ Failed to generate SVG"
    fi

    echo ""
}

# Change to project root
cd "$PROJECT_ROOT"

# If a specific file is provided, process only that file
if [ $# -gt 0 ]; then
    if [ -f "$1" ]; then
        generate_tree "$1"
    else
        echo "❌ Error: File '$1' not found"
        exit 1
    fi
else
    # Process all main HTML files
    echo "Generating DOM trees for all HTML pages..."
    echo "=========================================="
    echo ""

    for html_file in index.html about.html students.html glossary-and-faq.html license-and-credits.html; do
        if [ -f "$html_file" ]; then
            generate_tree "$html_file"
        fi
    done
fi

echo "=========================================="
echo "✓ DOM tree generation complete"
echo "  Output directory: $OUTPUT_DIR"
echo ""
echo "View the diagrams:"
echo "  PNG files: $OUTPUT_DIR/*-dom-tree.png"
echo "  SVG files: $OUTPUT_DIR/*-dom-tree.svg"
echo "  DOT files: $OUTPUT_DIR/*.dot"
