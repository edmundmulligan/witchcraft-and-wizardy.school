# Capturing CSS Animations as GIFs

Complete guide for recording CSS animations from the website and converting them to GIF format.

---

## Table of Contents

1. [Quick Method: Browser DevTools](#1-quick-method-browser-devtools)
2. [Automated Method: Puppeteer Script](#2-automated-method-puppeteer-script)
3. [Screen Recording Method](#3-screen-recording-method)
4. [Chrome Extension Method](#4-chrome-extension-method)
5. [Command-Line Automation](#5-command-line-automation)
6. [Tips for Best Quality](#6-tips-for-best-quality)

---

## 1. Quick Method: Browser DevTools

### Chrome/Chromium (Built-in Screen Recording)

**Record animation:**
1. Open your page with the CSS animation
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "screenshot" → Select "Capture screenshot" or "Capture full size screenshot"
5. For video: Use `Ctrl+Shift+P` → "Start/Stop recording"

**Chrome doesn't have built-in GIF recording**, but you can:
- Record video using Chrome's screen recorder
- Convert video to GIF using FFmpeg (see below)

### Firefox (Screenshot Tool)

**Single frame:**
1. Open Developer Tools (`F12`)
2. Click Camera icon in toolbar
3. Select "Save full page" or "Save visible area"

**For animations:**
- Firefox doesn't have built-in animation recording
- Use external screen recording + conversion

---

## 2. Automated Method: Puppeteer Script

This is the recommended method for consistent, repeatable results.

### Install Dependencies

```bash
# Puppeteer is already installed (used by pa11y)
# No additional dependencies needed - the script uses FFmpeg for video conversion
```

**Check dependencies:**
```bash
# Verify puppeteer is installed
npm list puppeteer

# Verify ffmpeg is available
ffmpeg -version
```

### Use the Capture Script

Use the provided script: `bin/capture-css-animation.js`

```bash
# Capture animation from a page
node bin/capture-css-animation.js \
  http://localhost:8080/students/lesson-01.html \
  wand-animation \
  5000

# Outputs:
# - wand-animation.webm (video)
# - wand-animation.gif (optimised GIF)
```

**Script features:**
- Captures specific element or full page
- Configurable duration
- Automatic GIF conversion
- Optimised for web use

---

## 3. Screen Recording Method

### Using Built-in Screen Recorder

**Linux (GNOME):**
```bash
# Start recording (Ctrl+Alt+Shift+R)
# Stop recording (Ctrl+Alt+Shift+R again)
# Video saved to ~/Videos/

# Convert to GIF
ffmpeg -i ~/Videos/Screencast.webm \
  -vf "fps=15,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y palette.png

ffmpeg -i ~/Videos/Screencast.webm -i palette.png \
  -lavfi "fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer" \
  -loop 0 animation.gif

rm palette.png
```

**Mac:**
```bash
# Use QuickTime Player → File → New Screen Recording
# Or: Cmd+Shift+5 for screenshot toolbar

# Convert to GIF (install ffmpeg via Homebrew first)
ffmpeg -i recording.mov -vf "fps=15,scale=800:-1" animation.gif
```

**Windows:**
```bash
# Use Xbox Game Bar (Win+G)
# Or: Windows + Alt + R to start/stop recording

# Convert to GIF
ffmpeg -i recording.mp4 -vf "fps=15,scale=800:-1" animation.gif
```

### Using OBS Studio (Cross-platform)

1. **Install OBS Studio**: https://obsproject.com/
2. **Setup:**
   - Add source → Window Capture → Select browser window
   - Or: Display Capture for full screen
3. **Configure:**
   - Settings → Output → Recording Format: MP4
   - Settings → Video → Resolution and FPS
4. **Record:**
   - Click "Start Recording"
   - Trigger animation
   - Click "Stop Recording"
5. **Convert:** Use FFmpeg (see conversion methods below)

---

## 4. Chrome Extension Method

### Recommended Extensions

**Awesome Screenshot & Screen Recorder**
- Chrome Web Store: "Awesome Screenshot"
- Features: Record video, capture screenshots, basic editing
- Export: MP4, then convert to GIF

**Loom**
- Quick video recording
- Cloud-based
- Export and convert to GIF

**ScreenToGif** (Windows only)
- Direct GIF recording: https://www.screentogif.com/
- Built-in editor
- No conversion needed

---

## 5. Command-Line Automation

### Using FFmpeg to Convert Existing Videos

**Basic conversion:**
```bash
ffmpeg -i input-video.mp4 -vf "fps=15,scale=800:-1" output.gif
```

**High quality (2-pass with palette):**
```bash
# Generate palette
ffmpeg -i input-video.mp4 \
  -vf "fps=15,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y palette.png

# Create GIF with palette
ffmpeg -i input-video.mp4 -i palette.png \
  -lavfi "fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 output.gif

# Clean up
rm palette.png
```

**Optimise for web (smaller file):**
```bash
# Lower FPS and resolution
ffmpeg -i input-video.mp4 \
  -vf "fps=10,scale=400:-1:flags=lanczos,palettegen" \
  -y palette.png

ffmpeg -i input-video.mp4 -i palette.png \
  -lavfi "fps=10,scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  -loop 0 output-small.gif

rm palette.png
```

### Using Browser Automation (Playwright)

```bash
# Install Playwright
npm install --save-dev playwright

# Use the provided script
node bin/capture-with-playwright.js \
  http://localhost:8080/your-page.html \
  "#animated-element" \
  output-animation
```

---

## 6. Tips for Best Quality

### Before Recording

1. **Clean browser window:**
   - Use incognito/private mode (no extensions)
   - Hide bookmarks bar (Ctrl+Shift+B)
   - Zoom to 100% (Ctrl+0)

2. **Prepare animation:**
   - Add delays before animation starts (so you can start recording)
   - Use `:paused` state if needed
   - Add replay button for consistent timing

3. **Optimise page:**
   - Remove unnecessary elements
   - Use solid background colour
   - Disable browser animations (Reduce motion settings)

### Recording Settings

**Frame rate:**
- 10 FPS: Small file, choppy (good for simple animations)
- 15 FPS: Balanced (recommended for web)
- 24 FPS: Smooth (larger file)
- 30+ FPS: Very smooth (very large file)

**Resolution:**
- 400px width: Thumbnails, small demos
- 600px width: Medium web embeds
- 800px width: Detailed demonstrations
- Original: Maximum quality (largest file)

**Duration:**
- Keep animations short (2-5 seconds ideal)
- Loop animations for continuous effect
- Trim dead space at start/end

### GIF Optimisation

**Reduce colours:**
```bash
# 256 colours (default)
# 128 colours (smaller file)
# 64 colours (much smaller, some quality loss)

ffmpeg -i input.mp4 \
  -vf "fps=15,scale=800:-1,palettegen=max_colors=128" \
  -y palette.png
```

**Lossy GIF compression:**
```bash
# Install gifsicle
sudo apt install gifsicle  # Ubuntu/Debian
brew install gifsicle      # macOS

# Optimise GIF
gifsicle -O3 --lossy=80 -o optimised.gif input.gif

# Options:
# -O3: Maximum optimisation
# --lossy=80: 80% quality (20% compression)
# --colours 128: Reduce to 128 colours
```

**Convert to WebP instead:**
```bash
# WebP is much smaller than GIF
ffmpeg -i input.mp4 \
  -vcodec libwebp \
  -lossless 0 \
  -compression_level 6 \
  -q:v 80 \
  -loop 0 \
  animation.webp

# Compare sizes:
ls -lh animation.gif animation.webp
```

---

## Common Use Cases

### Capture Hover Animation

**HTML structure:**
```html
<button class="animated-button">Hover me</button>
```

**Method 1: Manual hover**
1. Start screen recording
2. Hover over element
3. Stop recording
4. Convert to GIF

**Method 2: JavaScript automation**
```javascript
// In browser console
const el = document.querySelector('.animated-button');

// Trigger hover via JavaScript
el.dispatchEvent(new MouseEvent('mouseenter'));

// Wait for animation to complete
setTimeout(() => {
  el.dispatchEvent(new MouseEvent('mouseleave'));
}, 2000);
```

### Capture Transition on Page Load

**Method: Add delay to CSS**
```css
/* Original */
.element {
  animation: fadeIn 1s ease-in;
}

/* Add delay for recording setup */
.element {
  animation: fadeIn 1s ease-in 3s; /* 3 second delay */
}
```

### Capture Looping Animation

**Record multiple loops:**
```bash
# Record 3 cycles (if animation is 2 seconds)
# Record for 6+ seconds
# Then trim to exact loop duration

ffmpeg -i recording.mp4 -ss 3 -t 2 -vf "fps=15,scale=800:-1" loop.gif
# -ss 3: Skip first 3 seconds
# -t 2: Duration 2 seconds
```

---

## Quick Reference: File Size Comparison

| Method | File Size | Quality | Browser Support |
|--------|-----------|---------|-----------------|
| GIF (default) | ~2-5 MB | Medium | 100% |
| GIF (optimised) | ~500 KB - 1 MB | Medium | 100% |
| GIF (web-optimised) | ~200-500 KB | Low-Medium | 100% |
| WebP | ~100-300 KB | High | 97%+ (IE no) |
| MP4 | ~200-800 KB | High | 98%+ |
| WebM | ~100-500 KB | High | 96%+ (Safari no) |

**Recommendation:** Provide both GIF (fallback) and WebP/MP4 (modern browsers)

---

## Example: Capture Animation from Your Site

### Step-by-Step for Puffin Project

**1. Start local server:**
```bash
cd /home/edmund/Projects/Study/puffin-web-project-edmundmulligan
python3 -m http.server 8080
```

**2. Identify animation:**
- Navigate to page with animation
- Identify CSS class or element ID
- Note animation duration

**3. Capture using Puppeteer script:**
```bash
node bin/capture-css-animation.js \
  http://localhost:8080/students/lesson-01.html \
  lesson-animation \
  5000 \
  ".animated-wand"
```

**4. Optimise GIF:**
```bash
# Further optimise output
gifsicle -O3 --lossy=80 -o lesson-animation-optimised.gif lesson-animation.gif

# Or convert to WebP
ffmpeg -i lesson-animation.gif -c:v libwebp -q:v 80 lesson-animation.webp
```

**5. Add to documentation or README:**
```markdown
## Animation Demo

![Animation demo](images/lesson-animation-optimised.gif)

<!-- Or with picture tag for modern browsers -->
<picture>
  <source srcset="images/lesson-animation.webp" type="image/webp">
  <img src="images/lesson-animation.gif" alt="Animation demo">
</picture>
```

---

## Troubleshooting

### Issue: Recording is choppy

**Solutions:**
- Increase FPS: `fps=24` instead of `fps=15`
- Record at higher resolution, scale down later
- Use hardware acceleration in OBS/recording software
- Close other applications during recording

### Issue: GIF file too large

**Solutions:**
1. Reduce resolution: `-scale=400:-1`
2. Lower FPS: `fps=10`
3. Reduce colours: `palettegen=max_colors=128`
4. Use lossy compression: `gifsicle --lossy=80`
5. Trim unnecessary frames
6. Use WebP instead of GIF

### Issue: Animation doesn't loop smoothly

**Solutions:**
- Ensure `-loop 0` flag is set
- Record exact loop duration (no partial cycles)
- Use seamless looping CSS animations
- Add delay at end matching beginning frame

### Issue: Colours look wrong

**Solutions:**
- Use palette generation (2-pass method)
- Use `stats_mode=diff` for better palette
- Increase colour count: `max_colors=256`
- Check input video colour space

---

## Automation Script Examples

### Bash wrapper for common task:

```bash
#!/bin/bash
# capture-animation.sh
# Usage: ./capture-animation.sh input.mp4 output-name

INPUT="$1"
OUTPUT="${2:-animation}"

# High quality GIF
ffmpeg -i "$INPUT" \
  -vf "fps=15,scale=800:-1:flags=lanczos,palettegen" \
  -y "${OUTPUT}_palette.png"

ffmpeg -i "$INPUT" -i "${OUTPUT}_palette.png" \
  -lavfi "fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  -loop 0 "${OUTPUT}.gif"

# WebP version
ffmpeg -i "$INPUT" \
  -c:v libwebp -q:v 80 \
  "${OUTPUT}.webp"

# Optimise GIF
if command -v gifsicle &> /dev/null; then
  gifsicle -O3 --lossy=80 -o "${OUTPUT}-optimised.gif" "${OUTPUT}.gif"
fi

# Clean up
rm "${OUTPUT}_palette.png"

echo "Created:"
ls -lh "${OUTPUT}"*
```

---

## Resources

- **FFmpeg documentation**: https://ffmpeg.org/ffmpeg.html
- **Puppeteer docs**: https://pptr.dev/
- **Playwright docs**: https://playwright.dev/
- **Gifsicle**: https://www.lcdf.org/gifsicle/
- **OBS Studio**: https://obsproject.com/

---

## Summary

**Best method for your needs:**

| Scenario | Recommended Method |
|----------|-------------------|
| Quick one-time capture | Screen recording + FFmpeg |
| Repeated captures | Puppeteer automation script |
| Multiple animations | Playwright batch script |
| Manual quality control | OBS Studio |
| Simple animations | Browser DevTools screenshots |
| Production-ready | Puppeteer + optimisation pipeline |

**Recommended workflow:**
1. Record with Puppeteer or screen recording
2. Convert to GIF with 2-pass FFmpeg
3. Optimise with gifsicle
4. Create WebP version for modern browsers
5. Serve both formats with `<picture>` tag

Good luck capturing your CSS animations! 🎬📸
