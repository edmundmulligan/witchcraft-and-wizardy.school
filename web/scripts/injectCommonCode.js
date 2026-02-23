/*
 **********************************************************************
 * File       : scripts/injectCommonCode.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects header, footer, and not-implemented content into all pages
 *   to follow DRY principle
 **********************************************************************
 */

/* global Event, Debug */

(function() {
    'use strict';

    /**
     * Class for injecting common code elements (header, footer, popovers)
     */
    class CommonCodeInjector {
        constructor() {
            Debug.log('CommonCodeInjector: Initializing...');
            this.pathPrefix = this.determinePathPrefix();
            Debug.log('Path prefix determined:', this.pathPrefix);
        }

        /**
         * Determine path prefix based on current page location
         * @returns {string} Path prefix for resources
         */
        determinePathPrefix() {
            const pathname = window.location.pathname;
            return (pathname.includes('/pages/') || pathname.includes('/students/') || pathname.includes('/mentors/')) ? '../' : '';
        }

        /**
         * Inject header HTML into the page
         */
        injectHeader() {
            Debug.log('injectHeader: Starting header injection');
            const header = document.querySelector('header.header');
            if (!header || header.children.length > 0) {
                Debug.log('injectHeader: Header already exists or element not found');
                return;
            }

            Debug.log('injectHeader: Injecting header HTML');
            header.innerHTML = `
<div class="header-minimal">
    <div class="header-text">
        <img class="header-image mirror inline-header" src="${this.pathPrefix}images/cat-1299082.svg" alt="" aria-hidden="true">
        <div class="inline-header">
            <h1 class="site-title">Web Witchcraft and Wizardry</h1>
            <nav class="site-navigation" aria-label="Site navigation">
                <ul>
                    <li><a href="${this.pathPrefix}index.html">Home</a></li>
                    <li><a href="${this.pathPrefix}pages/start.html">Start</a></li>
                    <li><a href="${this.pathPrefix}pages/students.html">Students</a></li>
                    <li><a href="${this.pathPrefix}pages/mentors.html">Mentors</a></li>
                    <li><a href="${this.pathPrefix}pages/gallery.html">Gallery</a></li>
                    <li><a href="${this.pathPrefix}pages/accessories.html">Accessories</a></li>
                    <li><a href="${this.pathPrefix}pages/facts.html">Facts</a></li>
                    <li><a href="${this.pathPrefix}pages/glossary.html">Glossary</a></li>
                    <li><a href="${this.pathPrefix}pages/faq.html">FAQ</a></li>
                    <li><a href="${this.pathPrefix}pages/license.html">License</a></li>
                    <li><a href="${this.pathPrefix}pages/credits.html">Credits</a></li>
                </ul>
            </nav>
        </div>
        <img class="header-image inline-header" src="${this.pathPrefix}images/witch-151167.svg" alt="" aria-hidden="true">
        <div class="header-button">
            <button aria-label="Expand header">
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</div>

<div class="header-full">
    <div class="header-left">
        <img class="header-image mirror" src="${this.pathPrefix}images/cat-1299082.svg" alt="" aria-hidden="true">
    </div>

    <div class="header-center">
        <div class="header-warning">
            <h2>Warning</h2>
            <p>
                You are either viewing this website on a very small device or have zoomed your browser window to a high level.
            </p>
            <p>
                Some of the page content may not be displayed correctly. For the best experience, please view this website on a device with a wider screen or zoom your browser window out to be wider.
            </p>
        </div>

        <div class="header-text">
            <h1 class="site-title">Web Witchcraft and Wizardry</h1>
            <h2 class="site-subtitle">Learn to create magical websites</h2>
            <nav class="site-navigation" aria-label="Site navigation">
                <ul>
                    <li><a href="${this.pathPrefix}index.html">Home</a></li>
                    <li><a href="${this.pathPrefix}pages/start.html">Start</a></li>
                    <li><a href="${this.pathPrefix}pages/students.html">Students</a></li>
                    <li><a href="${this.pathPrefix}pages/mentors.html">Mentors</a></li>
                    <li><a href="${this.pathPrefix}pages/gallery.html">Gallery</a></li>
                    <li><a href="${this.pathPrefix}pages/accessories.html">Accessories</a></li>
                    <li><a href="${this.pathPrefix}pages/facts.html">Facts</a></li>
                    <li><a href="${this.pathPrefix}pages/glossary.html">Glossary</a></li>
                    <li><a href="${this.pathPrefix}pages/faq.html">FAQ</a></li>
                    <li><a href="${this.pathPrefix}pages/license.html">License</a></li>
                    <li><a href="${this.pathPrefix}pages/credits.html">Credits</a></li>
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
        <img class="header-image" src="${this.pathPrefix}images/witch-151167.svg" alt="" aria-hidden="true">
    </div>
</div>
        `;
        
            // Dispatch custom event to signal header is ready
            document.dispatchEvent(new Event('headerInjected'));
        }

        /**
         * Inject footer HTML into the page
         */
        injectFooter() {
            const footer = document.querySelector('footer.footer');
            if (!footer || footer.children.length > 0) {
                return;
            }

            footer.innerHTML = `
<div class="footer-minimal">
    <div class="footer-text"><p>&copy;&nbsp;The Embodied Mind, 2025-2026</p></div>
    <div class="footer-button"><button aria-label="Expand footer"><i class="fa-solid fa-chevron-up" aria-hidden="true"></i></button></div>
</div>

<div class="footer-full">
    <div class="footer-text">
        <h2>Created by Edmund Mulligan, BSc, PgDip, CITP&nbsp;MBCS, GradStat&nbsp;FRSS</h2>
        <p>
            &copy;&nbsp;The Embodied Mind, 2025-2026.
            MIT License. <a href="${this.pathPrefix}pages/license.html">See the license page for more details</a>.
        </p>
    </div>
    <div class="footer-button"><button aria-label="Collapse footer"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button></div>
    <div class="footer-logo">
        <img 
            id="embodied-mind-logo"
            src="${this.pathPrefix}images/logo-embodied-mind-with-name-purple.png" 
            alt="The Embodied Mind logo. A brain with a moustache winking"
            data-light-logo="${this.pathPrefix}images/logo-embodied-mind-with-name-purple.png"
            data-dark-logo="${this.pathPrefix}images/logo-embodied-mind-with-name-cyan.png"
        >
    </div>
</div>
`;

            // Dispatch custom event to signal footer is ready
            document.dispatchEvent(new Event('footerInjected'));
        }

        /**
         * Inject popover content for not-implemented feature
         */
        injectPopover() {
            const popover = document.getElementById('not-implemented');
            if (!popover) {
                return;
            }

            popover.innerHTML = `
                <h2>Under Construction</h2>
                <p>
                    This feature has not been implemented yet&nbsp;&mdash;&nbsp;please
                    check back later!
                </p>
                <button popovertarget="not-implemented" popovertargetaction="hide">
                    Close
                </button>
            `;
        }

        /**
         * Initialize and inject all common code elements
         */
        init() {
            this.injectHeader();
            this.injectFooter();
            this.injectPopover();
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        const injector = new CommonCodeInjector();
        injector.init();
    });
})();
