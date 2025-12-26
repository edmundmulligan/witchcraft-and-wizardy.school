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

ORIENTATIONS=("landscape" "portrait")
THEMES=("light" "dark")
BASE="source/background"
OUTPUT="generated"
for ORIENTATION in "${ORIENTATIONS[@]}"; do
    for THEME in "${THEMES[@]}"; do
        TEX_FILE="${BASE}-${ORIENTATION}-${THEME}-$1.tex"
        FILENAME="background-${ORIENTATION}-${THEME}-$1"
        ARTWORK_DIR="$OUTPUT"/${1}
        # Create artwork directory if it doesn't exist
        mkdir -p "$ARTWORK_DIR"

        PDF_FILE="$ARTWORK_DIR/$FILENAME.pdf"
        SVG_FILE="$ARTWORK_DIR/$FILENAME.svg"
        JPG_FILE="$ARTWORK_DIR/$FILENAME.jpg"
        PNG_FILE="$ARTWORK_DIR/$FILENAME.png"
        PNG_TRANSPARENT_FILE="$ARTWORK_DIR/$FILENAME-transparent.png"

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
        TEMP_PDF="background-${ORIENTATION}-${THEME}-$1.pdf"
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

        echo "Converting $PDF_FILE to JPG..."
        convert -density 300 "$PDF_FILE" -quality 90 -flatten "$JPG_FILE"

        if [ $? -eq 0 ]; then
        echo "Successfully created $JPG_FILE"
        else
            echo "Error: Failed to convert to JPG"
            exit 1
        fi

        echo "Converting $PDF_FILE to PNG (opaque background)..."
        convert -density 300 "$PDF_FILE" -quality 100 -flatten "$PNG_FILE"

        if [ $? -eq 0 ]; then
            echo "Successfully created $PNG_FILE"
        else
            echo "Error: Failed to convert to PNG"
            exit 1
        fi

        echo "Converting $PDF_FILE to PNG (transparent background)..."
        # Trim borders and make background transparent
        # For light themes: remove white and trim borders
        # For dark themes: use higher fuzz to catch black!90 (near-black colors)
        if [[ "$THEME" == "light" ]]; then
            convert -density 300 "$PDF_FILE" -quality 100 -alpha set -channel RGBA -fuzz 5% -transparent white -trim +repage "$PNG_TRANSPARENT_FILE"
        else
            convert -density 300 "$PDF_FILE" -quality 100 -alpha set -channel RGBA -fuzz 15% -transparent black -trim +repage "$PNG_TRANSPARENT_FILE"
        fi

        if [ $? -eq 0 ]; then
            echo "Successfully created $PNG_TRANSPARENT_FILE"
        else
            echo "Error: Failed to convert to transparent PNG"
            exit 1
        fi
    done
done