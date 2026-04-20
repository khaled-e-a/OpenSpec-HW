/**
 * SynergySpec Knowledge Graph Module
 *
 * Provides a knowledge graph for storing and querying SynergySpec artifacts
 * with full traceability support.
 */

export * from './types.js';
export * from './client.js';
export * from './validator.js';

// Import and re-export for convenience
import { InMemoryKGClient } from './client.js';
import { KGSchemaValidator } from './validator.js';

export const KG = {
  Client: InMemoryKGClient,
  Validator: KGSchemaValidator
};

// Utility functions for common operations
export function createKGClient(config: any): InMemoryKGClient {
  return new InMemoryKGClient(config);
}

export function createKGValidator(): KGSchemaValidator {
  return new KGSchemaValidator();
}