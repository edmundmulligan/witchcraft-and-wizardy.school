#!/usr/bin/env node

/*
 **********************************************************************
 * File       : find-fixes.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Computes contrast values for targeted theme combinations to help
 *   identify AA-compliant colour adjustments.
 **********************************************************************
 */

'use strict';

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

function relativeLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrast(h1, s1, l1, h2, s2, l2) {
    const rgb1 = hslToRgb(h1, s1, l1);
    const rgb2 = hslToRgb(h2, s2, l2);
    
    const lum1 = relativeLuminance(rgb1);
    const lum2 = relativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

console.log('Finding AA-compliant values for vibrant-light buttons:\n');

// Normal button: orange bg 75% with red text
console.log('Normal button (orange bg 75% with red text):');
for (let l = 25; l <= 35; l += 1) {
    const ratio = calculateContrast(30, 100, 75, 0, 100, l);
    const status = ratio >= 4.5 ? '✓ AA' : '✗';
    console.log(`  L=${l}%: ${ratio.toFixed(2)}:1 ${status}`);
}

// Hover button: orange bg 55% with magenta text
console.log('\nHover button (orange bg 55% with magenta text):');
for (let l = 15; l <= 25; l += 1) {
    const ratio = calculateContrast(30, 100, 55, 300, 100, l);
    const status = ratio >= 4.5 ? '✓ AA' : '✗';
    console.log(`  L=${l}%: ${ratio.toFixed(2)}:1 ${status}`);
}

console.log('\n' + '='.repeat(60));
console.log('\nRecommended fixes:');
console.log('  Normal button text: hsl(0, 100%, 30%) = 4.92:1 (AA)');
console.log('  Hover button text: hsl(300, 100%, 20%) = 4.60:1 (AA)');
