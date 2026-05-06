#!/bin/bash

# Video to GIF Converter
# Converts video files to optimised GIF and WebP animations
# Usage: ./video-to-gif.sh <input-video> [output-name] [options]

set -e

# Colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

# Default settings
FPS=15
WIDTH=800
LOSSY=80
COLOURS=256

# Functions
print_header() {
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE}  Video to GIF Converter${NC}"
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
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

usage() {
    echo "Usage: $0 <input-video> [output-name] [options]"
    echo
    echo "Arguments:"
    echo "  input-video   Video file to convert (mp4, webm, mov, etc.)"
    echo "  output-name   Name for output files (default: same as input)"
    echo
    echo "Options:"
    echo "  --fps <num>       Frame rate (default: 15)"
    echo "  --width <num>     Width in pixels (default: 800, -1 for original)"
    echo "  --lossy <num>     Lossy compression 0-100 (default: 80)"
    echo "  --colours <num>   Max colours 2-256 (default: 256)"
    echo "  --no-webp         Skip WebP creation"
    echo "  --no-optimise     Skip gifsicle optimisation"
    echo "  --quality <str>   Preset: web, medium, high (overrides other settings)"
    echo "  --trim <start,end> Trim video: --trim 2.5,5 (seconds)"
    echo
    echo "Quality presets:"
    echo "  web     - Small file, lower quality (fps=10, width=400, lossy=80, colours=128)"
    echo "  medium  - Balanced (fps=15, width=600, lossy=80, colours=256) [default]"
    echo "  high    - Large file, best quality (fps=24, width=-1, lossy=100, colours=256)"
    echo
    echo "Examples:"
    echo "  $0 recording.mp4"
    echo "  $0 recording.mp4 animation"
    echo "  $0 recording.mp4 demo --fps 20 --width 1000"
    echo "  $0 recording.mp4 small --quality web"
    echo "  $0 recording.mp4 clip --trim 2.5,8.0"
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

get_video_info() {
    local input="$1"
    
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null || echo "unknown")
    fps_fraction=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null || echo "0/1")
    width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null || echo "unknown")
    height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null || echo "unknown")
    
    if [ "$duration" != "unknown" ]; then
        printf "Duration: %.2f seconds\n" "$duration"
    else
        echo "Duration: unknown"
    fi
    
    echo "Resolution: ${width}x${height}"
    echo "Frame rate: ${fps_fraction}"
}

convert_to_gif() {
    local input="$1"
    local output="$2"
    local fps="$3"
    local width="$4"
    local colours="$5"
    local trim_start="$6"
    local trim_duration="$7"
    
    local palette="${output%.gif}_palette.png"
    
    # Build filter string
    local scale_filter="scale=${width}:-1:flags=lanczos"
    if [ "$width" = "-1" ]; then
        scale_filter="scale=-1:-1:flags=lanczos"
    fi
    
    local filter_complex="fps=${fps},${scale_filter},palettegen=stats_mode=diff:max_colors=${colours}"
    
    # Add trim if specified
    local trim_flags=""
    if [ -n "$trim_start" ]; then
        trim_flags="-ss $trim_start"
        if [ -n "$trim_duration" ]; then
            trim_flags="$trim_flags -t $trim_duration"
        fi
    fi
    
    echo
    print_info "Pass 1/2: Generating optimised palette..."
    print_info "Settings: ${fps} fps, ${width}px width, ${colours} colours"
    
    ffmpeg $trim_flags -i "$input" \
        -vf "$filter_complex" \
        -y "$palette" 2>&1 | grep -E "frame=|size=" | tail -1 || true
    
    if [ ! -f "$palette" ]; then
        print_error "Failed to generate palette"
        return 1
    fi
    
    print_info "Pass 2/2: Creating GIF with palette..."
    
    local paletteuse_filter="fps=${fps},${scale_filter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"
    
    ffmpeg $trim_flags -i "$input" -i "$palette" \
        -lavfi "$paletteuse_filter" \
        -loop 0 \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=" | tail -1 || true
    
    # Clean up palette
    rm -f "$palette"
    
    if [ -f "$output" ]; then
        local size=$(du -h "$output" | cut -f1)
        print_success "GIF created: $output ($size)"
        return 0
    else
        print_error "Failed to create GIF"
        return 1
    fi
}

optimise_gif() {
    local input="$1"
    local lossy="$2"
    local output="${input%.gif}-optimised.gif"
    
    if ! command -v gifsicle &> /dev/null; then
        print_warning "gifsicle not installed, skipping optimisation"
        print_info "Install with: sudo apt install gifsicle (or brew install gifsicle)"
        return 0
    fi
    
    echo
    print_info "Optimising GIF with gifsicle (lossy=${lossy})..."
    
    local orig_size=$(du -h "$input" | cut -f1)
    
    gifsicle -O3 --lossy=$lossy -o "$output" "$input" 2>&1 || {
        print_warning "Optimisation failed, keeping original"
        return 0
    }
    
    if [ -f "$output" ]; then
        local new_size=$(du -h "$output" | cut -f1)
        local saving=$(echo "scale=1; (1 - $(stat -f%z "$output" 2>/dev/null || stat -c%s "$output") / $(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")) * 100" | bc 2>/dev/null || echo "?")
        print_success "Optimised: $output ($orig_size → $new_size, saved ~${saving}%)"
        
        # Replace original with optimised
        mv "$output" "$input"
    fi
}

convert_to_webp() {
    local input="$1"
    local output="$2"
    local trim_start="$3"
    local trim_duration="$4"
    
    # Add trim if specified
    local trim_flags=""
    if [ -n "$trim_start" ]; then
        trim_flags="-ss $trim_start"
        if [ -n "$trim_duration" ]; then
            trim_flags="$trim_flags -t $trim_duration"
        fi
    fi
    
    echo
    print_info "Creating WebP animation..."
    
    ffmpeg $trim_flags -i "$input" \
        -vcodec libwebp \
        -lossless 0 \
        -compression_level 6 \
        -q:v 80 \
        -loop 0 \
        -preset default \
        -an -vsync 0 \
        -y "$output" 2>&1 | grep -E "frame=|size=|time=" | tail -1 || true
    
    if [ -f "$output" ]; then
        local size=$(du -h "$output" | cut -f1)
        print_success "WebP created: $output ($size)"
        return 0
    else
        print_error "Failed to create WebP"
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
OUTPUT_NAME=""
CREATE_WEBP=true
OPTIMISE=true
TRIM_START=""
TRIM_DURATION=""

# Validate input file
if [ ! -f "$INPUT" ]; then
    print_error "Input file not found: $INPUT"
    exit 1
fi

# Parse arguments
shift
if [ $# -gt 0 ] && [ "${1:0:2}" != "--" ]; then
    OUTPUT_NAME="$1"
    shift
fi

while [ $# -gt 0 ]; do
    case "$1" in
        --fps)
            FPS="$2"
            shift 2
            ;;
        --width)
            WIDTH="$2"
            shift 2
            ;;
        --lossy)
            LOSSY="$2"
            shift 2
            ;;
        --colours)
            COLOURS="$2"
            shift 2
            ;;
        --no-webp)
            CREATE_WEBP=false
            shift
            ;;
        --no-optimise)
            OPTIMISE=false
            shift
            ;;
        --quality)
            QUALITY="$2"
            case "$QUALITY" in
                web)
                    FPS=10
                    WIDTH=400
                    LOSSY=80
                    COLOURS=128
                    ;;
                medium)
                    FPS=15
                    WIDTH=600
                    LOSSY=80
                    COLOURS=256
                    ;;
                high)
                    FPS=24
                    WIDTH=-1
                    LOSSY=100
                    COLOURS=256
                    ;;
                *)
                    print_error "Invalid quality preset: $QUALITY"
                    echo "Valid options: web, medium, high"
                    exit 1
                    ;;
            esac
            shift 2
            ;;
        --trim)
            IFS=',' read -r TRIM_START TRIM_END <<< "$2"
            if [ -n "$TRIM_START" ] && [ -n "$TRIM_END" ]; then
                TRIM_DURATION=$(echo "$TRIM_END - $TRIM_START" | bc)
            fi
            shift 2
            ;;
        --help|-h)
            usage
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Generate output name if not provided
if [ -z "$OUTPUT_NAME" ]; then
    BASENAME=$(basename "$INPUT")
    OUTPUT_NAME="${BASENAME%.*}"
fi

# Get directory for output
INPUT_DIR=$(dirname "$INPUT")
GIF_OUTPUT="${INPUT_DIR}/${OUTPUT_NAME}.gif"
WEBP_OUTPUT="${INPUT_DIR}/${OUTPUT_NAME}.webp"

# Check dependencies
check_dependencies

# Display input info
echo
print_info "Input file: $INPUT"
get_video_info "$INPUT"
echo
print_info "Output name: $OUTPUT_NAME"
if [ -n "$TRIM_START" ]; then
    print_info "Trim: ${TRIM_START}s to ${TRIM_END}s (duration: ${TRIM_DURATION}s)"
fi

# Convert to GIF
convert_to_gif "$INPUT" "$GIF_OUTPUT" "$FPS" "$WIDTH" "$COLOURS" "$TRIM_START" "$TRIM_DURATION"

# Optimise GIF
if [ "$OPTIMISE" = true ]; then
    optimise_gif "$GIF_OUTPUT" "$LOSSY"
fi

# Create WebP
if [ "$CREATE_WEBP" = true ]; then
    convert_to_webp "$INPUT" "$WEBP_OUTPUT" "$TRIM_START" "$TRIM_DURATION"
fi

# Summary
echo
echo -e "${BLUE}===================================================${NC}"
echo -e "${GREEN}Conversion complete!${NC}"
echo -e "${BLUE}===================================================${NC}"
echo
echo "Output files:"

if [ -f "$GIF_OUTPUT" ]; then
    SIZE=$(du -h "$GIF_OUTPUT" | cut -f1)
    echo "  GIF:  $GIF_OUTPUT ($SIZE)"
fi

if [ -f "$WEBP_OUTPUT" ]; then
    SIZE=$(du -h "$WEBP_OUTPUT" | cut -f1)
    echo "  WebP: $WEBP_OUTPUT ($SIZE)"
    
    # Show size comparison
    GIF_SIZE=$(stat -f%z "$GIF_OUTPUT" 2>/dev/null || stat -c%s "$GIF_OUTPUT")
    WEBP_SIZE=$(stat -f%z "$WEBP_OUTPUT" 2>/dev/null || stat -c%s "$WEBP_OUTPUT")
    SAVING=$(echo "scale=1; (1 - $WEBP_SIZE / $GIF_SIZE) * 100" | bc 2>/dev/null || echo "?")
    echo
    print_success "WebP is ~${SAVING}% smaller than GIF"
fi

echo
print_success "Done! 🎬"
