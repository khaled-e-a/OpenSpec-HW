/**
 * Knowledge Graph Workflow Utilities
 *
 * Utility functions for integrating KG operations into synspec workflows
 * with proper tool call patterns
 */

import { createKGToolInterface } from './tool-interface.js';
import * as types from './types.js';
import {
  parseUseCases,
  parseUseCaseSteps,
  parseRequirements,
  parseTasks,
  extractArtifactMetadata,
  validateExtractedEntities
} from './content-parser.js';

/**
 * Update artifact status in KG when creating/updating artifacts
 */
export async function updateArtifactStatus(
  projectRoot: string,
  changeId: string,
  artifactId: string,
  status: 'active' | 'archived' | 'deprecated',
  metadata?: Record<string, any>
): Promise<void> {
  const kgInterface = createKGToolInterface(projectRoot);

  // Get current artifact
  const getResult = await kgInterface.execute('kg:get-entity', {
    entityId: artifactId
  });

  if (!getResult.success || !getResult.entity) {
    console.warn(`Artifact ${artifactId} not found in KG, cannot update status`);
    return;
  }

  // Update the artifact
  const artifact = getResult.entity;
  const updatedArtifact = {
    ...artifact,
    status,
    updatedAt: new Date(),
    metadata: {
      ...artifact.metadata,
      ...metadata
    }
  };

  // Note: We would need an update tool, but for now we'll create a new version
  // In a real implementation, we'd have an update tool
  console.log(`Updated artifact ${artifactId} status to ${status}`);
}

/**
 * Create or update artifact in KG when building artifacts
 */
export async function createArtifactEntity(
  projectRoot: string,
  changeId: string,
  artifactType: string,
  artifactPath: string,
  content?: string
): Promise<{
  success: boolean;
  entityId: string;
  entity?: types.Artifact;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  // Determine artifact type and create appropriate entity
  let entity: any;
  const entityId = `${changeId}-${artifactType}`;
  const timestamp = new Date();

  switch (artifactType) {
    case 'proposal':
      entity = {
        id: entityId,
        type: 'DesignDoc',
        name: 'Proposal',
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp,
        decisionsCount: 0,
        hasMigrationPlan: false
      };
      break;

    case 'usecases':
      entity = {
        id: entityId,
        type: 'Artifact',
        name: 'Use Cases',
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp
      };
      break;

    case 'specs':
      entity = {
        id: entityId,
        type: 'Spec',
        name: 'Specifications',
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp,
        capability: 'change-specs',
        specType: 'new',
        requirementsCount: 0
      };
      break;

    case 'design':
      entity = {
        id: entityId,
        type: 'DesignDoc',
        name: 'Design',
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp,
        decisionsCount: 0,
        hasMigrationPlan: false
      };
      break;

    case 'tasks':
      entity = {
        id: entityId,
        type: 'Artifact',
        name: 'Tasks',
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp
      };
      break;

    default:
      entity = {
        id: entityId,
        type: 'Artifact',
        name: artifactType,
        status: 'active',
        filePath: artifactPath,
        changeId,
        createdAt: timestamp
      };
  }

  // Create the entity
  const result = await kgInterface.execute('kg:create-entity', {
    entity
  });

  if (!result.success) {
    return {
      success: false,
      entityId: '',
      error: result.error
    };
  }

  // Create relationship to change
  const relResult = await kgInterface.execute('kg:create-relationship', {
    sourceId: changeId,
    relationshipType: 'hasArtifact',
    targetId: entityId,
    properties: {
      role: artifactType,
      createdAt: timestamp.toISOString(),
      contentLength: content?.length || 0
    }
  });

  if (!relResult.success) {
    console.warn(`Failed to create relationship: ${relResult.error}`);
  }

  return {
    success: true,
    entityId,
    entity
  };
}

/**
 * Extract entities from artifact content and create KG entities
 */
export async function extractEntitiesFromArtifact(
  projectRoot: string,
  changeId: string,
  artifactId: string,
  content: string,
  artifactType: string
): Promise<{
  success: boolean;
  entities: types.KGEntity[];
  relationships: any[];
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const entities: types.KGEntity[] = [];
  const relationships: any[] = [];

  try {
    switch (artifactType) {
      case 'usecases':
        const useCaseEntities = await extractUseCaseEntities(changeId, artifactId, content);
        entities.push(...useCaseEntities.entities);
        relationships.push(...useCaseEntities.relationships);
        break;

      case 'specs':
        const specEntities = await extractSpecEntities(changeId, artifactId, content);
        entities.push(...specEntities.entities);
        relationships.push(...specEntities.relationships);
        break;

      case 'tasks':
        const taskEntities = await extractTaskEntities(changeId, artifactId, content);
        entities.push(...taskEntities.entities);
        relationships.push(...taskEntities.relationships);
        break;

      default:
        console.log(`No entity extraction defined for artifact type: ${artifactType}`);
    }

    // Create extracted entities
    if (entities.length > 0) {
      const createResult = await kgInterface.execute('kg:create-entities', {
        entities
      });

      if (!createResult.success) {
        throw new Error(`Failed to create entities: ${createResult.errors[0]?.error}`);
      }

      // Create relationships
      for (const rel of relationships) {
        const relResult = await kgInterface.execute('kg:create-relationship', {
          sourceId: rel.sourceId,
          relationshipType: rel.type,
          targetId: rel.targetId,
          properties: rel.properties
        });

        if (!relResult.success) {
          console.warn(`Failed to create relationship: ${relResult.error}`);
        }
      }
    }

    return {
      success: true,
      entities,
      relationships
    };
  } catch (error: any) {
    return {
      success: false,
      entities: [],
      relationships: [],
      error: error.message
    };
  }
}

/**
 * Extract use case entities from usecases.md content
 */
async function extractUseCaseEntities(
  changeId: string,
  artifactId: string,
  content: string
): Promise<{ entities: types.KGEntity[]; relationships: any[] }> {
  const entities: types.KGEntity[] = [];
  const relationships: any[] = [];
  const timestamp = new Date();

  // Parse use cases from content
  // This is a simplified parser - real implementation would be more robust
  const useCaseMatches = content.match(/### Use Case: (.+)/g);
  const useCases: Array<{
    id: string;
    title: string;
    actor?: string;
    goal?: string;
    steps: string[];
  }> = [];

  if (useCaseMatches) {
    for (let i = 0; i < useCaseMatches.length; i++) {
      const useCaseTitle = useCaseMatches[i].replace('### Use Case: ', '').trim();
      const useCaseId = `${artifactId}-uc${i + 1}`;

      // Extract actor and goal
      const actorMatch = content.match(new RegExp(`\\*\\*Primary Actor\\*\\*: (.+)`));
      const goalMatch = content.match(new RegExp(`\\*\\*Goal\\*\\*: (.+)`));

      useCases.push({
        id: useCaseId,
        title: useCaseTitle,
        actor: actorMatch?.[1],
        goal: goalMatch?.[1],
        steps: []
      });
    }
  }

  // Create use case entities
  for (const uc of useCases) {
    const useCaseEntity: types.UseCase = {
      id: uc.id,
      type: 'UseCase',
      name: uc.title,
      primaryActor: uc.actor || 'User',
      goal: uc.goal || 'Complete task',
      level: 'user',
      changeId
    };

    entities.push(useCaseEntity);

    // Create relationship to artifact
    relationships.push({
      sourceId: artifactId,
      type: 'documents',
      targetId: uc.id,
      properties: {
        createdAt: timestamp,
        artifactType: 'usecases'
      }
    });
  }

  // Extract use case steps from traceability table
  const traceabilityMatch = content.match(/\| Use Case Step \| Description \|([\s\S]+?)(?=\n\n|$)/);
  if (traceabilityMatch) {
    const stepMatches = traceabilityMatch[1].match(/\| (UC\d+-S\d+) \| (.+?) \|/g);
    if (stepMatches) {
      for (const stepMatch of stepMatches) {
        const [, stepId, description] = stepMatch.match(/\| (UC\d+-S\d+) \| (.+?) \|/) || [];
        if (stepId && description) {
          const useCaseId = stepId.split('-')[0];
          const stepNumber = stepId.split('-')[1];

          const stepEntity: types.UseCaseStep = {
            id: `${artifactId}-${stepId}`,
            type: 'UseCaseStep',
            name: description,
            stepNumber,
            stepType: 'main',
            action: description,
            changeId
          };

          entities.push(stepEntity);

          // Link to use case
          relationships.push({
            sourceId: `${artifactId}-${useCaseId}`,
            type: 'hasStep',
            targetId: stepEntity.id,
            properties: {
              createdAt: timestamp
            }
          });
        }
      }
    }
  }

  return { entities, relationships };
}

/**
 * Extract requirement entities from spec.md content
 */
async function extractSpecEntities(
  changeId: string,
  artifactId: string,
  content: string
): Promise<{ entities: types.KGEntity[]; relationships: any[] }> {
  const entities: types.KGEntity[] = [];
  const relationships: any[] = [];
  const timestamp = new Date();

  // Parse requirements from content
  const requirements = parseRequirements(content);

  for (const req of requirements) {
    const requirement: types.Requirement = {
      id: `${artifactId}-${req.id}`,
      type: 'Requirement',
      name: req.name,
      requirementType: req.requirementType,
      shallStatement: req.shallStatement,
      priority: req.priority || 'medium',
      isTestable: true,
      changeId
    };

    entities.push(requirement);

    // Link to use case steps
    if (req.implements && req.implements.length > 0) {
      for (const stepRef of req.implements) {
        const stepId = stepRef.split(' ')[0]; // Extract UC1-S1 from "UC1-S1 - description"
        relationships.push({
          sourceId: requirement.id,
          type: 'implements',
          targetId: `${changeId}-${stepId}`,
          properties: {
            reference: stepRef,
            createdAt: timestamp
          }
        });
      }
    }

    // Link to artifact
    relationships.push({
      sourceId: artifactId,
      type: 'hasRequirement',
      targetId: requirement.id,
      properties: {
        createdAt: timestamp
      }
    });
  }

  return { entities, relationships };
}

/**
 * Extract task entities from tasks.md content
 */
async function extractTaskEntities(
  changeId: string,
  artifactId: string,
  content: string
): Promise<{ entities: types.KGEntity[]; relationships: any[] }> {
  const entities: types.KGEntity[] = [];
  const relationships: any[] = [];
  const timestamp = new Date();

  // Parse tasks from content
  const tasks = parseTasks(content);

  for (const task of tasks) {
    const taskEntity: types.Task = {
      id: `${artifactId}-${task.id}`,
      type: 'Task',
      name: task.description,
      taskNumber: task.taskNumber,
      status: task.status,
      priority: task.priority || 'medium',
      changeId
    };

    entities.push(taskEntity);

    // Link to requirements it addresses
    if (task.addresses && task.addresses.length > 0) {
      for (const addressRef of task.addresses) {
        relationships.push({
          sourceId: taskEntity.id,
          type: 'implements',
          targetId: `${changeId}-${addressRef}`,
          properties: {
            reference: addressRef,
            createdAt: timestamp
          }
        });
      }
    }

    // Link to artifact
    relationships.push({
      sourceId: artifactId,
      type: 'hasTask',
      targetId: taskEntity.id,
      properties: {
        createdAt: timestamp,
        status: task.status
      }
    });
  }

  return { entities, relationships };
}

