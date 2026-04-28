/**
 * `synergyspec-hw kg watch` — watch synergyspec/changes/ for markdown edits
 * and auto-refresh the KG so the graph stays in sync with disk.
 *
 * Uses fs.watch (recursive) with debouncing. Picks up edits from any source:
 * AI tools writing files, humans editing in their editor, scripts, etc.
 */

import { existsSync, watch } from 'fs';
import path from 'path';
import { kgRefreshCommand } from './kg-refresh.js';
import { isKGEnabled } from '../utils/kg-utils.js';

export interface KGWatchOptions {
  debounceMs?: number;
}

export async function kgWatchCommand(options: KGWatchOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const debounceMs = options.debounceMs ?? 500;

  if (!isKGEnabled(projectRoot)) {
    throw new Error(
      'KG is not initialized for this project. Run `synergyspec-hw new change <name>` first.'
    );
  }

  const changesRoot = path.join(projectRoot, 'synergyspec', 'changes');
  if (!existsSync(changesRoot)) {
    throw new Error(`No changes directory at ${path.relative(projectRoot, changesRoot)}.`);
  }

  console.log(`Watching ${path.relative(projectRoot, changesRoot)}/ for *.md changes...`);
  console.log(`Press Ctrl+C to stop.`);
  console.log();

  // Initial refresh so the user starts with a synced graph.
  try {
    await runRefresh(projectRoot, undefined);
  } catch (err: any) {
    console.warn(`Initial refresh failed: ${err.message}`);
  }

  // Pending refreshes per-change, debounced. A null value means "all changes".
  const pending = new Map<string, NodeJS.Timeout>();
  const inflight = new Set<string>();

  function scheduleRefresh(changeId: string) {
    const existing = pending.get(changeId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      pending.delete(changeId);
      // Skip if a refresh for this change is already running. The watcher will
      // pick up any further edits via subsequent change events.
      if (inflight.has(changeId)) return;
      inflight.add(changeId);
      try {
        await runRefresh(projectRoot, changeId);
      } catch (err: any) {
        console.error(`Refresh failed for ${changeId}: ${err.message}`);
      } finally {
        inflight.delete(changeId);
      }
    }, debounceMs);

    pending.set(changeId, timer);
  }

  let watcher;
  try {
    watcher = watch(changesRoot, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      // We only care about markdown edits.
      if (!filename.endsWith('.md')) return;
      // The first path segment after changesRoot is the changeId.
      const segments = filename.split(path.sep);
      const changeId = segments[0];
      if (!changeId || changeId === 'archive' || changeId.startsWith('.')) return;
      scheduleRefresh(changeId);
    });
  } catch (err: any) {
    throw new Error(
      `fs.watch failed: ${err.message}. ` +
      `Recursive watch may not be supported on this platform. ` +
      `Run \`synergyspec-hw kg refresh\` manually instead.`
    );
  }

  await new Promise<void>((resolve) => {
    const shutdown = () => {
      console.log('\nStopping watcher...');
      watcher?.close();
      // Flush any pending timers.
      for (const t of pending.values()) clearTimeout(t);
      pending.clear();
      resolve();
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}

async function runRefresh(projectRoot: string, changeId: string | undefined): Promise<void> {
  const ts = new Date().toISOString().split('T')[1].split('.')[0];
  const result = await kgRefreshCommand({ change: changeId, silent: true, projectRoot });
  for (const s of result.changes) {
    const total =
      s.created.useCases + s.created.steps + s.created.requirements + s.created.tasks;
    console.log(
      `[${ts}] ${s.changeId}: ${total} entities, ${s.edges} edges` +
      (s.warnings.length > 0 ? ` (${s.warnings.length} warning${s.warnings.length === 1 ? '' : 's'})` : '')
    );
    for (const w of s.warnings) console.log(`         ⚠ ${w}`);
  }
}
