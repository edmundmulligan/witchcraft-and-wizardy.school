/*
 **********************************************************************
 * File       : data/header.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This module defines the header HTML template used across all pages
 **********************************************************************
 */

export default {
  html: `<div class="header-minimal">
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
        <div class="header-image header-image-wizard inline-header" role="img" aria-label="Wizard icon"></div>
        <div class="inline-header">
            <h1 class="site-title">Web Witchcraft and Wizardry</h1>
            <nav class="site-navigation" aria-label="Main navigation (compact)">
                <ul>
                    <li><a href="{{pathPrefix}}index.html">Home</a></li>
                    <li><a href="{{pathPrefix}}pages/start.html">Start</a></li>
                    <li><a href="{{pathPrefix}}pages/students.html">Students</a></li>
                    <li><a href="{{pathPrefix}}pages/mentors.html">Mentors</a></li>
                    <li><a href="{{pathPrefix}}pages/gallery.html">Galleries</a></li>
                    <li><a href="{{pathPrefix}}pages/facts.html">Facts</a></li>
                    <li><a href="{{pathPrefix}}pages/glossary.html">Glossary</a></li>
                    <li><a href="{{pathPrefix}}pages/faq.html">FAQ</a></li>
                    <li><a href="{{pathPrefix}}pages/feedback.html">Feedback</a></li>
                    <li><a href="{{pathPrefix}}pages/license.html">License</a></li>
                    <li><a href="{{pathPrefix}}pages/credits.html">Credits</a></li>
                </ul>
            </nav>
        </div>
        <div class="header-image header-image-witch inline-header" role="img" aria-label="Witch icon"></div>
        <div class="header-button">
            <button aria-label="Expand header">
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</div>

<div class="header-full">
    <div class="header-left">
        <div class="header-image header-image-wizard" role="img" aria-label="Wizard icon"></div>
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
            <nav class="site-navigation" aria-label="Main navigation">
                <ul>
                    <li><a href="{{pathPrefix}}index.html">Home</a></li>
                    <li><a href="{{pathPrefix}}pages/start.html">Start</a></li>
                    <li><a href="{{pathPrefix}}pages/students.html">Students</a></li>
                    <li><a href="{{pathPrefix}}pages/mentors.html">Mentors</a></li>
                    <li><a href="{{pathPrefix}}pages/gallery.html">Galleries</a></li>
                    <li><a href="{{pathPrefix}}pages/facts.html">Facts</a></li>
                    <li><a href="{{pathPrefix}}pages/glossary.html">Glossary</a></li>
                    <li><a href="{{pathPrefix}}pages/faq.html">FAQ</a></li>
                    <li><a href="{{pathPrefix}}pages/feedback.html">Feedback</a></li>
                    <li><a href="{{pathPrefix}}pages/license.html">License</a></li>
                    <li><a href="{{pathPrefix}}pages/credits.html">Credits</a></li>
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
        <div class="header-image header-image-witch" role="img" aria-label="Witch icon"></div>
    </div>
</div>`,
};
