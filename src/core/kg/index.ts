/**
 * SynergySpec Knowledge Graph Module
 *
 * Provides a knowledge graph for storing and querying SynergySpec artifacts
 * with full traceability support.
 */

export * from './types.js';
export * as types from './types.js';
export * from './client.js';
export * from './validator.js';
export * from './init.js';
export * from './tools.js';
export * from './tool-interface.js';
export * from './verify-utils.js';
export * from './content-parser.js';
export * from './implementation-utils.js';
export * from './blast-radius-utils.js';

// Import and re-export for convenience
import { InMemoryKGClient } from './client.js';
import { KGSchemaValidator } from './validator.js';
import { initializeKG, initializeChangeKG, saveKGState, loadKGState } from './init.js';
import {
  initKGTool,
  createKGEntityTool,
  createKGEntitiesTool,
  createKGRelationshipTool,
  queryKGTool,
  getKGEntityTool,
  getChangeTraceabilityTool,
  persistKGTool,
  validateKGEntityTool,
  getKGSummaryTool
} from './tools.js';

export const KG = {
  Client: InMemoryKGClient,
  Validator: KGSchemaValidator,
  createKGClient: (config: any) => new InMemoryKGClient(config),
  initializeKG,
  initializeChangeKG,
  saveKGState,
  loadKGState,
  // Tools
  Tools: {
    initKG: initKGTool,
    createEntity: createKGEntityTool,
    createEntities: createKGEntitiesTool,
    createRelationship: createKGRelationshipTool,
    query: queryKGTool,
    getEntity: getKGEntityTool,
    getChangeTraceability: getChangeTraceabilityTool,
    persist: persistKGTool,
    validateEntity: validateKGEntityTool,
    getSummary: getKGSummaryTool
  }
};

// Utility functions for common operations
export function createKGClient(config: any): InMemoryKGClient {
  return new InMemoryKGClient(config);
}

export function createKGValidator(): KGSchemaValidator {
  return new KGSchemaValidator();
}