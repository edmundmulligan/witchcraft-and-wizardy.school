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

(function() {
    'use strict';

    /**
     * Class for showing OS-specific instructions based on radio button selection
     */
    class OSInstructionSwitcher {
        constructor() {
            this.osRadios = null;
        }

        /**
         * Hide all instruction divs
         */
        hideAllInstructions() {
            const allInstructions = document.querySelectorAll('[id^="instructions-"]');
            allInstructions.forEach(div => {
                div.classList.remove('visible');
            });
        }

        /**
         * Show instructions for a specific OS
         * @param {string} osValue - The OS value (e.g., 'windows', 'macos', 'linux')
         */
        showInstructions(osValue) {
            this.hideAllInstructions();
            
            const selectedInstructions = document.getElementById(`instructions-${osValue}`);
            if (selectedInstructions) {
                selectedInstructions.classList.add('visible');
            }
        }

        /**
         * Set up event listeners for OS radio buttons
         */
        setupListeners() {
            this.osRadios = document.querySelectorAll('input[name="os"]');
        
            if (this.osRadios.length === 0) {
                return; // Not on a page with OS selection
            }
        
            // Add change event listener to all OS radio buttons
            this.osRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.showInstructions(radio.value);
                });
            });
        }

        /**
         * Initialize the OS instruction switcher
         */
        init() {
            this.setupListeners();
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        const switcher = new OSInstructionSwitcher();
        switcher.init();
    });
})();
