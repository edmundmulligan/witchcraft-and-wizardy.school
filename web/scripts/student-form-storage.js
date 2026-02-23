/*
 **********************************************************************
 * File       : student-form-storage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Generic form data storage utility with encryption support.
 *   Allows storing and retrieving form data with custom storage keys.
 *   Can be used with multiple independent forms on the same site.
 **********************************************************************
*/
/* global btoa, atob, Debug, alert, TextEncoder, TextDecoder, FormData, setTimeout */
/* jshint esversion: 8 */

(function() {
    'use strict';

    /**
     * Generic class for managing encrypted form data storage
     */
    class FormDataStorage {
        constructor(encryptionKey = 'witchcraft-and-wizardry-school-secure-key-2026') {
            this.ENCRYPTION_KEY = encryptionKey;
        }

        /**
         * Derive a cryptographic key from a password
         * @returns {Promise<CryptoKey>}
         */
        async deriveKey() {
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                encoder.encode(this.ENCRYPTION_KEY),
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
        async encryptData(data) {
            try {
                const key = await this.deriveKey();
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
        async decryptData(encryptedData) {
            try {
                const key = await this.deriveKey();
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
         * Save data to localStorage with encryption
         * @param {string} storageKey - The storage key to use
         * @param {Object} data - The data object to store
         * @returns {Promise<boolean>} Success status
         */
        async save(storageKey, data) {
            try {
                const dataWithTimestamp = {
                    ...data,
                    savedAt: new Date().toISOString()
                };
                
                const encryptedData = await this.encryptData(JSON.stringify(dataWithTimestamp));
                localStorage.setItem(storageKey, encryptedData);
                return true;
            } catch (error) {
                console.error('Error saving form data:', error);
                return false;
            }
        }

        /**
         * Load data from localStorage with decryption
         * @param {string} storageKey - The storage key to use
         * @returns {Promise<Object|null>} The decrypted data object or null
         */
        async load(storageKey) {
            try {
                const savedData = localStorage.getItem(storageKey);
                if (!savedData) {
                    return null;
                }

                const decryptedData = await this.decryptData(savedData);
                return JSON.parse(decryptedData);
            } catch (error) {
                console.error('Error loading form data:', error);
                return null;
            }
        }

        /**
         * Clear data from localStorage
         * @param {string} storageKey - The storage key to clear
         */
        clear(storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.error('Error clearing form data:', error);
            }
        }

        /**
         * Check if data exists for a storage key
         * @param {string} storageKey - The storage key to check
         * @returns {boolean} True if data exists
         */
        exists(storageKey) {
            return localStorage.getItem(storageKey) !== null;
        }
    }

    /**
     * Specialized class for managing student form data with avatar preview
     */
    class StudentFormManager {
        constructor(formId, storageKeyPrefix = 'studentFormData_') {
            this.formId = formId;
            this.storageKeyPrefix = storageKeyPrefix;
            this.CURRENT_PROFILE_KEY = `${storageKeyPrefix}currentProfile`;
            this.storage = new FormDataStorage();
        }

        /**
         * Get the storage key for the current profile
         * @returns {string|null} The storage key or null if no profile is set
         */
        getCurrentStorageKey() {
            const currentProfile = localStorage.getItem(this.CURRENT_PROFILE_KEY);
            return currentProfile ? this.storageKeyPrefix + currentProfile : null;
        }

        /**
         * Update the avatar preview output with the appropriate image
         * @param {Object} data - Form data object
         */
        updateAvatarPreview(data) {
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
         * Load saved form data from localStorage and populate the form
         * @param {boolean} forceTheme - If true, apply theme regardless of current theme setting
         */
        async loadFormData(forceTheme = true) {
            try {
                const storageKey = this.getCurrentStorageKey();
                if (!storageKey) {
                    return;
                }

                const data = await this.storage.load(storageKey);
                if (!data) {
                    return;
                }
            
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

                if (data.elementChoice) {
                    const elementRadio = document.getElementById(`element-choice-${data.elementChoice}`);
                    if (elementRadio) {
                        elementRadio.checked = true;
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
                this.updateAvatarPreview(data);
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        }

        /**
         * Save form data to localStorage
         * @param {Event} event - The form submit event
         */
        async saveFormData(event) {
            event.preventDefault(); // Prevent form submission

            try {
                const form = document.getElementById(this.formId);
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
                    elementChoice: formData.get('element-choice') || ''
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
                localStorage.setItem(this.CURRENT_PROFILE_KEY, profileIdentifier);

                // Create the storage key
                const storageKey = this.storageKeyPrefix + profileIdentifier;

                // Save to localStorage with encryption
                const success = await this.storage.save(storageKey, data);

                if (!success) {
                    alert('There was an error saving your information. Please try again.');
                    return;
                }

                // Update the avatar preview
                this.updateAvatarPreview(data);

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
         * Set up form event listeners
         */
        setupFormListeners() {
            const form = document.getElementById(this.formId);
            if (!form) {
                return;
            }

            form.addEventListener('submit', (event) => this.saveFormData(event));

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
                    this.updateAvatarPreview(data);
                
                    // Apply theme immediately if theme choice changed
                    if (radio.name === 'theme-choice' && data.themeChoice && window.ThemeSwitcher) {
                        window.ThemeSwitcher.set(data.themeChoice);
                    }
                });
            });
        }

        /**
         * Set up load button handler
         */
        setupLoadButton() {
            const form = document.getElementById(this.formId);
            const loadButton = document.getElementById('load-information-btn');
            
            if (!loadButton || !form) {
                return;
            }

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
                const isMentorForm = form.id === 'mentor-info-form';
                const profileIdentifier = isMentorForm ? 'mentor' : enteredName.toLowerCase();

                try {
                    // Try to load the data for this profile
                    const storageKey = this.storageKeyPrefix + profileIdentifier;
                    
                    if (!this.storage.exists(storageKey)) {
                        loadButton.textContent = 'No Data Found!';
                        loadButton.style.backgroundColor = 'var(--color-warning-background)';
                    
                        setTimeout(() => {
                            loadButton.textContent = 'Load Information';
                            loadButton.style.backgroundColor = '';
                        }, 2000);
                        return;
                    }

                    // Set this as the current profile
                    localStorage.setItem(this.CURRENT_PROFILE_KEY, profileIdentifier);

                    // Load the form data with forced theme application
                    await this.loadFormData(true);

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

        /**
         * Set up clear button handler
         */
        setupClearButton() {
            const form = document.getElementById(this.formId);
            const clearButton = document.getElementById('clear-information-btn');
            const confirmYesButton = document.getElementById('confirm-clear-yes');
            const confirmPopover = document.getElementById('confirm-clear');
        
            if (!confirmYesButton || !confirmPopover) {
                return;
            }

            confirmYesButton.addEventListener('click', () => {
                // Clear localStorage for current profile
                const storageKey = this.getCurrentStorageKey();
                if (storageKey) {
                    this.storage.clear(storageKey);
                }
                localStorage.removeItem(this.CURRENT_PROFILE_KEY);
            
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

        /**
         * Populate the student-image div with the saved avatar
         */
        async populateStudentImage() {
            const studentImageDiv = document.querySelector('.student-image');
            if (!studentImageDiv) {
                return; // Not on a lesson page
            }

            try {
                const storageKey = this.getCurrentStorageKey();
                if (!storageKey) {
                    return; // No current profile
                }

                const data = await this.storage.load(storageKey);
                if (!data) {
                    return; // No saved data
                }

                // Only show image if all three required selections are made
                if (data.avatarChoice && data.genderChoice && data.ageChoice) {
                    const imageName = `rachel-mulligan-${data.avatarChoice}-${data.ageChoice}-${data.genderChoice}.png`;
                    const imagePath = `../images/${imageName}`;
                    const studentName = data.name || 'Student';
                
                    // Create figure with image and caption
                    studentImageDiv.innerHTML = `
                    <figure style="margin: 0; text-align: center;">
                        <img src="${imagePath}" alt="Your avatar: ${data.avatarChoice}, ${data.ageChoice}, ${data.genderChoice}" class="avatar-image">
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

        /**
         * Get form data for a specific profile
         * @param {string} profileIdentifier - Profile identifier
         * @returns {Promise<Object|null>} Form data or null
         */
        async get(profileIdentifier) {
            try {
                const storageKey = profileIdentifier ? 
                    this.storageKeyPrefix + profileIdentifier : 
                    this.getCurrentStorageKey();
            
                if (!storageKey) {
                    return null;
                }
            
                return await this.storage.load(storageKey);
            } catch (error) {
                console.error('Error retrieving form data:', error);
                return null;
            }
        }

        /**
         * Clear form data for a specific profile
         * @param {string} profileIdentifier - Profile identifier
         */
        clear(profileIdentifier) {
            if (profileIdentifier) {
                this.storage.clear(this.storageKeyPrefix + profileIdentifier);
            } else {
                const storageKey = this.getCurrentStorageKey();
                if (storageKey) {
                    this.storage.clear(storageKey);
                }
                localStorage.removeItem(this.CURRENT_PROFILE_KEY);
            }
        }

        /**
         * Get current profile identifier
         * @returns {string|null} Current profile identifier
         */
        getCurrentProfile() {
            return localStorage.getItem(this.CURRENT_PROFILE_KEY);
        }

        /**
         * Set current profile identifier
         * @param {string} profileIdentifier - Profile identifier
         */
        setCurrentProfile(profileIdentifier) {
            if (profileIdentifier) {
                localStorage.setItem(this.CURRENT_PROFILE_KEY, profileIdentifier);
            } else {
                localStorage.removeItem(this.CURRENT_PROFILE_KEY);
            }
        }

        /**
         * Initialize the form manager
         */
        init() {
            const form = document.getElementById(this.formId);
            if (!form) {
                // Not on the form page, but might be on a lesson page
                this.populateStudentImage();
                return;
            }
        
            this.loadFormData();
            this.setupFormListeners();
            this.setupLoadButton();
            this.setupClearButton();
        }
    }

    // Initialize student form manager for the default student/mentor forms
    const studentFormManager = new StudentFormManager('student-info-form');
    const mentorFormManager = new StudentFormManager('mentor-info-form');

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            studentFormManager.init();
            mentorFormManager.init();
        });
    } else {
        studentFormManager.init();
        mentorFormManager.init();
    }

    // Export both base storage class and student form manager for use by other scripts
    window.FormDataStorage = FormDataStorage;
    window.StudentFormStorage = {
        get: (profileIdentifier) => studentFormManager.get(profileIdentifier),
        clear: (profileIdentifier) => studentFormManager.clear(profileIdentifier),
        getCurrentProfile: () => studentFormManager.getCurrentProfile(),
        setCurrentProfile: (profileIdentifier) => studentFormManager.setCurrentProfile(profileIdentifier),
        populateStudentImage: () => studentFormManager.populateStudentImage()
    };
})();
