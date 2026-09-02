/**
 * Extract Session Messages Extension for Pi
 *
 * Provides an `/extract` command to export user and agent messages from the current session
 * with filtering options (exclude tool calls, thinking blocks) and multiple output formats
 * (text, JSON, markdown).
 *
 * Usage:
 *   /extract --exclude-tools --exclude-thinking --format text
 *   /extract --format json
 *   /extract --help
 *
 * Features:
 * - Multiple output formats (text, JSON, markdown)
 * - Filter out tool calls and/or thinking blocks
 * - Auto-copy to clipboard (with fallbacks)
 * - Tab completion for arguments
 * - Branch-aware session extraction
 */
// Try to import clipboard library (async, loaded on demand)
let clipboard;
export default function (pi) {
    pi.registerCommand("extract", {
        description: "Extract user and agent messages from current session",
        getArgumentCompletions: (prefix) => {
            const options = [
                "--help",
                "--exclude-tools",
                "--exclude-thinking",
                "--include-tools",
                "--include-thinking",
                "--format",
            ];
            return options.filter((opt) => opt.startsWith(prefix)).map((opt) => ({ value: opt, label: opt }));
        },
        handler: async (args, ctx) => {
            const argList = args.split(/\s+/).filter(Boolean);
            // Parse arguments
            let includeToolCalls = true;
            let includeThinking = true;
            let outputFormat = "text";
            let showHelp = false;
            for (let i = 0; i < argList.length; i++) {
                const arg = argList[i];
                if (arg === "--help") {
                    showHelp = true;
                }
                else if (arg === "--exclude-tools") {
                    includeToolCalls = false;
                }
                else if (arg === "--exclude-thinking") {
                    includeThinking = false;
                }
                else if (arg === "--include-tools") {
                    includeToolCalls = true;
                }
                else if (arg === "--include-thinking") {
                    includeThinking = true;
                }
                else if (arg === "--format" && argList[i + 1]) {
                    outputFormat = argList[++i];
                }
            }
            if (showHelp) {
                const help = `
Extract Session Messages

Usage: /extract [options]

Options:
  --exclude-tools       Exclude tool calls from output
  --exclude-thinking    Exclude thinking blocks from output
  --include-tools       Include tool calls (default)
  --include-thinking    Include thinking blocks (default)
  --format <type>       Output format: text, json, markdown (default: text)
  --help                Show this help message

Examples:
  /extract --exclude-tools --exclude-thinking
  /extract --format json
  /extract --format markdown
        `.trim();
                ctx.ui.notify(help, "info");
                return;
            }
            try {
                const messages = extractMessages(ctx, includeToolCalls, includeThinking);
                if (messages.length === 0) {
                    ctx.ui.notify("No messages found in session", "warning");
                    return;
                }
                let output = "";
                if (outputFormat === "json") {
                    output = JSON.stringify(messages, null, 2);
                }
                else if (outputFormat === "markdown") {
                    output = formatMarkdown(messages);
                }
                else {
                    output = formatText(messages);
                }
                // Try to copy to clipboard with multiple fallbacks
                await copyToClipboard(output, ctx);
                ctx.ui.notify(`✓ Extracted ${messages.length} messages (copied to clipboard)`, "info");
                // Show preview in custom panel
                if (ctx.mode === "tui") {
                    const preview = output.split("\n").slice(0, 30).join("\n") +
                        (output.split("\n").length > 30 ? "\n...(truncated, full output in clipboard)" : "");
                    ctx.ui.notify(preview, "info");
                }
            }
            catch (error) {
                ctx.ui.notify(`Error extracting session: ${error instanceof Error ? error.message : String(error)}`, "error");
            }
        },
    });
    /**
     * Copy text to clipboard with multiple fallback strategies
     */
    async function copyToClipboard(text, ctx) {
        // Strategy 1: Try clipboardy library
        if (clipboard?.write) {
            try {
                await clipboard.write(text);
                return;
            }
            catch (err) {
                // Fall through to next strategy
            }
        }
        // Strategy 2: Try navigator.clipboard (browser-like environments)
        if (typeof globalThis.navigator !== "undefined") {
            const nav = globalThis.navigator;
            if (nav.clipboard?.writeText) {
                try {
                    await nav.clipboard.writeText(text);
                    return;
                }
                catch (err) {
                    // Fall through to next strategy
                }
            }
        }
        // Strategy 3: Try xclip (Linux)
        if (process.platform === "linux") {
            try {
                const { execSync } = await import("child_process");
                execSync("xclip -selection clipboard", {
                    input: text,
                    stdio: ["pipe", "ignore", "ignore"],
                });
                return;
            }
            catch (err) {
                // Fall through to next strategy
            }
        }
        // Strategy 4: Try pbcopy (macOS)
        if (process.platform === "darwin") {
            try {
                const { execSync } = await import("child_process");
                execSync("pbcopy", {
                    input: text,
                    stdio: ["pipe", "ignore", "ignore"],
                });
                return;
            }
            catch (err) {
                // Fall through to next strategy
            }
        }
        // Strategy 5: Try wl-copy (Wayland on Linux)
        if (process.platform === "linux") {
            try {
                const { execSync } = await import("child_process");
                execSync("wl-copy", {
                    input: text,
                    stdio: ["pipe", "ignore", "ignore"],
                });
                return;
            }
            catch (err) {
                // Fall through to next strategy
            }
        }
        // Fallback: Show warning but don't fail - output is still extracted
        ctx.ui.notify("⚠️ Clipboard not available on this system.\nResult extracted but not copied. Copy manually from preview.", "warning");
    }
    function extractMessages(ctx, includeToolCalls, includeThinking) {
        const messages = [];
        try {
            const branchEntries = ctx.sessionManager.getBranch();
            for (const entry of branchEntries) {
                if (entry.type !== "message")
                    continue;
                const msg = entry.message;
                const role = msg.role;
                // Extract content
                let textContent = [];
                let toolCalls = [];
                let thinkingBlocks = [];
                if (typeof msg.content === "string") {
                    textContent.push(msg.content);
                }
                else if (Array.isArray(msg.content)) {
                    for (const block of msg.content) {
                        if (block.type === "text") {
                            textContent.push(block.text);
                        }
                        else if (block.type === "toolCall") {
                            toolCalls.push(block);
                        }
                        else if (block.type === "thinking") {
                            thinkingBlocks.push(block.thinking);
                        }
                    }
                }
                const msgObj = {
                    role,
                    timestamp: entry.timestamp,
                    text: textContent.join("\n").trim(),
                    toolCalls: includeToolCalls ? toolCalls : [],
                    thinking: includeThinking ? thinkingBlocks : [],
                };
                // Add provider/model for assistant messages
                if (role === "assistant" && msg.provider && msg.model) {
                    msgObj.provider = msg.provider;
                    msgObj.model = msg.model;
                }
                // Add tool result specific fields
                if (role === "toolResult") {
                    msgObj.toolName = msg.toolName;
                    msgObj.toolCallId = msg.toolCallId;
                    msgObj.isError = msg.isError;
                }
                messages.push(msgObj);
            }
        }
        catch (error) {
            throw new Error(`Failed to read session: ${error instanceof Error ? error.message : String(error)}`);
        }
        return messages;
    }
    function formatText(messages) {
        let output = "";
        for (const msg of messages) {
            output += `\n${"=".repeat(60)}\n`;
            output += `Role: ${msg.role.toUpperCase()} | ${msg.timestamp}\n`;
            output += "=".repeat(60) + "\n";
            if (msg.text) {
                output += msg.text + "\n";
            }
            if (msg.thinking && msg.thinking.length > 0) {
                output += "\n[THINKING BLOCKS]\n";
                for (let i = 0; i < msg.thinking.length; i++) {
                    output += `\n--- Block ${i + 1} ---\n`;
                    output += msg.thinking[i] + "\n";
                }
            }
            if (msg.toolCalls && msg.toolCalls.length > 0) {
                output += "\n[TOOL CALLS]\n";
                for (const call of msg.toolCalls) {
                    output += `\n Tool: ${call.name} (ID: ${call.id})\n`;
                    output += ` Args: ${JSON.stringify(call.arguments)}\n`;
                }
            }
            if (msg.role === "assistant" && msg.provider) {
                output += `\nModel: ${msg.provider}/${msg.model}\n`;
            }
            if (msg.role === "toolResult") {
                output += `Tool: ${msg.toolName} | Error: ${msg.isError}\n`;
            }
        }
        output += `\n${"=".repeat(60)}\n`;
        output += `Total messages: ${messages.length}\n`;
        output += "=".repeat(60) + "\n";
        return output;
    }
    function formatMarkdown(messages) {
        let output = "# Session Messages\n\n";
        for (const msg of messages) {
            output += `## ${msg.role.toUpperCase()}\n\n`;
            if (msg.text) {
                output += msg.text + "\n\n";
            }
            if (msg.thinking && msg.thinking.length > 0) {
                output += "### Thinking\n\n";
                for (const t of msg.thinking) {
                    output += `\`\`\`\n${t}\n\`\`\`\n\n`;
                }
            }
            if (msg.toolCalls && msg.toolCalls.length > 0) {
                output += "### Tool Calls\n\n";
                for (const call of msg.toolCalls) {
                    output += `- **${call.name}** (${call.id})\n`;
                    output += `\`\`\`json\n${JSON.stringify(call.arguments, null, 2)}\n\`\`\`\n\n`;
                }
            }
            if (msg.role === "assistant" && msg.provider) {
                output += `*Model: ${msg.provider}/${msg.model}*\n\n`;
            }
            if (msg.role === "toolResult") {
                output += `**Tool:** ${msg.toolName} | **Error:** ${msg.isError}\n\n`;
            }
            output += "---\n\n";
        }
        output += `**Total messages:** ${messages.length}\n`;
        return output;
    }
}
//# sourceMappingURL=index.js.map