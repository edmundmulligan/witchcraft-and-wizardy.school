/**
 * File: colourPalette.js
 * Author: Edmund Mulligan <edmund@edmundmulligan.name>
 * License: MIT
 * Description: JavaScript for the colour palette preview page
 */

'use strict';

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Array} [r, g, b] values (0-255)
 */
function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculate relative luminance
 * @param {Array} rgb - [r, g, b] values (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - HSL color string
 * @param {string} color2 - HSL color string
 * @returns {number} Contrast ratio
 */
function calculateContrast(color1, color2) {
    const hslRegex = /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/;
    
    const match1 = color1.match(hslRegex);
    const match2 = color2.match(hslRegex);
    
    if (!match1 || !match2) return 0;
    
    const rgb1 = hslToRgb(parseFloat(match1[1]), parseFloat(match1[2]), parseFloat(match1[3]));
    const rgb2 = hslToRgb(parseFloat(match2[1]), parseFloat(match2[2]), parseFloat(match2[3]));
    
    const lum1 = relativeLuminance(rgb1);
    const lum2 = relativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level
 * @param {number} ratio - Contrast ratio
 * @returns {string} WCAG level (AAA, AA, A, or Fail)
 */
function getWCAGLevel(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'A';
    return 'Fail';
}

/**
 * Initialize contrast information for all color swatches
 */
function initializeContrastInfo() {
    const contrastDivs = document.querySelectorAll('.contrast-info');
    
    contrastDivs.forEach(div => {
        const bg = div.getAttribute('data-bg');
        const fg = div.getAttribute('data-fg');
        
        if (bg && fg) {
            const ratio = calculateContrast(bg, fg);
            const level = getWCAGLevel(ratio);
            
            div.innerHTML = `
                Contrast: ${ratio.toFixed(2)}:1
                <span class="wcag-badge">WCAG ${level}</span>
            `;
        }
    });
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContrastInfo);
} else {
    initializeContrastInfo();
}
