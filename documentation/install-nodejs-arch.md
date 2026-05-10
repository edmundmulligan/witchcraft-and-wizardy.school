# How to Install Node.js on Arch Linux

## What is Node.js?

Node.js is a free program that lets you run JavaScript code on your computer (not just in a web browser). Think of it like an engine that powers JavaScript programs and lets you build websites, games, and apps!

## Before You Start: Check if Node.js is Already Installed

Before installing, let's see if you already have Node.js on your computer!

### Check Using Terminal

1. Open Terminal (press **Ctrl + Alt + T** or search for "Terminal")
2. Type this command and press **Enter**:
   ```bash
   node --version
   ```
3. **If you see a version number** (like v22.0.0 or v20.11.0), Node.js is already installed! 
   - **Skip to "What's Next?" at the bottom of this guide**
4. **If you see an error** like "command not found", Node.js is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if Node.js is NOT already installed on your computer.**

### Method 1: Using Pacman (Official Repository - Recommended!)

This installs Node.js from Arch's official repositories:

1. Open Terminal

2. Update your system first (always a good practice on Arch):
   ```bash
   sudo pacman -Syu
   ```
   - Enter your password when prompted (you won't see it being typed - this is normal!)
   - Press **Enter** to confirm

3. Install Node.js and npm:
   ```bash
   sudo pacman -S nodejs npm
   ```
   - Press **Enter** to confirm installation
   - Wait for the download and installation to complete (this takes 1-3 minutes)

4. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers for both

🎉 **Done!** Node.js is installed!

### Method 2: Install LTS Version via NVM (Recommended for Development!)

NVM (Node Version Manager) lets you install and switch between different Node.js versions:

1. Install NVM from AUR:
   ```bash
   # Using yay (if you have it)
   yay -S nvm

   # Or manually download the install script
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Close and reopen Terminal, or run:
   ```bash
   source ~/.bashrc
   ```

3. Install the latest LTS version:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

🎉 **Done!** Node.js LTS is installed via NVM!

### Method 3: Using yay or paru (AUR Helpers)

For specific versions or variants:

```bash
# For Node.js LTS (Long Term Support)
yay -S nodejs-lts-iron

# For the latest stable
yay -S nodejs

# List all available Node.js versions
yay -Ss nodejs
```

## What is npm?

When you install Node.js, you also get **npm** (Node Package Manager). This is a tool that helps you download and use code that other people have written. It's like an app store for code!

## What's Next?

Now that you have Node.js installed, you can:
- Run JavaScript files on your computer
- Install packages (code libraries) using npm
- Build your own websites and apps
- Follow JavaScript tutorials and courses

## Your First Node.js Program

Let's test that everything works:

1. Open Terminal

2. Create a test file:
   ```bash
   echo 'console.log("Hello, Node.js!");' > hello.js
   ```

3. Run the file:
   ```bash
   node hello.js
   ```

4. You should see: `Hello, Node.js!`

If you see that message, everything is working perfectly! 🎉

## Alternative: Install Specific Versions

Arch Linux typically provides the latest stable version. For specific needs:

### Using NVM (Best for multiple versions):
```bash
# Install specific version
nvm install 20.11.0
nvm install 18.19.0

# Switch between versions
nvm use 20.11.0
nvm use 18.19.0

# Set default version
nvm alias default 20.11.0

# List installed versions
nvm list
```

### Using Docker (Isolated environments):
```bash
# Run Node.js in Docker
docker run -it --rm node:20 node

# Or run a script
docker run -it --rm -v "$PWD":/app -w /app node:20 node hello.js
```

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Try running `sudo pacman -Syu` to update your system first
3. Make sure you have sudo privileges
4. Check that the installation completed without errors
5. Close and reopen Terminal after installing
6. Check the Arch Wiki: https://wiki.archlinux.org/title/Node.js
7. Ask an adult or teacher for help

## Tips for Beginners

- **Check versions anytime:** `node --version` and `npm --version`
- **Run a JavaScript file:** `node filename.js`
- **Install a package:** `npm install package-name`
- **Start over:** If you make a mistake, you can close Terminal and open it again
- **Case sensitive:** When typing commands, UPPERCASE and lowercase letters matter!
- **Autocomplete:** Press **Tab** to autocomplete file names
- **Clear screen:** Press **Ctrl + L** or type `clear`

## Common Commands

Here are some Node.js commands you'll use a lot:

- `node filename.js` - Run a JavaScript file
- `npm init` - Create a new project
- `npm install` - Install all packages for a project
- `npm install package-name` - Install a specific package
- `npm install -g package-name` - Install a package globally
- `node` - Start interactive mode (REPL)
  - To exit interactive mode, press `Ctrl + C` twice or type `.exit`

## Keyboard Shortcuts for Terminal

- **Ctrl + C** - Stop the current program
- **Ctrl + L** - Clear the Terminal screen
- **Ctrl + D** - Exit Terminal or Node.js interactive mode
- **Ctrl + Shift + T** - Open a new Terminal tab (in some terminals)
- **Ctrl + Shift + W** - Close Terminal tab
- **Up/Down Arrow** - Navigate through command history

## Updating Node.js

Arch uses a rolling release model, so Node.js updates with your system:

### If installed via pacman:
```bash
# Update entire system (recommended)
sudo pacman -Syu

# Update only Node.js (not recommended on Arch)
sudo pacman -S nodejs npm
```

### If installed via NVM:
```bash
# Install latest LTS
nvm install --lts

# Use the new version
nvm use --lts

# Remove old versions
nvm uninstall 18.19.0
```

**Note:** On Arch, always update the entire system rather than individual packages to avoid partial upgrades!

## Uninstall Node.js (If Needed)

### If installed via pacman:
```bash
sudo pacman -R nodejs npm
```

### If installed via NVM:
```bash
# Uninstall specific version
nvm uninstall 20.11.0

# Completely remove NVM
rm -rf ~/.nvm
# Then remove the NVM lines from ~/.bashrc or ~/.zshrc
```

## Fixing Common Permissions Issues

If you get permission errors when running `npm install -g`:

### Option 1: Use NVM (Recommended):
NVM installs packages in your home directory, avoiding permission issues entirely.

### Option 2: Change npm's default directory:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

This lets you install global packages without `sudo`.

### Option 3: Use sudo (Not Recommended):
```bash
sudo npm install -g package-name
```

## Advanced: Yarn Alternative

If you prefer Yarn over npm:

```bash
# Install Yarn
sudo pacman -S yarn

# Or via npm
npm install -g yarn

# Use Yarn instead of npm
yarn add package-name
yarn install
yarn run script-name
```

## Performance Optimization

### Enable V8 Snapshots:
```bash
# Install V8 with snapshots
sudo pacman -S v8
```

### Compile Native Addons:
```bash
# Install build tools
sudo pacman -S base-devel python
```

## Why Use Node.js?

- ✅ Free and open source
- ✅ Fast and powerful
- ✅ Used by millions of developers worldwide
- ✅ Build websites, apps, games, and more
- ✅ Huge library of free packages to use
- ✅ Works on Arch, Ubuntu, Windows, and macOS
- ✅ Great for learning programming
- ✅ Excellent performance on Linux
- ✅ Always up-to-date on Arch's rolling release
- ✅ First-class support on Arch Linux

## Arch Wiki

For more advanced configuration and troubleshooting, consult the Arch Wiki:
```bash
# Or visit: https://wiki.archlinux.org/title/Node.js
```

## Troubleshooting

**npm commands are slow:**
- Clear npm cache: `npm cache clean --force`
- Check internet connection
- Consider using a faster npm mirror

**Native module compilation fails:**
- Install build tools: `sudo pacman -S base-devel`
- Install Python: `sudo pacman -S python`
- Check the package's documentation

**"EACCES" permission errors:**
- Use NVM instead of system Node.js
- Or follow the permission fix steps above
- Never use `sudo npm` with user-installed Node.js

**Node version mismatch:**
- Check which version is active: `which node`
- If using NVM: `nvm current`
- Switch to correct version: `nvm use VERSION`
