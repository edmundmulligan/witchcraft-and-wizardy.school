# How to Install Node.js on Windows

## What is Node.js?

Node.js is a free program that lets you run JavaScript code on your computer (not just in a web browser). Think of it like an engine that powers JavaScript programs and lets you build websites, games, and apps!

## Before You Start: Check if Node.js is Already Installed

Before downloading, let's see if you already have Node.js on your computer!

### Check Using Command Prompt

1. Click the **Start** button
2. Type **"cmd"** or **"Command Prompt"**
3. Click to open Command Prompt (a black window will appear)
4. Type this command and press **Enter**:
   ```
   node --version
   ```
5. **If you see a version number** (like v22.0.0 or v20.11.0), Node.js is already installed! 
   - **Skip to "What's Next?" at the bottom of this guide**
6. **If you see an error** like "'node' is not recognised", Node.js is not installed yet - continue to the next section.

## Installation Steps

**Only follow these steps if Node.js is NOT already installed on your computer.**

### Step 1: Download Node.js

1. Open your web browser (like Firefox)
2. Go to: **https://nodejs.org**
3. You'll see two big green buttons. Click the one that says **"LTS"** (Long Term Support)
   - LTS means it's the most stable and recommended version
   - The button will say something like "20.11.0 LTS (Recommended For Most Users)"
4. Wait for the file to download (it's called something like `node-v20.11.0-x64.msi`)

### Step 2: Run the Installer

1. Find the downloaded file in your **Downloads** folder
2. **Double-click** the file to start the installation
3. If Windows asks "Do you want to allow this app to make changes?", click **Yes**

### Step 3: Follow the Setup Wizard

1. Click **Next** on the welcome screen
2. Click **I accept** the license agreement, then click **Next**
3. **Choose where to install** - keep the default location and click **Next**
4. **Custom Setup** - keep all the default options selected (everything should have a checkmark)
   - ✅ Node.js runtime
   - ✅ npm package manager
   - ✅ Online documentation shortcuts
   - ✅ Add to PATH
5. Click **Next**
6. **Tools for Native Modules** - You'll see a checkbox about installing additional tools
   - You can **uncheck this box** for now (you won't need it yet)
7. Click **Next**, then click **Install**
8. Wait for the installation to finish (this takes about 1-2 minutes)
9. Click **Finish**

### Step 4: Verify Installation

Let's make sure Node.js installed correctly!

1. Open **Command Prompt** again (or close and reopen it if it was already open)
2. Type these commands one at a time and press **Enter** after each:
   ```
   node --version
   ```
   You should see something like `v20.11.0`
   
   ```
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

1. Open **Notepad** (or any text editor)
2. Type this code:
   ```javascript
   console.log("Hello, Node.js!");
   ```
3. Save the file as `hello.js` on your **Desktop**
4. Open **Command Prompt**
5. Type these commands:
   ```
   cd Desktop
   node hello.js
   ```
6. You should see: `Hello, Node.js!`

If you see that message, everything is working perfectly! 🎉

## Need Help?

If something doesn't work:
1. Make sure you downloaded Node.js from the official website (nodejs.org)
2. Try restarting your computer after installation
3. Make sure you closed and reopened Command Prompt after installing Node.js
4. Check that the installation completed without errors
5. Ask an adult or teacher for help

## Tips for Beginners

- **Check versions anytime:** `node --version` and `npm --version`
- **Run a JavaScript file:** `node filename.js`
- **Install a package:** `npm install package-name`
- **Start over:** If you make a mistake, you can close Command Prompt and open it again
- **Case sensitive:** When typing commands, UPPERCASE and lowercase letters matter!

## Common Commands

Here are some Node.js commands you'll use a lot:

- `node filename.js` - Run a JavaScript file
- `npm init` - Create a new project
- `npm install` - Install all packages for a project
- `npm install package-name` - Install a specific package
- `node` - Start interactive mode (type JavaScript and see results immediately)
  - To exit interactive mode, press `Ctrl + C` twice

## Why Use Node.js?

- ✅ Free and open source
- ✅ Fast and powerful
- ✅ Used by millions of developers worldwide
- ✅ Build websites, apps, games, and more
- ✅ Huge library of free packages to use
- ✅ Works on Windows, Mac, and Linux
- ✅ Great for learning programming
