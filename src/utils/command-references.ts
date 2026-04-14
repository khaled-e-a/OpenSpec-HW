/**
 * Command Reference Utilities
 *
 * Utilities for transforming command references to tool-specific formats.
 */

/**
 * Transforms colon-based command references to hyphen-based format.
 * Converts `/synspec:` patterns to `/synspec-` for tools that use hyphen syntax.
 *
 * @param text - The text containing command references
 * @returns Text with command references transformed to hyphen format
 *
 * @example
 * transformToHyphenCommands('/synspec:new') // returns '/synspec-new'
 * transformToHyphenCommands('Use /synspec:apply to implement') // returns 'Use /synspec-apply to implement'
 */
export function transformToHyphenCommands(text: string): string {
  return text.replace(/\/synspec:/g, '/synspec-');
}
