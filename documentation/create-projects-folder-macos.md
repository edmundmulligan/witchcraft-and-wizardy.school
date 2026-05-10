# How to Create a Projects Folder on macOS

## What is a Projects Folder?

A Projects folder is a special place on your computer where you keep all your coding projects organised. It's like having a toy box where you keep all your toys in one place - it makes everything easier to find!

## Why Do You Need It?

When you start coding, you'll create lots of different projects. Having them all in one folder helps you:
- ✅ Find your projects quickly
- ✅ Keep your computer organised
- ✅ Back up your work easily
- ✅ Know where to save new projects

## Method 1: Using Finder (Easiest!)

This is the easiest way to create your Projects folder.

### Step 1: Open Finder

1. Click the **Finder icon** in your Dock (the smiling blue and white face)
   - Or press **Command (⌘) + Space** to open Spotlight, type "Finder", and press Enter

### Step 2: Go to Your Home Folder

1. In Finder, click **Go** in the menu bar at the top
2. Click **Home** (or press **Shift + Command + H**)
3. You're now in your home folder (it has your username and a house icon)

### Step 3: Create the Projects Folder

1. Right-click (or Control-click) in an empty space in the window
2. Choose **New Folder** from the menu
3. A new folder appears with the name highlighted
4. Type: **Projects**
5. Press **Return** (Enter)

🎉 **Done!** You now have a Projects folder!

## Method 2: Using Terminal

This method uses commands, which is more like "real programming"!

### Step 1: Open Terminal

1. Press **Command (⌘) + Space** to open Spotlight
2. Type **"Terminal"**
3. Press **Return** to open Terminal (a window with text will appear)
   - Or go to **Applications** → **Utilities** → **Terminal**

### Step 2: Create the Projects Folder

1. Type this command and press **Return**:
   ```bash
   mkdir Projects
   ```
   - `mkdir` stands for "make directory" (directory is another word for folder)

2. To check it was created, type:
   ```bash
   ls
   ```
   - You should see "Projects" in the list

3. To open it, type:
   ```bash
   cd Projects
   ```
   - `cd` stands for "change directory" (move into that folder)

🎉 **Done!** Your Projects folder is created!

## Where is Your Projects Folder?

Your Projects folder is in your **home folder**, which is usually here:
```
/Users/YourName/Projects
```
(Replace "YourName" with your actual macOS username)

## How to Find It Again

### Using Finder:
1. Open Finder
2. Press **Shift + Command + H** to go to your home folder
3. Look for the **Projects** folder

### Using Favorites (Even Faster!):
1. Open Finder
2. Find your Projects folder
3. **Drag** it to the **Favorites** section in the left sidebar
4. Now it will always be at the top of the left side!

## Creating Folders Inside Projects

As you start coding, you'll want to create a new folder for each project:

1. Open your **Projects** folder
2. Right-click (or Control-click) in empty space
3. Choose **New Folder**
4. Give it a name like:
   - `my-first-website`
   - `javascript-practice`
   - `game-project`
   - `school-assignment`

**Tip:** Use lowercase letters and dashes (-) instead of spaces in project names. This makes them easier to work with in code!

## Organising Your Projects

Here's how your folder structure might look:

```
Projects/
├── my-first-website/
├── javascript-practice/
├── python-games/
└── school-projects/
```

Each project gets its own folder. Nice and organized!

## Using Your Projects Folder

### When starting a new project:
1. Open your Projects folder in Finder
2. Create a new folder for the project
3. Open that folder
4. Start creating your files!

### From Terminal:
```bash
cd Projects
mkdir my-new-project
cd my-new-project
```

### From VS Code:
1. Open VS Code
2. Click **File** → **Open Folder** (or press **Command + O**)
3. Navigate to **Projects**
4. Choose the project folder you want to work on

## Tips for Staying Organized

- 📁 Create a new folder for each project
- 📝 Give folders clear names so you remember what they are
- 🗑️ Delete old practice projects you don't need anymore
- 💾 Use Time Machine to backup your Projects folder regularly
