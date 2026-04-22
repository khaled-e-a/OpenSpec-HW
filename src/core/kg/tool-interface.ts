/**
 * Knowledge Graph Tool Interface for AI Assistants
 *
 * Provides a clean interface for AI assistants to interact with KG
 * through deterministic tool calls
 */

import * as tools from './tools.js';
import * as types from './types.js';

/**
 * KG Tool Registry
 *
 * Maps tool names to their implementations with descriptions
 * for AI assistant consumption
 */
export const KG_TOOL_REGISTRY = {
  'kg:init': {
    description: 'Initialize knowledge graph for the project',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      type: {
        type: 'string',
        description: 'KG storage type',
        enum: ['memory', 'file'],
        default: 'file'
      },
      forceRecreate: {
        type: 'boolean',
        description: 'Force recreate KG if it exists',
        default: false
      },
      schema: {
        type: 'string',
        description: 'Default schema to use',
        default: 'spec-driven'
      }
    },
    returns: {
      success: 'boolean',
      clientId: 'string',
      kgPath: 'string (optional)',
      message: 'string'
    },
    implementation: tools.initKGTool
  },

  'kg:create-entity': {
    description: 'Create a single entity in the knowledge graph',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      entity: {
        type: 'object',
        description: 'Entity data to create',
        required: true
      },
      validate: {
        type: 'boolean',
        description: 'Validate entity against schema',
        default: true
      }
    },
    returns: {
      success: 'boolean',
      entityId: 'string',
      entity: 'object (optional)',
      error: 'string (optional)'
    },
    implementation: tools.createKGEntityTool
  },

  'kg:create-entities': {
    description: 'Create multiple entities in the knowledge graph',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      entities: {
        type: 'array',
        description: 'Array of entity data to create',
        required: true
      },
      validate: {
        type: 'boolean',
        description: 'Validate entities against schema',
        default: true
      }
    },
    returns: {
      success: 'boolean',
      created: 'number',
      errors: 'array',
      entityIds: 'array'
    },
    implementation: tools.createKGEntitiesTool
  },

  'kg:create-relationship': {
    description: 'Create a relationship between two entities',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      sourceId: {
        type: 'string',
        description: 'ID of the source entity',
        required: true
      },
      relationshipType: {
        type: 'string',
        description: 'Type of relationship',
        required: true
      },
      targetId: {
        type: 'string',
        description: 'ID of the target entity',
        required: true
      },
      properties: {
        type: 'object',
        description: 'Additional relationship properties',
        default: {}
      }
    },
    returns: {
      success: 'boolean',
      error: 'string (optional)'
    },
    implementation: tools.createKGRelationshipTool
  },

  'kg:query': {
    description: 'Query entities in the knowledge graph',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      query: {
        type: 'object',
        description: 'Query criteria',
        properties: {
          entityType: { type: 'string', description: 'Entity type to filter by' },
          properties: { type: 'object', description: 'Property filters' },
          ids: { type: 'array', description: 'Specific entity IDs to fetch' }
        }
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 100
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip',
        default: 0
      }
    },
    returns: {
      success: 'boolean',
      entities: 'array',
      count: 'number',
      error: 'string (optional)'
    },
    implementation: tools.queryKGTool
  },

  'kg:get-entity': {
    description: 'Get a single entity by ID',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      entityId: {
        type: 'string',
        description: 'ID of the entity to retrieve',
        required: true
      },
      entityType: {
        type: 'string',
        description: 'Expected type of the entity',
        optional: true
      }
    },
    returns: {
      success: 'boolean',
      entity: 'object (optional)',
      error: 'string (optional)'
    },
    implementation: tools.getKGEntityTool
  },

  'kg:get-change-traceability': {
    description: 'Get complete traceability information for a change',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      },
      changeId: {
        type: 'string',
        description: 'ID of the change',
        required: true
      }
    },
    returns: {
      success: 'boolean',
      traceability: {
        type: 'object',
        properties: {
          useCaseSteps: { type: 'array' },
          requirements: { type: 'array' },
          testCases: { type: 'array' },
          codeFiles: { type: 'array' },
          coverage: { type: 'number' }
        }
      },
      error: 'string (optional)'
    },
    implementation: tools.getChangeTraceabilityTool
  },

  'kg:persist': {
    description: 'Save KG state to persistent storage',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      }
    },
    returns: {
      success: 'boolean',
      kgPath: 'string (optional)',
      error: 'string (optional)'
    },
    implementation: tools.persistKGTool
  },

  'kg:validate-entity': {
    description: 'Validate an entity against the KG schema',
    parameters: {
      entity: {
        type: 'object',
        description: 'Entity to validate',
        required: true
      },
      entityType: {
        type: 'string',
        description: 'Type of entity to validate against',
        required: true
      }
    },
    returns: {
      success: 'boolean',
      isValid: 'boolean',
      errors: 'array',
      warnings: 'array'
    },
    implementation: tools.validateKGEntityTool
  },

  'kg:get-summary': {
    description: 'Get a summary of KG contents',
    parameters: {
      projectRoot: {
        type: 'string',
        description: 'Root directory of the project',
        required: true
      }
    },
    returns: {
      success: 'boolean',
      summary: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          entities: { type: 'number' },
          relationships: { type: 'number' },
          coverage: { type: 'number' }
        }
      },
      error: 'string (optional)'
    },
    implementation: tools.getKGSummaryTool
  }
};

/**
 * Execute a KG tool by name
 */
export async function executeKGTool(
  toolName: string,
  parameters: Record<string, any>
): Promise<any> {
  const tool = KG_TOOL_REGISTRY[toolName];
  if (!tool) {
    throw new Error(`Unknown KG tool: ${toolName}`);
  }

  // Validate required parameters
  for (const [paramName, paramDef] of Object.entries(tool.parameters)) {
    if (paramDef.required && !(paramName in parameters)) {
      throw new Error(`Missing required parameter: ${paramName}`);
    }
  }

  // Execute the tool
  return await tool.implementation(parameters);
}

/**
 * Get tool description for AI assistants
 */
export function getKGToolDescription(toolName: string): string | null {
  const tool = KG_TOOL_REGISTRY[toolName];
  if (!tool) return null;

  return `${tool.description}\n\nParameters:\n${Object.entries(tool.parameters)
    .map(([name, def]) => `  ${name}: ${def.type}${def.required ? ' (required)' : ' (optional)'} - ${def.description}`)
    .join('\n')}\n\nReturns:\n${JSON.stringify(tool.returns, null, 2)}`;
}

/**
 * Get all available KG tool names
 */
export function getKGToolNames(): string[] {
  return Object.keys(KG_TOOL_REGISTRY);
}

/**
 * Create a KG tool interface for a specific project
 */
export function createKGToolInterface(projectRoot: string) {
  return {
    /**
     * Execute a KG tool with project root pre-filled
     */
    async execute(toolName: string, parameters: Record<string, any> = {}): Promise<any> {
      return executeKGTool(toolName, {
        ...parameters,
        projectRoot
      });
    },

    /**
     * Create a change with full KG setup
     */
    async createChange(changeData: {
      id: string;
      name: string;
      schema: string;
      description?: string;
    }): Promise<{
      success: boolean;
      entities: types.KGEntity[];
      relationships: any[];
    }> {
      const results: types.KGEntity[] = [];
      const relationships: any[] = [];

      try {
        // 1. Create change entity
        const change: types.Change = {
          id: changeData.id,
          type: 'Change',
          name: changeData.name,
          schema: changeData.schema,
          status: 'proposed',
          createdDate: new Date(),
          description: changeData.description
        };

        const changeResult = await this.execute('kg:create-entity', {
          entity: change
        });

        if (!changeResult.success) {
          throw new Error(changeResult.error);
        }

        results.push(change);

        // 2. Create schema-specific artifacts
        const artifacts = await this.createChangeArtifacts(changeData);
        if (artifacts.length > 0) {
          const artifactsResult = await this.execute('kg:create-entities', {
            entities: artifacts
          });

          if (!artifactsResult.success) {
            throw new Error(artifactsResult.errors[0]?.error);
          }

          results.push(...artifacts);

          // 3. Create relationships
          for (const artifact of artifacts) {
            const relResult = await this.execute('kg:create-relationship', {
              sourceId: changeData.id,
              relationshipType: 'hasArtifact',
              targetId: artifact.id,
              properties: { role: artifact.type.toLowerCase() }
            });

            if (!relResult.success) {
              throw new Error(relResult.error);
            }

            relationships.push({
              sourceId: changeData.id,
              type: 'hasArtifact',
              targetId: artifact.id,
              properties: { role: artifact.type.toLowerCase() }
            });
          }
        }

        // 4. Persist the changes
        await this.execute('kg:persist', {});

        return {
          success: true,
          entities: results,
          relationships
        };
      } catch (error) {
        return {
          success: false,
          entities: results,
          relationships,
          error: error.message
        };
      }
    },

    /**
     * Create artifacts for a change based on schema
     */
    async createChangeArtifacts(changeData: {
      id: string;
      schema: string;
    }): Promise<types.Artifact[]> {
      const timestamp = new Date();
      const artifacts: types.Artifact[] = [];

      // Base artifacts
      artifacts.push(
        {
          id: `${changeData.id}-proposal`,
          type: 'DesignDoc',
          name: 'Proposal',
          status: 'active',
          filePath: `synergyspec/changes/${changeData.id}/proposal.md`,
          changeId: changeData.id,
          createdAt: timestamp,
          decisionsCount: 0,
          hasMigrationPlan: false
        },
        {
          id: `${changeData.id}-tasks`,
          type: 'Artifact',
          name: 'Tasks',
          status: 'active',
          filePath: `synergyspec/changes/${changeData.id}/tasks.md`,
          changeId: changeData.id,
          createdAt: timestamp
        }
      );

      // Schema-specific artifacts
      switch (changeData.schema) {
        case 'spec-driven':
          artifacts.push(
            {
              id: `${changeData.id}-usecases`,
              type: 'Artifact',
              name: 'Use Cases',
              status: 'active',
              filePath: `synergyspec/changes/${changeData.id}/usecases.md`,
              changeId: changeData.id,
              createdAt: timestamp
            },
            {
              id: `${changeData.id}-specs`,
              type: 'Spec',
              name: 'Specifications',
              status: 'active',
              filePath: `synergyspec/changes/${changeData.id}/specs/`,
              changeId: changeData.id,
              createdAt: timestamp,
              capability: 'change-specs',
              specType: 'new',
              requirementsCount: 0
            },
            {
              id: `${changeData.id}-design`,
              type: 'DesignDoc',
              name: 'Design',
              status: 'active',
              filePath: `synergyspec/changes/${changeData.id}/design.md`,
              changeId: changeData.id,
              createdAt: timestamp,
              decisionsCount: 0,
              hasMigrationPlan: false
            }
          );
          break;
      }

      return artifacts;
    },

    /**
     * Get traceability for a change
     */
    async getChangeTraceability(changeId: string): Promise<{
      useCaseSteps: types.UseCaseStep[];
      requirements: types.Requirement[];
      testCases: types.TestCase[];
      codeFiles: types.CodeFile[];
      coverage: number;
    }> {
      const result = await this.execute('kg:get-change-traceability', { changeId });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.traceability;
    }
  };
}