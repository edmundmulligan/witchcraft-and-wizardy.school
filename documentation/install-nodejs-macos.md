# How to Install Node.js on macOS

## What is Node.js?

Node.js is a free program that lets you run JavaScript code on your computer (not just in a web browser). Think of it like an engine that powers JavaScript programs and lets you build websites, games, and apps!

## Before You Start: Check if Node.js is Already Installed

Before downloading, let's see if you already have Node.js on your computer!

### Check Using Terminal

1. Press **Command (⌘) + Space** to open Spotlight
2. Type **"Terminal"**
3. Press **Return** to open Terminal
4. Type this command and press **Return**:
   ```bash
   node --version
   ```
5. **If you see a version number** (like v22.0.0 or v20.11.0), Node.js is already installed! 
   - **Skip to "What's Next?" at the bottom of this guide**
6. **If you see an error** like "command not found", Node.js is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if Node.js is NOT already installed on your computer.**

### Step 1: Download Node.js

1. Open your web browser (like Safari or Firefox)
2. Go to: **https://nodejs.org**
3. You'll see two big green buttons. Click the one that says **"LTS"** (Long Term Support)
   - LTS means it's the most stable and recommended version
   - The button will say something like "20.11.0 LTS (Recommended For Most Users)"
4. Wait for the file to download (it's called something like `node-v20.11.0.pkg`)
5. The file will be saved to your **Downloads** folder

### Step 2: Run the Installer

1. Find the downloaded **.pkg** file in your **Downloads** folder
2. **Double-click** the file to start the installation
3. If macOS asks for your password, enter it (this is your Mac login password)

### Step 3: Follow the Installation Wizard

1. Click **Continue** on the welcome screen
2. Click **Continue** again on the license screen
3. Click **Agree** to accept the license
4. **Choose where to install** - keep the default location and click **Continue**
5. Click **Install** (you may need to enter your password again)
6. Wait for the installation to finish (this takes about 1-2 minutes)
7. Click **Close**
8. You can move the installer to Trash if asked

### Step 4: Verify Installation

Let's make sure Node.js installed correctly!

1. Open **Terminal** (or close and reopen it if it was already open)
   - Press **Command (⌘) + Space**, type "Terminal", press **Return**
2. Type these commands one at a time and press **Return** after each:
   ```bash
   node --version
   ```
   You should see something like `v20.11.0`
   
   ```bash
   npm --version
   ```
   You should see something like `10.2.4`

3. If you see version numbers for both, **congratulations!** Node.js is installed correctly! 🎉

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

1. Open **TextEdit** (or any text editor)
2. Click **Format** → **Make Plain Text** (important!)
3. Type this code:
   ```javascript
   console.log("Hello, Node.js!");
   ```
4. Save the file as `hello.js` on your **Desktop**
5. Open **Terminal**
6. Type these commands:
   ```bash
   cd Desktop
   node hello.js
   ```
7. You should see: `Hello, Node.js!`

If you see that message, everything is working perfectly! 🎉

## Alternative: Install with Homebrew (Advanced)

If you're comfortable with Terminal, you can also install Node.js using Homebrew:

```bash
# First install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js
brew install node
```

## Need Help?

If something doesn't work:
1. Make sure you downloaded Node.js from the official website (nodejs.org)
2. Try restarting your computer after installation
3. Make sure you closed and reopened Terminal after installing Node.js
4. Check that the installation completed without errors
5. Make sure your macOS version is supported (check nodejs.org for requirements)
6. Ask an adult or teacher for help

## Tips for Beginners

- **Check versions anytime:** `node --version` and `npm --version`
- **Run a JavaScript file:** `node filename.js`
- **Install a package:** `npm install package-name`
- **Start over:** If you make a mistake, you can close Terminal and open it again
- **Case sensitive:** When typing commands, UPPERCASE and lowercase letters matter!
- **Autocomplete:** Press **Tab** in Terminal to autocomplete file names

## Common Commands

Here are some Node.js commands you'll use a lot:

- `node filename.js` - Run a JavaScript file
- `npm init` - Create a new project
- `npm install` - Install all packages for a project
- `npm install package-name` - Install a specific package
- `node` - Start interactive mode (type JavaScript and see results immediately)
  - To exit interactive mode, press `Control + C` twice or type `.exit`

## Keyboard Shortcuts for Terminal

- **Control + C** - Stop the current program
- **Control + L** - Clear the Terminal screen
- **Command (⌘) + K** - Clear Terminal history
- **Command (⌘) + T** - Open a new Terminal tab
- **Command (⌘) + W** - Close current Terminal tab

## Why Use Node.js?

- ✅ Free and open source
- ✅ Fast and powerful
- ✅ Used by millions of developers worldwide
- ✅ Build websites, apps, games, and more
- ✅ Huge library of free packages to use
- ✅ Works on macOS, Windows, and Linux
- ✅ Great for learning programming
- ✅ Excellent performance on macOS
