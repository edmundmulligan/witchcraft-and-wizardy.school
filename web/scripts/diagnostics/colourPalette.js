/**************************************************************************************************
 * File: scripts/diagnostics/colourPalette.js
 * Author: Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright: (c) 2026 The Embodied Mind
 * License: MIT
 * Description: JavaScript for the colour palette preview page
 * - Handles colour conversion, contrast calculation, and display of results
 * - Reads CSS variables, including relative colour syntax, and computes contrast ratios
 * - Displays WCAG compliance levels and logs detailed information for debugging
 **************************************************************************************************/

/* eslint-env browser */
/* global getComputedStyle, document */

/**
 * ColourPalette class for managing colour conversion, contrast calculation, and display
 */
class ColourPalette {
    /**
     * Convert HSL to RGB
     * Adapted from https://www.w3.org/TR/css-color-4/#hsl-to-rgb
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {Array} [r, g, b] values (0-255)
     */
    hslToRgb(h, s, l) {
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
     * Adapted from https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
     * @param {Array} rgb - [r, g, b] values (0-255)
     * @returns {number} Relative luminance (0-1)
     */
    relativeLuminance(rgb) {
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
    * Calculate contrast ratio between two colours
     * Adapted from https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
     * @param {string} colour1 - HSL or RGB colour string
     * @param {string} colour2 - HSL or RGB colour string
     * @returns {number} Contrast ratio
     */
    calculateContrast(colour1, colour2) {
    // Convert RGB to HSL if needed
        if (colour1.startsWith('rgb(') || colour1.startsWith('rgb ')) {
            colour1 = this.rgbToHsl(colour1);
        }
        if (colour2.startsWith('rgb(') || colour2.startsWith('rgb ')) {
            colour2 = this.rgbToHsl(colour2);
        }
    
        // Normalise both colours to handle different HSL formats
        const normalised1 = this.normaliseHSL(colour1);
        const normalised2 = this.normaliseHSL(colour2);
    
        // More flexible regex that handles optional decimals and whitespace
        const hslRegex = /hsl\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*\)/;
    
        const match1 = normalised1.match(hslRegex);
        const match2 = normalised2.match(hslRegex);
    
        if (!match1 || !match2) {
            console.warn('Could not parse colours:', {
                original1: colour1,
                original2: colour2,
                normalised1: normalised1,
                normalised2: normalised2
            });
            return 0;
        }
        
        // Extract HSL values and convert to RGB
        const rgb1 = this.hslToRgb(parseFloat(match1[1]), parseFloat(match1[2]), parseFloat(match1[3]));
        const rgb2 = this.hslToRgb(parseFloat(match2[1]), parseFloat(match2[2]), parseFloat(match2[3]));
        
        // Calculate relative luminance for each colour
        const lum1 = this.relativeLuminance(rgb1);
        const lum2 = this.relativeLuminance(rgb2);
        
        // Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter colour
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Blend a foreground colour with a background colour at given opacity
     * @param {string} fgColour - Foreground HSL colour string
     * @param {string} bgColour - Background HSL colour string  
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} Blended HSL colour string
     */
    blendColours(fgColour, bgColour, opacity) {
        // Normalise both colours
        const normFg = this.normaliseHSL(fgColour);
        const normBg = this.normaliseHSL(bgColour);
        
        // Parse HSL values
        const hslRegex = /hsl\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*\)/;
        const matchFg = normFg.match(hslRegex);
        const matchBg = normBg.match(hslRegex);
        
        if (!matchFg || !matchBg) {
            console.warn('Could not parse colours for blending:', { fgColour, bgColour });
            return fgColour;
        }
        
        // Convert to RGB for blending
        const fgRgb = this.hslToRgb(parseFloat(matchFg[1]), parseFloat(matchFg[2]), parseFloat(matchFg[3]));
        const bgRgb = this.hslToRgb(parseFloat(matchBg[1]), parseFloat(matchBg[2]), parseFloat(matchBg[3]));
        
        // Blend RGB values: result = fg * opacity + bg * (1 - opacity)
        const blendedRgb = [
            Math.round(fgRgb[0] * opacity + bgRgb[0] * (1 - opacity)),
            Math.round(fgRgb[1] * opacity + bgRgb[1] * (1 - opacity)),
            Math.round(fgRgb[2] * opacity + bgRgb[2] * (1 - opacity))
        ];
        
        // Convert back to HSL
        return this.rgbToHsl(`rgb(${blendedRgb[0]}, ${blendedRgb[1]}, ${blendedRgb[2]})`);
    }

    /**
     * Determine WCAG compliance level
     * @param {number} ratio - Contrast ratio
     * @returns {string} WCAG level (AAA, AA, A, or Fail)
    */
    getWCAGLevel(ratio) {
        if (ratio >= 7) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        if (ratio >= 3) return 'A';
        return 'Fail';
    }

    /**
     * Parse RGB colour to HSL format
     * Adapted from https://www.w3.org/TR/css-color-4/#color-conversion-code
    * @param {string} rgbString - RGB colour string
    * @returns {string} HSL colour string
     */
    rgbToHsl(rgbString) {
        // Parse RGB values - handle multiple formats: rgb(255, 0, 0), rgb(255 0 0), rgba(255, 0, 0, 1)
        // Try comma-separated first
        let match = rgbString.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        // If that fails, try space-separated
        if (!match) {
            match = rgbString.match(/rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)/);
        }
        // If both fail, try mixed (shouldn't happen but be defensive)
        if (!match) {
            match = rgbString.match(/rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
        }
        
        if (!match) {
            console.warn('Could not parse RGB:', rgbString);
            return rgbString;
        }
    
        let r = parseInt(match[1]) / 255;
        let g = parseInt(match[2]) / 255;
        let b = parseInt(match[3]) / 255;
    
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
            switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
    
        // Use more precision for hue to avoid rounding errors
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
    
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /**
     * Parse relative colour syntax: hsl(from var(...) h s 18%)
     * @param {string} relativeColourString - String like "hsl(from var(...) h s 18%)" or "hsl(from hsl(...) h s 18%)"
     * @returns {string} Computed HSL string
     */
    parseRelativeColourSyntax(relativeColourString) {
        // Find "from" and extract the source and output values
        const fromIndex = relativeColourString.indexOf('from');
        if (fromIndex === -1) return null;
        
        // Extract everything after "from" and before the closing paren
        const afterFrom = relativeColourString.substring(fromIndex + 4).trim();
        
        // Find the end of the source colour (tracking nested parentheses)
        let parenDepth = 0;
        let sourceEnd = 0;
        for (let i = 0; i < afterFrom.length; i++) {
            if (afterFrom[i] === '(') parenDepth++;
            else if (afterFrom[i] === ')') {
                if (parenDepth === 0) break;
                parenDepth--;
            } else if (afterFrom[i] === ' ' && parenDepth === 0) {
                sourceEnd = i;
                break;
            }
        }
        
        if (sourceEnd === 0) {
            sourceEnd = afterFrom.indexOf(' ');
            if (sourceEnd === -1) sourceEnd = afterFrom.length;
        }
        
        let source = afterFrom.substring(0, sourceEnd).trim();
        const outputStr = afterFrom.substring(sourceEnd).trim();
        
        // Resolve var() references
        if (source.startsWith('var(')) {
            const varMatch = source.match(/var\(--([^)]+)\)/);
            if (varMatch) {
                const varName = '--' + varMatch[1];
                const resolvedValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                if (resolvedValue && !resolvedValue.startsWith('hsl(from')) {
                    source = resolvedValue;
                }
            }
        }
        
        // Parse the base colour
        const hslMatch = source.match(/hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d+(?:\.\d+)?)\s*%?\s*[,\s]?\s*(\d+(?:\.\d+)?)\s*%?\s*\)/i);
        
        if (!hslMatch) {
            console.warn('Could not parse base colour:', source);
            return null;
        }
        
        let baseH = parseFloat(hslMatch[1]);
        let baseS = parseFloat(hslMatch[2]);
        let baseL = parseFloat(hslMatch[3]);
        
        // Parse output values: h, s, l (or keyword or value)
        const parts = outputStr.split(/\s+/).filter(p => p);
        
        let h = baseH, s = baseS, l = baseL;
        
        for (let i = 0; i < Math.min(3, parts.length); i++) {
            const part = parts[i].toLowerCase();
            
            if (part === 'h') {
                // Keep base hue
            } else if (part === 's') {
                // Keep base saturation
            } else if (part === 'l') {
                // Keep base lightness
            } else if (part.endsWith('%')) {
                const val = parseFloat(part);
                if (i === 0) h = val;
                else if (i === 1) s = val;
                else if (i === 2) l = val;
            } else if (!isNaN(parseFloat(part))) {
                const val = parseFloat(part);
                if (i === 0) h = val;
                else if (i === 1) s = val;
                else if (i === 2) l = val;
            }
        }
        
        console.log(`[parseRelativeColour] "${relativeColourString}" -> hsl(${h}, ${s}%, ${l}%)`);
        
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /**
     * Get computed CSS variable value
     * @param {string} varName - CSS variable name (e.g., '--colour-warning-background')
     * @returns {string} Computed colour value in HSL format
     */
    getCSSVariableValue(varName) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    
        if (!value) {
            console.warn('No value found for CSS variable:', varName);
            return '';
        }
    
        // Check if it's a relative colour syntax that the browser didn't compute
        if (value.startsWith('hsl(from ') || value.startsWith('hsl( from ')) {
            const parsed = this.parseRelativeColourSyntax(value);
            if (parsed) {
                return parsed;
            }
            console.warn('Could not parse relative colour syntax:', value);
            return value;
        }
    
        // If the value is in RGB format (which browsers often return for computed styles), convert to HSL
        if (value.startsWith('rgb(') || value.startsWith('rgb ') || value.startsWith('rgba(')) {
            const hsl = this.rgbToHsl(value);
            return hsl;
        }
    
        return value;
    }

    /**
     * Normalise HSL colour string to standard format
     * @param {string} hslString - HSL colour string (may have 'deg' suffix) or RGB string
     * @returns {string} Normalised HSL string
     */
    normaliseHSL(hslString) {
        // If it's an RGB string, convert it first
        if (hslString.startsWith('rgb(') || hslString.startsWith('rgb ') || hslString.startsWith('rgba(')) {
            hslString = this.rgbToHsl(hslString);
        }
    
        // Match HSL patterns with or without 'deg' suffix
        // Handle various formats:
        // - hsl(275deg 100% 25%) - modern space-separated with deg
        // - hsl(275, 100%, 25%) - traditional comma-separated  
        // - hsl(275 100% 25%) - modern space-separated without deg
        // - hsla(275, 100%, 25%, 1) - with alpha
        
        // Try modern format first (with optional deg): hsl(180deg 100% 50%) or hsl(180 100% 50%)
        let match = hslString.match(/hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s+(\d+(?:\.\d+)?)\s*%\s+(\d+(?:\.\d+)?)\s*%/);
        
        // If that fails, try comma-separated format: hsl(180, 100%, 50%)
        if (!match) {
            match = hslString.match(/hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%/);
        }
        
        // If both fail, try the most permissive pattern (mixed separators - shouldn't happen)
        if (!match) {
            match = hslString.match(/hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d+(?:\.\d+)?)\s*%\s*[,\s]?\s*(\d+(?:\.\d+)?)\s*%/);
        }
        
        if (match) {
            // Convert to standardised comma-separated format
            return `hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`;
        }
    
        console.warn('Could not normalise HSL:', hslString);
        return hslString;
    }

    /**************************************************************
     * Remaining methods are specific to ColourPalette.html page
     * - initialiseColourValues: Reads CSS variables and updates the display
     * - initialiseContrastInfo: Calculates contrast ratios and updates the display
     * - initialise: Calls the above two methods to set up the page
      *************************************************************
     */
    
    /**
     * Initialise colour values from CSS variables
    */
    initialiseColourValues() {
        const colourValueDivs = document.querySelectorAll('.colour-value[data-var]');
    
        colourValueDivs.forEach(div => {
            const varName = div.getAttribute('data-var');
            if (varName) {
                const rawValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                const computedValue = this.getCSSVariableValue(varName);
                const normalisedValue = this.normaliseHSL(computedValue);
            
                // Debug: log the transformation when RGB is converted
                if (rawValue.startsWith('rgb')) {
                    console.log(`${varName}: ${rawValue} -> ${normalisedValue}`);
                }
            
                div.textContent = normalisedValue || computedValue;
            }
        });
    }

    /**
     * Initialise contrast information for all colour swatches
     */
    initialiseContrastInfo() {
        const contrastDivs = document.querySelectorAll('.contrast-info');
        
        console.log(`[ColourPalette] Initialising ${contrastDivs.length} contrast checks...`);
    
        contrastDivs.forEach((div, index) => {
        // Check if we have CSS variable references or direct colour value
            const bgVar = div.getAttribute('data-bg-var');
            const fgVar = div.getAttribute('data-fg-var');
            const pageVar = div.getAttribute('data-page-var');
            const opacity = parseFloat(div.getAttribute('data-opacity'));
        
            let bg = div.getAttribute('data-bg');
            let fg = div.getAttribute('data-fg');
            let page = div.getAttribute('data-page');
        
            // If CSS variables are specified, get their computed values
            if (bgVar) {
                bg = this.getCSSVariableValue(bgVar);
            }
            if (fgVar) {
                fg = this.getCSSVariableValue(fgVar);
            }
            if (pageVar) {
                page = this.getCSSVariableValue(pageVar);
            }
            
            // If opacity and page background are specified, blend the colours
            if (opacity && page && opacity < 1) {
                const normalisedPage = this.normaliseHSL(page);
                bg = this.blendColours(bg, normalisedPage, opacity);
                fg = this.blendColours(fg, normalisedPage, opacity);
                console.log(`[${index+1}] Blending with opacity ${opacity} on page background ${pageVar}`);
            }
        
            if (bg && fg) {
                const normalisedBg = this.normaliseHSL(bg);
                const normalisedFg = this.normaliseHSL(fg);
                const ratio = this.calculateContrast(normalisedBg, normalisedFg);
                const level = this.getWCAGLevel(ratio);
            
                // Log problematic cases
                if (level === 'Fail' || ratio === 0 || isNaN(ratio)) {
                    console.error(`[${index+1}] PROBLEM: ${bgVar} / ${fgVar}`, {
                        bgVar,
                        fgVar,
                        bgRaw: bg,
                        fgRaw: fg,
                        bgNormalised: normalisedBg,
                        fgNormalised: normalisedFg,
                        ratio: ratio,
                        level: level,
                        isNaN: isNaN(ratio),
                        isZero: ratio === 0
                    });
                } else {
                    console.log(`[${index+1}] OK: ${level} ${ratio.toFixed(2)}:1 - ${bgVar?.substring(8,50) || 'direct'}`);
                }
            
                if (ratio === 0 || isNaN(ratio)) {
                    div.innerHTML = `
                    <span class="wcag-badge" style="background-color: red; color: white; padding: 2px 8px; border-radius: 3px;">Error</span>
                    Could not calculate contrast
                `;
                } else {
                    const badgeColour = level === 'AAA' ? '#28a745' : level === 'AA' ? '#0d6efd' : level === 'A' ? '#ffc107' : '#dc3545';
                    let opacityNote = opacity && opacity < 1 ? ` <em>(at ${Math.round(opacity * 100)}% opacity)</em>` : '';
                    div.innerHTML = `
                    Contrast: <strong>${ratio.toFixed(2)}:1</strong>
                    <span class="wcag-badge" style="background-color: ${badgeColour}; color: white; padding: 2px 8px; border-radius: 3px; margin-left: 10px;">WCAG ${level}</span>${opacityNote}
                `;
                }
            } else {
                console.warn(`[${index+1}] Missing values:`, { bgVar, fgVar, hasBg: !!bg, hasFg: !!fg });
                div.innerHTML = `
                    <span class="wcag-badge" style="background-color: orange; color: white; padding: 2px 8px; border-radius: 3px;">Warning</span>
                    Missing colour value (bg:${!!bg}, fg:${!!fg})
                `;
            }
        });
        
        console.log('[ColourPalette] Contrast initialization complete');
    }

    /**
     * Initialise the colour palette display
     */
    initialise() {
        this.initialiseColourValues();
        this.initialiseContrastInfo();
    }
}

// Create singleton instance and initialise when DOM and CSS are loaded
const colourPalette = new ColourPalette();

/**
 * Initialise tab navigation for theme sections.
 */
function initialiseTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active state from all buttons and panels.
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Activate clicked button and its matching panel.
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(`tab-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function appendContentLinkCards() {
    const themePanels = [
        'normal-light',
        'normal-dark',
        'subdued-light',
        'subdued-dark',
        'vibrant-light',
        'vibrant-dark'
    ];

    themePanels.forEach(themeKey => {
        const panel = document.getElementById(`tab-${themeKey}`);
        const grid = panel ? panel.querySelector('.colour-grid') : null;

        if (!grid || grid.querySelector(`.content-link-card[data-theme-key="${themeKey}"]`)) {
            return;
        }

        const heading = themeKey
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

        const card = document.createElement('div');
        card.className = 'colour-card wide content-link-card';
        card.setAttribute('data-theme-key', themeKey);
        card.innerHTML = `
            <div class="colour-swatch" data-scheme="${themeKey}-page">
                <div class="card-title">Content Links ${heading} Theme</div>
                <div class="content-link-examples">
                    <a href="#" class="content-link-example" style="color: var(--colour-${themeKey}-link-text); background-color: var(--colour-${themeKey}-link-background);">Normal content link</a>
                    <a href="#" class="content-link-example" style="color: var(--colour-${themeKey}-link-text-hover); background-color: var(--colour-${themeKey}-link-background-hover);">Hover content link</a>
                    <a href="#" class="content-link-example" style="color: var(--colour-${themeKey}-link-text-visited); background-color: var(--colour-${themeKey}-link-background-visited);">Visited content link</a>
                </div>
                <div class="colour-name">Link Background: --colour-${themeKey}-link-background</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-background"></div>
                <div class="colour-name">Link Text: --colour-${themeKey}-link-text</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-text"></div>
                <div class="contrast-section-title">On page background</div>
                <div class="contrast-info" data-bg-var="--colour-${themeKey}-page-background" data-fg-var="--colour-${themeKey}-link-text"></div>
                <div class="contrast-section-title">On headings background</div>
                <div class="contrast-info" data-bg-var="--colour-${themeKey}-headings-background" data-fg-var="--colour-${themeKey}-link-text"></div>
                <div class="colour-name">Link Background Hover: --colour-${themeKey}-link-background-hover</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-background-hover"></div>
                <div class="colour-name">Link Text Hover: --colour-${themeKey}-link-text-hover</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-text-hover"></div>
                <div class="contrast-info" data-bg-var="--colour-${themeKey}-page-background" data-fg-var="--colour-${themeKey}-link-text-hover"></div>
                <div class="colour-name">Link Background Visited: --colour-${themeKey}-link-background-visited</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-background-visited"></div>
                <div class="colour-name">Link Text Visited: --colour-${themeKey}-link-text-visited</div>
                <div class="colour-value" data-var="--colour-${themeKey}-link-text-visited"></div>
                <div class="contrast-info" data-bg-var="--colour-${themeKey}-page-background" data-fg-var="--colour-${themeKey}-link-text-visited"></div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function initialiseWhenReady() {
    const MAX_RETRIES = 30;

    // Check multiple known variables from colours.css to confirm styles are ready.
    const rootStyles = getComputedStyle(document.documentElement);
    const cssReady = [
        '--colour-page-text',
        '--colour-warning-background',
        '--colour-normal-light-page-background'
    ].some(varName => rootStyles.getPropertyValue(varName).trim());

    if (cssReady) {
        appendContentLinkCards();
        colourPalette.initialise();
        return;
    }

    initialiseWhenReady.retryCount = (initialiseWhenReady.retryCount || 0) + 1;

    if (initialiseWhenReady.retryCount >= MAX_RETRIES) {
        console.warn('CSS variables not detected after retries; initialising anyway.');
        appendContentLinkCards();
        colourPalette.initialise();
        return;
    }

    console.warn(`CSS not loaded yet, retrying... (${initialiseWhenReady.retryCount}/${MAX_RETRIES})`);
    setTimeout(initialiseWhenReady, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initialiseTabNavigation();
        // Give CSS a moment to fully load
        setTimeout(initialiseWhenReady, 50);
    });
} else {
    // DOM already loaded
    initialiseTabNavigation();
    initialiseWhenReady();
}
