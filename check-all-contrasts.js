#!/usr/bin/env node

/*
 **********************************************************************
 * File       : check-all-contrasts.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Calculates and reports contrast ratios for configured theme pairs
 *   across project colour schemes.
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

function getWCAGLevel(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'A';
    return 'FAIL';
}

const themes = [
    {
        name: 'Normal-Light',
        buttons: [
            { state: 'normal', bg: [180, 100, 75], fg: [275, 100, 25] },
            { state: 'hover', bg: [180, 100, 55], fg: [300, 100, 25] },
            { state: 'selected', bg: [180, 100, 18], fg: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [180, 100, 16], fg: [0, 0, 100] },
            { state: 'hover', bg: [180, 100, 10], fg: [180, 100, 94] },
            { state: 'visited', bg: [180, 100, 16], fg: [300, 100, 94] }
        ]
    },
    {
        name: 'Normal-Dark',
        buttons: [
            { state: 'normal', bg: [180, 100, 75], fg: [275, 100, 25] },
            { state: 'hover', bg: [180, 100, 55], fg: [300, 100, 25] },
            { state: 'selected', bg: [180, 100, 18], fg: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [300, 100, 16], fg: [0, 0, 100] },
            { state: 'hover', bg: [300, 100, 10], fg: [180, 100, 94] },
            { state: 'visited', bg: [300, 100, 16], fg: [300, 100, 94] }
        ]
    },
    {
        name: 'Subdued-Light',
        buttons: [
            { state: 'normal', bg: [0, 0, 54], fg: [0, 0, 10] },
            { state: 'hover', bg: [0, 0, 40], fg: [0, 0, 100] },
            { state: 'selected', bg: [0, 0, 18], fg: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [0, 0, 16], fg: [0, 0, 100] },
            { state: 'hover', bg: [0, 0, 10], fg: [0, 0, 94] },
            { state: 'visited', bg: [0, 0, 16], fg: [0, 0, 90] }
        ]
    },
    {
        name: 'Subdued-Dark',
        buttons: [
            { state: 'normal', bg: [0, 0, 75], fg: [0, 0, 10] },
            { state: 'hover', bg: [0, 0, 55], fg: [0, 0, 10] },
            { state: 'selected', bg: [0, 0, 94], fg: [0, 0, 0] }
        ],
        links: [
            { state: 'normal', bg: [0, 0, 30], fg: [0, 0, 91] },
            { state: 'hover', bg: [0, 0, 40], fg: [0, 0, 94] },
            { state: 'visited', bg: [0, 0, 30], fg: [0, 0, 85] }
        ]
    },
    {
        name: 'Vibrant-Light',
        buttons: [
            { state: 'normal', bg: [30, 100, 75], fg: [0, 100, 30] },
            { state: 'hover', bg: [30, 100, 55], fg: [300, 100, 20] },
            { state: 'selected', bg: [30, 100, 18], fg: [0, 0, 100] }
        ],
        links: [
            { state: 'normal', bg: [210, 100, 16], fg: [0, 0, 100] },
            { state: 'hover', bg: [210, 100, 10], fg: [60, 100, 94] },
            { state: 'visited', bg: [210, 100, 16], fg: [300, 100, 94] }
        ]
    },
    {
        name: 'Vibrant-Dark',
        buttons: [
            { state: 'normal', bg: [120, 100, 75], fg: [120, 100, 15] },
            { state: 'hover', bg: [120, 100, 55], fg: [180, 100, 15] },
            { state: 'selected', bg: [120, 100, 94], fg: [0, 0, 0] }
        ],
        links: [
            { state: 'normal', bg: [300, 100, 30], fg: [0, 0, 100] },
            { state: 'hover', bg: [300, 100, 40], fg: [60, 100, 94] },
            { state: 'visited', bg: [300, 100, 30], fg: [180, 100, 94] }
        ]
    }
];

console.log('Checking all theme contrasts for WCAG compliance\n');
console.log('='.repeat(70));

let hasIssues = false;

themes.forEach(theme => {
    console.log(`\n${theme.name} Theme:`);
    console.log('-'.repeat(70));
    
    console.log('\nButtons:');
    theme.buttons.forEach(btn => {
        const ratio = calculateContrast(...btn.bg, ...btn.fg);
        const level = getWCAGLevel(ratio);
        const status = level === 'AAA' ? '✓' : level === 'AA' ? '⚠' : '✗';
        console.log(`  ${btn.state.padEnd(10)}: ${ratio.toFixed(2)}:1 - ${level} ${status}`);
        if (level === 'A' || level === 'FAIL') {
            hasIssues = true;
            console.log(`    ⚠️  NEEDS FIXING: hsl(${btn.bg.join(', ')}) bg / hsl(${btn.fg.join(', ')}) fg`);
        }
    });
    
    console.log('\nLinks:');
    theme.links.forEach(link => {
        const ratio = calculateContrast(...link.bg, ...link.fg);
        const level = getWCAGLevel(ratio);
        const status = level === 'AAA' ? '✓' : level === 'AA' ? '⚠' : '✗';
        console.log(`  ${link.state.padEnd(10)}: ${ratio.toFixed(2)}:1 - ${level} ${status}`);
        if (level === 'A' || level === 'FAIL') {
            hasIssues = true;
            console.log(`    ⚠️  NEEDS FIXING: hsl(${link.bg.join(', ')}) bg / hsl(${link.fg.join(', ')}) fg`);
        }
    });
});

console.log('\n' + '='.repeat(70));
if (hasIssues) {
    console.log('\n⚠️  Some contrasts need improvement to meet at least AA compliance');
} else {
    console.log('\n✓ All contrasts meet at least AA compliance (4.5:1)');
}
