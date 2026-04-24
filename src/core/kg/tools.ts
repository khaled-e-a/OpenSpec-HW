/**
 * Knowledge Graph Tool Operations
 *
 * Tool wrappers for KG operations to ensure deterministic behavior
 * when AI assistants interact with the knowledge graph
 */

import { KG, KGClient, types } from './index.js';
import { KGClientConfig } from './client.js';

/**
 * Tool: Initialize Knowledge Graph
 *
 * Creates and configures a KG client for a project
 */
export async function initKGTool(projectRoot: string, options?: {
  type?: 'memory' | 'file';
  forceRecreate?: boolean;
  schema?: string;
}): Promise<{
  success: boolean;
  clientId: string;
  kgPath?: string;
  message: string;
}> {
  try {
    const { initializeKG } = await import('./init.js');

    const result = await initializeKG({
      projectRoot,
      type: options?.type || 'file',
      schema: options?.schema,
      forceRecreate: options?.forceRecreate || false
    });

    // Generate a client ID for reference
    const clientId = `kg-${Date.now()}`;

    return {
      success: result.success,
      clientId,
      kgPath: result.kgPath,
      message: result.message
    };
  } catch (error: any) {
    return {
      success: false,
      clientId: '',
      message: `Failed to initialize KG: ${error.message}`
    };
  }
}

/**
 * Tool: Create KG Entity
 *
 * Creates a single entity in the knowledge graph
 */
export async function createKGEntityTool(
  projectRoot: string,
  entity: types.KGEntity,
  options?: {
    validate?: boolean;
    cascade?: boolean;
  }
): Promise<{
  success: boolean;
  entityId: string;
  entity?: types.KGEntity;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(projectRoot);

    if (!kg) {
      return {
        success: false,
        entityId: '',
        error: 'KG not available for this project'
      };
    }

    const created = await kg.create(entity, options);

    return {
      success: true,
      entityId: created.id,
      entity: created
    };
  } catch (error: any) {
    return {
      success: false,
      entityId: '',
      error: error.message
    };
  }
}

/**
 * Tool: Create Multiple KG Entities
 *
 * Creates multiple entities in a single operation
 */
export async function createKGEntitiesTool(
  projectRoot: string,
  entities: types.KGEntity[],
  options?: {
    validate?: boolean;
    cascade?: boolean;
  }
): Promise<{
  success: boolean;
  created: number;
  errors: Array<{ entity: any; error: string }>;
  entityIds: string[];
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(projectRoot);

    if (!kg) {
      return {
        success: false,
        created: 0,
        errors: entities.map(e => ({ entity: e, error: 'KG not available' })),
        entityIds: []
      };
    }

    const result = await kg.createMany(entities, options);

    return {
      success: result.success,
      created: result.created,
      errors: result.errors,
      entityIds: result.success ? entities.map(e => e.id) : []
    };
  } catch (error: any) {
    return {
      success: false,
      created: 0,
      errors: entities.map(e => ({ entity: e, error: error.message })),
      entityIds: []
    };
  }
}

/**
 * Tool: Create KG Relationship
 *
 * Creates a relationship between two entities
 */
export async function createKGRelationshipTool(
  projectRoot: string,
  sourceId: string,
  relationshipType: string,
  targetId: string,
  properties?: Record<string, any>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(projectRoot);

    if (!kg) {
      return {
        success: false,
        error: 'KG not available for this project'
      };
    }

    await kg.createRelationship(sourceId, relationshipType, targetId, properties);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool: Query KG Entities
 *
 * Finds entities matching query criteria
 */
export async function queryKGTool(
  projectRoot: string,
  query: {
    entityType?: string;
    properties?: Record<string, any>;
    ids?: string[];
  },
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
  }
): Promise<{
  success: boolean;
  entities: types.KGEntity[];
  count: number;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(projectRoot);

    if (!kg) {
      return {
        success: false,
        entities: [],
        count: 0,
        error: 'KG not available for this project'
      };
    }

    // Handle ID-based queries
    if (query.ids && query.ids.length > 0) {
      const entities = await kg.readMany(query.ids);
      return {
        success: true,
        entities,
        count: entities.length
      };
    }

    // Handle property-based queries
    const kgQuery: any = {
      entityType: query.entityType,
      properties: query.properties
    };

    const entities = await kg.find(kgQuery, options);

    return {
      success: true,
      entities,
      count: entities.length
    };
  } catch (error: any) {
    return {
      success: false,
      entities: [],
      count: 0,
      error: error.message
    };
  }
}

/**
 * Tool: Get KG Entity by ID
 *
 * Retrieves a single entity by its ID
 */
export async function getKGEntityTool(
  projectRoot: string,
  entityId: string,
  entityType?: string
): Promise<{
  success: boolean;
  entity?: types.KGEntity;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(projectRoot);

    if (!kg) {
      return {
        success: false,
        error: 'KG not available for this project'
      };
    }

    const entity = await kg.read(entityId, entityType);

    if (!entity) {
      return {
        success: false,
        error: `Entity '${entityId}' not found`
      };
    }

    return {
      success: true,
      entity
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool: Get Change Traceability
 *
 * Gets complete traceability information for a change
 */
export async function getChangeTraceabilityTool(
  projectRoot: string,
  changeId: string
): Promise<{
  success: boolean;
  traceability?: {
    useCaseSteps: types.UseCaseStep[];
    requirements: types.Requirement[];
    testCases: types.TestCase[];
    codeFiles: types.CodeFile[];
    coverage: number;
  };
  error?: string;
}> {
  try {
    const { getChangeKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getChangeKGClient(projectRoot, changeId);

    if (!kg) {
      return {
        success: false,
        error: 'KG not available or change not found'
      };
    }

    const traceability = await kg.getChangeTraceability(changeId);

    return {
      success: true,
      traceability
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool: Persist KG State
 *
 * Saves the current KG state to persistent storage
 */
export async function persistKGTool(projectRoot: string): Promise<{
  success: boolean;
  kgPath?: string;
  error?: string;
}> {
  try {
    const { persistKGState } = await import('../../utils/kg-utils.js');
    await persistKGState(projectRoot, null as any); // Will get client internally

    return {
      success: true,
      kgPath: join(projectRoot, '.synergyspec', 'kg')
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tool: Validate Entity Against Schema
 *
 * Validates an entity against the KG ontology schema
 */
export async function validateKGEntityTool(
  entity: any,
  entityType: string
): Promise<{
  success: boolean;
  isValid: boolean;
  errors: Array<{ field?: string; message: string }>;
  warnings: Array<{ field?: string; message: string }>;
}> {
  try {
    const { KGSchemaValidator } = await import('./validator.js');
    const validator = new KGSchemaValidator();

    const result = validator.validateEntity(entity, entityType);

    return {
      success: true,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings
    };
  } catch (error: any) {
    return {
      success: false,
      isValid: false,
      errors: [{ message: `Validation failed: ${error.message}` }],
      warnings: []
    };
  }
}

/**
 * Tool: Get KG Summary
 *
 * Gets a summary of KG contents for a project
 */
export async function getKGSummaryTool(projectRoot: string): Promise<{
  success: boolean;
  summary?: {
    enabled: boolean;
    entities: number;
    relationships: number;
    coverage: number;
  };
  error?: string;
}> {
  try {
    const { getKGSummary } = await import('../../utils/kg-utils.js');
    const summary = await getKGSummary(projectRoot, '');

    if (!summary) {
      return {
        success: true,
        summary: {
          enabled: false,
          entities: 0,
          relationships: 0,
          coverage: 0
        }
      };
    }

    return {
      success: true,
      summary
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Import utilities
import { join } from 'path';