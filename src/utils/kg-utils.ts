/**
 * Knowledge Graph Utilities
 *
 * Helper functions for working with the Knowledge Graph across synspec commands
 */

import { KG, KGClient } from '../core/kg/index.js';
import { join } from 'path';
import { existsSync } from 'fs';

export interface KGConfig {
  enabled: boolean;
  type: 'memory' | 'file' | 'neo4j';
  path?: string;
  connectionString?: string;
}

/**
 * Check if KG is enabled for the project
 */
export function isKGEnabled(projectRoot: string): boolean {
  // Check for KG config file
  const kgConfigPath = join(projectRoot, '.synergyspec', 'kg', 'config.json');
  if (existsSync(kgConfigPath)) {
    return true;
  }

  // Check for feature flag in project config
  const projectConfigPath = join(projectRoot, 'synergyspec', 'config.yaml');
  if (existsSync(projectConfigPath)) {
    // Would parse config and check for kg.enabled flag
    // For now, assume enabled if KG directory exists
  }

  // Default: KG is opt-in for now, but will be default in future
  return false;
}

/**
 * Get or create KG client for a project
 */
export async function getKGClient(projectRoot: string): Promise<KGClient | null> {
  if (!isKGEnabled(projectRoot)) {
    return null;
  }

  const kgConfigPath = join(projectRoot, '.synergyspec', 'kg', 'config.json');
  const kgDataPath = join(projectRoot, '.synergyspec', 'kg', 'data.json');

  // Check if KG data exists
  if (existsSync(kgDataPath)) {
    // Load existing KG
    const client = KG.createKGClient({
      type: 'file',
      connectionString: kgDataPath
    });

    // Load state
    await KG.loadKGState(client, join(projectRoot, '.synergyspec', 'kg'));

    return client;
  }

  // KG is enabled but not initialized yet
  // This shouldn't happen if new-change command is used, but handle gracefully
  const { initializeKG } = await import('../core/kg/init.js');
  const result = await initializeKG({
    projectRoot,
    forceRecreate: false
  });

  return result.client;
}

/**
 * Get KG client for a specific change
 */
export async function getChangeKGClient(
  projectRoot: string,
  changeId: string
): Promise<KGClient | null> {
  const client = await getKGClient(projectRoot);
  if (!client) return null;

  // Verify change exists in KG
  const change = await client.read(changeId, 'Change');
  if (!change) {
    // Change not in KG, might need to import it
    return null;
  }

  return client;
}

/**
 * Ensure KG is initialized for a command
 */
export async function ensureKGInitialized(
  projectRoot: string,
  options?: {
    force?: boolean;
    schema?: string;
  }
): Promise<KGClient> {
  const { initializeKG } = await import('../core/kg/init.js');

  const result = await initializeKG({
    projectRoot,
    schema: options?.schema,
    forceRecreate: options?.force || false
  });

  if (!result.success) {
    throw new Error(`Failed to initialize knowledge graph: ${result.message}`);
  }

  return result.client;
}

/**
 * Save KG state after modifications
 */
export async function persistKGState(projectRoot: string, client: KGClient): Promise<void> {
  if (!isKGEnabled(projectRoot)) return;

  const { saveKGState } = await import('../core/kg/init.js');
  const kgPath = join(projectRoot, '.synergyspec', 'kg');

  await saveKGState(client, kgPath);
}

/**
 * Get KG summary for a change
 */
export async function getKGSummary(
  projectRoot: string,
  changeId: string
): Promise<{
  enabled: boolean;
  entities: number;
  relationships: number;
  coverage: number;
} | null> {
  const client = await getChangeKGClient(projectRoot, changeId);
  if (!client) return null;

  // Get change artifacts
  const artifacts = await client.getChangeArtifacts(changeId);

  // Get traceability info
  const traceability = await client.getChangeTraceability(changeId);

  return {
    enabled: true,
    entities: traceability.requirements.length + traceability.testCases.length + traceability.codeFiles.length,
    relationships: 0, // Would need to count relationships
    coverage: traceability.coverage
  };
}

/**
 * Format KG info for CLI output
 */
export function formatKGInfo(summary: {
  entities: number;
  relationships: number;
  coverage: number;
}): string {
  const coverageStr = summary.coverage.toFixed(1);
  return `📊 KG: ${summary.entities} entities, ${summary.relationships} relationships, ${coverageStr}% coverage`;
}

/**
 * Check if command should use KG
 */
export function shouldUseKG(commandName: string, flags: any): boolean {
  // Check for --no-kg flag
  if (flags?.noKg || flags?.noKG) {
    return false;
  }

  // Check for KG_DISABLE env var
  if (process.env.SYNERGYSPEC_KG_DISABLE === '1') {
    return false;
  }

  // Some commands might not need KG by default
  const kgOptionalCommands = ['list', 'show', 'help'];
  if (kgOptionalCommands.includes(commandName)) {
    // These commands can work without KG
    return false;
  }

  // Default: use KG if available
  return true;
}

/**
 * Handle KG errors gracefully
 */
export function handleKGError(error: any): void {
  console.warn('⚠️  Knowledge Graph warning:', error.message);
  console.warn('   Continuing without KG integration...');
  console.warn('   Run with --no-kg to disable KG or fix the issue.');
}

/**
 * Decorate command with KG information
 */
export function withKGInfo(
  commandFn: Function,
  commandName: string
): Function {
  return async function(...args: any[]) {
    const projectRoot = process.cwd();
    const useKG = isKGEnabled(projectRoot);

    if (useKG) {
      console.log(`🔍 Using Knowledge Graph for ${commandName}`);
    }

    try {
      return await commandFn.apply(this, args);
    } catch (error) {
      if (useKG && error.message?.includes('KG')) {
        handleKGError(error);
        // Retry without KG?
        return await commandFn.apply(this, args);
      }
      throw error;
    }
  };
}