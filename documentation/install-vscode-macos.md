# How to Install Visual Studio Code on macOS

## What is Visual Studio Code?

Visual Studio Code (VS Code) is a free program that helps you write code. Think of it like Pages or TextEdit, but designed specifically for programming!

## Before You Start: Check if VS Code is Already Installed

Before downloading, let's see if you already have VS Code on your computer!

### Method 1: Check with Spotlight

1. Press **Command (⌘) + Space** to open Spotlight
2. Type **"Visual Studio Code"** or **"VS Code"**
3. If you see it appear with a blue icon, **it's already installed!** 
   - Press **Return** to open VS Code
   - **Skip to "What's Next?" at the bottom of this guide**
4. If you don't see it, continue to the installation steps below

### Method 2: Check Using Terminal

1. Press **Command (⌘) + Space**, type "Terminal", press **Return**
2. Type this command and press **Return**:
   ```bash
   code --version
   ```
3. **If you see version numbers** (like 1.95.0), VS Code is already installed! Close Terminal and skip the installation.
4. **If you see an error** like "command not found", VS Code is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if VS Code is NOT already installed on your computer.**

### Step 1: Download VS Code

1. Open your web browser (like Safari or Firefox)
2. Go to: **https://code.visualstudio.com**
3. Click the big blue **"Download Mac Universal"** button
   - This version works on both Intel and Apple Silicon (M1/M2/M3) Macs
4. Wait for the file to download (it's called something like `VSCode-darwin-universal.zip`)
5. The file will be saved to your **Downloads** folder

### Step 2: Install VS Code

1. Find the **.zip** file in your **Downloads** folder
2. **Double-click** the .zip file to extract it
3. You'll see a **Visual Studio Code.app** file appear
4. **Drag** the **Visual Studio Code** app to your **Applications** folder
   - You can open a new Finder window and click **Applications** in the sidebar
   - Or drag it to the Applications shortcut in the Downloads folder window

### Step 3: Open VS Code for the First Time

1. Open **Finder**
2. Click **Applications**
3. Find and **double-click Visual Studio Code**
4. You might see a message: **"Visual Studio Code is an app downloaded from the internet. Are you sure you want to open it?"**
   - Click **Open** (this is safe - VS Code is from Microsoft's official website)
5. VS Code will open! 🎉

### Step 4: Add VS Code to Your Dock

To make VS Code easier to find:

1. With VS Code open, look at its icon in the Dock
2. **Right-click** (or Control-click) the VS Code icon in the Dock
3. Choose **Options** → **Keep in Dock**
4. Now VS Code will always stay in your Dock!

### Step 5: Install the 'code' Command (Optional but Recommended)

This lets you open VS Code from Terminal:

1. In VS Code, press **Command (⌘) + Shift + P** to open the Command Palette
2. Type **"shell command"**
3. Click **"Shell Command: Install 'code' command in PATH"**
4. Enter your password if asked
5. You'll see a message saying it was installed successfully

Now you can open VS Code from Terminal by typing `code`!

## What's Next?

Now that you have VS Code installed, you can:
- Open a folder to start coding
- Install extensions to add more features
- Start writing your first program!

## Need Help?

If something doesn't work:
1. Make sure you downloaded VS Code from the official website (code.visualstudio.com)
2. Make sure you dragged VS Code to the Applications folder (not just running it from Downloads)
3. Try restarting your computer
4. Check you have enough disk space (VS Code needs about 300MB)
5. Ask an adult or teacher for help

## Tips for Beginners

- **Save your work often!** Press `Command (⌘) + S` to save
- **Zoom in/out:** Hold `Command (⌘)` and press `+` or `-`
- **Open a folder:** Click `File` → `Open Folder` (or press `Command + O`)
- **Dark mode:** VS Code starts in dark mode (black background). If you prefer light mode, click the gear icon ⚙️ at the bottom left → `Theme` → `Color Theme` → choose "Light+"
- **Command Palette:** Press `Command (⌘) + Shift + P` to access all commands

## Keyboard Shortcuts for macOS

- **Command (⌘) + S** - Save file
- **Command (⌘) + P** - Quick open (find files)
- **Command (⌘) + W** - Close current tab
- **Command (⌘) + Q** - Quit VS Code completely
- **Command (⌘) + ,** (comma) - Open Settings
- **Command (⌘) + /** - Toggle comment
- **Command (⌘) + /** - Split editor
- **Command (⌘) + B** - Toggle sidebar
- **Control + `** (backtick) - Toggle integrated Terminal

## Using VS Code from Terminal

If you installed the 'code' command, you can:

```bash
# Open current folder in VS Code
code .

# Open a specific folder
code /Users/YourName/Projects/my-project

# Open a specific file
code hello.js

# Create and open a new file
code newfile.txt
```

## Recommended Extensions for Beginners

To install extensions:

1. Click the **Extensions** icon in the left sidebar (looks like building blocks)
2. Search for these useful extensions:
   - **Prettier** - Automatically formats your code
   - **Live Server** - Preview HTML files in a browser
   - **ESLint** - Helps you write better JavaScript
   - **HTML CSS Support** - Better HTML and CSS editing

## Why Use VS Code?

- ✅ Free and open source
- ✅ Fast and lightweight
- ✅ Thousands of extensions available
- ✅ Built-in Git integration
- ✅ Integrated Terminal
- ✅ Excellent for all programming languages
- ✅ Works on macOS, Windows, and Linux
- ✅ Regular updates and improvements
- ✅ Great community support
