/**
 * Knowledge Graph Tool Operations
 *
 * Tool wrappers for KG operations. Each tool accepts a single params object
 * so it can be dispatched uniformly by executeKGTool.
 */

import { join } from 'path';
import { KG, KGClient, types } from './index.js';
import { KGClientConfig } from './client.js';

/**
 * Tool: Initialize Knowledge Graph
 */
export async function initKGTool(params: {
  projectRoot: string;
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
      projectRoot: params.projectRoot,
      type: params.type || 'file',
      schema: params.schema,
      forceRecreate: params.forceRecreate || false
    });

    return {
      success: result.success,
      clientId: `kg-${Date.now()}`,
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
 */
export async function createKGEntityTool(params: {
  projectRoot: string;
  entity: types.KGEntity;
  validate?: boolean;
  cascade?: boolean;
}): Promise<{
  success: boolean;
  entityId: string;
  entity?: types.KGEntity;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(params.projectRoot);

    if (!kg) {
      return { success: false, entityId: '', error: 'KG not available for this project' };
    }

    const created = await kg.create(params.entity, { validate: params.validate, cascade: params.cascade });

    return { success: true, entityId: created.id, entity: created };
  } catch (error: any) {
    return { success: false, entityId: '', error: error.message };
  }
}

/**
 * Tool: Create Multiple KG Entities
 */
export async function createKGEntitiesTool(params: {
  projectRoot: string;
  entities: types.KGEntity[];
  validate?: boolean;
  cascade?: boolean;
}): Promise<{
  success: boolean;
  created: number;
  errors: Array<{ entity: any; error: string }>;
  entityIds: string[];
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(params.projectRoot);

    if (!kg) {
      return {
        success: false,
        created: 0,
        errors: params.entities.map(e => ({ entity: e, error: 'KG not available' })),
        entityIds: []
      };
    }

    const result = await kg.createMany(params.entities, { validate: params.validate, cascade: params.cascade });

    return {
      success: result.success,
      created: result.created,
      errors: result.errors,
      entityIds: result.success ? params.entities.map(e => e.id) : []
    };
  } catch (error: any) {
    return {
      success: false,
      created: 0,
      errors: params.entities.map(e => ({ entity: e, error: error.message })),
      entityIds: []
    };
  }
}

/**
 * Tool: Create KG Relationship
 */
export async function createKGRelationshipTool(params: {
  projectRoot: string;
  sourceId: string;
  relationshipType: string;
  targetId: string;
  properties?: Record<string, any>;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(params.projectRoot);

    if (!kg) {
      return { success: false, error: 'KG not available for this project' };
    }

    await kg.createRelationship(params.sourceId, params.relationshipType, params.targetId, params.properties);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tool: Query KG Entities
 */
export async function queryKGTool(params: {
  projectRoot: string;
  query: {
    entityType?: string;
    properties?: Record<string, any>;
    ids?: string[];
  };
  limit?: number;
  offset?: number;
  orderBy?: string;
}): Promise<{
  success: boolean;
  entities: types.KGEntity[];
  count: number;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(params.projectRoot);

    if (!kg) {
      return { success: false, entities: [], count: 0, error: 'KG not available for this project' };
    }

    const { query } = params;

    if (query.ids && query.ids.length > 0) {
      const entities = await kg.readMany(query.ids);
      return { success: true, entities, count: entities.length };
    }

    const kgQuery: any = {
      entityType: query.entityType,
      properties: query.properties
    };

    const entities = await kg.find(kgQuery, { limit: params.limit, offset: params.offset, orderBy: params.orderBy });

    return { success: true, entities, count: entities.length };
  } catch (error: any) {
    return { success: false, entities: [], count: 0, error: error.message };
  }
}

/**
 * Tool: Get KG Entity by ID
 */
export async function getKGEntityTool(params: {
  projectRoot: string;
  entityId: string;
  entityType?: string;
}): Promise<{
  success: boolean;
  entity?: types.KGEntity;
  error?: string;
}> {
  try {
    const { getKGClient } = await import('../../utils/kg-utils.js');
    const kg = await getKGClient(params.projectRoot);

    if (!kg) {
      return { success: false, error: 'KG not available for this project' };
    }

    const entity = await kg.read(params.entityId, params.entityType);

    if (!entity) {
      return { success: false, error: `Entity '${params.entityId}' not found` };
    }

    return { success: true, entity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tool: Get Change Traceability
 */
export async function getChangeTraceabilityTool(params: {
  projectRoot: string;
  changeId: string;
}): Promise<{
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
    const kg = await getChangeKGClient(params.projectRoot, params.changeId);

    if (!kg) {
      return { success: false, error: 'KG not available or change not found' };
    }

    const traceability = await kg.getChangeTraceability(params.changeId);

    return { success: true, traceability };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tool: Persist KG State
 */
export async function persistKGTool(params: { projectRoot: string }): Promise<{
  success: boolean;
  kgPath?: string;
  error?: string;
}> {
  try {
    const { persistKGState } = await import('../../utils/kg-utils.js');
    // persistKGState falls back to the cached client for this project root.
    await persistKGState(params.projectRoot);

    return {
      success: true,
      kgPath: join(params.projectRoot, 'synergyspec', 'kg')
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tool: Validate Entity Against Schema
 */
export async function validateKGEntityTool(params: {
  entity: any;
  entityType: string;
}): Promise<{
  success: boolean;
  isValid: boolean;
  errors: Array<{ field?: string; message: string }>;
  warnings: Array<{ field?: string; message: string }>;
}> {
  try {
    const { KGSchemaValidator } = await import('./validator.js');
    const validator = new KGSchemaValidator();

    const result = validator.validateEntity(params.entity, params.entityType);

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
 */
export async function getKGSummaryTool(params: { projectRoot: string }): Promise<{
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
    const summary = await getKGSummary(params.projectRoot, '');

    if (!summary) {
      return {
        success: true,
        summary: { enabled: false, entities: 0, relationships: 0, coverage: 0 }
      };
    }

    return { success: true, summary };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
