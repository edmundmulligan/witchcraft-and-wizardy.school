# Form Data Storage - Usage Guide

## Overview

The `student-form-storage.js` file has been refactored to provide two reusable classes:

1. **FormDataStorage** - Generic encrypted storage for any form data
2. **StudentFormManager** - Specialized manager for student/mentor forms with avatar support

## Generic Form Data Storage

### Basic Usage

```javascript
// Create a new storage instance
const storage = new FormDataStorage();

// Save data with a custom key
await storage.save('myFormKey', {
    name: 'John Doe',
    email: 'john@example.com',
    preference: 'dark'
});

// Load data
const data = await storage.load('myFormKey');
console.log(data); // { name: 'John Doe', email: 'john@example.com', preference: 'dark', savedAt: '2026-02-23T...' }

// Check if data exists
if (storage.exists('myFormKey')) {
    console.log('Data found!');
}

// Clear data
storage.clear('myFormKey');
```

### Custom Encryption Key

```javascript
const storage = new FormDataStorage('my-custom-encryption-key-2026');
```

## Creating Custom Form Managers

### Example 1: Theme Preferences Manager

```javascript
class ThemePreferencesManager {
    constructor() {
        this.storage = new FormDataStorage();
        this.storageKey = 'themePreferences';
    }

    async save(preferences) {
        return await this.storage.save(this.storageKey, preferences);
    }

    async load() {
        return await this.storage.load(this.storageKey);
    }
}
```

### Example 2: Contact Form Manager

```javascript
class ContactFormManager {
    constructor(formId) {
        this.formId = formId;
        this.storage = new FormDataStorage();
        this.storageKey = `contactForm_${formId}`;
    }

    async saveFormData(event) {
        event.preventDefault();
        
        const form = document.getElementById(this.formId);
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        const success = await this.storage.save(this.storageKey, data);
        
        if (success) {
            alert('Form data saved!');
        }
    }

    async loadFormData() {
        const data = await this.storage.load(this.storageKey);
        
        if (!data) return;

        const form = document.getElementById(this.formId);
        if (form && data.name) {
            form.querySelector('[name="name"]').value = data.name;
        }
        if (form && data.email) {
            form.querySelector('[name="email"]').value = data.email;
        }
        if (form && data.message) {
            form.querySelector('[name="message"]').value = data.message;
        }
    }

    init() {
        const form = document.getElementById(this.formId);
        if (!form) return;

        this.loadFormData();
        form.addEventListener('submit', (e) => this.saveFormData(e));
    }
}

// Usage
const contactManager = new ContactFormManager('contact-form');
contactManager.init();
```

## Student Form Manager (Specialized)

The `StudentFormManager` class is already configured for student/mentor forms with built-in support for:
- Avatar preview
- Multiple profiles
- Theme integration
- Clear/Load/Save operations

### Using Multiple Independent Managers

```javascript
// Create managers for different forms
const studentManager = new StudentFormManager('student-info-form', 'studentData_');
const mentorManager = new StudentFormManager('mentor-info-form', 'mentorData_');
const settingsManager = new StudentFormManager('settings-form', 'settings_');

// Initialize them
studentManager.init();
mentorManager.init();
settingsManager.init();
```

## Key Features

### Encryption
All data is automatically encrypted using AES-GCM before being stored in localStorage.

### Timestamps
Each saved data object automatically includes a `savedAt` timestamp.

### Independent Storage
Each form manager can use a different storage key prefix, ensuring data from different forms doesn't overlap.

### Error Handling
All methods include try-catch blocks with console error logging.

## API Reference

### FormDataStorage

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `save(storageKey, data)` | key: string, data: object | Promise\<boolean\> | Save encrypted data |
| `load(storageKey)` | key: string | Promise\<object\|null\> | Load and decrypt data |
| `clear(storageKey)` | key: string | void | Remove data |
| `exists(storageKey)` | key: string | boolean | Check if data exists |

### StudentFormManager

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `get(profileIdentifier)` | identifier: string | Promise\<object\|null\> | Get profile data |
| `clear(profileIdentifier)` | identifier: string | void | Clear profile data |
| `getCurrentProfile()` | none | string\|null | Get current profile ID |
| `setCurrentProfile(id)` | id: string | void | Set current profile |
| `populateStudentImage()` | none | Promise\<void\> | Display avatar image |

## Migration from Old Code

### Before:
```javascript
// Old hardcoded approach
localStorage.setItem('studentData', JSON.stringify(data));
```

### After:
```javascript
// New generic approach
const storage = new FormDataStorage();
await storage.save('studentData', data);
```

## Best Practices

1. **Use descriptive storage keys** - e.g., 'userPreferences', 'contactFormDraft', 'quizAnswers'
2. **Create dedicated manager classes** - Encapsulate form-specific logic
3. **Handle errors gracefully** - Always check return values from async methods
4. **Clean up on logout** - Clear sensitive data when users log out
5. **Use different prefixes** - Prevent key collisions between different forms

## Example: Complete Form Implementation

See `theme-storage-example.js` for a complete working example of how to create a custom form manager using the generic `FormDataStorage` class.
