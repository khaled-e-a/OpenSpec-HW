/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import path from 'path';
import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getVerifySpecSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getGenTestsSkillTemplate,
  getRunTestsSkillTemplate,
  getCiSkillTemplate,
  getCompareImagesSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxVerifySpecCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxGenTestsCommandTemplate,
  getOpsxRunTestsCommandTemplate,
  getOpsxCiCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

/**
 * Skill template with directory name and optional workflow ID mapping.
 * Entries without a workflowId are utility skills that bypass profile filtering
 * and are always installed unconditionally.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId?: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'openspec-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'openspec-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'openspec-apply-change', workflowId: 'apply' },
    { template: getFfChangeSkillTemplate(), dirName: 'openspec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'openspec-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'openspec-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'openspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'openspec-verify-change', workflowId: 'verify' },
    { template: getVerifySpecSkillTemplate(), dirName: 'openspec-verify-spec', workflowId: 'verify-spec' },
    { template: getOnboardSkillTemplate(), dirName: 'openspec-onboard', workflowId: 'onboard' },
    { template: getOpsxProposeSkillTemplate(), dirName: 'openspec-propose', workflowId: 'propose' },
    { template: getGenTestsSkillTemplate(), dirName: 'openspec-gen-tests', workflowId: 'gen-tests' },
    { template: getRunTestsSkillTemplate(), dirName: 'openspec-run-tests', workflowId: 'run-tests' },
    { template: getCiSkillTemplate(), dirName: 'openspec-ci', workflowId: 'ci' },
    // Utility skills — no workflowId, always installed regardless of profile
    { template: getCompareImagesSkillTemplate(), dirName: 'openspec-compare-images' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  // Entries without a workflowId are utility skills that always pass the filter
  return all.filter(entry => !entry.workflowId || filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    { template: getOpsxNewCommandTemplate(), id: 'new' },
    { template: getOpsxContinueCommandTemplate(), id: 'continue' },
    { template: getOpsxApplyCommandTemplate(), id: 'apply' },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    { template: getOpsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxVerifySpecCommandTemplate(), id: 'verify-spec' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
    { template: getOpsxProposeCommandTemplate(), id: 'propose' },
    { template: getOpsxGenTestsCommandTemplate(), id: 'gen-tests' },
    { template: getOpsxRunTestsCommandTemplate(), id: 'run-tests' },
    { template: getOpsxCiCommandTemplate(), id: 'ci' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates the list of script files to write for a skill template.
 *
 * @param template - The skill template (may have no scripts)
 * @param skillDir - Absolute path to the skill directory (e.g. `/project/.claude/skills/openspec-compare-images`)
 * @returns Array of `{ filePath, content }` objects ready to be written
 */
export function generateSkillScripts(
  template: SkillTemplate,
  skillDir: string
): Array<{ filePath: string; content: string }> {
  if (!template.scripts) return [];
  return Object.entries(template.scripts).map(([relativePath, content]) => ({
    filePath: path.join(skillDir, relativePath),
    content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
