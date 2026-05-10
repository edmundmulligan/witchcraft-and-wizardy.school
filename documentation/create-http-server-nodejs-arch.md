# How to Create an HTTP Server with Node.js on Arch Linux

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

4. Open your **file manager** (Dolphin, Thunar, Nautilus, etc.)

5. Go to your **Downloads** folder

6. Find **package.json** and **right-click** on it

7. Choose **Cut** (or press **Ctrl + X**)

8. Navigate to your **Projects** folder (in your Home folder)

9. **Right-click** in an empty space and choose **Paste** (or press **Ctrl + V**)

✅ Now you have package.json in your Projects folder!

## Step 2: Open Terminal in Your Projects Folder

### Method 1: Using File Manager

Most file managers support opening a terminal:

#### Dolphin (KDE):
- Press **F4** to open embedded terminal
- Or right-click → **Actions** → **Open Terminal Here**

#### Thunar (XFCE):
- Right-click → **Open Terminal Here**

#### Nautilus (GNOME):
- Right-click → **Open in Terminal**

### Method 2: Using Terminal

1. Open Terminal (press **Ctrl + Alt + T**)
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
- Find what's using the port: `sudo lsof -i :8000`
- Or change the port number in package.json

**"npm is not recognized" or "command not found"**
- Node.js might not be installed correctly
- Try closing and reopening Terminal
- Check Node.js is installed by typing `node --version`
- Make sure npm is in your PATH: `which npm`

**"Permission denied"**
- Try without `sudo` first
- If you must use `sudo`, run: `sudo npm run start`
- Check file permissions: `ls -la package.json`

**"EACCES" permission errors**
- This usually means npm permissions need fixing
- See the Node.js installation guide for fixing npm permissions
- If using NVM, this shouldn't happen

## What's Next?

Want to change your server? Edit `package.json` in VS Code or any text editor:
- Change the message: Find `<h1>Hello! Your server is working!</h1>` and change the text
- Change the port: Find `8000` and change it to another number like `3000`
- Add more HTML: Add more tags inside the `res.end()` part

Remember: After changing the file, stop the server (Ctrl + C) and run `npm run start` again!

## Terminal Tips for Arch Linux

- **Clear the screen:** Type `clear` or press **Ctrl + L**
- **See where you are:** Type `pwd` (print working directory)
- **List files:** Type `ls` to see files in the current folder
  - `ls -la` shows hidden files and details
  - `ls -lh` shows human-readable file sizes
- **Go home:** Type `cd ~` to go to your home folder
- **Go up one folder:** Type `cd ..`
- **Autocomplete:** Start typing a filename and press **Tab**
- **Command history:** Press **Up Arrow** to see previous commands
- **Search history:** Press **Ctrl + R** and start typing

## Keyboard Shortcuts for Terminal

- **Ctrl + C** - Stop the current program
- **Ctrl + L** - Clear Terminal screen
- **Ctrl + D** - Close Terminal (if nothing is running)
- **Ctrl + Shift + T** - Open new Terminal tab (in some terminals)
- **Ctrl + Shift + W** - Close Terminal tab
- **Ctrl + Shift + C** - Copy selected text
- **Ctrl + Shift + V** - Paste text
- **Ctrl + Z** - Suspend current program (use `fg` to resume)
- **Ctrl + R** - Search command history
- **Ctrl + A** - Move cursor to beginning of line
- **Ctrl + E** - Move cursor to end of line

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

The `&` runs it in the background. To manage background jobs:

```bash
# List background jobs
jobs

# Bring to foreground
fg

# Find the process ID
ps aux | grep node

# Kill the process (replace PID with the actual number)
kill PID

# Or kill all node processes (careful!)
killall node
```

## Advanced: Process Manager

For more control, install a process manager:

### Using PM2:
```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start "npm run start" --name my-server

# Manage the server
pm2 stop my-server
pm2 restart my-server
pm2 delete my-server
pm2 list
pm2 logs my-server

# Start on boot (optional)
pm2 startup
pm2 save
```

## Firewall Configuration

Arch Linux doesn't have a firewall enabled by default, but if you're using one:

### Using iptables:
```bash
# Allow port 8000
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT

# Save rules (varies by system)
sudo iptables-save > /etc/iptables/iptables.rules
```

### Using ufw (if installed):
```bash
# Install ufw
sudo pacman -S ufw

# Allow port 8000
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Using firewalld (if installed):
```bash
# Allow port 8000
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

**Note:** Only allow firewall access if you understand the security implications!

## SystemD Service (Production)

For running your server as a systemd service on Arch:

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/my-http-server.service
   ```

2. Add this content:
   ```ini
   [Unit]
   Description=My HTTP Server
   After=network.target

   [Service]
   Type=simple
   User=yourusername
   WorkingDirectory=/home/yourusername/Projects
   ExecStart=/usr/bin/npm run start
   Restart=on-failure
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable my-http-server
   sudo systemctl start my-http-server
   sudo systemctl status my-http-server
   ```

4. Manage the service:
   ```bash
   # Stop the service
   sudo systemctl stop my-http-server

   # Restart the service
   sudo systemctl restart my-http-server

   # View logs
   sudo journalctl -u my-http-server -f
   ```

## Using Different Terminals

Arch users often use various terminal emulators:

### Kitty:
```bash
# Open new window in same directory
Ctrl + Shift + Enter
```

### Alacritty:
Fast, GPU-accelerated terminal
```bash
sudo pacman -S alacritty
```

### Terminator:
Terminal with split panes
```bash
sudo pacman -S terminator
```

### Tmux:
Terminal multiplexer (multiple terminals in one)
```bash
sudo pacman -S tmux
# Start tmux
tmux
# Split panes: Ctrl + B then %
```

## Performance Monitoring

Monitor your server's performance:

```bash
# CPU and memory usage
htop

# Network connections
ss -tuln | grep 8000

# Detailed process info
ps aux | grep node

# Live network statistics
sudo nethogs

# System resource usage
glances
```

## Why Node.js on Arch?

- ✅ Always up-to-date with rolling release
- ✅ Easy to install via pacman
- ✅ Great performance on Arch Linux
- ✅ Access to latest features
- ✅ Excellent community support
- ✅ Perfect for development and production
- ✅ Multiple version management with NVM

## Arch Wiki

For more advanced configuration and troubleshooting:
```bash
# Or visit: https://wiki.archlinux.org/title/Node.js
```

## Troubleshooting

**Server crashes immediately:**
- Check syntax errors: `node package.json`
- View error messages carefully
- Make sure package.json is valid JSON

**Can't connect from another computer:**
- Check firewall settings
- Server might be binding to localhost only
- Configure to bind to 0.0.0.0 instead

**Port permission denied (< 1024):**
- Use ports above 1024 (like 8000, 3000)
- Or use capabilities: `sudo setcap 'cap_net_bind_service=+ep' $(which node)`
- Or use a reverse proxy like nginx

**High memory usage:**
- Node.js can use a lot of memory for large apps
- Monitor with `htop` or `ps`
- Consider using `--max-old-space-size` flag

**Module not found errors:**
- Run `npm install` in the Projects directory
- Check package.json exists
- Verify npm cache: `npm cache verify`
