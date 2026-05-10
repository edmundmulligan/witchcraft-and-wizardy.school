# How to Create an HTTP Server with Node.js on Ubuntu

## What is an HTTP Server?

An HTTP server is a program that serves web pages to your browser. When you visit a website, you're connecting to an HTTP server! Today, you'll create your own server that runs on your computer with just one file.

## Before You Start

Make sure you have:
- ✅ Node.js installed (check by typing `node --version` in Terminal)
- ✅ A Projects folder created (see "How to Create a Projects Folder" guide)

## Step 1: Download package.json

1. Open **Firefox** (or your web browser)

2. Visit this page:
   ```
   https://witchcraft-and-wizardy.school/lessons/package.json
   ```

3. The file will download to your **Downloads** folder

4. Open **Files** (click the folder icon in your dock)

5. Go to your **Downloads** folder

6. Find **package.json** and **right-click** on it

7. Choose **Cut** (or press **Ctrl + X**)

8. Navigate to your **Projects** folder (in your Home folder)

9. **Right-click** in an empty space and choose **Paste** (or press **Ctrl + V**)

✅ Now you have package.json in your Projects folder!

## Step 2: Open Terminal in Your Projects Folder

### Method 1: Using Files

1. Open **Files** and navigate to your **Projects** folder
2. **Right-click** in an empty space
3. Choose **Open in Terminal**

### Method 2: Using Terminal

1. Press **Ctrl + Alt + T** to open Terminal
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
2. Press **Ctrl + C**
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
- Stop your server with Ctrl + C and try again
- Or change the port number in package.json

**"npm is not recognized" or "command not found"**
- Node.js might not be installed correctly
- Try closing and reopening Terminal
- Check Node.js is installed by typing `node --version`

**"Permission denied"**
- Try without `sudo` first
- If you must use `sudo`, run: `sudo npm run start`
- Then enter your password

**"EACCES" permission errors**
- This usually means npm permissions need fixing
- See the Node.js installation guide for fixing npm permissions

## What's Next?

Want to change your server? Edit `package.json` in VS Code or any text editor:
- Change the message: Find `<h1>Hello! Your server is working!</h1>` and change the text
- Change the port: Find `8000` and change it to another number like `3000`
- Add more HTML: Add more tags inside the `res.end()` part

Remember: After changing the file, stop the server (Ctrl + C) and run `npm run start` again!

## Terminal Tips

- **Clear the screen:** Type `clear` or press **Ctrl + L**
- **See where you are:** Type `pwd` (print working directory)
- **List files:** Type `ls` to see files in the current folder
  - `ls -la` shows hidden files and details
- **Go home:** Type `cd ~` to go to your home folder
- **Go up one folder:** Type `cd ..`
- **Autocomplete:** Start typing a filename and press **Tab**
- **Command history:** Press **Up Arrow** to see previous commands

## Keyboard Shortcuts for Terminal

- **Ctrl + C** - Stop the current program
- **Ctrl + L** - Clear Terminal screen
- **Ctrl + D** - Close Terminal (if nothing is running)
- **Ctrl + Shift + T** - Open new Terminal tab
- **Ctrl + Shift + W** - Close Terminal tab
- **Ctrl + Shift + C** - Copy selected text
- **Ctrl + Shift + V** - Paste text
- **Ctrl + Z** - Suspend current program (use `fg` to resume)

## Understanding the Code

If you open package.json in VS Code, you'll see it contains:
- **"scripts"** - Commands you can run with `npm run`
- **"devDependencies"** - The http-server package that makes everything work
- **"homepage"** - A simple HTML page that displays your message

The server automatically serves files from your current folder to anyone who visits localhost:8000 in their browser!

## Advanced: Run Server in Background

To keep the server running while using Terminal for other things:

```bash
npm run start &
```

The `&` runs it in the background. To stop it:

```bash
# Find the process ID
ps aux | grep node

# Kill the process (replace PID with the actual number)
kill PID
```

Or install a process manager:

```bash
sudo npm install -g pm2
pm2 start "npm run start" --name my-server
pm2 stop my-server
pm2 list
```

## Firewall Settings (If Needed)

If other computers can't access your server:

```bash
# Allow port 8000 through firewall
sudo ufw allow 8000/tcp

# Check firewall status
sudo ufw status
```

**Note:** Only allow firewall access if you understand the security implications!
