/*
 **********************************************************************
 * File       : data/footer.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This module defines the footer HTML template used across all pages
 **********************************************************************
 */

export default {
  html: `<div class="footer-minimal">
    <div class="footer-text"><p>&copy;&nbsp;The Embodied Mind, 2025-2026</p></div>
    <div class="footer-button"><button aria-label="Expand footer"><i class="fa-solid fa-chevron-up" aria-hidden="true"></i></button></div>
</div>

<div class="footer-full">
    <div class="footer-text">
        <h2>Created by Edmund Mulligan, BSc, PgDip, CITP&nbsp;MBCS, GradStat&nbsp;FRSS</h2>
        <p>
            &copy;&nbsp;The Embodied Mind, 2025-2026.
            MIT License. <a href="{{pathPrefix}}pages/license.html">See the license page for more details</a>.
            <a href="{{pathPrefix}}pages/privacy-policy.html">Privacy Policy</a>.
        </p>
    </div>
    <div class="footer-button"><button aria-label="Collapse footer"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button></div>
    <div class="footer-logo">
        <img 
            id="embodied-mind-logo"
            src="{{pathPrefix}}images/logos/logo-embodied-mind-normal-light.svg" 
            alt="The Embodied Mind logo. A brain with a moustache winking"
            data-normal-light-logo="{{pathPrefix}}images/logos/logo-embodied-mind-normal-light.svg"
            data-normal-dark-logo="{{pathPrefix}}images/logos/logo-embodied-mind-normal-dark.svg"
            data-subdued-light-logo="{{pathPrefix}}images/logos/logo-embodied-mind-subdued-light.svg"
            data-subdued-dark-logo="{{pathPrefix}}images/logos/logo-embodied-mind-subdued-dark.svg"
            data-vibrant-light-logo="{{pathPrefix}}images/logos/logo-embodied-mind-vibrant-light.svg"
            data-vibrant-dark-logo="{{pathPrefix}}images/logos/logo-embodied-mind-vibrant-dark.svg"
        >
    </div>
</div>`,
};
