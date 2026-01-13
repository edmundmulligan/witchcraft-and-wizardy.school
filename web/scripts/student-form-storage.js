/* global btoa, atob, console, alert, TextEncoder, TextDecoder, FormData, setTimeout */
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

    const STORAGE_KEY_PREFIX = 'studentFormData_';
    const CURRENT_PROFILE_KEY = 'currentProfile';
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
     * 
     * 
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
            const imageName = `rachel-mulligan-${data.avatarChoice}-${data.ageChoice}-${data.genderChoice}.png`;
            const imagePath = `../images/${imageName}`;
            
            // Create and set the image
            output.innerHTML = `<img src="${imagePath}" alt="Your avatar: ${data.avatarChoice}, ${data.ageChoice}, ${data.genderChoice}" style="width: 100%; height: auto; border-radius: var(--border-radius, 0.5rem);">`;
        } else {
            // Clear output if not all selections are made
            output.innerHTML = '';
        }
    }

    /**
     * Get the storage key for the current profile
     * @returns {string|null} The storage key or null if no profile is set
     */
    function getCurrentStorageKey() {
        const currentProfile = localStorage.getItem(CURRENT_PROFILE_KEY);
        return currentProfile ? STORAGE_KEY_PREFIX + currentProfile : null;
    }

    /**
     * Load saved form data from localStorage and populate the form
     * @param {boolean} forceTheme - If true, apply theme regardless of current theme setting
     */
    async function loadFormData(forceTheme = true) {
        try {
            const storageKey = getCurrentStorageKey();
            if (!storageKey) {
                return;
            }

            const savedData = localStorage.getItem(storageKey);
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
            }

            // Apply theme - handle separately to ensure it always runs when forceTheme is true
            if (data.themeChoice && window.ThemeSwitcher) {
                if (forceTheme) {
                    // Force apply the theme when explicitly loading
                    window.ThemeSwitcher.set(data.themeChoice);
                } else {
                    // Only apply the theme if no theme preference is currently set
                    // This prevents overriding the user's active theme choice on page load
                    const currentTheme = window.ThemeSwitcher.get();
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
            const form = document.getElementById('student-info-form') || document.getElementById('mentor-info-form');
            if (!form) {
                return;
            }

            // Determine if this is mentor or student form
            const isMentorForm = form.id === 'mentor-info-form';

            // Get form values
            const formData = new FormData(form);
            const studentName = formData.get('student-name') || '';
            const data = {
                name: studentName,
                avatarChoice: formData.get('avatar-choice') || '',
                genderChoice: formData.get('gender-choice') || '',
                ageChoice: formData.get('age-choice') || '',
                themeChoice: formData.get('theme-choice') || '',
                savedAt: new Date().toISOString()
            };

            // Determine the profile identifier for the storage key
            let profileIdentifier;
            if (isMentorForm) {
                profileIdentifier = 'mentor';
            } else {
                // Use student name if provided, otherwise use 'Student'
                // Normalize to lowercase for case-insensitive storage
                profileIdentifier = (studentName.trim() || 'Student').toLowerCase();
            }

            // Store the current profile identifier
            localStorage.setItem(CURRENT_PROFILE_KEY, profileIdentifier);

            // Create the storage key
            const storageKey = STORAGE_KEY_PREFIX + profileIdentifier;

            // Encrypt and save to localStorage
            const encryptedData = await encryptData(JSON.stringify(data));
            localStorage.setItem(storageKey, encryptedData);

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
        // Load saved data when page loads (only if on students page with form)
        const form = document.getElementById('student-info-form') || document.getElementById('mentor-info-form');
        if (!form) {
            return; // Not on the students or mentors page
        }
        
        loadFormData();

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

        // Set up load button handler
        const loadButton = document.getElementById('load-information-btn');
        if (loadButton) {
            loadButton.addEventListener('click', async () => {
                const nameInput = document.getElementById('student-name');
                if (!nameInput) {
                    return;
                }

                const enteredName = nameInput.value.trim();
                if (!enteredName) {
                    alert('Please enter a name to load information.');
                    return;
                }

                // Determine the profile identifier based on form type
                // Normalize to lowercase for case-insensitive lookup
                const isMentorForm = form.id === 'mentor-info-form';
                const profileIdentifier = isMentorForm ? 'mentor' : enteredName.toLowerCase();

                try {
                    // Try to load the data for this profile
                    const storageKey = STORAGE_KEY_PREFIX + profileIdentifier;
                    const savedData = localStorage.getItem(storageKey);
                    
                    if (!savedData) {
                        loadButton.textContent = 'No Data Found!';
                        loadButton.style.backgroundColor = 'var(--color-warning-background)';
                        
                        setTimeout(() => {
                            loadButton.textContent = 'Load Information';
                            loadButton.style.backgroundColor = '';
                        }, 2000);
                        return;
                    }

                    // Set this as the current profile
                    localStorage.setItem(CURRENT_PROFILE_KEY, profileIdentifier);

                    // Load the form data with forced theme application
                    await loadFormData(true);

                    // Visual feedback
                    loadButton.textContent = 'Information Loaded!';
                    loadButton.style.backgroundColor = 'var(--color-light-success-background, #4CAF50)';
                    
                    setTimeout(() => {
                        loadButton.textContent = 'Load Information';
                        loadButton.style.backgroundColor = '';
                    }, 2000);
                } catch (error) {
                    console.error('Error loading information:', error);
                    alert('There was an error loading the information. Please try again.');
                }
            });
        }

        // Set up clear button handler
        const clearButton = document.getElementById('clear-information-btn');
        const confirmYesButton = document.getElementById('confirm-clear-yes');
        const confirmPopover = document.getElementById('confirm-clear');
        
        if (confirmYesButton && confirmPopover) {
            confirmYesButton.addEventListener('click', () => {
                // Clear localStorage for current profile
                const storageKey = getCurrentStorageKey();
                if (storageKey) {
                    localStorage.removeItem(storageKey);
                }
                localStorage.removeItem(CURRENT_PROFILE_KEY);
                
                // Reset the form
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

    /**
     * Populate the student-image div with the saved avatar
     * This is called on lesson pages to display the student's chosen avatar
     */
    async function populateStudentImage() {
        const studentImageDiv = document.querySelector('.student-image');
        if (!studentImageDiv) {
            return; // Not on a lesson page
        }

        try {
            const storageKey = getCurrentStorageKey();
            if (!storageKey) {
                return; // No current profile
            }

            const savedData = localStorage.getItem(storageKey);
            if (!savedData) {
                return; // No saved data
            }

            const decryptedData = await decryptData(savedData);
            const data = JSON.parse(decryptedData);

            // Only show image if all three required selections are made
            if (data.avatarChoice && data.genderChoice && data.ageChoice) {
                const imageName = `rachel-mulligan-${data.avatarChoice}-${data.ageChoice}-${data.genderChoice}.png`;
                const imagePath = `../images/${imageName}`;
                const studentName = data.name || 'Student';
                
                // Create figure with image and caption
                studentImageDiv.innerHTML = `
                    <figure style="margin: 0; text-align: center;">
                        <img src="${imagePath}" 
                            alt="Your avatar: ${data.avatarChoice}, ${data.ageChoice}, ${data.genderChoice}" 
                            class="avatar-image">
                        <figcaption class="avatar-caption">
                            Welcome, ${studentName}
                        </figcaption>
                    </figure>
                `;
            }
        } catch (error) {
            console.error('Error loading student image:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            populateStudentImage();
        });
    } else {
        init();
        populateStudentImage();
    }

    // Export functions for use by other pages
    window.StudentFormStorage = {
        get: async function(profileIdentifier) {
            try {
                // If no profile identifier provided, use current profile
                const storageKey = profileIdentifier 
                    ? STORAGE_KEY_PREFIX + profileIdentifier 
                    : getCurrentStorageKey();
                
                if (!storageKey) {
                    return null;
                }
                
                const savedData = localStorage.getItem(storageKey);
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
        clear: function(profileIdentifier) {
            try {
                // If no profile identifier provided, clear current profile
                if (profileIdentifier) {
                    localStorage.removeItem(STORAGE_KEY_PREFIX + profileIdentifier);
                } else {
                    const storageKey = getCurrentStorageKey();
                    if (storageKey) {
                        localStorage.removeItem(storageKey);
                    }
                    localStorage.removeItem(CURRENT_PROFILE_KEY);
                }
            } catch (error) {
                console.error('Error clearing form data:', error);
            }
        },
        getCurrentProfile: function() {
            return localStorage.getItem(CURRENT_PROFILE_KEY);
        },
        setCurrentProfile: function(profileIdentifier) {
            if (profileIdentifier) {
                localStorage.setItem(CURRENT_PROFILE_KEY, profileIdentifier);
            } else {
                localStorage.removeItem(CURRENT_PROFILE_KEY);
            }
        },
        populateStudentImage: populateStudentImage
    };
})();
