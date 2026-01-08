/*
 **********************************************************************
 * File       : scripts/inject-glossary-popovers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically loads glossary definitions from glossary.html into
 *   popover elements to follow DRY principle
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Find all glossary popovers on the page
    const glossaryPopovers = document.querySelectorAll('.glossary-popover');
    
    if (glossaryPopovers.length === 0) {
        return;
    }

    try {
        // Fetch the glossary page
        const response = await fetch('../pages/glossary.html');
        if (!response.ok) {
            throw new Error('Failed to fetch glossary');
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const glossaryDoc = parser.parseFromString(html, 'text/html');
        
        // Process each glossary popover
        glossaryPopovers.forEach(popover => {
            const popoverId = popover.id;
            // Extract the term from the popover ID (e.g., "glossary-html-popover" -> "html")
            const match = popoverId.match(/^glossary-(.+)-popover$/);
            if (!match) {
                return;
            }
            
            const term = match[1];
            const glossaryId = `glossary-${term}`;
            
            // Find the term and definition in the glossary
            const dt = glossaryDoc.getElementById(glossaryId);
            if (!dt) {
                console.warn(`Glossary term not found: ${glossaryId}`);
                return;
            }
            
            const termText = dt.textContent.trim();
            
            // Get the next sibling dd element (definition)
            const dd = dt.nextElementSibling;
            if (!dd || dd.tagName !== 'DD') {
                console.warn(`Definition not found for term: ${glossaryId}`);
                return;
            }
            
            const definition = dd.textContent.trim();
            
            // Populate the popover
            popover.innerHTML = `
                <h2>${termText}</h2>
                <p>${definition}</p>
                <button type="button" popovertarget="${popoverId}" popovertargetaction="hide">Close</button>
            `;
        });
        
    } catch (error) {
        console.error('Error loading glossary:', error);
    }
});
