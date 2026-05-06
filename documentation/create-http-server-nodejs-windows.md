# How to Create an HTTP Server with Node.js on Windows

## What is an HTTP Server?

An HTTP server is a program that serves web pages to your browser. When you visit a website, you're connecting to an HTTP server! Today, you'll create your own server that runs on your computer with just one file.

## Before You Start

Make sure you have:
- ✅ Node.js installed (check by typing `node --version` in Command Prompt)
- ✅ A Projects folder created (see "How to Create a Projects Folder" guide)

## Step 1: Download package.json

1. Open **Firefox** (or your web browser)

2. Visit this page:
   ```
   https://witchcraft-and-wizardy.school/lessons/package.json
   ```

3. The file will download to your **Downloads** folder

4. Open **File Explorer** (click the folder icon on your taskbar)

5. Go to your **Downloads** folder

6. Find **package.json** and **right-click** on it

7. Choose **Cut** (or press Ctrl + X)

8. Navigate to your **Projects** folder

9. **Right-click** in an empty space and choose **Paste** (or press Ctrl + V)

✅ Now you have package.json in your Projects folder!

## Step 2: Start Your Server!

1. In Command Prompt, type:
   ```
   npm run start
   ```

2. You should see:
   ```
   Server running at http://localhost:8000
   ```

3. Open your web browser and visit: **http://localhost:8000**

4. You should see: **"Hello! Your server is working!"** 🎉

## Step 3: Stop Your Server

When you're done:
1. Go back to **Command Prompt**
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

**"Port already in use"**
- Another program is using port 8000
- Stop your server with Ctrl + C and try again

**"npm is not recognized"**
- Node.js might not be installed correctly
- Try restarting Command Prompt

## What's Next?

Want to change your server? Edit `package.json` in Notepad:
- Change the message: Find `<h1>Hello! Your server is working!</h1>` and change the text
- Change the port: Find `8000` and change it to another number like `3000`
- Add more HTML: Add more tags inside the `res.end()` part

Remember: After changing the file, stop the server (Ctrl + C) and run `npm run start` again!
