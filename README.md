# Extract Session Extension for Pi

A powerful Pi extension for extracting and filtering user and agent messages from your session. Export conversations in multiple formats with smart filtering options.

## Features

✨ **Smart Defaults**
- Exclude thinking blocks and tool calls by default
- Get clean conversation with just `/extract`
- Include details with short flags: `-its` (tools), `-ith` (thinking)

✨ **Multiple Output Formats**
- Text (human-readable, formatted)
- JSON (machine-readable, for processing)
- Markdown (documentation-friendly)
- Auto-detect format from file extension

🎯 **Flexible Output**
- Copy to clipboard (default, always)
- Save to file with positional argument: `/extract ~/file.json`
- Auto-format detection from extension: .json, .md, .txt
- Smart defaults get clean conversations by default

🚀 **Native Pi Integration**
- Custom `/extract` command
- Tab completion for all arguments
- Auto-copy to clipboard (with multiple fallbacks)
- Positional filename argument for saving
- Branch-aware (respects `/tree` navigation)
- Works in all Pi sessions

🔄 **Multiple Clipboard Strategies**
- clipboardy library (if installed)
- navigator.clipboard (browser environments)
- xclip (Linux)
- pbcopy (macOS)
- wl-copy (Wayland Linux)
- Graceful fallback if none available

📁 **Smart File Output**
- Simple positional argument: `/extract ~/file.txt`
- Auto-generates timestamped filenames for directories
- Auto-detects format from file extension
- Creates directories as needed
- Both clipboard AND file when saving

## Installation

### Recommended: Install from npm

**Simplest method - install via shell, then reload in Pi:**

```bash
# 1. In your terminal/shell (NOT in Pi):
pi install npm:extract-session-extension

# 2. In Pi (if already running), reload:
/reload

# 3. Done! Start using it:
/extract --help
```

**Why this method:**
- ✅ Simplest (one command)
- ✅ Installs to your Pi setup
- ✅ Works everywhere
- ✅ Can update with `pi update --extensions`

### Alternative: Local Installation

**If you want to clone and install locally:**

```bash
# 1. Clone repository
git clone https://github.com/emrecanaltinsoy/extract-session-extension.git
cd extract-session-extension

# 2. In your terminal, install from local path:
pi install .

# 3. In Pi, reload:
/reload
```

Useful for:
- ✅ Contributing/developing
- ✅ Testing changes locally

## Quick Start with Pi

Get started in 30 seconds:

```bash
# 1. In your terminal/shell:
pi install npm:extract-session-extension

# 2. In Pi (if already running), reload:
/reload

# 3. Use it!
/extract --help
/extract                    # Clean conversation, clipboard only
/extract -its ~/data.json   # Include tools, save as JSON
/extract -ith ~/notes.md    # Include thinking, save as markdown
```

That's it! 🎉

## Usage

In any Pi session, use the `/extract` command:

### Basic Usage (Default: Clean Conversation)

```bash
/extract
```

Extracts just the conversation without thinking blocks or tool calls. Copies to clipboard.

### All Available Options

```bash
# Exclude everything (default)
/extract

# Include tool calls
/extract -its
# or: /extract --include-tools

# Include thinking blocks
/extract -ith
# or: /extract --include-thinking

# Include both
/extract -its -ith

# Change output format
/extract -f json           # JSON format (clipboard)
/extract -f markdown       # Markdown format (clipboard)
/extract -f text           # Text format (clipboard, default)

# Save to file (format auto-detected from extension)
/extract ~/session.txt     # Text format, saves to file
/extract ~/session.json    # JSON format, saves to file
/extract ~/notes.md        # Markdown format, saves to file

# Combine options
/extract -its ~/tools.json              # Include tools, JSON, save to file
/extract -ith ~/thinking.md             # Include thinking, markdown, save to file
/extract -f json -its ~/full-data.json  # Explicit format + include tools

# Show help
/extract --help
```

### Format Auto-Detection

When saving to a file, the format is auto-detected from the extension:

```
.json, .jsonl → JSON format
.md, .markdown → Markdown format
.txt, others → Text format (default)
```

You can override auto-detection with `-f` / `--format`:

```bash
/extract -f json ~/myfile.txt   # Forces JSON format despite .txt extension
```

### Examples

**Export and copy to clipboard (no file)**
```bash
/extract                      # Clean conversation only
/extract -its                 # Include tools
/extract -its -ith            # Include everything
```

**Export for documentation (Markdown)**
```bash
/extract ~/session.md
/extract -its ~/session-with-tools.md
```

**Export for processing (JSON)**
```bash
/extract -f json ~/session.json
/extract -its -ith ~/full-data.json
```

**Smart file saving (format auto-detected)**
```bash
/extract ~/backup/session.txt      # Text format
/extract ~/data/export.json        # JSON format
/extract ~/docs/notes.md           # Markdown format
```

## Output Examples

### Text Format (Default)

```
============================================================
Role: USER | 2026-09-02T16:20:11.765Z
============================================================
Can you help me with this?

============================================================
Role: ASSISTANT | 2026-09-02T16:20:17.558Z
============================================================
Of course! Here's how to do it...

Model: anthropic/claude-sonnet-4-5
```

### JSON Format

```json
[
  {
    "role": "user",
    "timestamp": "2026-09-02T16:20:11.765Z",
    "text": "Can you help me with this?",
    "toolCalls": [],
    "thinking": []
  },
  {
    "role": "assistant",
    "timestamp": "2026-09-02T16:20:17.558Z",
    "text": "Of course! Here's how to do it...",
    "toolCalls": [],
    "thinking": [],
    "provider": "anthropic",
    "model": "claude-sonnet-4-5"
  }
]
```

### Markdown Format

```markdown
# Session Messages

## USER

Can you help me with this?

---

## ASSISTANT

Of course! Here's how to do it...

*Model: anthropic/claude-sonnet-4-5*

---

**Total messages:** 2
```

## Troubleshooting

### Issue: `/extract` command not found

**Solution:** Run `/reload` in Pi to refresh extensions

```
/reload
```

### Issue: "No messages found"

**Solution:** Check that your session has messages

```
/session
```

Make sure you've sent prompts and gotten responses. Add some messages first if needed.

### Issue: Clipboard not working

**Solution:** The extraction still works, just copy manually from the preview

The command will show your extracted messages in the preview. If clipboard is unavailable on your system:
1. Select the preview text
2. Copy manually (Ctrl+C / Cmd+C)

### Issue: How to see all options?

**Solution:**

```
/extract --help
```

## Clipboard Fallback Strategies

The extension tries multiple methods to copy to clipboard:

1. **clipboardy** - Cross-platform Node.js clipboard library
2. **navigator.clipboard** - Browser-like environments
3. **xclip** - Linux with X11
4. **pbcopy** - macOS
5. **wl-copy** - Linux with Wayland
6. **Graceful fallback** - Shows warning but output is still extracted

If none work, you can manually copy from the preview shown in Pi.

## Customization

### Modify the Extension

1. Edit `src/index.ts`
2. Run `npm run build` to compile
3. Reload in Pi: `/reload`

### Add New Formats

```typescript
} else if (outputFormat === "csv") {
  output = formatCSV(messages);
}
```

### Modify Filtering Logic

Edit the `extractMessages` function to customize what gets extracted.

## API Structure

The extension extracts messages with this structure:

```typescript
interface MessageData {
  role: string;              // "user" | "assistant" | "toolResult" | ...
  timestamp: string;         // ISO format
  text: string;              // Main content
  toolCalls: any[];          // Tool invocations (if included)
  thinking: string[];        // Reasoning blocks (if included)
  provider?: string;         // Provider name
  model?: string;            // Model ID
  toolName?: string;         // For tool results
  toolCallId?: string;       // For tool results
  isError?: boolean;         // For tool results
}
```

## Message Types

Extracts all message types from Pi sessions:

- ✅ User messages
- ✅ Assistant responses
- ✅ Tool results
- ✅ Bash execution
- ✅ Custom messages
- ✅ Branch summaries
- ✅ Thinking blocks (optional)
- ✅ Tool calls (optional)

## Configuration for Pi

The `package.json` includes Pi extension configuration:

```json
{
  "pi": {
    "extensions": ["./dist/index.js"]
  }
}
```

This tells Pi where to find the extension entry point.

## Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev
```

## Publishing to npm

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build before publishing
npm run build

# Publish
npm publish
```

## License

MIT

## Author

Emrecan Altinsoy

## Repository

https://github.com/emrecanaltinsoy/extract-session-extension

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
