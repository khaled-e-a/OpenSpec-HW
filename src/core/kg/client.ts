/**
 * Knowledge Graph Client Interface
 *
 * Abstract interface for interacting with the knowledge graph.
 * Implementations can use different backends (Neo4j, in-memory, etc.)
 */

import * as types from './types.js';

export interface KGClientConfig {
  type: 'memory' | 'neo4j' | 'file';
  connectionString?: string;
  options?: Record<string, any>;
}

export interface CreateOptions {
  validate?: boolean;
  cascade?: boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PathQueryOptions {
  maxDepth?: number;
  relationshipTypes?: string[];
  direction?: 'out' | 'in' | 'both';
}

export interface BulkOperationResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{ entity: any; error: string }>;
}

/**
 * Abstract KG Client Interface
 */
export abstract class KGClient {
  protected config: KGClientConfig;

  constructor(config: KGClientConfig) {
    this.config = config;
  }

  // Entity CRUD operations
  abstract create(entity: types.KGEntity, options?: CreateOptions): Promise<types.KGEntity>;
  abstract createMany(entities: types.KGEntity[], options?: CreateOptions): Promise<BulkOperationResult>;

  abstract read(id: string, type?: string): Promise<types.KGEntity | null>;
  abstract readMany(ids: string[]): Promise<types.KGEntity[]>;

  abstract update(id: string, updates: Partial<types.KGEntity>): Promise<types.KGEntity>;
  abstract updateMany(updates: Array<{ id: string; data: Partial<types.KGEntity> }>): Promise<BulkOperationResult>;

  abstract delete(id: string): Promise<boolean>;
  abstract deleteMany(ids: string[]): Promise<BulkOperationResult>;
  abstract deleteByQuery(query: any): Promise<number>;

  // Query operations
  abstract find(query: types.KGQuery, options?: QueryOptions): Promise<types.KGEntity[]>;
  abstract findOne(query: types.KGQuery): Promise<types.KGEntity | null>;
  abstract findByType(type: string, options?: QueryOptions): Promise<types.KGEntity[]>;
  abstract count(query: types.KGQuery): Promise<number>;

  // Relationship operations
  abstract createRelationship(
    sourceId: string,
    relationshipType: string,
    targetId: string,
    properties?: Record<string, any>
  ): Promise<void>;

  abstract getRelationships(
    entityId: string,
    direction?: 'in' | 'out' | 'both',
    relationshipTypes?: string[]
  ): Promise<Array<{
    id: string;
    type: string;
    target: types.KGEntity;
    properties?: Record<string, any>;
  }>>;

  abstract deleteRelationship(sourceId: string, relationshipType: string, targetId: string): Promise<void>;

  // Path and graph operations
  abstract findPath(
    startId: string,
    endId: string,
    options?: PathQueryOptions
  ): Promise<types.KGEntity[] | null>;

  abstract findAllPaths(
    startId: string,
    endId: string,
    options?: PathQueryOptions
  ): Promise<types.KGEntity[][]>;

  abstract getNeighbors(
    entityId: string,
    relationshipTypes?: string[],
    depth?: number
  ): Promise<types.KGEntity[]>;

  // Traceability operations
  abstract getTraceabilityMatrix(
    sourceType: string,
    targetType: string,
    viaRelationship: string
  ): Promise<Array<{
    source: types.KGEntity;
    target: types.KGEntity;
    path: types.KGEntity[];
  }>>;

  abstract getCoverageReport(useCaseId: string): Promise<{
    covered: types.KGEntity[];
    uncovered: types.KGEntity[];
    percentage: number;
  }>;

  abstract getImpactAnalysis(entityId: string, depth?: number): Promise<{
    upstream: types.KGEntity[];
    downstream: types.KGEntity[];
    impacted: types.KGEntity[];
  }>;

  // Change-specific operations
  abstract getChangeArtifacts(changeId: string): Promise<{
    proposal?: types.Artifact;
    useCases?: types.Artifact;
    specs?: types.Spec[];
    design?: types.Artifact;
    tasks?: types.Task[];
    tests?: types.TestCase[];
  }>;

  abstract getChangeTraceability(changeId: string): Promise<{
    useCaseSteps: types.UseCaseStep[];
    requirements: types.Requirement[];
    testCases: types.TestCase[];
    codeFiles: types.CodeFile[];
    coverage: number;
  }>;

  // Testing operations
  abstract getTestCoverage(entityId: string): Promise<{
    covered: boolean;
    testCases: types.TestCase[];
    coveragePercentage: number;
    gaps: types.CoverageGap[];
  }>;

  abstract getFailingTests(): Promise<types.TestCase[]>;

  abstract getTestResults(since?: Date): Promise<types.TestRun[]>;

  // Schema operations
  abstract validateEntity(entity: any, entityType: string): Promise<{
    isValid: boolean;
    errors: Array<{ field?: string; message: string }>;
    warnings: Array<{ field?: string; message: string }>;
  }>;

  abstract getSchema(): Promise<any>;

  abstract getTypes(): Promise<string[]>;

  // Utility operations
  abstract exists(id: string): Promise<boolean>;
  abstract clear(): Promise<void>;
  abstract export(format: 'json' | 'yaml' | 'csv'): Promise<string>;
  abstract import(data: string, format: 'json' | 'yaml' | 'csv'): Promise<BulkOperationResult>;

  // Transaction support
  abstract beginTransaction(): Promise<string>;
  abstract commitTransaction(txId: string): Promise<void>;
  abstract rollbackTransaction(txId: string): Promise<void>;
}

/**
 * In-memory implementation of KG Client
 * Suitable for CLI usage and testing
 */
export class InMemoryKGClient extends KGClient {
  private entities: Map<string, types.KGEntity> = new Map();
  private relationships: Map<string, Array<{
    sourceId: string;
    type: string;
    targetId: string;
    properties?: Record<string, any>;
  }>> = new Map();
  private transactions: Map<string, any> = new Map();

  async create(entity: types.KGEntity, options?: CreateOptions): Promise<types.KGEntity> {
    // Validate if requested
    if (options?.validate !== false) {
      // Would call validator here
    }

    this.entities.set(entity.id, entity);
    return entity;
  }

  async createMany(entities: types.KGEntity[], options?: CreateOptions): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    for (const entity of entities) {
      try {
        await this.create(entity, options);
        result.created++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          entity,
          error: error.message
        });
      }
    }

    return result;
  }

  async read(id: string, type?: string): Promise<types.KGEntity | null> {
    const entity = this.entities.get(id);
    if (!entity) return null;

    if (type && 'type' in entity && entity.type !== type) {
      return null;
    }

    return entity;
  }

  async readMany(ids: string[]): Promise<types.KGEntity[]> {
    return ids.map(id => this.entities.get(id)).filter(Boolean) as types.KGEntity[];
  }

  async update(id: string, updates: Partial<types.KGEntity>): Promise<types.KGEntity> {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Entity not found: ${id}`);
    }

    const updated = { ...entity, ...updates };
    this.entities.set(id, updated);
    return updated;
  }

  async find(query: types.KGQuery, options?: QueryOptions): Promise<types.KGEntity[]> {
    let results = Array.from(this.entities.values());

    // Filter by entity type
    if (query.entityType) {
      results = results.filter(e =>
        'type' in e ? e.type === query.entityType : false
      );
    }

    // Filter by properties
    if (query.properties) {
      results = results.filter(e => {
        for (const [key, value] of Object.entries(query.properties!)) {
          if ((e as any)[key] !== value) return false;
        }
        return true;
      });
    }

    // Apply options
    if (options?.limit) {
      results = results.slice(options.offset || 0, options.offset! + options.limit);
    }

    return results;
  }

  async createRelationship(
    sourceId: string,
    relationshipType: string,
    targetId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const relKey = `${sourceId}-${relationshipType}`;
    const relationships = this.relationships.get(relKey) || [];

    relationships.push({
      sourceId,
      type: relationshipType,
      targetId,
      properties
    });

    this.relationships.set(relKey, relationships);
  }

  async getRelationships(
    entityId: string,
    direction: 'in' | 'out' | 'both' = 'both',
    relationshipTypes?: string[]
  ): Promise<Array<any>> {
    const results: Array<any> = [];

    // Outgoing relationships
    if (direction === 'out' || direction === 'both') {
      for (const [key, rels] of this.relationships.entries()) {
        if (key.startsWith(entityId)) {
          for (const rel of rels) {
            if (!relationshipTypes || relationshipTypes.includes(rel.type)) {
              const target = this.entities.get(rel.targetId);
              if (target) {
                results.push({
                  id: `${rel.sourceId}-${rel.type}-${rel.targetId}`,
                  type: rel.type,
                  target,
                  properties: rel.properties
                });
              }
            }
          }
        }
      }
    }

    // Incoming relationships
    if (direction === 'in' || direction === 'both') {
      for (const [key, rels] of this.relationships.entries()) {
        for (const rel of rels) {
          if (rel.targetId === entityId) {
            if (!relationshipTypes || relationshipTypes.includes(rel.type)) {
              const source = this.entities.get(rel.sourceId);
              if (source) {
                results.push({
                  id: `${rel.sourceId}-${rel.type}-${rel.targetId}`,
                  type: rel.type,
                  target: source, // In this case, target is the source entity
                  properties: rel.properties
                });
              }
            }
          }
        }
      }
    }

    return results;
  }

  async getChangeArtifacts(changeId: string): Promise<any> {
    const artifacts = await this.find({ properties: { changeId } });

    const result: any = {
      specs: [],
      tasks: [],
      tests: []
    };

    for (const artifact of artifacts) {
      if ('capability' in artifact) {
        result.specs?.push(artifact);
      } else if ('taskNumber' in artifact) {
        result.tasks?.push(artifact);
      } else if ('framework' in artifact) {
        result.tests?.push(artifact);
      }
    }

    return result;
  }

  async getChangeTraceability(changeId: string): Promise<any> {
    // Get all entities for this change
    const useCaseSteps = await this.find({ entityType: 'UseCaseStep', properties: { changeId } });
    const requirements = await this.find({ entityType: 'Requirement', properties: { changeId } });
    const testCases = await this.find({ entityType: 'TestCase', properties: { changeId } });
    const codeFiles = await this.find({ entityType: 'CodeFile', properties: { changeId } });

    // Calculate coverage
    const totalRequirements = requirements.length;
    const testedRequirements = requirements.filter(r =>
      testCases.some(tc => tc.tests?.includes(r))
    ).length;
    const coverage = totalRequirements > 0 ? (testedRequirements / totalRequirements) * 100 : 0;

    return {
      useCaseSteps,
      requirements,
      testCases,
      codeFiles,
      coverage
    };
  }

  async validateEntity(entity: any, entityType: string): Promise<{
    isValid: boolean;
    errors: Array<{ field?: string; message: string }>;
    warnings: Array<{ field?: string; message: string }>;
  }> {
    // Basic validation for now
    // In real implementation, would use KGSchemaValidator
    const errors: Array<{ field?: string; message: string }> = [];
    const warnings: Array<{ field?: string; message: string }> = [];

    if (!entity.id) {
      errors.push({ message: 'Entity must have an id' });
    }

    if (!entityType) {
      errors.push({ message: 'Entity type is required' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async clear(): Promise<void> {
    this.entities.clear();
    this.relationships.clear();
  }

  async export(format: 'json' | 'yaml' | 'csv'): Promise<string> {
    const data = {
      entities: Array.from(this.entities.values()),
      relationships: Array.from(this.relationships.entries())
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // Add other format support as needed
    throw new Error(`Export format '${format}' not implemented`);
  }

  // Transaction support (simplified for in-memory)
  async beginTransaction(): Promise<string> {
    const txId = `tx_${Date.now()}`;
    const snapshot = {
      entities: new Map(this.entities),
      relationships: new Map(this.relationships)
    };
    this.transactions.set(txId, snapshot);
    return txId;
  }

  async commitTransaction(txId: string): Promise<void> {
    this.transactions.delete(txId);
  }

  async rollbackTransaction(txId: string): Promise<void> {
    const snapshot = this.transactions.get(txId);
    if (snapshot) {
      this.entities = snapshot.entities;
      this.relationships = snapshot.relationships;
      this.transactions.delete(txId);
    }
  }
}