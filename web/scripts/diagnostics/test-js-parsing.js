/*
 **********************************************************************
 * File       : test-js-parsing.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Test suite for JavaScript colour parsing utilities
 **********************************************************************
 */

/* global ColourPalette */

const results = document.getElementById('results');
const palette = new ColourPalette();

function test(name, input1, input2OrFn, maybeFn) {
    // Handle both 3 and 4 parameter calls
    let fn, input2;
    if (typeof input2OrFn === 'function') {
        // 3 params: test(name, input, fn)
        fn = input2OrFn;
        input2 = null;
    } else {
        // 4 params: test(name, input1, input2, fn)
        input2 = input2OrFn;
        fn = maybeFn;
    }

    try {
        const result = fn();
        const pass = result.pass;
        const inputDisplay = input2 ?
            `Background: ${input1}<br>Foreground: ${input2}` :
            `Input: ${input1}`;
        results.innerHTML += `
            <div class="test ${pass ? 'pass' : 'fail'}">
                <strong>${pass ? '✓' : '✗'} ${name}</strong><br>
                ${inputDisplay}<br>
                ${result.message || ''}
            </div>
        `;
    } catch (e) {
        const inputDisplay = input2 ?
            `Background: ${input1}<br>Foreground: ${input2}` :
            `Input: ${input1}`;
        results.innerHTML += `
            <div class="test fail">
                <strong>✗ ${name}</strong><br>
                ${inputDisplay}<br>
                Error: ${e.message}
            </div>
        `;
    }
}

// Test RGB to HSL conversion
test('RGB with commas to HSL', 'rgb(0, 92, 92)', () => {
    const input = 'rgb(0, 92, 92)';
    const result = palette.rgbToHsl(input);
    const expected = 'hsl(180, 100%, 18%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

test('RGB with spaces to HSL', 'rgb(0 92 92)', () => {
    const input = 'rgb(0 92 92)';
    const result = palette.rgbToHsl(input);
    const expected = 'hsl(180, 100%, 18%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

test('RGBA to HSL', 'rgba(255, 255, 255, 1)', () => {
    const input = 'rgba(255, 255, 255, 1)';
    const result = palette.rgbToHsl(input);
    const expected = 'hsl(0, 0%, 100%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

// Test HSL normalization
test('Normalise HSL with deg', 'hsl(180deg 100% 18%)', () => {
    const input = 'hsl(180deg 100% 18%)';
    const result = palette.normaliseHSL(input);
    const expected = 'hsl(180, 100%, 18%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

test('Normalise HSL with commas', 'hsl(180, 100%, 18%)', () => {
    const input = 'hsl(180, 100%, 18%)';
    const result = palette.normaliseHSL(input);
    const expected = 'hsl(180, 100%, 18%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

test('Normalise RGB string', 'rgb(0, 92, 92)', () => {
    const input = 'rgb(0, 92, 92)';
    const result = palette.normaliseHSL(input);
    const expected = 'hsl(180, 100%, 18%)';
    return {
        pass: result === expected,
        message: `Expected: ${expected}<br>Got: ${result}`
    };
});

// Test contrast calculation
test('Contrast ratio calculation', 'hsl(180, 100%, 18%)', 'hsl(0, 0%, 100%)', () => {
    const bg = 'hsl(180, 100%, 18%)';
    const fg = 'hsl(0, 0%, 100%)';
    const ratio = palette.calculateContrast(bg, fg);
    const expected = 7.82;
    const pass = Math.abs(ratio - expected) < 0.1;
    return {
        pass: pass,
        message: `Expected: ~${expected}:1<br>Got: ${ratio.toFixed(2)}:1`
    };
});

test('Contrast with RGB input', 'rgb(0, 92, 92)', 'rgb(255, 255, 255)', () => {
    const bg = 'rgb(0, 92, 92)';
    const fg = 'rgb(255, 255, 255)';
    const ratio = palette.calculateContrast(bg, fg);
    const expected = 7.82;
    const pass = Math.abs(ratio - expected) < 0.1;
    return {
        pass: pass,
        message: `Expected: ~${expected}:1<br>Got: ${ratio.toFixed(2)}:1`
    };
});

test('WCAG level for 7.82:1', 7.82, () => {
    const level = palette.getWCAGLevel(7.82);
    const expected = 'AAA';
    return {
        pass: level === expected,
        message: `Expected: ${expected}<br>Got: ${level}`
    };
});

test('WCAG level for 4.5:1', 4.5, () => {
    const level = palette.getWCAGLevel(4.5);
    const expected = 'AA';
    return {
        pass: level === expected,
        message: `Expected: ${expected}<br>Got: ${level}`
    };
});
