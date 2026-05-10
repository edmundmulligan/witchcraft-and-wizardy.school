# How to Install Node.js on Red Hat

## What is Node.js?

Node.js is a free program that lets you run JavaScript code on your computer (not just in a web browser). Think of it like an engine that powers JavaScript programs and lets you build websites, games, and apps!

## Before You Start: Check if Node.js is Already Installed

Before installing, let's see if you already have Node.js on your computer!

### Check Using Terminal

1. Open Terminal (click **Activities** → search for "Terminal")
2. Type this command and press **Enter**:
   ```bash
   node --version
   ```
3. **If you see a version number** (like v22.0.0 or v20.11.0), Node.js is already installed! 
   - **Skip to "What's Next?" at the bottom of this guide**
4. **If you see an error** like "command not found", Node.js is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if Node.js is NOT already installed on your computer.**

### Method 1: Using DNF/YUM Package Manager (Easiest!)

This installs Node.js from Red Hat's repositories:

#### For RHEL 8+ and Fedora (using DNF):

1. Open Terminal

2. Enable the appropriate Node.js module stream (RHEL 8+):
   ```bash
   sudo dnf module list nodejs
   ```
   - This shows available Node.js versions

3. Enable the Node.js 20 stream:
   ```bash
   sudo dnf module enable nodejs:20 -y
   ```

4. Install Node.js and npm:
   ```bash
   sudo dnf install nodejs -y
   ```
   - Enter your password when prompted
   - Wait for the installation to complete (this takes 1-3 minutes)

5. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers for both

🎉 **Done!** Node.js is installed!

#### For RHEL 7 (using YUM):

```bash
# Enable Software Collections
sudo yum install centos-release-scl-rh -y

# Install Node.js
sudo yum install rh-nodejs20 -y

# Enable Node.js
scl enable rh-nodejs20 bash

# Make it permanent (add to ~/.bashrc)
echo 'source scl_source enable rh-nodejs20' >> ~/.bashrc
```

### Method 2: Install Latest LTS Version via NodeSource (Recommended for Newer Versions!)

Red Hat's repositories might have an older version of Node.js. For the latest LTS version:

1. Open Terminal

2. First, install curl if you don't have it:
   ```bash
   sudo dnf install curl -y
   ```
   (Or `sudo yum install curl -y` for RHEL 7)

3. Download and run the NodeSource setup script for Node.js 20.x LTS:
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   ```
   - This adds the NodeSource repository to your system

4. Install Node.js:
   ```bash
   sudo dnf install nodejs -y
   ```
   (Or `sudo yum install nodejs -y` for RHEL 7)

5. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   - You should see Node.js v20.x.x and npm version

🎉 **Done!** The latest LTS version of Node.js is installed!

### Method 3: Using EPEL Repository (Alternative)

For RHEL/CentOS, you can also use EPEL (Extra Packages for Enterprise Linux):

```bash
# Enable EPEL repository
sudo dnf install epel-release -y

# Install Node.js
sudo dnf install nodejs -y
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

## Alternative: Install with nvm (Advanced)

For developers who need to manage multiple Node.js versions:

1. Install nvm (Node Version Manager):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Close and reopen Terminal, then install Node.js:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## Need Help?

If something doesn't work:
1. Make sure you have internet connection
2. Make sure your Red Hat subscription is active (for RHEL)
3. Try running `sudo dnf check-update` before installing
4. Make sure you have administrator (sudo) privileges
5. Check that the installation completed without errors
6. Close and reopen Terminal after installing
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
- `node` - Start interactive mode (type JavaScript and see results immediately)
  - To exit interactive mode, press `Ctrl + C` twice or type `.exit`

## Keyboard Shortcuts for Terminal

- **Ctrl + C** - Stop the current program
- **Ctrl + L** - Clear the Terminal screen
- **Ctrl + D** - Exit Terminal or Node.js interactive mode
- **Ctrl + Shift + T** - Open a new Terminal tab
- **Ctrl + Shift + W** - Close Terminal tab
- **Up/Down Arrow** - Navigate through command history

## Updating Node.js

To update Node.js in the future:

### If installed via DNF:
```bash
sudo dnf upgrade nodejs
```

### If installed via YUM (RHEL 7):
```bash
sudo yum update nodejs
```

### If installed via NodeSource:
```bash
sudo dnf upgrade nodejs
```

### If installed via nvm:
```bash
nvm install --lts
nvm use --lts
```

## Uninstall Node.js (If Needed)

If you ever need to uninstall Node.js:

### Using DNF:
```bash
sudo dnf remove nodejs
```

### Using YUM:
```bash
sudo yum remove nodejs
```

## Fixing Common Permissions Issues

If you get permission errors when running `npm install`, you can fix your npm permissions:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

This lets you install global packages without `sudo`.

## SELinux Considerations (Advanced)

Red Hat uses SELinux for security. If you encounter SELinux-related issues:

```bash
# Check SELinux status
sestatus

# View SELinux context of Node.js
ls -Z $(which node)

# If needed, restore context
sudo restorecon -v $(which node)
```

Most users won't need to worry about this!

## Why Use Node.js?

- ✅ Free and open source
- ✅ Fast and powerful
- ✅ Used by millions of developers worldwide
- ✅ Build websites, apps, games, and more
- ✅ Huge library of free packages to use
- ✅ Works on Red Hat, Ubuntu, Windows, and macOS
- ✅ Great for learning programming
- ✅ Excellent performance on Linux
- ✅ Enterprise-ready with Red Hat support
- ✅ Used by major companies worldwide

## Enterprise Considerations

If you're using Red Hat in an enterprise environment:
- Consider using the versions provided by Red Hat subscriptions for official support
- Node.js is supported through Red Hat Software Collections
- Check with your system administrator for approved versions
- Consider containerized deployments with Podman or Docker
