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
  getTddSkillTemplate,
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
  getOpsxTddCommandTemplate,
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
    { template: getExploreSkillTemplate(), dirName: 'synergyspec-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'synergyspec-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'synergyspec-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'synergyspec-apply-change', workflowId: 'apply' },
    { template: getTddSkillTemplate(), dirName: 'synergyspec-tdd', workflowId: 'tdd' },
    { template: getFfChangeSkillTemplate(), dirName: 'synergyspec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'synergyspec-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'synergyspec-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'synergyspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'synergyspec-verify-change', workflowId: 'verify' },
    { template: getVerifySpecSkillTemplate(), dirName: 'synergyspec-verify-spec', workflowId: 'verify-spec' },
    { template: getOnboardSkillTemplate(), dirName: 'synergyspec-onboard', workflowId: 'onboard' },
    { template: getOpsxProposeSkillTemplate(), dirName: 'synergyspec-propose', workflowId: 'propose' },
    { template: getGenTestsSkillTemplate(), dirName: 'synergyspec-gen-tests', workflowId: 'gen-tests' },
    { template: getRunTestsSkillTemplate(), dirName: 'synergyspec-run-tests', workflowId: 'run-tests' },
    { template: getCiSkillTemplate(), dirName: 'synergyspec-ci', workflowId: 'ci' },
    // Utility skills — no workflowId, always installed regardless of profile
    { template: getCompareImagesSkillTemplate(), dirName: 'synergyspec-compare-images' },
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
    { template: getOpsxTddCommandTemplate(), id: 'tdd' },
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
 * @param skillDir - Absolute path to the skill directory (e.g. `/project/.claude/skills/synergyspec-compare-images`)
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
 * @param generatedByVersion - The SynergySpec version to embed in the file
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

  // Helper function to properly quote YAML strings
  const quoteYaml = (value: string | undefined): string => {
    if (!value) return '""';
    // Quote if contains special YAML characters or is empty
    if (/[:\[\]{}\(\)\",\n\r]/.test(value) || value.trim() !== value || value === '') {
      // Escape any existing double quotes and wrap in double quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  };

  return `---
name: ${quoteYaml(template.name)}
description: ${quoteYaml(template.description)}
license: ${quoteYaml(template.license || 'MIT')}
compatibility: ${quoteYaml(template.compatibility || 'Requires synergyspec-hw CLI.')}
metadata:
  author: ${quoteYaml(template.metadata?.author || 'synergyspec')}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
