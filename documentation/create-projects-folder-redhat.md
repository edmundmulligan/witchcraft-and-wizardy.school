# How to Create a Projects Folder on Red Hat

## What is a Projects Folder?

A Projects folder is a special place on your computer where you keep all your coding projects organised. It's like having a toy box where you keep all your toys in one place - it makes everything easier to find!

## Why Do You Need It?

When you start coding, you'll create lots of different projects. Having them all in one folder helps you:
- ✅ Find your projects quickly
- ✅ Keep your computer organised
- ✅ Back up your work easily
- ✅ Know where to save new projects

## Method 1: Using Files (Easiest!)

This is the easiest way to create your Projects folder using GNOME Files.

### Step 1: Open Files

1. Click **Activities** in the top-left corner
2. Type **"Files"** and press **Enter**
   - Or click the **Files** icon in your favorites bar

### Step 2: Go to Your Home Folder

1. Click **Home** in the left sidebar
2. You're now in your home folder (it has your username)

### Step 3: Create the Projects Folder

1. Right-click in an empty space in the window
2. Choose **New Folder** from the menu
3. A dialog box appears
4. Type: **Projects**
5. Click **Create** or press **Enter**

🎉 **Done!** You now have a Projects folder!

## Method 2: Using Terminal

This method uses commands, which is more like "real programming"!

### Step 1: Open Terminal

1. Press **Ctrl + Alt + T** (if enabled)
   - Or click **Activities**, type "Terminal", and press **Enter**
   - Or right-click on the desktop and choose **Open Terminal Here** (if available)

### Step 2: Create the Projects Folder

1. Type this command and press **Enter**:
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
/home/yourname/Projects
```
(Replace "yourname" with your actual Red Hat username)

You can also refer to it as:
```
~/Projects
```
(The `~` symbol is a shortcut for your home folder)

## How to Find It Again

### Using Files:
1. Open Files
2. Click **Home** in the left sidebar
3. Look for the **Projects** folder

### Using Bookmarks (Even Faster!):
1. Open Files
2. Navigate to your Projects folder
3. Drag it to the left sidebar under "Bookmarks"
4. Or right-click it and choose **Add to Bookmarks**
5. Now it will always be in your left sidebar!

## Creating Folders Inside Projects

As you start coding, you'll want to create a new folder for each project:

1. Open your **Projects** folder
2. Right-click in empty space
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
1. Open your Projects folder in Files
2. Create a new folder for the project
3. Open that folder
4. Start creating your files!

### From Terminal:
```bash
cd ~/Projects
mkdir my-new-project
cd my-new-project
```

### From VS Code:
1. Open VS Code
2. Click **File** → **Open Folder** (or press **Ctrl + K, Ctrl + O**)
3. Navigate to **Projects**
4. Choose the project folder you want to work on

## Tips for Staying Organized

- 📁 Create a new folder for each project
- 📝 Give folders clear names so you remember what they are
- 🗑️ Delete old practice projects you don't need anymore
- 💾 Use backup tools to backup your Projects folder regularly

## Keyboard Shortcuts for Red Hat

- **Ctrl + Alt + T** - Open Terminal (may need to be enabled)
- **Super** (Windows key) - Open Activities
- **Ctrl + H** - Show hidden files in Files
- **F2** - Rename a folder
- **Ctrl + Shift + N** - Create new folder (in some file managers)

## SELinux Context (Advanced)

Red Hat uses SELinux for security. Your Projects folder will automatically have the correct context, but if you ever have permission issues:

```bash
# View SELinux context
ls -Z ~/Projects

# Restore default context if needed
restorecon -Rv ~/Projects
```

You usually won't need to worry about this as a beginner!
