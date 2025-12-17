/*
 **********************************************************************
 * File       : scripts/footer.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects footer content into all pages to follow DRY principle
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer.footer');
    if (footer && footer.children.length === 0) {
        footer.innerHTML = `
        <div class="footer-text">
            <h2>Created by Edmund Mulligan, BSc, PgDip, CITP&nbsp;MBCS, GradStat&nbsp;FRSS</h2>
            <p>
                &copy; The Embodied Mind, 2025.
                MIT License. <a href="/pages/license-and-credits.html">See the license page for more details</a>.
            </p>
        </div>

        <div class="footer-logo">
            <img src="/images/logo-embodied-mind-with-name-purple.png" alt="The Embodied Mind logo. A brain with a moustache winking">
        </div>
        `;
    }
});
