# How to Install Visual Studio Code on Ubuntu

## What is Visual Studio Code?

Visual Studio Code (VS Code) is a free program that helps you write code. Think of it like a text editor, but designed specifically for programming!

## Before You Start: Check if VS Code is Already Installed

Before installing, let's see if you already have VS Code on your computer!

### Method 1: Check the Activities Menu

1. Click **Activities** in the top-left corner (or press the **Super** key)
2. Type **"Visual Studio Code"** or **"VS Code"** or **"Code"**
3. If you see it appear with a blue icon, **it's already installed!** 
   - Click it to open VS Code
   - **Skip to "What's Next?" at the bottom of this guide**
4. If you don't see it, continue to the installation steps below

### Method 2: Check Using Terminal

1. Press **Ctrl + Alt + T** to open Terminal
2. Type this command and press **Enter**:
   ```bash
   code --version
   ```
3. **If you see version numbers** (like 1.95.0), VS Code is already installed!
4. **If you see an error** like "command not found", VS Code is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if VS Code is NOT already installed on your computer.**

### Method 1: Using Ubuntu Software (Easiest!)

1. Click **Activities** in the top-left corner
2. Type **"Ubuntu Software"** and press **Enter**
3. In Ubuntu Software, search for **"Visual Studio Code"** or **"Code"**
4. Click on **Visual Studio Code**
5. Click the **Install** button
6. Enter your password when prompted
7. Wait for the installation to complete (this takes 1-3 minutes)
8. Click **Open** to launch VS Code

🎉 **Done!** VS Code is installed!

### Method 2: Download .deb Package from Website

1. Open Firefox (or your web browser)
2. Go to: **https://code.visualstudio.com**
3. Click **Download for Linux** → **.deb** (for Debian/Ubuntu)
4. Wait for the file to download (called something like `code_1.xx.x_amd64.deb`)
5. Open your **Downloads** folder
6. **Double-click** the .deb file
7. Click **Install** in Ubuntu Software
8. Enter your password when prompted
9. Wait for installation to complete

### Method 3: Using Terminal (Faster!)

This method installs VS Code from Microsoft's official repository:

1. Press **Ctrl + Alt + T** to open Terminal

2. Update package list and install dependencies:
   ```bash
   sudo apt update
   sudo apt install wget gpg -y
   ```

3. Import Microsoft's GPG key:
   ```bash
   wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
   sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
   ```

4. Add VS Code repository:
   ```bash
   echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null
   ```

5. Install VS Code:
   ```bash
   sudo apt update
   sudo apt install code -y
   ```

6. Launch VS Code:
   ```bash
   code
   ```

🎉 **Done!** VS Code is installed!

## First Time Opening VS Code

1. Open **Activities** and search for "Visual Studio Code"
2. Click to launch VS Code
3. You'll see a welcome screen - you can close this or explore the getting started guide
4. VS Code is ready to use!

## Optional: Pin VS Code to Your Favorites

To make VS Code easier to find:

1. Open **Activities** and search for "Visual Studio Code"
2. **Right-click** the VS Code icon
3. Choose **Add to Favorites**
4. VS Code will now appear in your application dock/launcher!

## What's Next?

Now that you have VS Code installed, you can:
- Open a folder to start coding
- Install extensions to add more features
- Start writing your first program!

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Try running `sudo apt update` before installing
3. Check you have enough disk space (VS Code needs about 300MB)
4. Make sure you entered your password correctly
5. Try restarting your computer
6. Ask an adult or teacher for help

## Tips for Beginners

- **Save your work often!** Press `Ctrl + S` to save
- **Zoom in/out:** Hold `Ctrl` and press `+` or `-`
- **Open a folder:** Click `File` → `Open Folder` (or press `Ctrl + K, Ctrl + O`)
- **Dark mode:** VS Code starts in dark mode (black background). If you prefer light mode, click the gear icon ⚙️ at the bottom left → `Theme` → `Color Theme` → choose "Light+"
- **Command Palette:** Press `Ctrl + Shift + P` to access all commands

## Keyboard Shortcuts for Ubuntu

- **Ctrl + S** - Save file
- **Ctrl + P** - Quick open (find files)
- **Ctrl + W** - Close current tab
- **Ctrl + Q** - Quit VS Code completely
- **Ctrl + ,** (comma) - Open Settings
- **Ctrl + /** - Toggle comment
- **Ctrl + \\** - Split editor
- **Ctrl + B** - Toggle sidebar
- **Ctrl + `** (backtick) - Toggle integrated Terminal
- **Ctrl + Shift + E** - Show Explorer
- **Ctrl + Shift + F** - Search across files

## Using VS Code from Terminal

Once installed, you can open VS Code from Terminal:

```bash
# Open current folder in VS Code
code .

# Open a specific folder
code ~/Projects/my-project

# Open a specific file
code hello.js

# Create and open a new file
code newfile.txt
```

## Recommended Extensions for Beginners

To install extensions:

1. Click the **Extensions** icon in the left sidebar (looks like building blocks)
   - Or press **Ctrl + Shift + X**
2. Search for these useful extensions:
   - **Prettier** - Automatically formats your code
   - **Live Server** - Preview HTML files in a browser
   - **ESLint** - Helps you write better JavaScript
   - **HTML CSS Support** - Better HTML and CSS editing
   - **Python** - If you're learning Python
   - **GitLens** - Enhanced Git integration

## Updating VS Code

VS Code will notify you when updates are available. To update manually:

### If installed via Ubuntu Software:
Updates will happen automatically through the Software Updater

### If installed via Terminal:
```bash
sudo apt update
sudo apt upgrade code
```

## Uninstall VS Code (If Needed)

If you ever need to uninstall VS Code:

### Using Ubuntu Software:
1. Open **Ubuntu Software**
2. Search for **Visual Studio Code**
3. Click **Remove**

### Using Terminal:
```bash
sudo apt remove code
```

To also remove configuration files:
```bash
rm -rf ~/.config/Code
rm -rf ~/.vscode
```

## Why Use VS Code?

- ✅ Free and open source
- ✅ Fast and lightweight
- ✅ Thousands of extensions available
- ✅ Built-in Git integration
- ✅ Integrated Terminal
- ✅ Excellent for all programming languages
- ✅ Works on Ubuntu, Windows, and macOS
- ✅ Regular updates and improvements
- ✅ Great community support
- ✅ Optimized for Linux/Ubuntu
- ✅ Low resource usage

## Troubleshooting

**VS Code won't start:**
- Try running `code --disable-gpu` from Terminal
- Check error logs: `code --verbose`

**Can't open Terminal in VS Code:**
- Make sure bash is installed: `which bash`
- Check VS Code Terminal settings

**Permission issues:**
- Make sure you installed with proper permissions
- Don't run VS Code with `sudo`
