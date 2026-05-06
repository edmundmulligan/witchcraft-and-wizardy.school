#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/check-links-helper.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Helper script for checking broken links in HTML pages.
 *   Uses Playwright to load pages with JavaScript execution and validates 
 *   internal and external links from the fully-rendered DOM.
 **********************************************************************
 */

import { chromium } from 'playwright';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// Get arguments
const pageUrl = process.argv[2];
const urlPath = process.argv[3];
const resultFile = process.argv[4];

const pageResult = {
  url: urlPath,
  links: [],
  brokenCount: 0,
  totalCount: 0,
  timeoutCount: 0,
};

/**
 * Parse the target page using Playwright, collect eligible links from the rendered DOM,
 * validate them, and persist the page report.
 *
 * @remarks Preconditions:
 * - CLI arguments must provide `pageUrl`, `urlPath`, and `resultFile`.
 * - `resultFile` must point to a JSON document compatible with `finalise`.
 * - The target page must be reachable from the current environment.
 * - Playwright chromium browser must be installed.
 *
 * @returns {Promise<void>} Resolves after the page result has been finalised.
 */
async function main() {
  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Suppress console errors to avoid cluttering output
    page.on('console', () => {});
    page.on('pageerror', () => {});

    // Load page and wait for JavaScript to execute
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Wait for header navigation to be injected (indicates JavaScript has completed)
    // Use a shorter timeout since some pages might not have navigation
    try {
      await page.waitForSelector('header nav.site-navigation a', { timeout: 5000 });
    } catch (e) {
      // Navigation not found - page might not have it or JS failed
      // Wait a shorter time and proceed anyway
      await page.waitForTimeout(1000);
    }

    // Extract all links from the rendered page
    const links = await page.evaluate(() => {
      const results = [];
      
      // Find all elements with href or src attributes
      const elements = document.querySelectorAll('a[href], link[href], img[src], script[src]');
      
      elements.forEach((elem) => {
        const tagName = elem.tagName.toLowerCase();
        const attrName = tagName === 'img' || tagName === 'script' ? 'src' : 'href';
        let href = elem.getAttribute(attrName);

        if (!href) return;

        // Skip certain link types
        const rel = elem.getAttribute('rel');
        if (
          rel &&
          (rel.includes('preconnect') || rel.includes('dns-prefetch') || rel.includes('prefetch'))
        ) {
          return;
        }

        // Skip mailto, javascript, data URIs, and hash-only links
        if (
          href.startsWith('mailto:') ||
          href.startsWith('javascript:') ||
          href.startsWith('vbscript:') ||
          href.startsWith('data:') ||
          href === '#'
        ) {
          return;
        }

        // Get resolved absolute URL
        const fullUrl = elem.href || elem.src || href;

        results.push({
          href: href,
          fullUrl: fullUrl,
          tagName: tagName,
          attrName: attrName,
          text: elem.textContent ? elem.textContent.trim().substring(0, 50) : '',
        });
      });

      return results;
    });

    await browser.close();
    browser = null;

    pageResult.totalCount = links.length;

    // Check each link
    if (links.length === 0) {
      finalise();
      return;
    }

    let checked = 0;

    for (const link of links) {
      try {
        await checkLink(link);
      } catch (err) {
        // Treat timeouts as warnings, not errors
        if (err.message === 'Request timeout') {
          pageResult.timeoutCount++;
          pageResult.links.push({
            url: link.fullUrl,
            original: link.href,
            warning: 'timeout',
            tagName: link.tagName,
            text: link.text,
          });
        } else {
          pageResult.brokenCount++;
          pageResult.links.push({
            url: link.fullUrl,
            original: link.href,
            error: err.message,
            tagName: link.tagName,
            text: link.text,
          });
        }
      }

      checked++;
      if (checked === links.length) {
        finalise();
      }
    }
  } catch (err) {
    if (browser) {
      await browser.close();
    }
    console.error('Error:', err.message);
    process.exit(1);
  }
}

/**
 * Validate a single discovered link using a lightweight HEAD request.
 *
 * @remarks Preconditions:
 * - `link.fullUrl` must be an absolute HTTP or HTTPS URL.
 * - `pageResult` is mutated in place to accumulate failures for the current page.
 *
 * @param {{fullUrl: string, href: string, tagName: string, text: string}} link - Link descriptor extracted from the page.
 * @returns {Promise<void>} Promise resolving after the request completes or the failure is recorded.
 */
function checkLink(link) {
  return new Promise((resolve, reject) => {
    const linkUrl = link.fullUrl;
    let urlObj;

    try {
      urlObj = new URL(linkUrl);
    } catch (e) {
      reject(new Error('Invalid URL'));
      return;
    }

    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method: 'HEAD',
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      timeout: 5000,
    };

    const req = client.request(options, (res) => {
      // Skip 403 (Forbidden) as many sites block automated requests but work in browsers
      // Skip 429 (Too Many Requests) as this is rate limiting, not a broken link
      if (res.statusCode >= 400 && res.statusCode !== 403 && res.statusCode !== 429) {
        pageResult.brokenCount++;
        pageResult.links.push({
          url: linkUrl,
          original: link.href,
          statusCode: res.statusCode,
          tagName: link.tagName,
          text: link.text,
        });
      }
      resolve();
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Merge the current page result into the shared broken-link report and print a one-line summary.
 *
 * @remarks Preconditions:
 * - `resultFile` must already exist and contain a JSON object with `pages` and `summary` properties.
 * - `pageResult` must have been populated for the current page before this function runs.
 *
 * @returns {void}
 */
function finalise() {
  const combined = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  combined.pages.push(pageResult);
  combined.summary.totalLinks += pageResult.totalCount;
  combined.summary.brokenLinks += pageResult.brokenCount;
  if (!combined.summary.timeoutLinks) combined.summary.timeoutLinks = 0;
  combined.summary.timeoutLinks += pageResult.timeoutCount;

  fs.writeFileSync(resultFile, JSON.stringify(combined, null, 2));

  if (pageResult.brokenCount > 0) {
    console.log('  ❌ Found ' + pageResult.brokenCount + ' broken link(s)');
  } else {
    console.log('  ✅ All ' + pageResult.totalCount + ' links OK');
  }

  if (pageResult.timeoutCount > 0) {
    console.log('  ⚠️  ' + pageResult.timeoutCount + ' link(s) timed out');
  }
}

main();
