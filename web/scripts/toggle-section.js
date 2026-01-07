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
    // For keyboard events, only respond to Enter or Space
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
    }
    
    // Prevent default for Space key to avoid page scroll
    if (event.key === ' ') {
        event.preventDefault();
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
        const isExpanded = !section.classList.contains('hidden');
        
        // Toggle visibility
        section.classList.toggle('hidden');
        
        // Toggle icon classes
        if (event.currentTarget.classList.contains('magic-visible')) {
            event.currentTarget.classList.remove('magic-visible');
            event.currentTarget.classList.add('magic-invisible');
        } else {
            event.currentTarget.classList.remove('magic-invisible');
            event.currentTarget.classList.add('magic-visible');
        }
        
        // Update ARIA attributes for accessibility
        event.currentTarget.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    }
}

// Function to collapse a section when clicking on magic-block
function toggleSectionCollapse(sectionId, event) {
    // For keyboard events, only respond to Enter or Space
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
    }
    
    // Prevent default for Space key to avoid page scroll
    if (event.key === ' ') {
        event.preventDefault();
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
        // Hide the section
        section.classList.add('hidden');
        
        // Find the corresponding toggle heading and change it to magic-invisible
        const toggleHeading = document.querySelector(`[onclick*="'${sectionId}'"]`);
        if (toggleHeading) {
            toggleHeading.classList.remove('magic-visible');
            toggleHeading.classList.add('magic-invisible');
            toggleHeading.setAttribute('aria-expanded', 'false');
        }
    }
}

// Make functions globally available for inline handlers
window.toggleSection = toggleSection;
window.toggleSectionCollapse = toggleSectionCollapse;

// Initialize accessibility attributes on page load
document.addEventListener('DOMContentLoaded', function() {
    // Find all toggleable headings and add proper attributes
    const toggleHeadings = document.querySelectorAll('.faq-title');
    toggleHeadings.forEach(heading => {
        // Make keyboard focusable
        heading.setAttribute('tabindex', '0');
        
        // Add ARIA expanded attribute (don't override heading role)
        heading.setAttribute('aria-expanded', 'false');
    });
    
    // Find all magic-block elements and add proper attributes
    const magicBlocks = document.querySelectorAll('.magic-block');
    magicBlocks.forEach(block => {
        // Make keyboard focusable
        block.setAttribute('tabindex', '0');
        block.setAttribute('role', 'button');
        block.setAttribute('aria-label', 'Collapse section');
    });
});