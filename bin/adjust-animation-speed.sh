#!/bin/bash

# Animation Speed Adjuster
# Adjusts the playback speed of video animations
# Usage: ./adjust-animation-speed.sh <input.mp4> <speed-factor> [output-file]

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
    echo -e "${BLUE}  Animation Speed Adjuster${NC}"
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
    echo "Usage: $0 <input-video> <speed-factor> [output-file]"
    echo
    echo "Speed factor examples:"
    echo "  0.5  = Half speed (2x slower)"
    echo "  1.0  = Normal speed (no change)"
    echo "  1.5  = 50% faster"
    echo "  2.0  = Double speed (2x faster)"
    echo "  4.0  = Quadruple speed (4x faster)"
    echo
    echo "Examples:"
    echo "  $0 coin-animation.mp4 2.0"
    echo "  $0 coin-animation.mp4 0.5 coin-slow.mp4"
    echo "  $0 coin-animation.mp4 1.5 coin-fast.mp4"
    echo
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

validate_speed() {
    local speed="$1"
    
    # Check if speed is a valid number
    if ! [[ "$speed" =~ ^[0-9]*\.?[0-9]+$ ]]; then
        print_error "Invalid speed factor: $speed"
        echo "Speed must be a positive number (e.g., 0.5, 1.0, 2.0)"
        exit 1
    fi
    
    # Check if speed is in reasonable range
    if (( $(echo "$speed < 0.1" | bc -l) )); then
        print_error "Speed factor too slow (minimum: 0.1)"
        exit 1
    fi
    
    if (( $(echo "$speed > 10" | bc -l) )); then
        print_error "Speed factor too fast (maximum: 10)"
        exit 1
    fi
}

get_video_info() {
    local input="$1"
    
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null | bc -l)
    width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    
    echo "Input video:"
    printf "  Duration: %.2f seconds\n" "$duration"
    printf "  Resolution: %dx%d\n" "$width" "$height"
    printf "  Frame rate: %.2f fps\n" "$fps"
}

adjust_speed() {
    local input="$1"
    local speed="$2"
    local output="$3"
    
    # Calculate PTS multiplier (inverse of speed)
    local pts_multiplier=$(echo "scale=4; 1 / $speed" | bc -l)
    
    echo
    print_info "Adjusting speed..."
    print_info "Speed factor: ${speed}x"
    print_info "PTS multiplier: $pts_multiplier"
    
    # Get original duration
    local orig_duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)
    local new_duration=$(echo "scale=2; $orig_duration / $speed" | bc -l)
    
    printf "  Original duration: %.2f seconds\n" "$orig_duration"
    printf "  New duration: %.2f seconds\n" "$new_duration"
    
    echo
    print_info "Processing video..."
    
    # Adjust speed with re-encoding for best quality
    ffmpeg -i "$input" \
        -filter:v "setpts=${pts_multiplier}*PTS" \
        -r 24 \
        -c:v libx264 \
        -crf 18 \
        -preset slow \
        -an \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=|speed=" || true
    
    if [ -f "$output" ]; then
        local size=$(du -h "$output" | cut -f1)
        print_success "Created: $output ($size)"
        
        # Verify new duration
        local actual_duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$output" 2>/dev/null)
        printf "\nActual output duration: %.2f seconds\n" "$actual_duration"
    else
        print_error "Failed to create output file"
        return 1
    fi
}

# Main script
print_header

# Check arguments
if [ $# -lt 2 ]; then
    print_error "Missing required arguments"
    echo
    usage
fi

INPUT="$1"
SPEED="$2"
OUTPUT="${3:-}"

# Validate input file
if [ ! -f "$INPUT" ]; then
    print_error "Input file not found: $INPUT"
    exit 1
fi

# Validate speed factor
validate_speed "$SPEED"

# Generate output filename if not provided
if [ -z "$OUTPUT" ]; then
    BASENAME=$(basename "$INPUT" .mp4)
    BASENAME=$(basename "$BASENAME" .MP4)
    DIR=$(dirname "$INPUT")
    
    # Create descriptive suffix
    if (( $(echo "$SPEED < 1" | bc -l) )); then
        SUFFIX="slow"
    elif (( $(echo "$SPEED > 1" | bc -l) )); then
        SUFFIX="fast"
    else
        SUFFIX="normal"
    fi
    
    OUTPUT="$DIR/${BASENAME}-${SPEED}x-${SUFFIX}.mp4"
fi

# Check if output file exists
if [ -f "$OUTPUT" ]; then
    read -p "Output file exists. Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled"
        exit 0
    fi
fi

# Check dependencies
check_dependencies

# Display input info
echo
get_video_info "$INPUT"

# Adjust speed
adjust_speed "$INPUT" "$SPEED" "$OUTPUT"

# Summary
echo
echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Speed adjustment complete!${NC}"
echo -e "${BLUE}===================================================${NC}"
echo
echo "Files:"
echo "  Input:  $INPUT"
echo "  Output: $OUTPUT"
echo "  Speed:  ${SPEED}x"
echo

if command -v ls &> /dev/null; then
    echo "File sizes:"
    ls -lh "$INPUT" "$OUTPUT" 2>/dev/null | \
        awk '{if (NR>1) printf "  %-30s %10s\n", $9, $5}'
fi

echo
print_success "Done!"
echo
print_info "Tip: You can now convert to other formats:"
echo "  ./bin/convert-animation-formats.sh $OUTPUT"
