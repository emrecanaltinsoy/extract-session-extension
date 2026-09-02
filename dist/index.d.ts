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
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
export default function (pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map