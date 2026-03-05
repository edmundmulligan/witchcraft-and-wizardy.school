#!/usr/bin/env node

/**
 * File: verify-color-contrasts.js
 * Author: Edmund Mulligan <edmund@edmundmulligan.name>
 * License: MIT
 * Description: Reusable script to verify WCAG 2.2 color contrast compliance for theme colors
 * 
 * This script verifies color contrast ratios against WCAG 2.2 standards:
 * - AAA: ≥7:1 (enhanced contrast)
 * - AA:  ≥4.5:1 (minimum contrast for normal text)
 * - A:   ≥3:1 (large text only)
 * - FAIL: <3:1 (insufficient contrast)
 * 
 * Usage as CLI:
 *   node verify-color-contrasts.js [path/to/colours.css]
 *   
 *   If no path provided, defaults to ../web/styles/colours.css
 *   If file not found, uses hardcoded fallback values
 * 
 * Usage as module:
 *   const { verifyAllContrasts, calculateContrast } = require('./verify-color-contrasts.js');
 *   
 *   // Verify from CSS file
 *   verifyAllContrasts('path/to/colours.css');
 *   
 *   // Verify using defaults
 *   verifyAllContrasts();
 *   
 *   // Calculate single contrast ratio
 *   const ratio = calculateContrast([180, 100, 75], [0, 0, 0]);
 * 
 * CSS File Format:
 *   The script parses CSS files containing color variables in HSL format:
 *   --color-normal-light-button-background: hsl(180, 100%, 75%);
 *   --color-normal-light-code-text: hsl(from var(--color-medium-purple) h s 30%);
 *   
 *   Supports CSS Color Module Level 5 "from" syntax for color derivation
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Object} RGB values {r, g, b} (0-255)
 */
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Calculate relative luminance according to WCAG 2.2
 * @param {Object} rgb - RGB values {r, g, b} (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function relativeLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @param {Array} color1 - [h, s, l] HSL values
 * @param {Array} color2 - [h, s, l] HSL values
 * @returns {number} Contrast ratio (1-21)
 */
function calculateContrast(color1, color2) {
    const rgb1 = hslToRgb(...color1);
    const rgb2 = hslToRgb(...color2);
    
    const lum1 = relativeLuminance(rgb1);
    const lum2 = relativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get WCAG compliance level for a contrast ratio
 * @param {number} ratio - Contrast ratio
 * @returns {string} WCAG level indicator
 */
function getWCAGLevel(ratio) {
    if (ratio >= 7) return 'AAA ✓';
    if (ratio >= 4.5) return 'AA ✓';
    if (ratio >= 3) return 'A ⚠';
    return 'FAIL ✗';
}

/**
 * Get numeric WCAG level for a contrast ratio
 * @param {number} ratio - Contrast ratio
 * @returns {string} WCAG level name
 */
function getWCAGLevelName(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'A';
    return 'Fail';
}

/**
 * Check if contrast meets minimum requirement
 * @param {number} ratio - Contrast ratio
 * @param {string} requirement - 'AAA', 'AA', or 'A'
 * @returns {boolean} True if requirement is met
 */
function meetsRequirement(ratio, requirement = 'AA') {
    const thresholds = { AAA: 7, AA: 4.5, A: 3 };
    return ratio >= thresholds[requirement];
}

/**
 * Parse HSL color from CSS value
 * @param {string} cssValue - CSS color value (e.g., "hsl(180, 100%, 50%)" or "hsl(from hsl(180, 100%, 75%) h s l)")
 * @returns {Array|null} [h, s, l] values or null if not parseable
 */
function parseHSL(cssValue) {
    if (!cssValue) return null;
    
    // Check if this uses "from" syntax: hsl(from <color> h s l)
    // Supports both old comma-separated and new space-separated formats
    const fromRegex = /hsl\(\s*from\s+hsl\((\d+(?:\.\d+)?)(?:deg)?,?\s+(\d+(?:\.\d+)?)%?,?\s+(\d+(?:\.\d+)?)%?\)\s+([\dh]+)(?:,?\s+)?([\ds]+)%?(?:,?\s+)?([\dl]+)%?\s*\)/;
    const fromMatch = cssValue.match(fromRegex);
    
    if (fromMatch) {
        // Extract base color
        const baseH = parseFloat(fromMatch[1]);
        const baseS = parseFloat(fromMatch[2]);
        const baseL = parseFloat(fromMatch[3]);
        
        // Extract override values (can be 'h', 's', 'l' to keep original, or a number to override)
        const hVal = fromMatch[4] === 'h' ? baseH : parseFloat(fromMatch[4]);
        const sVal = fromMatch[5] === 's' ? baseS : parseFloat(fromMatch[5]);
        const lVal = fromMatch[6] === 'l' ? baseL : parseFloat(fromMatch[6]);
        
        return [hVal, sVal, lVal];
    }
    
    // Match standard hsl(...) pattern (both comma-separated and space-separated)
    // Supports: hsl(180, 100%, 50%) and hsl(180deg 100% 50%)
    const hslRegex = /hsl\((\d+(?:\.\d+)?)(?:deg)?,?\s+(\d+(?:\.\d+)?)%?,?\s+(\d+(?:\.\d+)?)%?\)/;
    const match = cssValue.match(hslRegex);
    
    if (match) {
        return [
            parseFloat(match[1]),
            parseFloat(match[2]),
            parseFloat(match[3])
        ];
    }
    
    return null;
}

/**
 * Parse CSS file and extract color variables
 * @param {string} cssFilePath - Path to CSS file
 * @returns {Object} Color variables keyed by name
 */
function parseCSSFile(cssFilePath) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const colors = {};
    
    // Extract all CSS variable definitions
    const varRegex = /--([a-z0-9-]+):\s*([^;]+);/gi;
    let match;
    
    while ((match = varRegex.exec(cssContent)) !== null) {
        const varName = match[1];
        const varValue = match[2].trim();
        colors[varName] = varValue;
    }
    
    return colors;
}

/**
 * Resolve CSS variable references
 * @param {string} value - CSS value (may contain var() references)
 * @param {Object} colors - All color variables
 * @returns {string} Resolved value
 */
function resolveCSSVar(value, colors) {
    if (!value) return value;
    
    // Handle var() references
    const varRefRegex = /var\(--([a-z0-9-]+)\)/gi;
    let resolved = value;
    let match;
    
    while ((match = varRefRegex.exec(resolved)) !== null) {
        const refName = match[1];
        if (colors[refName]) {
            resolved = resolved.replace(match[0], colors[refName]);
        }
    }
    
    return resolved;
}

/**
 * Extract color value with resolution of references
 * @param {Object} colors - All color variables
 * @param {string} varName - Variable name to extract
 * @returns {Array|null} [h, s, l] values or null
 */
function getColorValue(colors, varName) {
    const rawValue = colors[varName];
    if (!rawValue) return null;
    
    const resolved = resolveCSSVar(rawValue, colors);
    return parseHSL(resolved);
}

/**
 * Build theme definitions from parsed CSS
 * @param {Object} colors - All color variables from CSS
 * @returns {Array} Theme definitions
 */
function buildThemesFromCSS(colors) {
    const themeNames = [
        { name: 'Normal-Light', prefix: 'color-normal-light' },
        { name: 'Normal-Dark', prefix: 'color-normal-dark' },
        { name: 'Subdued-Light', prefix: 'color-subdued-light' },
        { name: 'Subdued-Dark', prefix: 'color-subdued-dark' },
        { name: 'Vibrant-Light', prefix: 'color-vibrant-light' },
        { name: 'Vibrant-Dark', prefix: 'color-vibrant-dark' }
    ];
    
    const themes = [];
    
    for (const { name, prefix } of themeNames) {
        const theme = {
            name,
            headings: {
                bg: getColorValue(colors, `${prefix}-headings-background`),
                text: getColorValue(colors, `${prefix}-headings-text`)
            },
            code: {
                bg: getColorValue(colors, `${prefix}-code-background`),
                text: getColorValue(colors, `${prefix}-code-text`)
            },
            buttons: [
                {
                    state: 'normal',
                    bg: getColorValue(colors, `${prefix}-button-background`),
                    text: getColorValue(colors, `${prefix}-button-text`)
                },
                {
                    state: 'hover',
                    bg: getColorValue(colors, `${prefix}-button-background-hover`),
                    text: getColorValue(colors, `${prefix}-button-text-hover`)
                },
                {
                    state: 'selected',
                    bg: getColorValue(colors, `${prefix}-button-background-selected`),
                    text: getColorValue(colors, `${prefix}-button-text-selected`)
                }
            ],
            links: [
                {
                    state: 'normal',
                    bg: getColorValue(colors, `${prefix}-link-background`),
                    text: getColorValue(colors, `${prefix}-link-text`)
                },
                {
                    state: 'hover',
                    bg: getColorValue(colors, `${prefix}-link-background-hover`),
                    text: getColorValue(colors, `${prefix}-link-text-hover`)
                },
                {
                    state: 'visited',
                    bg: getColorValue(colors, `${prefix}-link-background-visited`),
                    text: getColorValue(colors, `${prefix}-link-text-visited`)
                }
            ]
        };
        
        themes.push(theme);
    }
    
    return themes;
}

/**
 * Build non-theme color definitions from CSS
 * @param {Object} colors - All color variables from CSS
 * @returns {Object} Non-theme color definitions
 */
function buildNonThemeColorsFromCSS(colors) {
    return {
        warning: {
            bg: getColorValue(colors, 'color-warning-background'),
            text: getColorValue(colors, 'color-warning-text')
        },
        error: {
            bg: getColorValue(colors, 'color-error-background'),
            text: getColorValue(colors, 'color-error-text')
        }
    };
}

// Default theme definitions (used if no CSS file provided)
const defaultThemes = [
    {
        name: 'Normal-Light',
        headings: { bg: [180, 100, 40], text: [300, 100, 25] },
        code: { bg: [180, 100, 70], text: [271, 56, 30] },
        buttons: [
            { state: 'normal', bg: [180, 100, 75], text: [275, 100, 25] },
            { state: 'hover', bg: [180, 100, 55], text: [300, 100, 25] },
            { state: 'selected', bg: [180, 100, 18], text: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [180, 100, 16], text: [0, 0, 100] },
            { state: 'hover', bg: [180, 100, 10], text: [180, 100, 94] },
            { state: 'visited', bg: [300, 100, 16], text: [300, 100, 94] }
        ]
    },
    {
        name: 'Normal-Dark',
        headings: { bg: [300, 100, 25], text: [180, 100, 50] },
        code: { bg: [271, 56, 50], text: [0, 0, 100] },
        buttons: [
            { state: 'normal', bg: [180, 100, 75], text: [275, 100, 25] },
            { state: 'hover', bg: [180, 100, 55], text: [300, 100, 25] },
            { state: 'selected', bg: [180, 100, 18], text: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [300, 100, 16], text: [0, 0, 100] },
            { state: 'hover', bg: [300, 100, 10], text: [180, 100, 94] },
            { state: 'visited', bg: [300, 100, 16], text: [300, 100, 94] }
        ]
    },
    {
        name: 'Subdued-Light',
        headings: { bg: [0, 0, 75], text: [0, 0, 23] },
        code: { bg: [0, 0, 96], text: [0, 0, 17] },
        buttons: [
            { state: 'normal', bg: [0, 0, 54], text: [0, 0, 10] },
            { state: 'hover', bg: [0, 0, 40], text: [0, 0, 100] },
            { state: 'selected', bg: [0, 0, 18], text: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [0, 0, 16], text: [0, 0, 100] },
            { state: 'hover', bg: [0, 0, 10], text: [0, 0, 94] },
            { state: 'visited', bg: [0, 0, 16], text: [0, 0, 90] }
        ]
    },
    {
        name: 'Subdued-Dark',
        headings: { bg: [0, 0, 23], text: [0, 0, 94] },
        code: { bg: [0, 0, 17], text: [0, 0, 94] },
        buttons: [
            { state: 'normal', bg: [0, 0, 75], text: [0, 0, 10] },
            { state: 'hover', bg: [0, 0, 55], text: [0, 0, 10] },
            { state: 'selected', bg: [0, 0, 94], text: [0, 0, 0] }
        ],
        links: [
            { state: 'normal', bg: [0, 0, 30], text: [0, 0, 91] },
            { state: 'hover', bg: [0, 0, 40], text: [0, 0, 94] },
            { state: 'visited', bg: [0, 0, 30], text: [0, 0, 85] }
        ]
    },
    {
        name: 'Vibrant-Light',
        headings: { bg: [0, 100, 45], text: [0, 0, 100] },
        code: { bg: [60, 100, 50], text: [0, 0, 0] },
        buttons: [
            { state: 'normal', bg: [30, 100, 75], text: [0, 100, 30] },
            { state: 'hover', bg: [30, 100, 55], text: [300, 100, 20] },
            { state: 'selected', bg: [30, 100, 18], text: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [210, 100, 16], text: [0, 0, 100] },
            { state: 'hover', bg: [210, 100, 10], text: [60, 100, 94] },
            { state: 'visited', bg: [210, 100, 16], text: [300, 100, 94] }
        ]
    },
    {
        name: 'Vibrant-Dark',
        headings: { bg: [120, 100, 50], text: [0, 0, 0] },
        code: { bg: [270, 50, 20], text: [0, 0, 100] },
        buttons: [
            { state: 'normal', bg: [120, 100, 75], text: [120, 100, 15] },
            { state: 'hover', bg: [120, 100, 55], text: [180, 100, 15] },
            { state: 'selected', bg: [120, 100, 94], text: [0, 0, 0] }
        ],
        links: [
            { state: 'normal', bg: [300, 100, 30], text: [0, 0, 100] },
            { state: 'hover', bg: [300, 100, 40], text: [60, 100, 94] },
            { state: 'visited', bg: [300, 100, 30], text: [180, 100, 94] }
        ]
    }
];

// Default non-theme colors (used if no CSS file provided)
const defaultNonThemeColors = {
    warning: { bg: [0, 100, 27], text: [0, 0, 100] },
    error: { bg: [0, 100, 35], text: [0, 0, 100] }
};

/**
 * Format HSL color for display
 * @param {Array} color - [h, s, l] values
 * @returns {string} Formatted color string
 */
function formatColor(color) {
    return `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`;
}

/**
 * Verify all theme contrasts
 * @param {string} [cssFilePath] - Optional path to CSS file. If provided, colors will be parsed from the file.
 * @returns {Object} Verification results with counts
 */
function verifyAllContrasts(cssFilePath) {
    console.log('WCAG 2.2 Color Contrast Verification');
    console.log('=' .repeat(80));
    
    let themes = defaultThemes;
    let nonThemeColors = defaultNonThemeColors;
    
    // Parse CSS file if provided
    if (cssFilePath) {
        try {
            console.log(`Parsing colors from: ${cssFilePath}`);
            const colors = parseCSSFile(cssFilePath);
            themes = buildThemesFromCSS(colors);
            nonThemeColors = buildNonThemeColorsFromCSS(colors);
            console.log('✓ Successfully parsed CSS file');
        } catch (error) {
            console.warn(`⚠ Warning: Could not parse CSS file: ${error.message}`);
            console.warn('Using default hardcoded colors as fallback');
        }
    } else {
        console.log('Using default hardcoded colors');
    }
    
    console.log('=' .repeat(80));
    console.log('');
    
    let totalChecks = 0;
    let passedAAA = 0;
    let passedAA = 0;
    let passedA = 0;
    let failed = 0;
    
    // Check non-theme colors
    console.log('Non-Theme Colors:');
    console.log('-'.repeat(80));
    
    Object.entries(nonThemeColors).forEach(([name, colors]) => {
        const ratio = calculateContrast(colors.bg, colors.text);
        const level = getWCAGLevel(ratio);
        totalChecks++;
        
        if (ratio >= 7) passedAAA++;
        else if (ratio >= 4.5) passedAA++;
        else if (ratio >= 3) passedA++;
        else failed++;
        
        console.log(`${name.padEnd(20)}: ${ratio.toFixed(2)}:1 - ${level}`);
        console.log(`  bg: ${formatColor(colors.bg)}, text: ${formatColor(colors.text)}`);
    });
    
    console.log('');
    
    // Check each theme
    themes.forEach(theme => {
        console.log(`\n${theme.name} Theme:`);
        console.log('-'.repeat(80));
        
        // Check headings
        if (theme.headings) {
            const ratio = calculateContrast(theme.headings.bg, theme.headings.text);
            const level = getWCAGLevel(ratio);
            totalChecks++;
            
            if (ratio >= 7) passedAAA++;
            else if (ratio >= 4.5) passedAA++;
            else if (ratio >= 3) passedA++;
            else failed++;
            
            console.log(`Headings         : ${ratio.toFixed(2)}:1 - ${level}`);
        }
        
        // Check code blocks
        if (theme.code) {
            const ratio = calculateContrast(theme.code.bg, theme.code.text);
            const level = getWCAGLevel(ratio);
            totalChecks++;
            
            if (ratio >= 7) passedAAA++;
            else if (ratio >= 4.5) passedAA++;
            else if (ratio >= 3) passedA++;
            else failed++;
            
            console.log(`Code             : ${ratio.toFixed(2)}:1 - ${level}`);
        }
        
        // Check buttons
        console.log('\nButtons:');
        theme.buttons.forEach(btn => {
            const ratio = calculateContrast(btn.bg, btn.text);
            const level = getWCAGLevel(ratio);
            totalChecks++;
            
            if (ratio >= 7) passedAAA++;
            else if (ratio >= 4.5) passedAA++;
            else if (ratio >= 3) passedA++;
            else failed++;
            
            console.log(`  ${btn.state.padEnd(12)}: ${ratio.toFixed(2)}:1 - ${level}`);
        });
        
        // Check links
        console.log('\nLinks:');
        theme.links.forEach(link => {
            const ratio = calculateContrast(link.bg, link.text);
            const level = getWCAGLevel(ratio);
            totalChecks++;
            
            if (ratio >= 7) passedAAA++;
            else if (ratio >= 4.5) passedAA++;
            else if (ratio >= 3) passedA++;
            else failed++;
            
            console.log(`  ${link.state.padEnd(12)}: ${ratio.toFixed(2)}:1 - ${level}`);
        });
    });
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY:');
    console.log('-'.repeat(80));
    console.log(`Total checks:     ${totalChecks}`);
    console.log(`AAA (≥7:1):       ${passedAAA} (${((passedAAA / totalChecks) * 100).toFixed(1)}%)`);
    console.log(`AA (≥4.5:1):      ${passedAA} (${((passedAA / totalChecks) * 100).toFixed(1)}%)`);
    console.log(`A (≥3:1):         ${passedA} (${((passedA / totalChecks) * 100).toFixed(1)}%)`);
    console.log(`Failed (<3:1):    ${failed} (${((failed / totalChecks) * 100).toFixed(1)}%)`);
    console.log('-'.repeat(80));
    
    const allPass = failed === 0 && passedA === 0;
    if (allPass) {
        console.log('✓ All contrasts meet WCAG 2.2 AA compliance (4.5:1) or better');
    } else if (failed > 0) {
        console.log('✗ Some contrasts fail WCAG 2.2 compliance');
    } else {
        console.log('⚠ Some contrasts only meet A level (3:1) - should be AA minimum');
    }
    
    console.log('='.repeat(80));
    
    return { totalChecks, passedAAA, passedAA, passedA, failed };
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateContrast,
        getWCAGLevel,
        getWCAGLevelName,
        meetsRequirement,
        hslToRgb,
        relativeLuminance,
        formatColor,
        parseHSL,
        parseCSSFile,
        resolveCSSVar,
        getColorValue,
        buildThemesFromCSS,
        buildNonThemeColorsFromCSS,
        verifyAllContrasts
    };
}

// Run verification if called directly
if (require.main === module) {
    // Get CSS file path from command line arguments
    const cssFilePath = process.argv[2];
    
    // If no file path provided, use default path
    const defaultPath = path.join(__dirname, '../web/styles/colours.css');
    const fileToUse = cssFilePath || defaultPath;
    
    // Check if file exists
    if (fileToUse && fs.existsSync(fileToUse)) {
        verifyAllContrasts(fileToUse);
    } else if (cssFilePath) {
        console.error(`Error: CSS file not found: ${cssFilePath}`);
        console.log('Using default hardcoded colors');
        verifyAllContrasts();
    } else {
        // Default file doesn't exist, use hardcoded values
        verifyAllContrasts();
    }
}
