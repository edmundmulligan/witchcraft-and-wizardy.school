/*
 **********************************************************************
 * File       : scripts/in-page-navigation-license-and-credits.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects in-page navigation content into license-and-credits page to follow DRY principle
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const navElements = document.querySelectorAll('nav.in-page-navigation');
    navElements.forEach(function(nav) {
        if (nav && nav.children.length === 0) {
            nav.innerHTML = `
                <ul>
                    <li>Jump to:</li>
                    <li><a href="#license">License</a></li>
                    <li><a href="#credits">Credits</a></li>
                </ul>
            `;
        }
    });
});
