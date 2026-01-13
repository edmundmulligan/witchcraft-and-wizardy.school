#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/check-links-helper.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Helper script for checking broken links in HTML pages.
 *   Uses cheerio to parse HTML and validates internal and external links.
 **********************************************************************
 */

const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Get arguments
const pageUrl = process.argv[2];
const urlPath = process.argv[3];
const resultFile = process.argv[4];

const pageResult = {
  url: urlPath,
  links: [],
  brokenCount: 0,
  totalCount: 0
};

// Fetch HTML content with redirect handling
function fetchWithRedirects(url, maxRedirects = 5, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth >= maxRedirects) {
      reject(new Error('Too many redirects'));
      return;
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        fetchWithRedirects(redirectUrl, maxRedirects, depth + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      let html = '';
      res.on('data', (chunk) => { html += chunk; });
      res.on('end', () => resolve(html));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const html = await fetchWithRedirects(pageUrl);
    const $ = cheerio.load(html);
    const links = [];

    // Extract all links from various tags
    $('a[href], link[href], img[src], script[src]').each((i, elem) => {
      const tagName = elem.name;
      const attrName = tagName === 'img' || (tagName === 'script') ? 'src' : 'href';
      let href = $(elem).attr(attrName);

      if (!href) return;

      // Skip certain link types
      const rel = $(elem).attr('rel');
      if (rel && (rel.includes('preconnect') || rel.includes('dns-prefetch') || rel.includes('prefetch'))) {
        return;
      }

      // Skip mailto, javascript, data URIs, and hash-only links
      if (href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('data:') || href === '#') {
        return;
      }

      // Resolve relative URLs
      let fullUrl;
      try {
        fullUrl = new URL(href, pageUrl).href;
      } catch (e) {
        fullUrl = href;
      }

      links.push({
        href: href,
        fullUrl: fullUrl,
        tagName: tagName,
        attrName: attrName,
        text: $(elem).text().trim().substring(0, 50)
      });
    });

    pageResult.totalCount = links.length;

    // Check each link
    if (links.length === 0) {
      finalize();
      return;
    }

    let checked = 0;

    for (const link of links) {
      try {
        await checkLink(link);
      } catch (err) {
        pageResult.brokenCount++;
        pageResult.links.push({
          url: link.fullUrl,
          original: link.href,
          error: err.message,
          tagName: link.tagName,
          text: link.text
        });
      }

      checked++;
      if (checked === links.length) {
        finalize();
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

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
      timeout: 5000
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
          text: link.text
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

function finalize() {
  const combined = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  combined.pages.push(pageResult);
  combined.summary.totalLinks += pageResult.totalCount;
  combined.summary.brokenLinks += pageResult.brokenCount;

  fs.writeFileSync(resultFile, JSON.stringify(combined, null, 2));

  if (pageResult.brokenCount > 0) {
    console.log('  ❌ Found ' + pageResult.brokenCount + ' broken link(s)');
  } else {
    console.log('  ✅ All ' + pageResult.totalCount + ' links OK');
  }
}

main();
