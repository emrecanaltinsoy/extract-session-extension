# Installation Methods for Extract Session Extension

## Quick Start (Recommended)

Use the raw GitHub URL directly (without npm: prefix):

```
/pi install https://github.com/emrecanaltinsoy/extract-session-extension.git
```

Then reload Pi:
```
/reload
/extract --help
```

## Why This Works

When you use the raw `https://` URL:
- ✅ Git clones the repository correctly
- ✅ The package.json name stays `extract-session-extension` (unscoped)
- ✅ Extension loads immediately without scoping issues
- ✅ Works from GitHub, no npm registry publish needed

## Why npm:github: Doesn't Work

When you use `npm:github:emrecanaltinsoy/extract-session-extension`:
- ❌ npm adds a scope based on the GitHub username (@emrecan)
- ❌ Package ends up at node_modules/@emrecan/extract-session-extension
- ❌ Pi tries to load the scoped version
- ❌ Extension doesn't register properly

## All Installation Methods

### Method 1: Direct Git URL (Best for GitHub)
```
/pi install https://github.com/emrecanaltinsoy/extract-session-extension.git
```

### Method 2: Git Shorthand (Requires git: prefix)
```
/pi install git:github.com/emrecanaltinsoy/extract-session-extension
```

### Method 3: SSH URL (If you have SSH configured)
```
/pi install ssh://git@github.com/emrecanaltinsoy/extract-session-extension.git
```

### Method 4: Local Path (For Development)
```
/pi install /path/to/extract-session-extension
```

### Method 5: With Version Tag
```
/pi install https://github.com/emrecanaltinsoy/extract-session-extension.git@v1.0.2
```

## Verify Installation

After installation, reload Pi:
```
/reload
/extract --help
```

You should see:
- ✅ `/extract` command in autocomplete
- ✅ Help text showing all options
- ✅ `--output` flag working

## Test It Works

Try these commands:
```
/extract --format text --exclude-tools --exclude-thinking
/extract --format json --output ~/test.json
/extract --format markdown
```

The messages should be extracted and copied to clipboard (or saved to file with `--output`).
