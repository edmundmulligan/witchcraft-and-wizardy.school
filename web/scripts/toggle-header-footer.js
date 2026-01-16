/*
 **********************************************************************
 * File       : scripts/toggle-header-footer.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles toggle functionality for collapsible header and footer
 *   sections. Works with both header-minimal/header-full and
 *   footer-minimal/footer-full elements.
 *   This script sets up listeners after the header and footer are injected.
 *   Saves state to localStorage to persist across pages.
 **********************************************************************
 */

(function() {
    'use strict';

    const HEADER_STATE_KEY = 'headerState';
    const FOOTER_STATE_KEY = 'footerState';

// Function to setup header toggle
function setupHeaderToggle() {
    const header = document.querySelector('header.header');
    if (header) {
        const headerMinimal = header.querySelector('.header-minimal');
        const headerFull = header.querySelector('.header-full');
        const headerButtons = header.querySelectorAll('.header-button button');
        
        // Load saved state
        const savedState = localStorage.getItem(HEADER_STATE_KEY);
        if (savedState === 'expanded') {
            headerMinimal.style.display = 'none';
            headerFull.style.display = 'grid';
        } else if (savedState === 'compact') {
            headerMinimal.style.display = 'grid';
            headerFull.style.display = 'none';
        }
        
        headerButtons.forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('fa-chevron-down')) {
                    // Down arrow clicked - show full header
                    headerMinimal.style.display = 'none';
                    headerFull.style.display = 'grid';
                    localStorage.setItem(HEADER_STATE_KEY, 'expanded');
                } else {
                    // Up arrow clicked - show minimal header
                    headerMinimal.style.display = 'grid';
                    headerFull.style.display = 'none';
                    localStorage.setItem(HEADER_STATE_KEY, 'compact');
                }
            });
        });
    }
}

// Function to setup footer toggle
function setupFooterToggle() {
    const footer = document.querySelector('footer.footer');
    if (footer) {
        const footerMinimal = footer.querySelector('.footer-minimal');
        const footerFull = footer.querySelector('.footer-full');
        const footerButtons = footer.querySelectorAll('.footer-button button');
        
        // Load saved state
        const savedState = localStorage.getItem(FOOTER_STATE_KEY);
        if (savedState === 'expanded') {
            footerMinimal.style.display = 'none';
            footerFull.style.display = 'flex';
        } else if (savedState === 'compact') {
            footerMinimal.style.display = 'flex';
            footerFull.style.display = 'none';
        }
        
        footerButtons.forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('fa-chevron-up')) {
                    // Up arrow clicked - show full footer
                    footerMinimal.style.display = 'none';
                    footerFull.style.display = 'flex';
                    localStorage.setItem(FOOTER_STATE_KEY, 'expanded');
                } else {
                    // Down arrow clicked - show minimal footer
                    footerMinimal.style.display = 'flex';
                    footerFull.style.display = 'none';
                    localStorage.setItem(FOOTER_STATE_KEY, 'compact');
                }
            });
        });
    }
}

    // Listen for custom events from inject scripts
    document.addEventListener('headerInjected', setupHeaderToggle);
    document.addEventListener('footerInjected', setupFooterToggle);
})();
