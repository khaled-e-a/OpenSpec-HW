/**
 * Knowledge Graph Initialization
 *
 * Utilities for initializing and setting up the knowledge graph
 * for a SynergySpec project or change.
 */

import { KG, KGClient, types } from './index.js';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

export interface KGInitOptions {
  projectRoot: string;
  changeId?: string;
  schema?: string;
  forceRecreate?: boolean;
  type?: 'memory' | 'file';
}

export interface KGInitResult {
  success: boolean;
  kgPath?: string;
  client: KGClient;
  entitiesCreated: number;
  message: string;
}

/**
 * Initialize knowledge graph for a project
 */
export async function initializeKG(options: KGInitOptions): Promise<KGInitResult> {
  const { projectRoot, changeId, schema = 'spec-driven', forceRecreate = false } = options;

  // Determine KG storage path
  const kgPath = join(projectRoot, '.synergyspec', 'kg');
  const kgConfigPath = join(kgPath, 'config.json');
  const kgDataPath = join(kgPath, 'data.json');

  // Create KG directory if it doesn't exist
  if (!existsSync(kgPath)) {
    mkdirSync(kgPath, { recursive: true });
  }

  // Check if KG already exists
  const kgExists = existsSync(kgConfigPath) && existsSync(kgDataPath);

  if (kgExists && !forceRecreate) {
    // Load existing KG
    const client = KG.createKGClient({
      type: 'file',
      connectionString: kgDataPath
    });

    return {
      success: true,
      kgPath,
      client,
      entitiesCreated: 0,
      message: 'Loaded existing knowledge graph'
    };
  }

  // Create new KG
  const client = KG.createKGClient({ type: 'memory' });

  // Save initial config
  const config = {
    version: '1.0.0',
    schema,
    createdAt: new Date().toISOString(),
    projectRoot
  };

  writeFileSync(kgConfigPath, JSON.stringify(config, null, 2));

  // Initialize with base entities if this is a project-level init
  if (!changeId) {
    await initializeProjectKG(client, projectRoot);
  }

  return {
    success: true,
    kgPath,
    client,
    entitiesCreated: 0,
    message: 'Created new knowledge graph'
  };
}

/**
 * Initialize KG for a specific change
 */
export async function initializeChangeKG(
  client: KGClient,
  changeId: string,
  changeData: {
    name: string;
    schema: string;
    description?: string;
    createdAt?: Date;
  }
): Promise<{ entities: types.KGEntity[]; relationships: any[] }> {
  const entities: types.KGEntity[] = [];
  const relationships: any[] = [];

  // Create Change entity
  const change: types.Change = {
    id: changeId,
    type: 'Change',
    name: changeData.name,
    schema: changeData.schema,
    status: 'proposed',
    createdDate: changeData.createdAt || new Date(),
    description: changeData.description
  };

  entities.push(change);

  // Create initial artifacts based on schema
  const artifacts = await createSchemaArtifacts(changeId, changeData.schema);
  entities.push(...artifacts);

  // Create relationships
  for (const artifact of artifacts) {
    relationships.push({
      sourceId: changeId,
      type: 'hasArtifact',
      targetId: artifact.id,
      properties: { role: artifact.type.toLowerCase() }
    });
  }

  // Save to KG
  await client.createMany(entities);

  for (const rel of relationships) {
    await client.createRelationship(rel.sourceId, rel.type, rel.targetId, rel.properties);
  }

  return { entities, relationships };
}

/**
 * Create initial artifacts based on schema
 */
async function createSchemaArtifacts(
  changeId: string,
  schema: string
): Promise<any[]> {
  const artifacts: any[] = [];
  const timestamp = new Date();

  // Base artifacts for all schemas
  const baseArtifacts = [
    {
      id: `${changeId}-proposal`,
      type: 'DesignDoc',
      name: 'Proposal',
      status: 'active' as const,
      filePath: `synergyspec/changes/${changeId}/proposal.md`,
      changeId,
      createdAt: timestamp,
      decisionsCount: 0,
      hasMigrationPlan: false
    },
    {
      id: `${changeId}-tasks`,
      type: 'Artifact', // Generic artifact for tasks.md
      name: 'Tasks',
      status: 'active' as const,
      filePath: `synergyspec/changes/${changeId}/tasks.md`,
      changeId,
      createdAt: timestamp
    }
  ];

  artifacts.push(...baseArtifacts);

  // Schema-specific artifacts
  switch (schema) {
    case 'spec-driven':
      artifacts.push(
        {
          id: `${changeId}-usecases`,
          type: 'Artifact',
          name: 'Use Cases',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/usecases.md`,
          changeId,
          createdAt: timestamp
        },
        {
          id: `${changeId}-specs`,
          type: 'Spec',
          name: 'Specifications',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/specs/`,
          changeId,
          createdAt: timestamp,
          capability: 'change-specs',
          specType: 'new',
          requirementsCount: 0
        },
        {
          id: `${changeId}-design`,
          type: 'DesignDoc',
          name: 'Design',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/design.md`,
          changeId,
          createdAt: timestamp,
          decisionsCount: 0,
          hasMigrationPlan: false
        }
      );
      break;

    // Add other schema cases as needed
  }

  return artifacts;
}

/**
 * Initialize project-level KG with existing specs and changes
 */
async function initializeProjectKG(
  client: KGClient,
  projectRoot: string
): Promise<void> {
  // Scan for existing specs
  const specsPath = join(projectRoot, 'synergyspec', 'specs');
  if (existsSync(specsPath)) {
    await scanAndImportSpecs(client, specsPath);
  }

  // Scan for existing changes
  const changesPath = join(projectRoot, 'synergyspec', 'changes');
  if (existsSync(changesPath)) {
    await scanAndImportChanges(client, changesPath);
  }

  // Scan for existing archived changes
  const archivePath = join(projectRoot, 'synergyspec', 'changes', 'archive');
  if (existsSync(archivePath)) {
    await scanAndImportArchivedChanges(client, archivePath);
  }
}

/**
 * Scan and import existing specs
 */
async function scanAndImportSpecs(
  client: KGClient,
  specsPath: string
): Promise<void> {
  // This would recursively scan the specs directory
  // and create KG entities for each spec found
  // Implementation depends on spec file format
}

/**
 * Scan and import existing changes
 */
async function scanAndImportChanges(
  client: KGClient,
  changesPath: string
): Promise<void> {
  // This would scan the changes directory
  // and create KG entities for each change
  // Implementation depends on change structure
}

/**
 * Scan and import archived changes
 */
async function scanAndImportArchivedChanges(
  client: KGClient,
  archivePath: string
): Promise<void> {
  // This would scan the archive directory
  // and create KG entities for archived changes
}

/**
 * Save KG state to disk (for file-based persistence)
 */
export async function saveKGState(
  client: KGClient,
  kgPath: string
): Promise<void> {
  const dataPath = join(kgPath, 'data.json');

  // Export all entities
  const entities = await client.find({});

  // Export all relationships
  const relationships: any[] = [];
  for (const entity of entities) {
    const entityRels = await client.getRelationships(entity.id);
    relationships.push(...entityRels.map(rel => ({
      sourceId: entity.id,
      type: rel.type,
      targetId: rel.target.id,
      properties: rel.properties
    })));
  }

  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entities,
    relationships
  };

  writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

/**
 * Load KG state from disk
 */
export async function loadKGState(
  client: KGClient,
  kgPath: string
): Promise<void> {
  const dataPath = join(kgPath, 'data.json');

  if (!existsSync(dataPath)) {
    return;
  }

  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

  // Import entities
  if (data.entities) {
    await client.createMany(data.entities);
  }

  // Import relationships
  if (data.relationships) {
    for (const rel of data.relationships) {
      await client.createRelationship(
        rel.sourceId,
        rel.type,
        rel.targetId,
        rel.properties
      );
    }
  }
}