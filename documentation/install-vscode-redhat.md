# How to Install Visual Studio Code on Red Hat

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

1. Open Terminal (click **Activities** → search for "Terminal")
2. Type this command and press **Enter**:
   ```bash
   code --version
   ```
3. **If you see version numbers** (like 1.95.0), VS Code is already installed!
4. **If you see an error** like "command not found", VS Code is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if VS Code is NOT already installed on your computer.**

### Method 1: Using Microsoft's RPM Repository (Recommended!)

This method installs VS Code from Microsoft's official repository and allows automatic updates:

1. Open Terminal

2. Import Microsoft's GPG key:
   ```bash
   sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
   ```

3. Create the VS Code repository file:
   ```bash
   sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
   ```

4. Update package cache and install VS Code:
   
   **For RHEL 8+ and Fedora (DNF):**
   ```bash
   sudo dnf check-update
   sudo dnf install code -y
   ```
   
   **For RHEL 7 (YUM):**
   ```bash
   sudo yum check-update
   sudo yum install code -y
   ```

5. Launch VS Code:
   ```bash
   code
   ```

🎉 **Done!** VS Code is installed!

### Method 2: Download and Install RPM Package

1. Open Firefox (or your web browser)

2. Go to: **https://code.visualstudio.com**

3. Click **Download for Linux** → **.rpm** (for Red Hat/Fedora/SUSE)

4. Wait for the file to download (called something like `code-1.xx.x.el7.x86_64.rpm`)

5. Open Terminal and navigate to Downloads:
   ```bash
   cd ~/Downloads
   ```

6. Install the RPM package:
   
   **For RHEL 8+ and Fedora:**
   ```bash
   sudo dnf install ./code-*.rpm
   ```
   
   **For RHEL 7:**
   ```bash
   sudo yum install ./code-*.rpm
   ```

7. Launch VS Code:
   ```bash
   code
   ```

🎉 **Done!** VS Code is installed!

### Method 3: Using Snap (If Available)

Some Red Hat systems support Snap packages:

1. Install snapd (if not already installed):
   ```bash
   sudo dnf install snapd -y
   sudo systemctl enable --now snapd.socket
   sudo ln -s /var/lib/snapd/snap /snap
   ```

2. Restart Terminal or log out and back in

3. Install VS Code:
   ```bash
   sudo snap install code --classic
   ```

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
4. VS Code will now appear in your favorites bar!

## What's Next?

Now that you have VS Code installed, you can:
- Open a folder to start coding
- Install extensions to add more features
- Start writing your first program!

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Make sure your Red Hat subscription is active (for RHEL)
3. Try running `sudo dnf check-update` before installing
4. Check you have enough disk space (VS Code needs about 300MB)
5. Make sure you have administrator (sudo) privileges
6. Try restarting your computer
7. Ask an adult or teacher for help

## Tips for Beginners

- **Save your work often!** Press `Ctrl + S` to save
- **Zoom in/out:** Hold `Ctrl` and press `+` or `-`
- **Open a folder:** Click `File` → `Open Folder` (or press `Ctrl + K, Ctrl + O`)
- **Dark mode:** VS Code starts in dark mode (black background). If you prefer light mode, click the gear icon ⚙️ at the bottom left → `Theme` → `Color Theme` → choose "Light+"
- **Command Palette:** Press `Ctrl + Shift + P` to access all commands

## Keyboard Shortcuts for Red Hat

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

### If installed via repository:
```bash
# RHEL 8+/Fedora
sudo dnf upgrade code

# RHEL 7
sudo yum update code
```

### If installed via Snap:
```bash
sudo snap refresh code
```

## Uninstall VS Code (If Needed)

If you ever need to uninstall VS Code:

### If installed via DNF:
```bash
sudo dnf remove code
```

### If installed via YUM:
```bash
sudo yum remove code
```

### If installed via Snap:
```bash
sudo snap remove code
```

To also remove configuration files:
```bash
rm -rf ~/.config/Code
rm -rf ~/.vscode
```

## SELinux Considerations (Advanced)

Red Hat uses SELinux for security. VS Code should work fine with SELinux enabled, but if you encounter issues:

```bash
# Check SELinux status
sestatus

# View SELinux denials (if any)
sudo ausearch -m avc -ts recent

# If needed, restore context
restorecon -Rv ~/.config/Code
```

Most users won't need to worry about this!

## Why Use VS Code?

- ✅ Free and open source
- ✅ Fast and lightweight
- ✅ Thousands of extensions available
- ✅ Built-in Git integration
- ✅ Integrated Terminal
- ✅ Excellent for all programming languages
- ✅ Works on Red Hat, Ubuntu, Windows, and macOS
- ✅ Regular updates and improvements
- ✅ Great community support
- ✅ Enterprise-ready
- ✅ Low resource usage

## Troubleshooting

**VS Code won't start:**
- Try running `code --disable-gpu` from Terminal
- Check error logs: `code --verbose`
- Make sure you have required dependencies

**Can't open Terminal in VS Code:**
- Make sure bash is installed: `which bash`
- Check VS Code Terminal settings

**Permission issues:**
- Make sure you installed with proper permissions
- Don't run VS Code with `sudo`

**GPG key errors:**
- Re-import Microsoft's GPG key
- Check internet connection

## Enterprise Considerations

If you're using Red Hat in an enterprise environment:
- VS Code is free for both personal and commercial use
- Consider hosting an internal package mirror for offline installations
- Check with your system administrator for approved versions
- VS Code supports enterprise proxy configurations
- Extension marketplace can be configured for internal repositories
