/**
 * Core template types for skills and slash commands.
 */

export interface SkillTemplate {
  name: string;
  description: string;
  instructions: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  /** Optional script files to write alongside SKILL.md. Key = relative path within skill dir, value = file content. */
  scripts?: Record<string, string>;
}

export interface CommandTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
}
