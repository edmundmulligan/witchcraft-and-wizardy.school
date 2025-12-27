/*
 **********************************************************************
 * File       : scripts/inject-popover-text.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects popover content to follow DRY principle
 *   Probably better to do all injections from a single javascript function
 *   but this is simpler for now
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const popover = document.getElementById('not-implemented');
    if (popover) {
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
});
