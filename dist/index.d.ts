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
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
export default function (pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map