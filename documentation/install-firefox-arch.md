# How to Install Firefox on Arch Linux

## What is Firefox?

Firefox is a free web browser made by Mozilla. A web browser is the program you use to visit websites on the internet - like Google Chrome, Microsoft Edge, or Safari.

## Before You Start: Check if Firefox is Already Installed

Before installing, let's see if you already have Firefox on your computer!

### Method 1: Check Your Application Menu

1. Open your **application launcher** (press **Super** key or click your menu)
2. Search for **"Firefox"**
3. If you see it appear with an orange/red fox icon, **it's already installed!** 
   - Click it to open Firefox
   - **Skip to "What's Next?" at the bottom of this guide**
4. If you don't see it, continue to the installation steps below

### Method 2: Check Using Terminal

1. Press **Ctrl + Alt + T** to open Terminal (or open it from your menu)
2. Type this command and press **Enter**:
   ```bash
   firefox --version
   ```
3. If you see a version number (like "Mozilla Firefox 121.0"), **Firefox is already installed!**
4. If you see "command not found", continue to the installation steps below

## Installation Steps

**Only follow these steps if Firefox is NOT already installed on your computer.**

### Method 1: Using Pacman (Official Repository - Recommended!)

This installs Firefox from Arch's official repositories:

1. Open Terminal

2. Update your system first (always a good practice on Arch):
   ```bash
   sudo pacman -Syu
   ```
   - Enter your password when prompted (you won't see it being typed - this is normal!)
   - Press **Enter** to confirm

3. Install Firefox:
   ```bash
   sudo pacman -S firefox
   ```
   - Press **Enter** to confirm installation
   - Wait for the download and installation to complete (this takes 1-3 minutes)

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

### Method 2: Using yay or paru (AUR Helper)

If you prefer Firefox Developer Edition or ESR (Extended Support Release):

```bash
# For Firefox Developer Edition
yay -S firefox-developer-edition

# For Firefox ESR
yay -S firefox-esr
```

### Method 3: Using Flatpak (If Available)

If you have Flatpak installed:

```bash
# Install Flatpak if needed
sudo pacman -S flatpak

# Add Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install Firefox
flatpak install flathub org.mozilla.firefox

# Launch Firefox
flatpak run org.mozilla.firefox
```

## First Time Opening Firefox

1. Open your application menu and search for "Firefox"
2. Click to launch Firefox
3. Firefox will show a welcome page
4. You might be asked:
   - **"Make Firefox your default browser?"** - This means Firefox will open when you click links. You can choose **Set as Default** or **Not now** (you can change this later)
   - **"Set Up Firefox Sync?"** - This lets you save bookmarks to your account. You can choose **Not now** if you want (you can do this later)
5. That's it! Firefox is ready to use!

## Optional: Pin Firefox to Your Panel/Dock

Depending on your desktop environment:

### KDE Plasma:
- Right-click the Firefox icon in the task manager
- Choose **Show Launcher When Not Running**

### GNOME:
- While Firefox is running, right-click its icon in the dash
- Choose **Add to Favorites**

### XFCE:
- Right-click on a panel
- Choose **Panel** → **Add New Items** → **Launcher**
- Browse to Firefox

## What's Next?

Now that you have Firefox installed, you can:
- Start browsing the web
- Set your favorite website as your homepage
- Install add-ons (extra features) to customize Firefox
- Import bookmarks from your old browser

## Uninstall Firefox (If Needed)

If you ever need to uninstall Firefox:

### If installed via pacman:
```bash
sudo pacman -R firefox
```

### If installed via yay:
```bash
yay -R firefox-developer-edition
# or
yay -R firefox-esr
```

### If installed via Flatpak:
```bash
flatpak uninstall org.mozilla.firefox
```

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Try running `sudo pacman -Syu` to update your system first
3. Check if you have enough disk space (Firefox needs about 200MB)
4. Make sure you have sudo privileges
5. Check the Arch Wiki: https://wiki.archlinux.org/title/Firefox
6. Ask an adult or teacher for help

## Tips for Beginners

- **Zoom in/out:** Hold `Ctrl` and press `+` or `-`
- **New tab:** Press `Ctrl + T`
- **Close tab:** Press `Ctrl + W`
- **Bookmarks:** Press `Ctrl + D` to save a website you like
- **Private browsing:** Press `Ctrl + Shift + P` (this doesn't save your history)
- **Homepage:** You can set any website as your homepage in Settings
- **Quit Firefox:** Press `Ctrl + Q`

## Keyboard Shortcuts for Arch Linux

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
- ✅ Works on Arch, Ubuntu, Windows, macOS, and phones
- ✅ Thousands of free add-ons available
- ✅ Excellent integration with Linux desktop environments
- ✅ Uses less RAM than Chrome
- ✅ Highly customizable
- ✅ First-class support on Arch Linux

## Updating Firefox

Arch uses a rolling release model, so Firefox updates with your system:

```bash
# Update entire system (recommended)
sudo pacman -Syu

# Update only Firefox (not recommended on Arch)
sudo pacman -S firefox
```

**Note:** On Arch, always update the entire system rather than individual packages to avoid partial upgrades!

## Advanced: Custom Firefox Configurations

### Install Firefox Nightly (Cutting-edge features):
```bash
yay -S firefox-nightly
```

### Hardware Acceleration:
Firefox should have hardware acceleration enabled by default on Arch. To check:
1. Type `about:support` in the address bar
2. Look for "Graphics" section
3. Check "Compositing" - should say "WebRender"

### Wayland Support:
If you're using Wayland:
```bash
# Set environment variable
echo 'export MOZ_ENABLE_WAYLAND=1' >> ~/.bashrc
source ~/.bashrc
```

### Custom Profile Location:
```bash
# Launch Firefox with a specific profile
firefox -P ProfileName

# Create a new profile
firefox -ProfileManager
```

## Arch Wiki

For more advanced configuration and troubleshooting, consult the excellent Arch Wiki:
```bash
# Or visit: https://wiki.archlinux.org/title/Firefox
```

The Arch Wiki is one of the best Linux documentation resources available!

## Troubleshooting

**Firefox won't start:**
- Check for conflicting processes: `ps aux | grep firefox`
- Try safe mode: `firefox -safe-mode`
- Check logs: `journalctl -xe | grep firefox`

**Sound not working:**
- Install PulseAudio or PipeWire: `sudo pacman -S pulseaudio` or `sudo pacman -S pipewire`
- Check Firefox audio settings in `about:preferences`

**Video playback issues:**
- Install codecs: `sudo pacman -S ffmpeg`
