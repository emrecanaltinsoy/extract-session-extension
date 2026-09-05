/**
 * Extract Session Messages Extension for Pi
 *
 * Provides an `/extract` command to export user and agent messages from the current session
 * with filtering options (exclude tool calls, thinking blocks) and multiple output formats
 * (text, JSON, markdown). Can save to file or copy to clipboard.
 *
 * Usage:
 *   /extract --exclude-tools --exclude-thinking --format text
 *   /extract --format json --output /path/to/directory
 *   /extract --help
 *
 * Features:
 * - Multiple output formats (text, JSON, markdown)
 * - Filter out tool calls and/or thinking blocks
 * - Save to file or copy to clipboard
 * - Auto-copy to clipboard (with fallbacks)
 * - Tab completion for arguments
 * - Branch-aware session extraction
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

// Try to import clipboard library (async, loaded on demand)
let clipboard: any;

interface MessageData {
  role: string;
  timestamp: string;
  text: string;
  toolCalls: any[];
  thinking: string[];
  provider?: string;
  model?: string;
  toolName?: string;
  toolCallId?: string;
  isError?: boolean;
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("extract", {
    description: "Extract user and agent messages from current session",
    getArgumentCompletions: (prefix) => {
      const options = [
        "--help",
        "-its",
        "-ith",
        "--include-tools",
        "--include-thinking",
        "-f",
        "--format",
      ];
      return options.filter((opt) => opt.startsWith(prefix)).map((opt) => ({ value: opt, label: opt }));
    },
    handler: async (args, ctx) => {
      const argList = args.split(/\s+/).filter(Boolean);

      // Parse arguments
      let includeToolCalls = false;  // Default: exclude
      let includeThinking = false;   // Default: exclude
      let outputFormat = "text";
      let outputFilePath: string | null = null;
      let showHelp = false;

      for (let i = 0; i < argList.length; i++) {
        const arg = argList[i];
        
        if (arg === "--help") {
          showHelp = true;
        } else if (arg === "-its" || arg === "--include-tools") {
          includeToolCalls = true;
        } else if (arg === "-ith" || arg === "--include-thinking") {
          includeThinking = true;
        } else if ((arg === "-f" || arg === "--format") && argList[i + 1]) {
          outputFormat = argList[++i];
        } else if (!arg.startsWith("-")) {
          // Positional argument: treat as filename
          outputFilePath = arg;
        }
      }

      if (showHelp) {
        const help = `
Extract Session Messages

Usage: /extract [options] [filename]

Options:
  -its, --include-tools       Include tool calls in output
  -ith, --include-thinking    Include thinking blocks in output
  -f, --format <type>         Output format: text, json, markdown (default: text)
  --help                      Show this help message

Filename (optional):
  Save to file. Format auto-detected from extension (.json, .md, .txt)
  If not specified, output copied to clipboard only

Examples:
  /extract                              # Exclude all, clipboard only
  /extract -its                         # Include tools, clipboard only
  /extract -its -ith                    # Include both, clipboard only
  /extract ~/session.txt                # Save to file, exclude all
  /extract -f json ~/session.json       # Format specified, save to file
  /extract -its ~/tools-included.md     # Include tools, markdown format, save to file
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

        // Auto-detect format from filename if not explicitly set
        if (outputFilePath && outputFormat === "text") {
          if (outputFilePath.endsWith(".json")) {
            outputFormat = "json";
          } else if (outputFilePath.endsWith(".md") || outputFilePath.endsWith(".markdown")) {
            outputFormat = "markdown";
          }
        }

        let output = "";

        if (outputFormat === "json") {
          output = JSON.stringify(messages, null, 2);
        } else if (outputFormat === "markdown") {
          output = formatMarkdown(messages);
        } else {
          output = formatText(messages);
        }

        // Determine file path and save if requested
        let savedFilePath = "";
        if (outputFilePath) {
          savedFilePath = await saveToFile(output, outputFilePath, outputFormat, ctx);
        }

        // Try to copy to clipboard with multiple fallbacks
        await copyToClipboard(output, ctx);

        // Build success message
        let message = `✓ Extracted ${messages.length} messages (copied to clipboard)`;
        if (savedFilePath) {
          message += `\n✓ Saved to: ${savedFilePath}`;
        }
        ctx.ui.notify(message, "info");

        // Show preview in custom panel
        if (ctx.mode === "tui") {
          const preview =
            output.split("\n").slice(0, 30).join("\n") +
            (output.split("\n").length > 30 ? "\n...(truncated, full output in clipboard/file)" : "");
          ctx.ui.notify(preview, "info");
        }
      } catch (error) {
        ctx.ui.notify(
          `Error extracting session: ${error instanceof Error ? error.message : String(error)}`,
          "error"
        );
      }
    },
  });

  /**
   * Save output to file
   */
  async function saveToFile(
    content: string,
    filePath: string,
    format: string,
    ctx: ExtensionContext
  ): Promise<string> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      // Expand tilde to home directory
      const expandedPath = filePath.startsWith("~") ? filePath.replace("~", process.env.HOME || "") : filePath;

      // Check if path exists
      let finalPath: string;
      try {
        const stats = fs.statSync(expandedPath);
        if (stats.isDirectory()) {
          // It's a directory, generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("Z")[0];
          const filename = `extract_${timestamp}.${format}`;
          finalPath = path.join(expandedPath, filename);
        } else {
          // It's a file path
          finalPath = expandedPath;
        }
      } catch {
        // Path doesn't exist, treat as file path
        if (expandedPath.endsWith("/")) {
          // It's meant to be a directory
          fs.mkdirSync(expandedPath, { recursive: true });
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("Z")[0];
          const filename = `extract_${timestamp}.${format}`;
          finalPath = path.join(expandedPath, filename);
        } else {
          // It's a file path, create parent directories if needed
          const parentDir = path.dirname(expandedPath);
          if (parentDir !== "." && parentDir !== "/") {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          finalPath = expandedPath;
        }
      }

      // Write file
      fs.writeFileSync(finalPath, content, "utf8");
      return finalPath;
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Copy text to clipboard with multiple fallback strategies
   */
  async function copyToClipboard(text: string, ctx: ExtensionContext): Promise<void> {
    // Strategy 1: Try clipboardy library
    if (clipboard?.write) {
      try {
        await clipboard.write(text);
        return;
      } catch (err) {
        // Fall through to next strategy
      }
    }

    // Strategy 2: Try navigator.clipboard (browser-like environments)
    if (typeof (globalThis as any).navigator !== "undefined") {
      const nav = (globalThis as any).navigator;
      if (nav.clipboard?.writeText) {
        try {
          await nav.clipboard.writeText(text);
          return;
        } catch (err) {
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
      } catch (err) {
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
      } catch (err) {
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
      } catch (err) {
        // Fall through to next strategy
      }
    }

    // Fallback: Show warning but don't fail - output is still extracted
    ctx.ui.notify(
      "⚠️ Clipboard not available on this system.\nResult extracted but not copied. Copy manually from preview.",
      "warning"
    );
  }

  function extractMessages(
    ctx: ExtensionContext,
    includeToolCalls: boolean,
    includeThinking: boolean
  ): MessageData[] {
    const messages: MessageData[] = [];

    try {
      const branchEntries = ctx.sessionManager.getBranch();

      for (const entry of branchEntries) {
        if (entry.type !== "message") continue;

        const msg = entry.message as any;
        const role = msg.role;

        // Skip tool result messages if not including tool calls
        if (role === "toolResult" && !includeToolCalls) {
          continue;
        }

        // Extract content
        let textContent: string[] = [];
        let toolCalls: any[] = [];
        let thinkingBlocks: string[] = [];

        if (typeof msg.content === "string") {
          textContent.push(msg.content);
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === "text") {
              textContent.push(block.text);
            } else if (block.type === "toolCall") {
              toolCalls.push(block);
            } else if (block.type === "thinking") {
              thinkingBlocks.push(block.thinking);
            }
          }
        }

        const msgObj: MessageData = {
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
    } catch (error) {
      throw new Error(`Failed to read session: ${error instanceof Error ? error.message : String(error)}`);
    }

    return messages;
  }

  function formatText(messages: MessageData[]): string {
    let output = "";

    for (const msg of messages) {
      output += `\n${"=".repeat(60)}\n`;
      output += `Role: ${msg.role.toUpperCase()} | ${msg.timestamp}\n`;
      output += "=".repeat(60) + "\n";

      // Thinking blocks first (happens before the response)
      if (msg.thinking && msg.thinking.length > 0) {
        output += "\n[THINKING BLOCKS]\n";
        for (let i = 0; i < msg.thinking.length; i++) {
          output += `\n--- Block ${i + 1} ---\n`;
          output += msg.thinking[i] + "\n";
        }
        output += "\n";
      }

      // Then the actual message text
      if (msg.text) {
        output += msg.text + "\n";
      }

      // Then tool calls
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

  function formatMarkdown(messages: MessageData[]): string {
    let output = "# Session Messages\n\n";

    for (const msg of messages) {
      output += `## ${msg.role.toUpperCase()}\n\n`;

      // Thinking blocks first (happens before the response)
      if (msg.thinking && msg.thinking.length > 0) {
        output += "### Thinking\n\n";
        for (const t of msg.thinking) {
          output += `\`\`\`\n${t}\n\`\`\`\n\n`;
        }
      }

      // Then the actual message text
      if (msg.text) {
        output += msg.text + "\n\n";
      }

      // Then tool calls
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
