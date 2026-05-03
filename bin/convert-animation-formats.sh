#!/bin/bash

# Blender Animation Format Converter
# Converts rendered MP4 animations to WebP and GIF formats
# Usage: ./convert-animation-formats.sh <input.mp4> [output-directory]

set -e

# Colour codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

# Functions
print_header() {
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}  Blender Animation Format Converter${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

usage() {
    echo "Usage: $0 <input.mp4> [output-directory]"
    echo
    echo "Examples:"
    echo "  $0 coin-animation.mp4"
    echo "  $0 coin-animation.mp4 ./diagnostics/screenshots"
    echo
    echo "This script will create:"
    echo "  - High-quality WebP animation"
    echo "  - High-quality GIF animation"
    echo "  - Web-optimised GIF animation (smaller size)"
    exit 1
}

check_dependencies() {
    if ! command -v ffmpeg &> /dev/null; then
        print_error "ffmpeg is not installed"
        echo
        echo "Please install ffmpeg:"
        echo "  Ubuntu/Debian: sudo apt install ffmpeg"
        echo "  Fedora: sudo dnf install ffmpeg"
        echo "  Arch: sudo pacman -S ffmpeg"
        echo "  macOS: brew install ffmpeg"
        exit 1
    fi
    print_success "ffmpeg found"
}

get_video_info() {
    local input="$1"
    
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null | bc -l)
    width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    
    printf "Duration: %.2f seconds\n" "$duration"
    printf "Resolution: %dx%d\n" "$width" "$height"
    printf "Frame rate: %.2f fps\n" "$fps"
}

convert_to_webp() {
    local input="$1"
    local output="$2"
    
    echo
    print_info "Converting to WebP (high quality)..."
    
    ffmpeg -i "$input" \
        -vcodec libwebp \
        -lossless 0 \
        -compression_level 6 \
        -q:v 80 \
        -loop 0 \
        -preset default \
        -an -vsync 0 \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=" || true
    
    if [ -f "$output" ]; then
        size=$(du -h "$output" | cut -f1)
        print_success "Created: $output ($size)"
    else
        print_error "Failed to create WebP"
        return 1
    fi
}

convert_to_gif_hq() {
    local input="$1"
    local output="$2"
    local palette="${output%.gif}_palette.png"
    
    echo
    print_info "Converting to GIF (high quality, 2-pass)..."
    
    # Pass 1: Generate palette
    print_info "Pass 1: Generating optimised palette..."
    ffmpeg -i "$input" \
        -vf "fps=24,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" \
        -y "$palette" 2>&1 | grep -E "frame=|size=" || true
    
    # Pass 2: Create GIF using palette
    print_info "Pass 2: Creating GIF with palette..."
    ffmpeg -i "$input" -i "$palette" \
        -lavfi "fps=24,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
        -loop 0 \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=" || true
    
    # Clean up palette
    rm -f "$palette"
    
    if [ -f "$output" ]; then
        size=$(du -h "$output" | cut -f1)
        print_success "Created: $output ($size)"
    else
        print_error "Failed to create high-quality GIF"
        return 1
    fi
}

convert_to_gif_web() {
    local input="$1"
    local output="$2"
    local palette="${output%.gif}_palette.png"
    
    echo
    print_info "Converting to GIF (web-optimised, smaller size)..."
    
    # Pass 1: Generate palette
    ffmpeg -i "$input" \
        -vf "fps=12,scale=400:-1:flags=lanczos,palettegen=stats_mode=diff" \
        -y "$palette" 2>&1 | grep -E "frame=|size=" || true
    
    # Pass 2: Create GIF using palette
    ffmpeg -i "$input" -i "$palette" \
        -lavfi "fps=12,scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
        -loop 0 \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=" || true
    
    # Clean up palette
    rm -f "$palette"
    
    if [ -f "$output" ]; then
        size=$(du -h "$output" | cut -f1)
        print_success "Created: $output ($size)"
    else
        print_error "Failed to create web-optimised GIF"
        return 1
    fi
}

# Main script
print_header

# Check arguments
if [ $# -lt 1 ]; then
    print_error "No input file specified"
    echo
    usage
fi

INPUT="$1"
OUTPUT_DIR="${2:-.}"

# Validate input file
if [ ! -f "$INPUT" ]; then
    print_error "Input file not found: $INPUT"
    exit 1
fi

# Check dependencies
check_dependencies

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Get base filename without extension
BASENAME=$(basename "$INPUT" .mp4)
BASENAME=$(basename "$BASENAME" .MP4)

# Define output files
WEBP_OUTPUT="$OUTPUT_DIR/${BASENAME}.webp"
GIF_HQ_OUTPUT="$OUTPUT_DIR/${BASENAME}.gif"
GIF_WEB_OUTPUT="$OUTPUT_DIR/${BASENAME}-web.gif"

# Display input info
echo
print_info "Input file: $INPUT"
get_video_info "$INPUT"
echo
print_info "Output directory: $OUTPUT_DIR"

# Convert to all formats
convert_to_webp "$INPUT" "$WEBP_OUTPUT"
convert_to_gif_hq "$INPUT" "$GIF_HQ_OUTPUT"
convert_to_gif_web "$INPUT" "$GIF_WEB_OUTPUT"

# Summary
echo
echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Conversion complete!${NC}"
echo -e "${BLUE}===================================================${NC}"
echo
echo "Output files:"
echo "  WebP (high quality):     $WEBP_OUTPUT"
echo "  GIF (high quality):      $GIF_HQ_OUTPUT"
echo "  GIF (web-optimised):     $GIF_WEB_OUTPUT"
echo

# Show file sizes
if command -v ls &> /dev/null; then
    echo "File sizes:"
    ls -lh "$INPUT" "$WEBP_OUTPUT" "$GIF_HQ_OUTPUT" "$GIF_WEB_OUTPUT" 2>/dev/null | \
        awk '{if (NR>1) printf "  %-30s %10s\n", $9, $5}'
fi

echo
print_success "All conversions successful!"
