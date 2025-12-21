/*
 **********************************************************************
 * File       : scripts/inject-popover-text.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects popover content to follow DRY principle
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const popover = document.getElementById('not-implemented');
    if (popover) {
        popover.innerHTML = `
           <h2>Alert</h2>
            <p>
                This feature has not been implemented in this phase of the project, as 
                described in the essay Incorporating usability and user experience into 
                the Web Witchcraft and Wizardry project (Mulligan, 2025).
            </p>
            <button popovertarget="not-implemented" popovertargetaction="hide">
                Close
            </button>
        `;
    }
});
