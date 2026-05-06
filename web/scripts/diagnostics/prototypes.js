/*
 **********************************************************************
 * File       : prototypes.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see ../../license-and-credits.html page)
 * Description:
 *   JavaScript for the prototypes viewer diagnostic page.
 *   Handles tab switching, screenshot loading, interactive controls
 *   for viewing screenshots across different themes, styles, and viewports,
 *   and modal/lightbox functionality for viewing full-size images.
 **********************************************************************
 */

(function() {
    'use strict';

    // Configuration
    const VIEWPORTS = [
        { width: 199, label: 'Tiny (<200px)' },
        { width: 401, label: 'Mobile (<600px)' },
        { width: 901, label: 'Small Computer (<1200px)' },
        { width: 2001, label: 'Large Computer (>1200px)' }
    ];

    const OUTPUT_PATH = '../diagnostics/screenshots/';

    /**
     * Set up tab switching functionality
     */
    function setupTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    /**
     * Generate filename based on page type and options
     * @param {string} pageType - Type of page (landing, students, lesson)
     * @param {number} viewport - Viewport width
     * @param {Object} options - Theme, style, expand, and section options
     * @returns {string} Generated filename
     */
    function generateFilename(pageType, viewport, options) {
        const { theme, style, expand, section } = options;
        
        if (pageType === 'landing') {
            return `homepage-${viewport}-${theme}-${style}-${expand}.png`;
        } else if (pageType === 'students') {
            return `students-${viewport}-${theme}-${style}-${expand}.png`;
        } else if (pageType === 'lesson') {
            return `lesson-01-${viewport}-${theme}-${style}-${expand}-section-${section}.png`;
        }
        
        return '';
    }

    /**
     * Create screenshot display element
     * @param {string} filename - Screenshot filename
     * @param {string} label - Display label for the screenshot
     * @param {boolean} clickable - Whether the image should open in modal on click (default: true)
     * @returns {HTMLElement} Screenshot container element
     */
    function createScreenshotElement(filename, label, clickable = true) {
        const container = document.createElement('div');
        container.className = 'screenshot-container';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'screenshot-label';
        labelDiv.textContent = label;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'screenshot-wrapper';
        
        const img = document.createElement('img');
        img.src = OUTPUT_PATH + filename;
        img.alt = `Screenshot: ${label}`;
        
        // Handle image load errors
        img.onerror = () => {
            img.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Image not found';
            wrapper.appendChild(errorMsg);
        };
        
        // Add click handler to open modal (only if clickable and image loads successfully)
        if (clickable) {
            img.addEventListener('click', () => {
                if (!img.classList.contains('error')) {
                    openImageModal(img.src, img.alt);
                }
            });
        } else {
            img.style.cursor = 'default';
        }
        
        wrapper.appendChild(img);
        container.appendChild(labelDiv);
        container.appendChild(wrapper);
        
        return container;
    }

    /**
     * Update screenshots for a given page type
     * @param {string} pageType - Type of page to update screenshots for
     */
    function updateScreenshots(pageType) {
        const container = document.getElementById(`${pageType}-screenshots`);
        container.innerHTML = '';
        
        // Special handling for animations tab - just show a single GIF
        if (pageType === 'animations') {
            const animationOption = document.querySelector('input[name="animations-options"]:checked');
            const animationType = animationOption ? animationOption.value : 'animation-theme-switch';
            // Validate animation type against whitelist to prevent XSS
            const allowedAnimationTypes = ['animation-theme-switch', 'animation-portraits'];
            if (!allowedAnimationTypes.includes(animationType)) return;
            const filename = `${animationType}.gif`;
            const label = animationOption ? animationOption.nextElementSibling.textContent : 'Animation';
            
            // Pass false for clickable parameter - animations are already full size
            const element = createScreenshotElement(filename, label, false);
            container.appendChild(element);
            return;
        }
        
        // Get current options based on page type
        const theme = document.querySelector(`input[name="${pageType}-theme"]:checked`)?.value;
        const style = document.querySelector(`input[name="${pageType}-style"]:checked`)?.value;
        const expand = document.querySelector(`input[name="${pageType}-expand"]:checked`)?.value;
        
        // Validate options against whitelists to prevent XSS
        const allowedThemes = ['light', 'dark'];
        const allowedStyles = ['normal', 'subdued', 'vibrant'];
        const allowedExpand = ['minimal', 'expanded'];
        
        if (!theme || !allowedThemes.includes(theme)) return;
        if (!style || !allowedStyles.includes(style)) return;
        if (!expand || !allowedExpand.includes(expand)) return;
        
        let section = '0';
        if (pageType === 'lesson') {
            section = document.querySelector('input[name="lesson-section"]:checked')?.value;
            const allowedSections = ['0', '1', '2', '3', '4', '5', '6'];
            if (!section || !allowedSections.includes(section)) return;
        }
        
        const options = { theme, style, expand, section };
        
        // Generate screenshots for each viewport
        VIEWPORTS.forEach(viewport => {
            const filename = generateFilename(pageType, viewport.width, options);
            const element = createScreenshotElement(filename, viewport.label);
            container.appendChild(element);
        });
    }

    /**
     * Add event listeners to all radio buttons
     */
    function setupEventListeners() {
        ['landing', 'students', 'lesson'].forEach(pageType => {
            // Theme radios
            document.querySelectorAll(`input[name="${pageType}-theme"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
            
            // Style radios
            document.querySelectorAll(`input[name="${pageType}-style"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
            
            // Expand radios
            document.querySelectorAll(`input[name="${pageType}-expand"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
        });
        
        // Section radios (lesson only)
        document.querySelectorAll('input[name="lesson-section"]').forEach(radio => {
            radio.addEventListener('change', () => updateScreenshots('lesson'));
        });
        
        // Animation state radios (animations tab)
        document.querySelectorAll('input[name="animations-options"]').forEach(radio => {
            radio.addEventListener('change', () => updateScreenshots('animations'));
        });
        
        // Play animations button - restarts the GIF
        const playAnimationsBtn = document.getElementById('play-animations-btn');
        if (playAnimationsBtn) {
            playAnimationsBtn.addEventListener('click', restartAnimation);
        }
    }

    /**
     * Restart the animation by reloading the GIF
     */
    function restartAnimation() {
        const container = document.getElementById('animations-screenshots');
        const img = container.querySelector('img');
        
        if (img && img.src.endsWith('.gif')) {
            // Force reload by adding a timestamp query parameter
            const src = img.src.split('?')[0];
            img.src = src + '?t=' + new Date().getTime();
        }
    }

    /**
     * Create and setup the image modal
     */
    function setupImageModal() {
        // Create modal element if it doesn't exist
        let modal = document.getElementById('image-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-modal';
            modal.className = 'image-modal';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'image-modal-close';
            closeBtn.textContent = '×';
            closeBtn.setAttribute('aria-label', 'Close modal');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeImageModal();
            });
            
            // Create image element
            const img = document.createElement('img');
            img.alt = 'Full size screenshot';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            modal.appendChild(closeBtn);
            modal.appendChild(img);
            document.body.appendChild(modal);
            
            // Close modal when clicking on backdrop
            modal.addEventListener('click', closeImageModal);
            
            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeImageModal();
                }
            });
        }
    }

    /**
     * Open the image modal with specified image
     * @param {string} src - Image source URL
     * @param {string} alt - Image alt text
     */
    function openImageModal(src, alt) {
        const modal = document.getElementById('image-modal');
        const img = modal.querySelector('img');
        
        img.src = src;
        img.alt = alt;
        modal.classList.add('active');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the image modal
     */
    function closeImageModal() {
        const modal = document.getElementById('image-modal');
        modal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Digital Images tab - Logo switcher
     */
    function switchLogo() {
        const selectedColour = document.querySelector('input[name="logo-colour"]:checked')?.value;
        const logoImage = document.getElementById('logo-image');
        // Validate colour value against whitelist to prevent XSS
        const allowedColours = ['black', 'purple', 'cyan'];
        if (logoImage && selectedColour && allowedColours.includes(selectedColour)) {
            logoImage.src = `../diagnostics/images/logo-embodied-mind-with-name-${selectedColour}.svg`;
        }
    }

    /**
     * Digital Images tab - Background switcher
     */
    function switchBackground() {
        const selectedTheme = document.querySelector('input[name="bg-theme"]:checked')?.value;
        const selectedOrientation = document.querySelector('input[name="bg-orientation"]:checked')?.value;
        const backgroundImage = document.getElementById('background-image');
        // Validate values against whitelist to prevent XSS
        const allowedThemes = ['light', 'dark'];
        const allowedOrientations = ['landscape', 'portrait'];
        if (backgroundImage && selectedTheme && selectedOrientation &&
            allowedThemes.includes(selectedTheme) && 
            allowedOrientations.includes(selectedOrientation)) {
            backgroundImage.src = `../diagnostics/images/background-web-${selectedOrientation}-${selectedTheme}.svg`;
        }
    }

    /**
     * Digital Images tab - Load and setup favicon
     */
    async function loadFavicon() {
        const faviconContainer = document.getElementById('favicon-container');
        if (!faviconContainer || faviconContainer.hasChildNodes()) return;

        try {
            const response = await fetch('../diagnostics/images/favicon-inline.svg');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');
            
            svg.setAttribute('width', '150');
            faviconContainer.appendChild(svg);
            
            // Set initial state
            const checkedRadio = document.querySelector('input[name="favicon-animated"]:checked');
            if (checkedRadio && checkedRadio.value === 'true') {
                svg.classList.add('animated');
            }
        } catch (error) {
            console.error('Error loading favicon SVG:', error);
        }
    }

    /**
     * Digital Images tab - Toggle favicon animation
     */
    function toggleFaviconAnimation() {
        const faviconContainer = document.getElementById('favicon-container');
        const svg = faviconContainer?.querySelector('svg');
        if (!svg) return;

        const isAnimatedValue = document.querySelector('input[name="favicon-animated"]:checked')?.value;
        // Validate value against whitelist to prevent XSS
        const allowedValues = ['true', 'false'];
        if (isAnimatedValue && allowedValues.includes(isAnimatedValue)) {
            const isAnimated = isAnimatedValue === 'true';
            if (isAnimated) {
                svg.classList.add('animated');
            } else {
                svg.classList.remove('animated');
            }
        }
    }

    /**
     * Digital Images tab - Switch promotional montage format
     */
    function switchPromoFormat(restoreScroll = null) {
        const selectedFormat = document.querySelector('input[name="promo-format"]:checked')?.value;
        const promoContainer = document.getElementById('promo-container');
        if (!promoContainer) return;

        // Validate format against whitelist to prevent XSS
        const allowedFormats = ['mp4', 'webp', 'gif'];
        if (!selectedFormat || !allowedFormats.includes(selectedFormat)) return;

        const timestamp = new Date().getTime();
        
        // Clear existing content
        promoContainer.innerHTML = '';
        
        if (selectedFormat === 'mp4') {
            // Create video element using DOM API to avoid innerHTML XSS warnings
            const video = document.createElement('video');
            video.id = 'promo-video';
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.width = 800;
            
            const source = document.createElement('source');
            source.src = `../diagnostics/images/animated-web.${selectedFormat}?t=${timestamp}`;
            source.type = 'video/mp4';
            
            video.appendChild(source);
            promoContainer.appendChild(video);
        } else {
            // Create img element using DOM API to avoid innerHTML XSS warnings
            const img = document.createElement('img');
            img.src = `../diagnostics/images/animated-web.${selectedFormat}?t=${timestamp}`;
            img.alt = 'Promotional Montage Animation';
            img.width = 800;
            
            promoContainer.appendChild(img);
        }
        
        if (restoreScroll) {
            const restore = () => window.scrollTo(restoreScroll.x, restoreScroll.y);
            restore();
            requestAnimationFrame(restore);
        }
    }

    /**
     * Digital Images tab - Restart promotional animation
     */
    function restartPromo() {
        const selectedFormat = document.querySelector('input[name="promo-format"]:checked')?.value;
        
        // Validate format against whitelist to prevent XSS
        const allowedFormats = ['mp4', 'webp', 'gif'];
        if (!selectedFormat || !allowedFormats.includes(selectedFormat)) return;
        
        if (selectedFormat === 'mp4') {
            const video = document.getElementById('promo-video');
            if (video) {
                video.currentTime = 0;
                video.play();
            }
        } else {
            const scrollPos = { x: window.scrollX, y: window.scrollY };
            switchPromoFormat(scrollPos);
        }
    }

    /**
     * Setup event listeners for Digital Images tab
     */
    function setupImagesTabListeners() {
        // Logo color switcher
        document.querySelectorAll('input[name="logo-color"]').forEach(radio => {
            radio.addEventListener('change', switchLogo);
        });

        // Background switcher
        document.querySelectorAll('input[name="bg-theme"], input[name="bg-orientation"]').forEach(radio => {
            radio.addEventListener('change', switchBackground);
        });

        // Favicon animation toggle
        document.querySelectorAll('input[name="favicon-animated"]').forEach(radio => {
            radio.addEventListener('change', toggleFaviconAnimation);
        });

        // Promotional format switcher
        document.querySelectorAll('input[name="promo-format"]').forEach(radio => {
            radio.addEventListener('change', () => switchPromoFormat());
        });

        // Restart promo button
        const restartBtn = document.getElementById('restart-promo-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', restartPromo);
        }
    }

    /**
     * Initialise the screenshot viewer
     */
    function init() {
        setupTabs();
        setupEventListeners();
        setupImageModal();
        setupImagesTabListeners();
        
        // Load initial screenshots for all tabs
        updateScreenshots('landing');
        updateScreenshots('students');
        updateScreenshots('lesson');
        updateScreenshots('animations');
        
        // Initialise digital images tab
        loadFavicon();
        switchPromoFormat();
    }

    // Initialise when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
