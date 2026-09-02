# Extract Session Extension for Pi

A powerful Pi extension for extracting and filtering user and agent messages from your session. Export conversations in multiple formats with smart filtering options.

## Features

✨ **Multiple Output Formats**
- Text (human-readable, formatted)
- JSON (machine-readable, for processing)
- Markdown (documentation-friendly)

🎯 **Smart Filtering**
- Exclude tool calls (bash, file operations, etc.)
- Exclude thinking blocks (Claude's reasoning)
- Combine for clean conversation-only exports

🚀 **Native Pi Integration**
- Custom `/extract` command
- Tab completion for all arguments
- Auto-copy to clipboard (with multiple fallbacks)
- Save to file with `--output` flag
- Branch-aware (respects `/tree` navigation)
- Works in all Pi sessions

🔄 **Multiple Clipboard Strategies**
- clipboardy library (if installed)
- navigator.clipboard (browser environments)
- xclip (Linux)
- pbcopy (macOS)
- wl-copy (Wayland Linux)
- Graceful fallback if none available

📁 **File Output**
- Optional `--output` flag to save to file
- Auto-generated timestamped filenames
- Creates directories as needed
- Supports both file and directory paths

## Installation

### Option 1: Install via Pi from GitHub (Easiest - Recommended) 🚀

**Use the raw GitHub URL directly in any Pi session:**

```
/pi install https://github.com/emrecanaltinsoy/extract-session-extension.git
/reload
/extract --help
```

That's it! The `/extract` command will be available immediately.

**Why this method?**
- ✅ Works without npm registry
- ✅ No scoping issues
- ✅ Simplest installation method
- ✅ Direct from GitHub source

### Option 2: Alternative Installation Methods

**Git shorthand (also works):**
```
/pi install git:github.com/emrecanaltinsoy/extract-session-extension
```

**SSH URL (if you have SSH configured):**
```
/pi install ssh://git@github.com/emrecanaltinsoy/extract-session-extension.git
```

**Local development:**
```
/pi install /path/to/extract-session-extension
```

### Option 3: Install via npm (if published)

**From npm registry:**

```bash
npm install --save-dev extract-session-extension
```

### Option 4: Install Globally

```bash
npm install -g extract-session-extension
```

### Option 4: Install from GitHub

```bash
npm install emrecanaltinsoy/extract-session-extension
```

### Option 5: Manual Installation

1. Clone this repository: `git clone https://github.com/emrecanaltinsoy/extract-session-extension.git`
2. Build it: `npm install && npm run build`
3. Copy to `~/.pi/agent/extensions/extract-session/`

## Quick Start with Pi

The easiest way to get started:

```
/pi install https://github.com/emrecanaltinsoy/extract-session-extension.git
/reload
# Your extension is ready!
/extract --help
/extract --exclude-tools --exclude-thinking
```

That's it! Your messages are now extracted and copied to clipboard.

## Usage

In any Pi session, use the `/extract` command:

### Basic Usage (Clean Conversation)

```
/extract --exclude-tools --exclude-thinking
```

Extracts just the conversation without technical implementation details.

### All Available Commands

```bash
/extract                                            # Everything
/extract --help                                    # Show help
/extract --exclude-tools                           # Skip tool calls
/extract --exclude-thinking                        # Skip thinking blocks
/extract --exclude-tools --exclude-thinking        # Just conversation
/extract --format json                             # JSON format
/extract --format markdown                         # Markdown format
/extract --format text                             # Text format (default)
/extract --output ~/Documents                      # Save to directory
/extract --format json --output ~/session.json     # Save as specific file
/extract --exclude-thinking --output /tmp          # Save with filters
```

### Examples

**Extract and copy to clipboard (no file)**
```
/extract --exclude-tools --exclude-thinking
```

**Export for documentation (Markdown)**
```
/extract --format markdown
```

**Export to file for processing (JSON)**
```
/extract --format json --output ~/Documents
```
Creates file: `~/Documents/extract_2026-09-02T165300Z.json`

**Save with specific filename**
```
/extract --format json --output ~/session-export.json
```

**Clean conversation only, save to file**
```
/extract --exclude-tools --exclude-thinking --output /tmp
```
Creates file: `/tmp/extract_2026-09-02T165300Z.txt`

**Get everything including debug info, save to file**
```
/extract --output ~/backup
```
Creates file: `~/backup/extract_2026-09-02T165300Z.txt`

## File Output

Use `--output` to save extracted messages to a file instead of just copying to clipboard.

### Output Path Behavior

- **Directory path** (e.g., `--output ~/Documents`):
  - Creates automatically generated filename: `extract_TIMESTAMP.FORMAT`
  - Example: `extract_2026-09-02T165300Z.json`

- **File path** (e.g., `--output ~/session.json`):
  - Saves directly to specified file
  - Creates parent directories if needed

- **Tilde expansion** (e.g., `--output ~/data`):
  - `~` automatically expands to your home directory

### Filename Format

Auto-generated filenames use ISO 8601 timestamp:
- `extract_YYYY-MM-DDTHH-MM-SS.FORMAT`
- Example: `extract_2026-09-02T16-53-00.json`

This ensures unique, sortable filenames for each export.

### Both Clipboard and File

When using `--output`, messages are **both** saved to file AND copied to clipboard, so you get the best of both!

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
