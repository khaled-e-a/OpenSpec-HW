/**
 * `synergyspec-hw kg install-hooks` — install Claude Code hooks into
 * `.claude/settings.local.json` so the KG auto-refreshes after the AI
 * writes/edits any file. Deterministic — runs regardless of whether the AI
 * remembered the in-skill instruction.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export interface KGInstallHooksOptions {
  projectRoot?: string;
  silent?: boolean;
}

interface HookEntry {
  type: string;
  command: string;
}

interface HookGroup {
  matcher?: string;
  hooks: HookEntry[];
}

interface ClaudeSettings {
  permissions?: any;
  hooks?: Record<string, HookGroup[]>;
}

const HOOK_COMMAND = 'synergyspec-hw kg refresh --silent 2>/dev/null || true';
const HOOK_MARKER_TYPE = 'command';

export async function kgInstallHooksCommand(options: KGInstallHooksOptions = {}): Promise<{ installed: boolean; path: string }> {
  const projectRoot = options.projectRoot ?? process.cwd();
  const silent = !!options.silent;

  const claudeDir = path.join(projectRoot, '.claude');
  const settingsPath = path.join(claudeDir, 'settings.local.json');

  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  let settings: ClaudeSettings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch (e: any) {
      throw new Error(`Failed to parse ${settingsPath}: ${e.message}`);
    }
  }

  if (!settings.hooks) settings.hooks = {};

  // PostToolUse: fires after Write/Edit/MultiEdit. Refresh is idempotent and
  // cheap; running on every write is fine and guarantees the graph never
  // drifts even if the AI forgets the in-skill `kg refresh` step.
  const eventName = 'PostToolUse';
  const matcher = 'Write|Edit|MultiEdit';

  const groups = settings.hooks[eventName] ?? [];
  let group = groups.find(g => g.matcher === matcher);
  if (!group) {
    group = { matcher, hooks: [] };
    groups.push(group);
  }

  const alreadyInstalled = group.hooks.some(h => h.type === HOOK_MARKER_TYPE && h.command === HOOK_COMMAND);
  if (alreadyInstalled) {
    if (!silent) console.log(`Hook already installed at ${path.relative(projectRoot, settingsPath) || settingsPath}.`);
    return { installed: false, path: settingsPath };
  }

  group.hooks.push({ type: HOOK_MARKER_TYPE, command: HOOK_COMMAND });
  settings.hooks[eventName] = groups;

  // Also Stop event: fires once when the agent finishes responding. This
  // catches edits that happened in earlier tool calls and ensures one final
  // sync at end-of-turn.
  const stopGroups = settings.hooks['Stop'] ?? [];
  let stopGroup = stopGroups.find(g => !g.matcher);
  if (!stopGroup) {
    stopGroup = { hooks: [] };
    stopGroups.push(stopGroup);
  }
  if (!stopGroup.hooks.some(h => h.type === HOOK_MARKER_TYPE && h.command === HOOK_COMMAND)) {
    stopGroup.hooks.push({ type: HOOK_MARKER_TYPE, command: HOOK_COMMAND });
  }
  settings.hooks['Stop'] = stopGroups;

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  if (!silent) {
    console.log(`Installed KG auto-refresh hooks in ${path.relative(projectRoot, settingsPath) || settingsPath}.`);
    console.log(`  PostToolUse(Write|Edit|MultiEdit) → ${HOOK_COMMAND}`);
    console.log(`  Stop                              → ${HOOK_COMMAND}`);
  }
  return { installed: true, path: settingsPath };
}
