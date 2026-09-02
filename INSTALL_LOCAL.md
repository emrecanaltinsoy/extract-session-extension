# Local Installation (No Git, No Credentials Required)

For users without GitHub CLI, SSH setup, or internet git access, you can install directly from a local directory.

## Installation Steps

### Step 1: Clone or Download the Repository

**Option A: If you have git (but no SSH/credentials):**
```bash
git clone --depth 1 https://github.com/emrecanaltinsoy/extract-session-extension.git
cd extract-session-extension
```

**Option B: Download as ZIP (No git required):**
1. Visit: https://github.com/emrecanaltinsoy/extract-session-extension
2. Click green "Code" button → "Download ZIP"
3. Extract the ZIP file
4. Open terminal in that directory

### Step 2: Install via Pi Using Local Path

From the extract-session-extension directory, run:

```
/pi install /full/path/to/extract-session-extension
```

Or if you're already in that directory:

```
/pi install .
```

### Step 3: Reload Pi

```
/reload
```

### Step 4: Verify It Works

```
/extract --help
```

## Example Workflow

```bash
# Download (if not using git)
# ... unzip extract-session-extension.zip ...

# Navigate to it
cd ~/Downloads/extract-session-extension

# Install in Pi (from any terminal window with Pi)
/pi install /home/emrecan/Downloads/extract-session-extension

# Reload
/reload

# Use it
/extract --help
```

## For Development

If you're actively developing the extension:

```bash
# Clone locally
git clone https://github.com/emrecanaltinsoy/extract-session-extension.git
cd extract-session-extension

# Install from local path (auto-reloads on changes if using npm link)
/pi install .

# Or with npm link for live development
npm link
/reload
```

## Why This Works

- ✅ No git credentials needed
- ✅ No SSH keys needed  
- ✅ No GitHub CLI needed
- ✅ No network access required (after download)
- ✅ Works everywhere
- ✅ Simple file path reference

## Troubleshooting

### "Path does not exist"
- Make sure you use the **full absolute path** (starting with `/`)
- Or use `.` if running Pi from that directory

### Extension still not appearing
- Run `/reload` to refresh Pi
- Check the path exists: `ls /path/to/extract-session-extension/dist/index.js`
- Verify `dist/index.js` file is there

### Quick Path Verification
```bash
ls -la ~/path/to/extract-session-extension/dist/index.js
```

Should show the file exists.
