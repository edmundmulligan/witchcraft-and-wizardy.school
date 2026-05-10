# How to Create a Projects Folder on Arch Linux

## What is a Projects Folder?

A Projects folder is a special place on your computer where you keep all your coding projects organised. It's like having a toy box where you keep all your toys in one place - it makes everything easier to find!

## Why Do You Need It?

When you start coding, you'll create lots of different projects. Having them all in one folder helps you:
- ✅ Find your projects quickly
- ✅ Keep your computer organised
- ✅ Back up your work easily
- ✅ Know where to save new projects

## Method 1: Using File Manager (Easiest!)

This is the easiest way to create your Projects folder using your file manager (Dolphin, Thunar, Nautilus, etc.).

### Step 1: Open Your File Manager

1. Click your **file manager** icon in your panel/dock
   - Or press **Super + E** (if configured)
   - Or open it from your application menu

### Step 2: Go to Your Home Folder

1. Click **Home** in the left sidebar
2. You're now in your home folder (it has your username)

### Step 3: Create the Projects Folder

1. Right-click in an empty space in the window
2. Choose **Create New** → **Folder** (or similar, depending on your file manager)
3. A dialog box appears or the folder name becomes editable
4. Type: **Projects**
5. Press **Enter**

🎉 **Done!** You now have a Projects folder!

## Method 2: Using Terminal

This method uses commands, which is more like "real programming"!

### Step 1: Open Terminal

1. Press **Ctrl + Alt + T** (on many desktop environments)
   - Or search for "Terminal" in your application menu
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
   - You should see "Projects" in the list (it will be blue/colored, indicating it's a folder)

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
(Replace "yourname" with your actual Arch Linux username)

You can also refer to it as:
```
~/Projects
```
(The `~` symbol is a shortcut for your home folder)

## How to Find It Again

### Using Your File Manager:
1. Open your file manager
2. Click **Home** in the left sidebar
3. Look for the **Projects** folder

### Using Bookmarks (Even Faster!):
1. Open your file manager
2. Navigate to your Projects folder
3. **Drag** it to the bookmarks/favorites section
   - Or right-click and choose **Add to Bookmarks** (varies by file manager)
4. Now it will always be easily accessible!

## Creating Folders Inside Projects

As you start coding, you'll want to create a new folder for each project:

1. Open your **Projects** folder
2. Right-click in empty space
3. Choose **Create New** → **Folder**
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
1. Open your Projects folder in your file manager
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
- 💾 Use backup tools like Timeshift or rsync to backup your Projects folder

## Keyboard Shortcuts for Arch Linux

Shortcuts may vary depending on your desktop environment (KDE, GNOME, XFCE, etc.):

- **Ctrl + Alt + T** - Open Terminal (most DEs)
- **Super** (Windows key) - Open application launcher
- **Ctrl + H** - Show hidden files in file manager
- **F2** - Rename a folder
- **Ctrl + Shift + N** - Create new folder (in some file managers)

## Advanced: Using XDG User Directories

Arch Linux follows the XDG Base Directory specification. You can customize your user directories:

```bash
# Install xdg-user-dirs if not already installed
sudo pacman -S xdg-user-dirs

# View current directories
xdg-user-dirs-update --list

# The Projects folder is not a standard XDG directory,
# but you can add it to your shell config for quick access:
echo 'export PROJECTS=~/Projects' >> ~/.bashrc
source ~/.bashrc

# Now you can use: cd $PROJECTS
```

## File Manager Specific Tips

### For Dolphin (KDE):
- Press **F4** to open an embedded terminal
- Press **Ctrl + I** to split view
- **Ctrl + T** opens a new tab

### For Thunar (XFCE):
- Right-click → **Open Terminal Here**
- **F9** toggles the side panel
- Customize shortcuts in Edit → Preferences

### For Nautilus (GNOME):
- Press **Ctrl + L** to type paths directly
- **Ctrl + H** shows hidden files
- **F9** toggles the sidebar
