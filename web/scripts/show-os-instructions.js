/*
 **********************************************************************
 * File       : scripts/show-os-instructions.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Shows OS-specific instructions based on radio button selection
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', function() {
    const osRadios = document.querySelectorAll('input[name="os"]');
    
    if (osRadios.length === 0) {
        return; // Not on a page with OS selection
    }
    
    // Add change event listener to all OS radio buttons
    osRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all instruction divs
            const allInstructions = document.querySelectorAll('[id^="instructions-"]');
            allInstructions.forEach(div => {
                div.classList.remove('visible');
            });
            
            // Show the selected instruction div
            const selectedInstructions = document.getElementById(`instructions-${this.value}`);
            if (selectedInstructions) {
                selectedInstructions.classList.add('visible');
            }
        });
    });
});
