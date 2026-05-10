# How to Install Visual Studio Code on Arch Linux

## What is Visual Studio Code?

Visual Studio Code (VS Code) is a free program that helps you write code. Think of it like a text editor, but designed specifically for programming!

## Before You Start: Check if VS Code is Already Installed

Before installing, let's see if you already have VS Code on your computer!

### Method 1: Check Your Application Menu

1. Open your **application launcher** (press **Super** key or click your menu)
2. Search for **"Visual Studio Code"** or **"VS Code"** or **"Code"**
3. If you see it appear with a blue icon, **it's already installed!** 
   - Click it to open VS Code
   - **Skip to "What's Next?" at the bottom of this guide**
4. If you don't see it, continue to the installation steps below

### Method 2: Check Using Terminal

1. Open Terminal (press **Ctrl + Alt + T** or search for "Terminal")
2. Type this command and press **Enter**:
   ```bash
   code --version
   ```
3. **If you see version numbers** (like 1.95.0), VS Code is already installed!
4. **If you see an error** like "command not found", VS Code is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if VS Code is NOT already installed on your computer.**

### Method 1: Using yay or paru (AUR - Recommended!)

The most popular way to install VS Code on Arch is from the AUR:

1. Open Terminal

2. Update your system first:
   ```bash
   sudo pacman -Syu
   ```

3. Install VS Code using yay (or paru):
   ```bash
   yay -S visual-studio-code-bin
   ```
   - Press **Enter** to confirm
   - Wait for the download and installation to complete (this takes 2-5 minutes)

4. Verify installation:
   ```bash
   code --version
   ```

5. Launch VS Code:
   ```bash
   code
   ```

🎉 **Done!** VS Code is installed!

**Note:** `visual-studio-code-bin` installs the official Microsoft build. If you prefer the open-source version, use `code` instead.

### Method 2: Install Open-Source Version

For a fully open-source version (no Microsoft branding or telemetry):

```bash
yay -S code
```

Or from the official repositories (if available):
```bash
sudo pacman -S code
```

### Method 3: Using Snap (If Available)

If you have snapd installed:

```bash
# Install snapd if needed
sudo pacman -S snapd
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap

# Install VS Code
sudo snap install code --classic
```

### Method 4: Using Flatpak (If Available)

If you have Flatpak installed:

```bash
# Install Flatpak if needed
sudo pacman -S flatpak

# Add Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install VS Code
flatpak install flathub com.visualstudio.code

# Launch VS Code
flatpak run com.visualstudio.code
```

## First Time Opening VS Code

1. Open your application menu and search for "Visual Studio Code"
2. Click to launch VS Code
3. You'll see a welcome screen - you can close this or explore the getting started guide
4. VS Code is ready to use!

## Optional: Pin VS Code to Your Panel/Dock

Depending on your desktop environment:

### KDE Plasma:
- Right-click the VS Code icon in the task manager while running
- Choose **Show Launcher When Not Running**

### GNOME:
- While VS Code is running, right-click its icon in the dash
- Choose **Add to Favorites**

### XFCE:
- Right-click on a panel
- Choose **Panel** → **Add New Items** → **Launcher**
- Browse to VS Code

## What's Next?

Now that you have VS Code installed, you can:
- Open a folder to start coding
- Install extensions to add more features
- Start writing your first program!

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Make sure you have an AUR helper installed (yay or paru)
3. Try running `sudo pacman -Syu` to update your system first
4. Check you have enough disk space (VS Code needs about 300MB)
5. Check the Arch Wiki: https://wiki.archlinux.org/title/Visual_Studio_Code
6. Ask an adult or teacher for help

## Tips for Beginners

- **Save your work often!** Press `Ctrl + S` to save
- **Zoom in/out:** Hold `Ctrl` and press `+` or `-`
- **Open a folder:** Click `File` → `Open Folder` (or press `Ctrl + K, Ctrl + O`)
- **Dark mode:** VS Code starts in dark mode (black background). If you prefer light mode, click the gear icon ⚙️ at the bottom left → `Theme` → `Color Theme` → choose "Light+"
- **Command Palette:** Press `Ctrl + Shift + P` to access all commands

## Keyboard Shortcuts for Arch Linux

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

# Open with specific extensions disabled
code --disable-extensions
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
   - **Bracket Pair Colorizer** - Color-codes matching brackets
   - **Path Intellisense** - Autocomplete file paths

## Updating VS Code

Arch uses a rolling release model, so VS Code updates with your system:

### If installed via AUR (yay):
```bash
# Update entire system (recommended)
yay -Syu

# Update only VS Code
yay -S visual-studio-code-bin
```

### If installed via Snap:
```bash
sudo snap refresh code
```

### If installed via Flatpak:
```bash
flatpak update com.visualstudio.code
```

**Note:** On Arch, always update the entire system rather than individual packages!

## Uninstall VS Code (If Needed)

### If installed via yay:
```bash
yay -R visual-studio-code-bin
# or
yay -R code
```

### If installed via Snap:
```bash
sudo snap remove code
```

### If installed via Flatpak:
```bash
flatpak uninstall com.visualstudio.code
```

To also remove configuration files:
```bash
rm -rf ~/.config/Code
rm -rf ~/.vscode
```

## Advanced Configuration

### Enable Wayland Support:
If you're using Wayland, edit the VS Code launcher:
```bash
# Add these flags
code --enable-features=UseOzonePlatform --ozone-platform=wayland
```

### Custom Electron Flags:
Create `~/.config/code-flags.conf`:
```
--enable-features=UseOzonePlatform
--ozone-platform=wayland
--enable-gpu-rasterization
```

### Disable Telemetry:
In VS Code Settings (Ctrl + ,):
- Search for "telemetry"
- Set "Telemetry: Telemetry Level" to "off"

Or edit `~/.config/Code/User/settings.json`:
```json
{
  "telemetry.telemetryLevel": "off"
}
```

## Why Use VS Code?

- ✅ Free and open source (OSS build)
- ✅ Fast and lightweight
- ✅ Thousands of extensions available
- ✅ Built-in Git integration
- ✅ Integrated Terminal
- ✅ Excellent for all programming languages
- ✅ Works on Arch, Ubuntu, Windows, and macOS
- ✅ Regular updates via rolling release
- ✅ Great community support
- ✅ Highly customizable
- ✅ Excellent performance on Arch Linux

## Alternatives to VS Code

If you prefer other editors available on Arch:

```bash
# VSCodium (VS Code without Microsoft branding)
yay -S vscodium-bin

# Neovim (terminal-based, highly customizable)
sudo pacman -S neovim

# Sublime Text
yay -S sublime-text-4

# Atom (being sunset, but still available)
yay -S atom

# JetBrains IDEs
yay -S intellij-idea-community-edition
yay -S pycharm-community-edition
```

## Arch Wiki

For more advanced configuration and troubleshooting:
```bash
# Or visit: https://wiki.archlinux.org/title/Visual_Studio_Code
```

## Troubleshooting

**VS Code won't start:**
- Try running with verbose output: `code --verbose`
- Check for conflicting processes: `ps aux | grep code`
- Try safe mode: `code --disable-extensions`

**Electron/GPU issues:**
- Disable GPU acceleration: `code --disable-gpu`
- Try software rendering: `code --disable-gpu --disable-software-rasterizer`

**Can't open Terminal in VS Code:**
- Make sure bash or zsh is installed: `which bash`
- Check VS Code Terminal settings
- Try different shell: Ctrl + , → search "terminal.integrated.shell.linux"

**Extension marketplace not working:**
- Check internet connection
- Verify firewall settings
- Try restarting VS Code

**High CPU/RAM usage:**
- Disable unused extensions
- Reduce file watcher scope in settings
- Close unused editor tabs

**Wayland-specific issues:**
- Add Electron flags (see Advanced Configuration)
- Or use X11/Xwayland mode

## Performance Tips for Arch

```bash
# Optimize VS Code for Arch
# Add to ~/.config/Code/User/settings.json

{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true
  },
  "search.followSymlinks": false,
  "typescript.disableAutomaticTypeAcquisition": true
}
```
