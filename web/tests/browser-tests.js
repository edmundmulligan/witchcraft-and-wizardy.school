#!/usr/bin/env node

/*
 **********************************************************************
 * File       : web/tests/browser-tests.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Application-specific browser tests for Web Witchcraft and Wizardry.
 *   Defines the test suite to be executed by the browser test runner.
 **********************************************************************
 */

/**
 * Define all pages to test
 */
const pages = [
  { url: '/index.html', name: 'Home' },
  { url: '/pages/about.html', name: 'About' },
  { url: '/pages/students.html', name: 'Students' },
  { url: '/pages/glossary-and-faq.html', name: 'Glossary & FAQ' },
  { url: '/pages/license-and-credits.html', name: 'License & Credits' }
];

/**
 * Define tests to run on each page
 * Each test should return { name, status, error? }
 */
async function runPageTests(page, pageInfo) {
  const tests = [];

  // Test 1: Check page title
  const title = await page.title();
  if (title.includes('Web Witchcraft and Wizardry')) {
    console.log(`     ✅ ${pageInfo.name} page title correct`);
    tests.push({ name: `${pageInfo.name} page title`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} title incorrect: ${title}`);
  }

  // Test 2: Check navigation links
  const navLinks = await page.$$('nav a');
  if (navLinks.length >= 4) {
    console.log(`     ✅ ${pageInfo.name} page navigation links present`);
    tests.push({ name: `${pageInfo.name} navigation links`, status: 'passed' });
  } else {
    throw new Error(`Expected at least 4 nav links on ${pageInfo.name}, found ${navLinks.length}`);
  }

  // Test 3: Check JavaScript execution - header/footer should be injected
  const headerContent = await page.$$('header *');
  if (headerContent.length > 0) {
    console.log(`     ✅ ${pageInfo.name} JavaScript executed (header injected)`);
    tests.push({ name: `${pageInfo.name} JavaScript execution`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} header not injected - JavaScript may have failed`);
  }

  // Test 4: Check CSS Grid support - header child div should use grid layout (or flex on mobile)
  const headerChildDisplay = await page.$eval('header > div', el => window.getComputedStyle(el).display);
  if (headerChildDisplay === 'grid' || headerChildDisplay === 'flex' || headerChildDisplay === 'none') {
    console.log(`     ✅ ${pageInfo.name} CSS Grid/Flexbox layout working (${headerChildDisplay})`);
    tests.push({ name: `${pageInfo.name} CSS Grid`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} CSS Grid/Flex not working: display is ${headerChildDisplay}`);
  }

  // Test 5: Check CSS Flexbox support - navigation should use flex
  const navDisplay = await page.$eval('nav.site-navigation ul', el => window.getComputedStyle(el).display);
  if (navDisplay === 'flex') {
    console.log(`     ✅ ${pageInfo.name} CSS Flexbox supported`);
    tests.push({ name: `${pageInfo.name} CSS Flexbox`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} CSS Flexbox not working: display is ${navDisplay}`);
  }

  // Test 6: Check CSS Variables support - check if custom property is applied
  const bgColor = await page.$eval('body', el => window.getComputedStyle(el).backgroundColor);
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    console.log(`     ✅ ${pageInfo.name} CSS Variables supported`);
    tests.push({ name: `${pageInfo.name} CSS Variables`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} CSS Variables not applied correctly`);
  }

  // Test 7: Check SVG support - header images should be present
  const svgImages = await page.$$('header img[src*=".svg"]');
  if (svgImages.length >= 2) {
    console.log(`     ✅ ${pageInfo.name} SVG images loaded`);
    tests.push({ name: `${pageInfo.name} SVG support`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} SVG images not found: expected 2, found ${svgImages.length}`);
  }

  // Test 8: Check responsive design - verify viewport meta tag
  const viewportMeta = await page.$$('meta[name="viewport"]');
  if (viewportMeta.length > 0) {
    console.log(`     ✅ ${pageInfo.name} viewport meta tag present`);
    tests.push({ name: `${pageInfo.name} responsive viewport`, status: 'passed' });
  } else {
    throw new Error(`${pageInfo.name} viewport meta tag missing`);
  }

  // Test 9: Check CSS calc() support - page title uses calc() for max-width
  const pageTitles = await page.$$('.page-title');
  if (pageTitles.length > 0) {
    const titleMaxWidth = await page.$eval('.page-title', el => window.getComputedStyle(el).maxWidth);
    if (titleMaxWidth && titleMaxWidth !== 'none') {
      console.log(`     ✅ ${pageInfo.name} CSS calc() supported`);
      tests.push({ name: `${pageInfo.name} CSS calc()`, status: 'passed' });
    }
  }

  // Test 10: Check font loading - verify fonts are rendered
  const siteTitles = await page.$$('.site-title');
  if (siteTitles.length > 0) {
    const fontFamily = await page.$eval('.site-title', el => window.getComputedStyle(el).fontFamily);
    if (fontFamily && fontFamily !== '') {
      console.log(`     ✅ ${pageInfo.name} fonts loaded`);
      tests.push({ name: `${pageInfo.name} font rendering`, status: 'passed' });
    }
  }

  return tests;
}

module.exports = {
  pages,
  runPageTests
};
