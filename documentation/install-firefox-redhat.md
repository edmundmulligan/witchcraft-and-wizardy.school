# How to Install Firefox on Red Hat

## What is Firefox?

Firefox is a free web browser made by Mozilla. A web browser is the program you use to visit websites on the internet - like Google Chrome, Microsoft Edge, or Safari.

**Good news!** Firefox usually comes pre-installed on Red Hat Enterprise Linux (RHEL) and Fedora, so you might already have it!

## Before You Start: Check if Firefox is Already Installed

Before installing, let's see if you already have Firefox on your computer!

### Method 1: Check the Activities Menu

1. Click **Activities** in the top-left corner (or press the **Super** key)
2. Type **"Firefox"**
3. If you see it appear with an orange/red fox icon, **it's already installed!** 
   - Click it to open Firefox
   - **Skip to "What's Next?" at the bottom of this guide**
4. If you don't see it, continue to the installation steps below

### Method 2: Check Using Terminal

1. Press **Ctrl + Alt + T** to open Terminal (or open it from Activities)
2. Type this command and press **Enter**:
   ```bash
   firefox --version
   ```
3. If you see a version number (like "Mozilla Firefox 121.0"), **Firefox is already installed!**
4. If you see "command not found", continue to the installation steps below

## Installation Steps

**Only follow these steps if Firefox is NOT already installed on your computer.**

### Method 1: Using GNOME Software (Easiest!)

1. Click **Activities** in the top-left corner
2. Type **"Software"** and press **Enter**
3. In GNOME Software, search for **"Firefox"**
4. Click on **Firefox Web Browser**
5. Click the **Install** button
6. Enter your password when prompted
7. Wait for the installation to complete (this takes 1-3 minutes)
8. Click **Launch** to open Firefox

### Method 2: Using DNF (Terminal Method)

Red Hat Enterprise Linux 8+ and Fedora use DNF (the Dandified YUM package manager):

1. Open Terminal (click **Activities** → search for "Terminal")

2. Update your system:
   ```bash
   sudo dnf check-update
   ```
   - Enter your password when prompted (you won't see it being typed - this is normal!)

3. Install Firefox:
   ```bash
   sudo dnf install firefox -y
   ```
   - Wait for the installation to complete (this takes 1-3 minutes)

4. Verify installation:
   ```bash
   firefox --version
   ```
   - You should see the Firefox version number

5. Launch Firefox:
   ```bash
   firefox &
   ```
   - The `&` lets Firefox run in the background so you can still use Terminal

🎉 **Done!** Firefox is installed!

### Method 3: Using YUM (For RHEL 7 and older)

If you're using an older version of Red Hat:

```bash
sudo yum update
sudo yum install firefox -y
```

## First Time Opening Firefox

1. Open **Activities** and search for "Firefox"
2. Click to launch Firefox
3. Firefox will show a welcome page
4. You might be asked:
   - **"Make Firefox your default browser?"** - This means Firefox will open when you click links. You can choose **Set as Default** or **Not now** (you can change this later)
   - **"Set Up Firefox Sync?"** - This lets you save bookmarks to your account. You can choose **Not now** if you want (you can do this later)
5. That's it! Firefox is ready to use!

## Optional: Pin Firefox to Your Favorites

To make Firefox easier to find:

1. Open **Activities** and search for "Firefox"
2. **Right-click** the Firefox icon
3. Choose **Add to Favorites**
4. Firefox will now appear in your favorites bar!

## What's Next?

Now that you have Firefox installed, you can:
- Start browsing the web
- Set your favorite website as your homepage
- Install add-ons (extra features) to customize Firefox
- Import bookmarks from your old browser

## Uninstall Firefox (If Needed)

If you ever need to uninstall Firefox:

### Using GNOME Software:
1. Open **GNOME Software**
2. Search for **Firefox**
3. Click **Remove**

### Using DNF:
```bash
sudo dnf remove firefox
```

### Using YUM (RHEL 7):
```bash
sudo yum remove firefox
```

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Try running `sudo dnf check-update` before installing
3. Check if you have enough disk space (Firefox needs about 200MB)
4. Make sure you have administrator (sudo) privileges
5. Check that your Red Hat subscription is active (for RHEL)
6. Ask an adult or teacher for help

## Tips for Beginners

- **Zoom in/out:** Hold `Ctrl` and press `+` or `-`
- **New tab:** Press `Ctrl + T`
- **Close tab:** Press `Ctrl + W`
- **Bookmarks:** Press `Ctrl + D` to save a website you like
- **Private browsing:** Press `Ctrl + Shift + P` (this doesn't save your history)
- **Homepage:** You can set any website as your homepage in Settings
- **Quit Firefox:** Press `Ctrl + Q`

## Keyboard Shortcuts for Red Hat

- **Ctrl + L** - Select the address bar
- **Ctrl + K** - Focus search bar
- **Ctrl + N** - Open a new window
- **Ctrl + Shift + T** - Reopen closed tab
- **Ctrl + Tab** - Switch between tabs
- **Alt + Left/Right Arrow** - Go back or forward
- **F11** - Toggle fullscreen mode

## Why Use Firefox?

- ✅ Free and open source
- ✅ Fast and secure
- ✅ Respects your privacy
- ✅ Blocks trackers automatically
- ✅ Works on Red Hat, Ubuntu, Windows, macOS, and phones
- ✅ Thousands of free add-ons available
- ✅ Great integration with GNOME desktop
- ✅ Uses less RAM than Chrome
- ✅ Often pre-installed on Red Hat systems
- ✅ Excellent support for enterprise environments

## Updating Firefox

Firefox will check for updates automatically. To update manually:

```bash
sudo dnf upgrade firefox
```

Or for RHEL 7:
```bash
sudo yum update firefox
```

## Enterprise Considerations

If you're using Red Hat in an enterprise environment:
- Firefox ESR (Extended Support Release) may be available
- Check with your system administrator for approved versions
- Consider using Firefox Policy Templates for organizational settings
- RHEL subscriptions include enterprise support
