/* global window, document, console, alert, localStorage, btoa, atob */
/* jshint esversion: 8 */
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
    const ENCRYPTION_KEY = 'witchcraft-and-wizardry-school-secure-key-2025';

    /**
     * Derive a cryptographic key from a password
     * @returns {Promise<CryptoKey>}
     */
    async function deriveKey() {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(ENCRYPTION_KEY),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('witchcraft-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data using AES-GCM
     * @param {string} data - The data to encrypt
     * @returns {Promise<string>} Base64-encoded encrypted data with IV
     */
    async function encryptData(data) {
        try {
            const key = await deriveKey();
            const encoder = new TextEncoder();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(data)
            );
            
            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encrypted), iv.length);
            
            // Convert to base64
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }

    /**
     * Decrypt data using AES-GCM
     * @param {string} encryptedData - Base64-encoded encrypted data with IV
     * @returns {Promise<string>} Decrypted data
     */
    async function decryptData(encryptedData) {
        try {
            const key = await deriveKey();
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);
            
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }

    /**
     * Update the avatar preview output with the appropriate image
     */
    function updateAvatarPreview(data) {
        const output = document.getElementById('avatar-preview');
        if (!output) {
            return;
        }

        // Only show image if all three required selections are made
        if (data.avatarChoice && data.genderChoice && data.ageChoice) {
            const imageName = `rachel-mulligan-${data.avatarChoice}-${data.ageChoice}-${data.genderChoice}.jpg`;
            const imagePath = `../images/${imageName}`;
            
            // Create and set the image
            output.innerHTML = `<img src="${imagePath}" alt="Your avatar: ${data.avatarChoice}, ${data.ageChoice}, ${data.genderChoice}" style="width: 100%; height: auto; border-radius: var(--border-radius, 0.5rem);">`;
        } else {
            // Clear output if not all selections are made
            output.innerHTML = '';
        }
    }

    /**
     * Load saved form data from localStorage and populate the form
     */
    async function loadFormData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (!savedData) {
                return;
            }

            // Decrypt the data
            const decryptedData = await decryptData(savedData);
            const data = JSON.parse(decryptedData);
            
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
                
                // Only apply the theme if no theme preference is currently set
                // This prevents overriding the user's active theme choice
                if (window.ThemeSwitcher) {
                    const currentTheme = window.ThemeSwitcher.get();
                    // Only apply saved theme if current preference is 'auto' (default)
                    if (currentTheme === 'auto') {
                        window.ThemeSwitcher.set(data.themeChoice);
                    }
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
    async function saveFormData(event) {
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

            // Encrypt and save to localStorage
            const encryptedData = await encryptData(JSON.stringify(data));
            localStorage.setItem(STORAGE_KEY, encryptedData);

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

        // Set up clear button handler
        const clearButton = document.getElementById('clear-information-btn');
        const confirmYesButton = document.getElementById('confirm-clear-yes');
        const confirmPopover = document.getElementById('confirm-clear');
        
        if (confirmYesButton && confirmPopover) {
            confirmYesButton.addEventListener('click', () => {
                // Clear localStorage
                localStorage.removeItem(STORAGE_KEY);
                
                // Reset the form
                const form = document.getElementById('student-info-form');
                if (form) {
                    form.reset();
                }
                
                // Clear avatar preview
                const output = document.getElementById('avatar-preview');
                if (output) {
                    output.innerHTML = '';
                }
                
                // Reset theme to browser default (auto)
                if (window.ThemeSwitcher) {
                    window.ThemeSwitcher.set('auto');
                }
                
                // Close the popover
                confirmPopover.hidePopover();
                
                // Visual feedback on the clear button
                if (clearButton) {
                    clearButton.textContent = 'Information Cleared!';
                    clearButton.style.backgroundColor = 'var(--color-warning-background)';
                    
                    setTimeout(() => {
                        clearButton.textContent = 'Clear Information';
                        clearButton.style.backgroundColor = '';
                    }, 2000);
                }
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
        get: async function() {
            try {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (!savedData) {
                    return null;
                }
                const decryptedData = await decryptData(savedData);
                return JSON.parse(decryptedData);
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
