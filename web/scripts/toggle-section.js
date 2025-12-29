/*
 **********************************************************************
 * File       : scripts/toggle-section.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles toggle functionality for collapsible sections.
 *   It adds event listeners to elements with the class 'magicVisible'.
 *   When clicked, it toggles the visibility of the corresponding section 
 *   and changes the class of the clicked element.
 **********************************************************************
 */

function toggleSection(sectionId, event) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('hidden');
        if (event.currentTarget.classList.contains('magic-visible')) {
            event.currentTarget.classList.remove('magic-visible');
            event.currentTarget.classList.add('magic-invisible');
        } else {
            event.currentTarget.classList.remove('magic-invisible');
            event.currentTarget.classList.add('magic-visible');
        }
    }
}