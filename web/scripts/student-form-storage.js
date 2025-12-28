/* global window, document, console, alert, localStorage */
/*
 **********************************************************************
 * File       : student-form-storage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles saving and loading student form data to/from localStorage.
 *   The data is stored as a JSON object and can be accessed by other
 *   pages in the site.
 **********************************************************************
*/

(function() {
    'use strict';

    const STORAGE_KEY = 'studentFormData';

    /**
     * Update the avatar preview output with the appropriate image
     */
    function updateAvatarPreview(data) {
        const output = document.getElementById('avatar-preview');
        if (!output) {
            return;
        }

        // Check if we have all the required selections
        if (data.avatarChoice && data.genderChoice && data.ageChoice) {
            const imageName = `rachel-mulligan-${data.avatarChoice}-${data.ageChoice}-${data.genderChoice}.jpg`;
            const imagePath = `../images/${imageName}`;
            
            // Create and set the image
            output.innerHTML = `<img src="${imagePath}" alt="Your avatar: ${data.avatarChoice}, ${data.ageChoice}, ${data.genderChoice}" style="width: 100%; height: auto; border-radius: var(--border-radius, 0.5rem);">`;
        } else {
            // Show default message if not all selections are made
            output.innerHTML = `
                <p>Your avatar will appear here once you select:</p>
                <ul style="text-align: left; padding-left: 2em;">
                    ${!data.avatarChoice ? '<li>Your class (witch or wizard)</li>' : ''}
                    ${!data.genderChoice ? '<li>Your gender</li>' : ''}
                    ${!data.ageChoice ? '<li>Your age</li>' : ''}
                </ul>
            `;
        }
    }

    /**
     * Load saved form data from localStorage and populate the form
     */
    function loadFormData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (!savedData) {
                return;
            }

            const data = JSON.parse(savedData);
            
            // Populate text input
            if (data.name) {
                const nameInput = document.getElementById('student-name');
                if (nameInput) {
                    nameInput.value = data.name;
                }
            }

            // Populate radio buttons
            if (data.avatarChoice) {
                const avatarRadio = document.getElementById(`avatar-choice-${data.avatarChoice}`);
                if (avatarRadio) {
                    avatarRadio.checked = true;
                }
            }

            if (data.genderChoice) {
                const genderRadio = document.getElementById(`gender-choice-${data.genderChoice}`);
                if (genderRadio) {
                    genderRadio.checked = true;
                }
            }

            if (data.ageChoice) {
                const ageRadio = document.getElementById(`age-choice-${data.ageChoice}`);
                if (ageRadio) {
                    ageRadio.checked = true;
                }
            }

            if (data.themeChoice) {
                const themeRadio = document.getElementById(`theme-choice-${data.themeChoice}`);
                if (themeRadio) {
                    themeRadio.checked = true;
                }
                
                // Apply the theme if theme switcher is available
                if (window.ThemeSwitcher) {
                    window.ThemeSwitcher.set(data.themeChoice);
                }
            }

            // Update the avatar preview
            updateAvatarPreview(data);
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    }

    /**
     * Save form data to localStorage
     */
    function saveFormData(event) {
        event.preventDefault(); // Prevent form submission

        try {
            const form = document.getElementById('student-info-form');
            if (!form) {
                return;
            }

            // Get form values
            const formData = new FormData(form);
            const data = {
                name: formData.get('student-name') || '',
                avatarChoice: formData.get('avatar-choice') || '',
                genderChoice: formData.get('gender-choice') || '',
                ageChoice: formData.get('age-choice') || '',
                themeChoice: formData.get('theme-choice') || '',
                savedAt: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Update the avatar preview
            updateAvatarPreview(data);

            // Apply theme if theme switcher is available and theme was selected
            if (data.themeChoice && window.ThemeSwitcher) {
                window.ThemeSwitcher.set(data.themeChoice);
            }

            // Provide visual feedback
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Information Saved!';
                submitButton.style.backgroundColor = 'var(--color-light-success-background, #4CAF50)';
                
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.backgroundColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving form data:', error);
            alert('There was an error saving your information. Please try again.');
        }
    }

    /**
     * Initialize the form storage functionality
     */
    function init() {
        // Load saved data when page loads
        loadFormData();

        // Set up form submission handler
        const form = document.getElementById('student-info-form');
        if (form) {
            form.addEventListener('submit', saveFormData);

            // Add event listeners to radio buttons to update preview in real-time
            const radioButtons = form.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    const formData = new FormData(form);
                    const data = {
                        avatarChoice: formData.get('avatar-choice') || '',
                        genderChoice: formData.get('gender-choice') || '',
                        ageChoice: formData.get('age-choice') || '',
                        themeChoice: formData.get('theme-choice') || ''
                    };
                    updateAvatarPreview(data);
                    
                    // Apply theme immediately if theme choice changed
                    if (radio.name === 'theme-choice' && data.themeChoice && window.ThemeSwitcher) {
                        window.ThemeSwitcher.set(data.themeChoice);
                    }
                });
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for use by other pages
    window.StudentFormStorage = {
        get: function() {
            try {
                const savedData = localStorage.getItem(STORAGE_KEY);
                return savedData ? JSON.parse(savedData) : null;
            } catch (error) {
                console.error('Error retrieving form data:', error);
                return null;
            }
        },
        clear: function() {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.error('Error clearing form data:', error);
            }
        }
    };
})();
