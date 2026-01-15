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

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header.header');
    if (header && header.children.length === 0) {
        // Determine path prefix based on current page location
        // Check if we're in a subdirectory (pages, students, or mentors)
        const pathname = window.location.pathname;
        const pathPrefix = (pathname.includes('/pages/') || pathname.includes('/students/') || pathname.includes('/mentors/')) ? '../' : '';
        
        header.innerHTML = `
        <div class="header-minimal">
            <div class="header-text">
                <h1 class="site-title">Web Witchcraft and Wizardry</h1>
                <nav class="site-navigation" aria-label="Site navigation">
                    <ul>
                        <li><a href="${pathPrefix}index.html">Home</a></li>
                        <li><a href="${pathPrefix}pages/start.html">Start</a></li>
                        <li><a href="${pathPrefix}pages/students.html">Students</a></li>
                        <li><a href="${pathPrefix}pages/mentors.html">Mentors</a></li>
                        <li><a href="${pathPrefix}pages/gallery.html">Gallery</a></li>
                        <li><a href="${pathPrefix}pages/accessories.html">Accessories</a></li>
                        <li><a href="${pathPrefix}pages/facts.html">Facts</a></li>
                        <li><a href="${pathPrefix}pages/glossary.html">Glossary</a></li>
                        <li><a href="${pathPrefix}pages/faq.html">FAQ</a></li>
                        <li><a href="${pathPrefix}pages/license.html">License</a></li>
                        <li><a href="${pathPrefix}pages/credits.html">Credits</a></li>
                    </ul>
                </nav>

                <div class="header-button">
                    <button aria-label="Expand header">
                        <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="header-full">
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
                            <li><a href="${pathPrefix}pages/start.html">Start</a></li>
                            <li><a href="${pathPrefix}pages/students.html">Students</a></li>
                            <li><a href="${pathPrefix}pages/mentors.html">Mentors</a></li>
                            <li><a href="${pathPrefix}pages/gallery.html">Gallery</a></li>
                            <li><a href="${pathPrefix}pages/accessories.html">Accessories</a></li>
                            <li><a href="${pathPrefix}pages/facts.html">Facts</a></li>
                            <li><a href="${pathPrefix}pages/glossary.html">Glossary</a></li>
                            <li><a href="${pathPrefix}pages/faq.html">FAQ</a></li>
                            <li><a href="${pathPrefix}pages/license.html">License</a></li>
                            <li><a href="${pathPrefix}pages/credits.html">Credits</a></li>
                        </ul>
                    </nav>
                </div>
                <div class="header-button">
                    <button aria-label="Collapse header">
                        <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <div class="header-right">
              <img class="header-image" src="${pathPrefix}images/witch-151167.svg" alt="" aria-hidden="true">
            </div>
        </div>
        `;
        
        // Dispatch custom event to signal header is ready
        document.dispatchEvent(new Event('headerInjected'));
    }
});
