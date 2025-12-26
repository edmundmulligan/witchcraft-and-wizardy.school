/*
 **********************************************************************
 * File       : scripts/header.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects header content into all pages to follow DRY principle
 *   Probably better to do all injections from a single javascript function
 *   but this is simpler for now
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header.header');
    if (header && header.children.length === 0) {
        // Determine path prefix based on current page location
        const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
        
        header.innerHTML = `
        <div class="header-left">
            <img class="header-image mirror" src="${pathPrefix}images/cat-1299082.svg" alt="" aria-hidden="true">
        </div>

        <div class="header-center">
            <div class="header-warning">
                <h2>Warning</h2>
                <p>
                    You are either vewing this website on a very small
                    device or have zoomed your browser window to a high level.
                </p>
                <p>
                    Some of the page content may not be displayed corectly.
                    For the best experience, please view this website
                    on a device with a wider screen or zoom your browser
                    window out to be wider.
                </p>
            </div>

            <div class="header-text">
                <h1 class="site-title">Web Witchcraft and Wizardry</h1>
                <h2 class="site-subtitle">Learn to create magical websites</h2>
                <nav class="site-navigation" aria-label="Site navigation">
                    <ul>
                        <li><a href="${pathPrefix}index.html">Home</a></li>
                        <li><a href="${pathPrefix}pages/students.html">Students</a></li>
                        <li><button popovertarget="not-implemented">Mentors</button></li>
                        <li><a href="${pathPrefix}pages/about.html">About</a></li>
                        <li><a href="${pathPrefix}pages/glossary-and-faq.html">Glossary</a></li>
                        <li><a href="${pathPrefix}pages/license-and-credits.html">License</a></li>
                    </ul>
                </nav>
            </div>
        </div>

        <div class="header-right">
          <img class="header-image" src="${pathPrefix}images/witch-151167.svg" alt="" aria-hidden="true">
        </div>
        `;
    }
});
