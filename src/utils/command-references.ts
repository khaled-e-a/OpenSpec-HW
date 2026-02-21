/**
 * Command Reference Utilities
 *
 * Utilities for transforming command references to tool-specific formats.
 */

/**
 * Transforms colon-based command references to hyphen-based format.
 * Converts `/opsx-hw:` patterns to `/opsx-hw-` for tools that use hyphen syntax.
 *
 * @param text - The text containing command references
 * @returns Text with command references transformed to hyphen format
 *
 * @example
 * transformToHyphenCommands('/opsx-hw:new') // returns '/opsx-hw-new'
 * transformToHyphenCommands('Use /opsx-hw:apply to implement') // returns 'Use /opsx-hw-apply to implement'
 */
export function transformToHyphenCommands(text: string): string {
  return text.replace(/\/opsx-hw:/g, '/opsx-hw-');
}
