/*
 **********************************************************************
 * File       : scripts/footer.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects footer content into all pages to follow DRY principle
 *   Probably better to do all injections from a single javascript function
 *   but this is simpler for now
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer.footer');
    if (footer && footer.children.length === 0) {
        // Determine path prefix based on current page location
        // Check if we're in a subdirectory (pages, students, or mentors)
        const pathname = window.location.pathname;
        const pathPrefix = (pathname.includes('/pages/') || pathname.includes('/students/') || pathname.includes('/mentors/')) ? '../' : '';
        
        footer.innerHTML = `
        <div class="footer-minimal">
            <div class="footer-text">
                <p>&copy;&nbsp;The Embodied Mind, 2025</p>
            </div>
            <div class="footer-button">
                <button aria-label="Expand footer">
                    <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        <div class="footer-full">
            <div class="footer-text">
                <h2>Created by Edmund Mulligan, BSc, PgDip, CITP&nbsp;MBCS, GradStat&nbsp;FRSS</h2>
                <p>
                    &copy;&nbsp;The Embodied Mind, 2025.
                    MIT License. <a href="${pathPrefix}pages/license-and-credits.html">See the license page for more details</a>.
                </p>
            </div>
            <div class="footer-button">
                <button aria-label="Collapse footer">
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
            </div>

            <div class="footer-logo">
                <img 
                    id="embodied-mind-logo"
                    src="${pathPrefix}images/logo-embodied-mind-with-name-purple.png" 
                    alt="The Embodied Mind logo. A brain with a moustache winking"
                    data-light-logo="${pathPrefix}images/logo-embodied-mind-with-name-purple.png"
                    data-dark-logo="${pathPrefix}images/logo-embodied-mind-with-name-cyan.png"
                >
            </div>
        </div>
        `;
        
        // Dispatch custom event to signal footer is ready
        document.dispatchEvent(new Event('footerInjected'));
    }
});

