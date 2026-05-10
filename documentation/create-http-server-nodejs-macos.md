# How to Create an HTTP Server with Node.js on macOS

## What is an HTTP Server?

An HTTP server is a program that serves web pages to your browser. When you visit a website, you're connecting to an HTTP server! Today, you'll create your own server that runs on your computer with just one file.

## Before You Start

Make sure you have:
- ✅ Node.js installed (check by typing `node --version` in Terminal)
- ✅ A Projects folder created (see "How to Create a Projects Folder" guide)

## Step 1: Download package.json

1. Open **Safari** or **Firefox** (or your web browser)

2. Visit this page:
   ```
   https://witchcraft-and-wizardy.school/lessons/package.json
   ```

3. The file will download to your **Downloads** folder

4. Open **Finder** (click the smiling face icon in your Dock)

5. Go to your **Downloads** folder

6. Find **package.json** and **drag it** to your **Projects** folder
   - Or right-click it and choose **Move to** → navigate to Projects folder

✅ Now you have package.json in your Projects folder!

## Step 2: Open Terminal in Your Projects Folder

### Method 1: Using Finder

1. Open **Finder** and navigate to your **Projects** folder
2. Right-click (or Control-click) in an empty space
3. Choose **Services** → **New Terminal at Folder**
   - If you don't see this option, hold **Option** and choose **New Terminal at Folder**

### Method 2: Using Terminal

1. Open **Terminal** (press **Command (⌘) + Space**, type "Terminal", press **Return**)
2. Type these commands:
   ```bash
   cd ~/Projects
   ```
   - `cd` means "change directory" (move to that folder)
   - `~` is a shortcut for your home folder

## Step 3: Start Your Server!

1. In Terminal, type:
   ```bash
   npm run start
   ```

2. You should see:
   ```
   Server running at http://localhost:8000
   ```

3. Open your web browser and visit: **http://localhost:8000**

4. You should see: **"Hello! Your server is working!"** 🎉

## Step 4: Stop Your Server

When you're done:
1. Go back to **Terminal**
2. Press **Control + C**
3. The server will stop

## What You Created

Your Projects folder now has just one file:
```
Projects/
└── package.json    ← Everything is in here!
```

## Common Problems

**"Cannot find module"**
- Make sure package.json is saved in the Projects folder
- Check you're in the correct folder by typing `pwd` in Terminal

**"Port already in use"**
- Another program is using port 8000
- Stop your server with Control + C and try again
- Or change the port number in package.json

**"npm is not recognized" or "command not found"**
- Node.js might not be installed correctly
- Try closing and reopening Terminal
- Check Node.js is installed by typing `node --version`

**Permission Denied**
- You might need to use `sudo npm run start` (but try without sudo first)
- If asked for a password, enter your Mac login password

## What's Next?

Want to change your server? Edit `package.json` in VS Code or TextEdit:
- Change the message: Find `<h1>Hello! Your server is working!</h1>` and change the text
- Change the port: Find `8000` and change it to another number like `3000`
- Add more HTML: Add more tags inside the `res.end()` part

Remember: After changing the file, stop the server (Control + C) and run `npm run start` again!

## Terminal Tips

- **Clear the screen:** Type `clear` or press **Command (⌘) + K**
- **See where you are:** Type `pwd` (print working directory)
- **List files:** Type `ls` to see files in the current folder
- **Go home:** Type `cd ~` to go to your home folder
- **Go up one folder:** Type `cd ..`
- **Autocomplete:** Start typing a filename and press **Tab**

## Keyboard Shortcuts

- **Control + C** - Stop the current program
- **Control + L** - Clear Terminal screen
- **Command (⌘) + T** - Open new Terminal tab
- **Command (⌘) + W** - Close Terminal tab
- **Command (⌘) + K** - Clear Terminal history

## Understanding the Code

If you open package.json in VS Code, you'll see it contains:
- **"scripts"** - Commands you can run with `npm run`
- **"devDependencies"** - The http-server package that makes everything work
- **"homepage"** - A simple HTML page that displays your message

The server automatically serves files from your current folder to anyone who visits localhost:8000 in their browser!
