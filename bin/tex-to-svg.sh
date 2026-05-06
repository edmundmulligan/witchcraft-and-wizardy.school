#!/bin/bash
# Compile a LaTeX file to PDF and convert to SVG
# Usage: ./tex-to-svg.sh filename (without .tex extension)
# Example: ./tex-to-svg.sh logo-embodied-mind-with-name-purple

# Run from the artwork folder to ensure correct paths

# Colours for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please provide a filename${NC}"
    echo "Usage: $0 filename outputFolder"
    echo "Example: $0 source/image-1/logo-embodied-mind-with-name-purple generated"
    exit 1
fi

BASENAME="$1"
INPUT_FOLDER=$(dirname "$BASENAME")
FILENAME=$(basename "$BASENAME")
BASENAME="${INPUT_FOLDER}/${FILENAME}"
OUTPUT_FOLDER="${2:-generated}"
TEXFILE="${BASENAME}.tex"
PDFFILE="${FILENAME}.pdf"
SVGFILE="${FILENAME}.svg"
PNGFILE="${FILENAME}.png"

# Check if .tex file exists
if [ ! -f "$TEXFILE" ]; then
    echo -e "${RED}Error: $TEXFILE not found${NC}"
    exit 1
fi

echo -e "${GREEN}Starting LaTeX compilation...${NC}"
echo -e "${CYAN}Running: pdflatex $TEXFILE${NC}"

# Compile .tex to PDF using pdflatex
if ! pdflatex "$TEXFILE"; then
    echo -e "${RED}Error: pdflatex compilation failed${NC}"
    echo -e "${YELLOW}Check the .log file for details: ${FILENAME}.log${NC}"
    exit 1
fi

# Check if PDF was created
if [ ! -f "$PDFFILE" ]; then
    echo -e "${RED}Error: $PDFFILE was not created${NC}"
    exit 1
fi

PDF_SIZE=$(du -h "$PDFFILE" | cut -f1)
echo -e "${GREEN}✓ PDF created successfully: $PDFFILE ($PDF_SIZE)${NC}"

# Convert PDF to SVG using pdftocairo
echo -e "${GREEN}Converting PDF to SVG...${NC}"
echo -e "${CYAN}Running: pdftocairo -svg $PDFFILE $SVGFILE${NC}"

if ! pdftocairo -svg "$PDFFILE" "$SVGFILE"; then
    echo -e "${RED}Error: PDF to SVG conversion failed${NC}"
    echo -e "${YELLOW}Make sure pdftocairo (poppler-utils) is installed${NC}"
    exit 1
fi

# Also create a PNG for reference
echo -e "${GREEN}Converting PDF to PNG...${NC}"
echo -e "${CYAN}Running: pdftocairo -png -transp -singlefile $PDFFILE $PNGFILE${NC}"

if ! pdftocairo -png -transp -singlefile "$PDFFILE" "$(basename "$PNGFILE" .png)"; then
    echo -e "${RED}Error: PDF to PNG conversion failed${NC}"
    echo -e "${YELLOW}Make sure pdftocairo (poppler-utils) is installed${NC}"
    exit 1
fi

# Check if SVG was created
if [ ! -f "$SVGFILE" ]; then
    echo -e "${RED}Error: $SVGFILE was not created${NC}"
    exit 1
fi

# Check if PNG was created
if [ ! -f "$PNGFILE" ]; then
    echo -e "${RED}Error: $PNGFILE was not created${NC}"
    exit 1
fi

SVG_SIZE=$(du -h "$SVGFILE" | cut -f1)
PNG_SIZE=$(du -h "$PNGFILE" | cut -f1)
echo -e "${GREEN}✓ SVG created successfully: $SVGFILE ($SVG_SIZE)${NC}"
echo -e "${GREEN}✓ PNG created successfully: $PNGFILE ($PNG_SIZE)${NC}"

echo ""
echo -e "${GREEN}Conversion complete!${NC}"
echo "Files created:"
echo "  • $PDFFILE ($PDF_SIZE)"
echo "  • $SVGFILE ($SVG_SIZE)"
echo "  • $PNGFILE ($PNG_SIZE)"

mkdir -p "$OUTPUT_FOLDER"
mv "$SVGFILE" "$OUTPUT_FOLDER"
mv "$PNGFILE" "$OUTPUT_FOLDER"

echo -e "${GREEN}✓ Moved $SVGFILE and $PNGFILE to $OUTPUT_FOLDER/${NC}"

# Clean up intermediate files
rm -f "$PDFFILE" "${FILENAME}.aux" "${FILENAME}.fdb_latexmk" "${FILENAME}.fls" "${FILENAME}.log"
