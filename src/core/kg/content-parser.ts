/**
 * Content Parser for KG Entity Extraction
 *
 * Parses artifact content to extract structured entities
 * for knowledge graph population
 */

import * as types from './types.js';

/**
 * Parse use cases from usecases.md content
 */
export function parseUseCases(content: string): Array<{
  id: string;
  title: string;
  actor?: string;
  goal?: string;
  level?: string;
}> {
  const useCases: Array<{
    id: string;
    title: string;
    actor?: string;
    goal?: string;
    level?: string;
  }> = [];

  // Find use case sections
  const useCaseRegex = /### Use Case: (.+)/g;
  let match;
  let useCaseIndex = 1;

  while ((match = useCaseRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const useCaseId = `uc${useCaseIndex}`;

    // Extract actor and goal from the section
    const sectionStart = match.index;
    const nextSection = content.indexOf('###', sectionStart + 1);
    const sectionEnd = nextSection > 0 ? nextSection : content.length;
    const sectionContent = content.substring(sectionStart, sectionEnd);

    // Extract actor
    const actorMatch = sectionContent.match(/\*\*Primary Actor\*\*: (.+)/);
    const actor = actorMatch ? actorMatch[1].trim() : undefined;

    // Extract goal
    const goalMatch = sectionContent.match(/\*\*Goal\*\*: (.+)/);
    const goal = goalMatch ? goalMatch[1].trim() : undefined;

    // Extract level
    const levelMatch = sectionContent.match(/level: (summary|user|subfunction)/i);
    const level = levelMatch ? levelMatch[1].toLowerCase() as 'summary' | 'user' | 'subfunction' : 'user';

    useCases.push({
      id: useCaseId,
      title,
      actor,
      goal,
      level
    });

    useCaseIndex++;
  }

  return useCases;
}

/**
 * Parse use case steps from usecases.md content
 */
export function parseUseCaseSteps(content: string): Array<{
  id: string;
  useCaseId: string;
  number: string;
  description: string;
  type: 'main' | 'extension';
}> {
  const steps: Array<{
    id: string;
    useCaseId: string;
    number: string;
    description: string;
    type: 'main' | 'extension';
  }> = [];

  // Find traceability table
  const tableMatch = content.match(/\| Use Case Step \| Description \|([\s\S]+?)(?=\n\n|$)/);
  if (!tableMatch) {
    return steps;
  }

  const tableContent = tableMatch[1];
  const rowMatches = tableContent.match(/\| (UC\d+-[SE]\d+[a-z]?) \| (.+?) \|/g);

  if (rowMatches) {
    for (const row of rowMatches) {
      const [, stepId, description] = row.match(/\| (UC\d+-[SE]\d+[a-z]?) \| (.+?) \|/) || [];

      if (stepId && description) {
        const useCaseId = stepId.split('-')[0];
        const stepNumber = stepId.split('-')[1];
        const isExtension = stepNumber.startsWith('E');

        steps.push({
          id: stepId,
          useCaseId,
          number: stepNumber,
          description: description.trim(),
          type: isExtension ? 'extension' : 'main'
        });
      }
    }
  }

  return steps;
}

/**
 * Parse requirements from spec.md content
 */
export function parseRequirements(content: string): Array<{
  id: string;
  name: string;
  shallStatement: string;
  requirementType: 'added' | 'modified' | 'removed' | 'renamed';
  priority?: 'high' | 'medium' | 'low';
  implements?: string[];
}> {
  const requirements: Array<{
    id: string;
    name: string;
    shallStatement: string;
    requirementType: 'added' | 'modified' | 'removed' | 'renamed';
    priority?: 'high' | 'medium' | 'low';
    implements?: string[];
  }> = [];

  // Find requirement sections
  const reqRegex = /### Requirement: (.+)/g;
  let match;
  let reqIndex = 1;

  while ((match = reqRegex.exec(content)) !== null) {
    const name = match[1].trim();
    const reqId = `req${reqIndex}`;

    // Find the section content
    const sectionStart = match.index;
    const nextReq = content.indexOf('### Requirement:', sectionStart + 1);
    const nextSection = content.indexOf('##', sectionStart + 1);
    const sectionEnd = Math.min(
      nextReq > 0 ? nextReq : content.length,
      nextSection > 0 ? nextSection : content.length
    );
    const sectionContent = content.substring(sectionStart, sectionEnd);

    // Extract shall statement
    const shallMatch = sectionContent.match(/The system SHALL (.+)/i);
    const shallStatement = shallMatch
      ? `The system SHALL ${shallMatch[1].trim()}`
      : `The system SHALL ${name.toLowerCase()}`;

    // Extract implements references
    const implementsMatch = sectionContent.match(/\*\*Implements\*\*: (.+)/);
    const implements = implementsMatch
      ? implementsMatch[1].split(';').map(s => s.trim().split(' ')[0])
      : [];

    // Extract requirement type from section header
    const sectionMatch = content.substring(0, sectionStart).match(/## (ADDED|MODIFIED|REMOVED|RENAMED) Requirements/);
    const requirementType = sectionMatch
      ? sectionMatch[1].toLowerCase() as 'added' | 'modified' | 'removed' | 'renamed'
      : 'added' as const;

    // Extract priority
    const priorityMatch = sectionContent.match(/priority: (high|medium|low)/i);
    const priority = priorityMatch
      ? priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low'
      : 'medium';

    requirements.push({
      id: reqId,
      name,
      shallStatement,
      requirementType,
      priority,
      implements: implements.length > 0 ? implements : undefined
    });

    reqIndex++;
  }

  return requirements;
}

/**
 * Parse tasks from tasks.md content
 */
export function parseTasks(content: string): Array<{
  id: string;
  taskNumber: string;
  description: string;
  status: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  addresses?: string[];
}> {
  const tasks: Array<{
    id: string;
    taskNumber: string;
    description: string;
    status: 'pending' | 'completed';
    priority?: 'high' | 'medium' | 'low';
    addresses?: string[];
  }> = [];

  // Find task lines
  const taskRegex = /^\s*- \[([ x])\] (\d+\.\d+) (.+)$/gm;
  let match;
  let taskIndex = 1;

  while ((match = taskRegex.exec(content)) !== null) {
    const isCompleted = match[1] === 'x';
    const taskNumber = match[2];
    const description = match[3].trim();

    // Extract addresses references
    const addressesMatch = description.match(/\(Addresses: (.+)\)/);
    const addresses = addressesMatch
      ? addressesMatch[1].split(',').map(s => s.trim())
      : [];

    // Extract priority from description
    const priorityMatch = description.match(/\[Priority: (High|Medium|Low)\]/i);
    const priority = priorityMatch
      ? priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low'
      : 'medium';

    tasks.push({
      id: `task${taskIndex}`,
      taskNumber,
      description: description.replace(/\s*\(Addresses: .+\)/, '').replace(/\s*\[Priority: .+\]/, '').trim(),
      status: isCompleted ? 'completed' : 'pending',
      priority,
      addresses: addresses.length > 0 ? addresses : undefined
    });

    taskIndex++;
  }

  return tasks;
}

/**
 * Extract metadata from artifact content
 */
export function extractArtifactMetadata(
  content: string,
  artifactType: string
): Record<string, any> {
  const metadata: Record<string, any> = {
    wordCount: content.split(/\s+/).length,
    lineCount: content.split('\n').length,
    hasTraceabilityTable: content.includes('| Use Case Step | Description |'),
    hasImplementationMapping: content.includes('**Implements**:'),
    extractionDate: new Date().toISOString()
  };

  switch (artifactType) {
    case 'usecases':
      metadata.useCaseCount = (content.match(/### Use Case:/g) || []).length;
      metadata.stepCount = (content.match(/UC\d+-S\d+/g) || []).length;
      metadata.hasActorGoals = content.includes('**Primary Actor**') && content.includes('**Goal**');
      break;

    case 'specs':
      metadata.requirementCount = (content.match(/### Requirement:/g) || []).length;
      metadata.scenarioCount = (content.match(/#### Scenario:/g) || []).length;
      metadata.hasShallStatements = content.includes('SHALL');
      break;

    case 'design':
      metadata.decisionCount = (content.match(/^### Decision \d+:/gm) || []).length;
      metadata.hasMigrationPlan = content.includes('## Migration Plan');
      metadata.riskCount = (content.match(/^### Risk \d+:/gm) || []).length;
      break;

    case 'tasks':
      metadata.taskCount = (content.match(/^- \[ \]/gm) || []).length + (content.match(/^- \[x\]/gm) || []).length;
      metadata.completedTaskCount = (content.match(/^- \[x\]/gm) || []).length;
      metadata.completionPercentage = Math.round((metadata.completedTaskCount / metadata.taskCount) * 100);
      break;
  }

  return metadata;
}

/**
 * Validate extracted entities
 */
export function validateExtractedEntities(
  entities: any[],
  artifactType: string
): {
  valid: any[];
  invalid: any[];
  errors: string[];
} {
  const valid: any[] = [];
  const invalid: any[] = [];
  const errors: string[] = [];

  for (const entity of entities) {
    const validationErrors: string[] = [];

    // Common validations
    if (!entity.id) {
      validationErrors.push('Missing entity ID');
    }
    if (!entity.type) {
      validationErrors.push('Missing entity type');
    }
    if (!entity.name) {
      validationErrors.push('Missing entity name');
    }

    // Type-specific validations
    switch (entity.type) {
      case 'UseCase':
        if (!entity.primaryActor) {
          validationErrors.push('UseCase missing primaryActor');
        }
        if (!entity.goal) {
          validationErrors.push('UseCase missing goal');
        }
        break;

      case 'UseCaseStep':
        if (!entity.stepNumber) {
          validationErrors.push('UseCaseStep missing stepNumber');
        }
        if (!entity.action) {
          validationErrors.push('UseCaseStep missing action');
        }
        break;

      case 'Requirement':
        if (!entity.shallStatement) {
          validationErrors.push('Requirement missing shallStatement');
        }
        if (!['added', 'modified', 'removed', 'renamed'].includes(entity.requirementType)) {
          validationErrors.push('Requirement has invalid requirementType');
        }
        break;

      case 'Task':
        if (!entity.taskNumber) {
          validationErrors.push('Task missing taskNumber');
        }
        if (!['pending', 'completed'].includes(entity.status)) {
          validationErrors.push('Task has invalid status');
        }
        break;
    }

    if (validationErrors.length === 0) {
      valid.push(entity);
    } else {
      invalid.push(entity);
      errors.push(`Entity ${entity.id || 'unknown'}: ${validationErrors.join(', ')}`);
    }
  }

  return { valid, invalid, errors };
}