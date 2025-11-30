/**********************************************************************
 * File       : toggleSelection.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *     This scripts toggles the visibility of sections in a webpage.
 *     It adds event listeners to elements with the class 'magicVisible'.
 *     When clicked, it toggles the visibility of the corresponding 
 *     section and changes the class of the clicked element 
 *     'magicInvisible'.
 ***********************************************************************/

function toggleSection(elementId, event) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden');
        if (event.currentTarget.classList.contains('magicVisible')) {
            event.currentTarget.classList.remove('magicVisible');
            event.currentTarget.classList.add('magicInvisible');
        } else {
            event.currentTarget.classList.remove('magicInvisible');
            event.currentTarget.classList.add('magicVisible');
        }
    }
}