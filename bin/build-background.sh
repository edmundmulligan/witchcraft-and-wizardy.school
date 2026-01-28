#!/bin/bash

# Build LaTeX to PDF and convert to SVG, JPG, PNG
# Usage: ./build-background.sh <application>
# Example: ./build-background.sh web

# Cleanup function to remove intermediate LaTeX files
cleanup() {
    echo "Cleaning up intermediate files..."
    latexmk -c background-*.tex 2>/dev/null || true
    rm -f background-*.aux background-*.log background-*.fls background-*.fdb_latexmk 2>/dev/null || true
}

# Set trap to cleanup on exit (normal, error, or interrupt)
trap cleanup EXIT

if [ -z "$1" ]; then
    echo "Usage: $0 <application>"
    echo "Example: $0 web"
    exit 1
fi

APPLICATION=${1}
ORIENTATIONS=("landscape" "portrait")
THEMES=("light" "dark")
BASE="source"
OUTPUT="generated"
for ORIENTATION in "${ORIENTATIONS[@]}"; do
    for THEME in "${THEMES[@]}"; do
        FILENAME="background-${APPLICATION}-${ORIENTATION}-${THEME}"
        TEX_FILE="${BASE}/${FILENAME}.tex"
        ARTWORK_DIR="$OUTPUT"/${APPLICATION}
        # Create artwork directory if it doesn't exist
        mkdir -p "$ARTWORK_DIR"

            PDF_FILE="$ARTWORK_DIR/$FILENAME.pdf"
            SVG_FILE="$ARTWORK_DIR/$FILENAME.svg"

            if [ ! -f "$TEX_FILE" ]; then
                echo "Warning: $TEX_FILE not found"
                continue
            fi

            echo "Building $TEX_FILE to PDF..."
            latexmk -pdf "$TEX_FILE"

            if [ $? -ne 0 ]; then
                echo "Error: Failed to build PDF"
                exit 1
            fi

            # Move PDF to artwork directory (PDF is created without the source/ prefix)
            TEMP_PDF="${FILENAME}.pdf"
            mkdir -p "$(dirname "$PDF_FILE")"
            mv "$TEMP_PDF" "$PDF_FILE"
            echo "Moved PDF to $PDF_FILE"

            echo "Converting $PDF_FILE to SVG..."
            pdf2svg "$PDF_FILE" "$SVG_FILE"

            if [ $? -eq 0 ]; then
                echo "Successfully created $SVG_FILE"
            else
                echo "Error: Failed to convert to SVG"
                exit 1
            fi
            rm -f "$PDF_FILE"
    done
done
