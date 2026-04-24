/**
 * Knowledge Graph Implementation Utilities
 *
 * Helper functions for tracking implementation progress in KG
 * during TDD and apply workflows
 */

import { createKGToolInterface } from './tool-interface.js';
import * as types from './types.js';

/**
 * Track implementation start for a task
 */
export async function trackImplementationStart(
  projectRoot: string,
  changeId: string,
  taskId: string,
  implementationMethod: 'tdd' | 'direct' | 'refactor'
): Promise<{
  success: boolean;
  taskUpdate?: any;
  implementationId?: string;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    // Update task status to in_progress
    const taskUpdate = await kgInterface.execute('kg:update', {
      id: taskId,
      updates: {
        status: 'in_progress',
        startedAt: new Date(),
        implementationMethod: implementationMethod
      }
    });

    if (!taskUpdate.success) {
      return {
        success: false,
        error: `Failed to update task status: ${taskUpdate.error}`
      };
    }

    // Create implementation event
    const implementationId = `impl-${changeId}-${taskId}-${Date.now()}`;
    const implementationEvent: types.Event = {
      id: implementationId,
      type: 'implementation',
      timestamp: new Date(),
      outcome: 'pending',
      metadata: {
        taskId: taskId,
        changeId: changeId,
        implementationMethod: implementationMethod,
        startedAt: new Date()
      }
    };

    const eventResult = await kgInterface.execute('kg:create-entity', {
      entity: implementationEvent
    });

    if (!eventResult.success) {
      console.warn('Failed to create implementation event:', eventResult.error);
    }

    return {
      success: true,
      taskUpdate,
      implementationId
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Track implementation completion for a task
 */
export async function trackImplementationComplete(
  projectRoot: string,
  changeId: string,
  taskId: string,
  implementationId: string,
  metrics: {
    duration?: number;
    filesModified?: number;
    linesAdded?: number;
    linesRemoved?: number;
    complexity?: number;
  }
): Promise<{
  success: boolean;
  taskUpdate?: any;
  eventUpdate?: any;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    // Update task status to completed
    const taskUpdate = await kgInterface.execute('kg:update', {
      id: taskId,
      updates: {
        status: 'completed',
        completedAt: new Date(),
        actualEffort: metrics.duration ? Math.round(metrics.duration / 3600000 * 10) / 10 : undefined, // Convert ms to hours
        ...metrics
      }
    });

    if (!taskUpdate.success) {
      return {
        success: false,
        error: `Failed to update task status: ${taskUpdate.error}`
      };
    }

    // Update implementation event
    const eventUpdate = await kgInterface.execute('kg:update', {
      id: implementationId,
      updates: {
        outcome: 'success',
        duration: metrics.duration,
        metadata: {
          ...metrics,
          completedAt: new Date()
        }
      }
    });

    if (!eventUpdate.success) {
      console.warn('Failed to update implementation event:', eventUpdate.error);
    }

    return {
      success: true,
      taskUpdate,
      eventUpdate
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create or update code entity in KG
 */
export async function createOrUpdateCodeEntity(
  projectRoot: string,
  changeId: string,
  taskId: string,
  filePath: string,
  content: string,
  options?: {
    status?: 'active' | 'in_progress' | 'deprecated';
    implementationMethod?: 'tdd' | 'direct' | 'refactor';
    testCoverage?: number;
  }
): Promise<{
  success: boolean;
  entityId: string;
  entity?: types.CodeFile;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    const entityId = `${changeId}-code-${taskId}`;
    const timestamp = new Date();

    // Try to get existing entity first
    const existing = await kgInterface.execute('kg:get-entity', {
      entityId
    });

    const codeEntity: types.CodeFile = {
      id: entityId,
      type: 'CodeFile',
      name: `Implementation for task ${taskId}`,
      status: (options?.status === 'in_progress' ? 'active' : options?.status) || 'active',
      filePath: filePath,
      changeId: changeId,
      createdAt: existing.success ? existing.entity.createdAt : timestamp,
      updatedAt: timestamp,
      language: detectLanguage(filePath),
      complexity: calculateComplexity(content),
      linesOfCode: content.split('\n').length,
      testCoverage: options?.testCoverage,
    } as types.CodeFile;

    if (existing.success) {
      // Update existing entity
      const result = await kgInterface.execute('kg:update', {
        id: entityId,
        updates: codeEntity
      });

      if (!result.success) {
        return {
          success: false,
          entityId: '',
          error: `Failed to update code entity: ${result.error}`
        };
      }

      return {
        success: true,
        entityId,
        entity: codeEntity
      };
    } else {
      // Create new entity
      const result = await kgInterface.execute('kg:create-entity', {
        entity: codeEntity
      });

      if (!result.success) {
        return {
          success: false,
          entityId: '',
          error: `Failed to create code entity: ${result.error}`
        };
      }

      return {
        success: true,
        entityId: result.entityId,
        entity: codeEntity
      };
    }

  } catch (error: any) {
    return {
      success: false,
      entityId: '',
      error: error.message
    };
  }
}

/**
 * Create test entity in KG
 */
export async function createTestEntity(
  projectRoot: string,
  changeId: string,
  taskId: string,
  testInfo: {
    name: string;
    filePath: string;
    framework: string;
    testType: 'unit' | 'component' | 'integration' | 'e2e';
    isFailing?: boolean;
    assertions?: number;
  },
  requirementsTested?: string[]
): Promise<{
  success: boolean;
  entityId: string;
  entity?: types.TestCase;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    const entityId = `${changeId}-test-${taskId}-${Date.now()}`;
    const timestamp = new Date();

    const testEntity: types.TestCase = {
      id: entityId,
      type: 'TestCase',
      name: testInfo.name,
      framework: testInfo.framework,
      testType: testInfo.testType,
      isFailing: testInfo.isFailing || false,
      assertionsCount: testInfo.assertions,
      filePath: testInfo.filePath,
      changeId: changeId,
      createdAt: timestamp,
      status: 'active'
    };

    const result = await kgInterface.execute('kg:create-entity', {
      entity: testEntity
    });

    if (!result.success) {
      return {
        success: false,
        entityId: '',
        error: `Failed to create test entity: ${result.error}`
      };
    }

    // Link test to requirements
    if (requirementsTested && requirementsTested.length > 0) {
      for (const reqId of requirementsTested) {
        const relResult = await kgInterface.execute('kg:create-relationship', {
          sourceId: result.entityId,
          relationshipType: 'tests',
          targetId: `${changeId}-${reqId}`,
          properties: {
            testType: testInfo.testType,
            coversTask: true,
            createdAt: timestamp
          }
        });

        if (!relResult.success) {
          console.warn(`Failed to link test to requirement ${reqId}:`, relResult.error);
        }
      }
    }

    return {
      success: true,
      entityId: result.entityId,
      entity: testEntity
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
 * Track TDD cycle in KG
 */
export async function trackTDDCycle(
  projectRoot: string,
  changeId: string,
  taskId: string,
  cycle: 'red' | 'green' | 'refactor',
  metrics: {
    duration?: number;
    testCount?: number;
    codeLines?: number;
    filesModified?: number;
  }
): Promise<{
  success: boolean;
  eventId: string;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    const eventId = `tdd-${changeId}-${taskId}-${cycle}-${Date.now()}`;
    const timestamp = new Date();

    const tddEvent: types.Event = {
      id: eventId,
      type: 'tdd_cycle',
      timestamp: timestamp,
      outcome: 'success',
      duration: metrics.duration,
      metadata: {
        cycle: cycle,
        taskId: taskId,
        changeId: changeId,
        testCount: metrics.testCount,
        codeLines: metrics.codeLines,
        filesModified: metrics.filesModified,
        completedAt: timestamp
      }
    };

    const result = await kgInterface.execute('kg:create-entity', {
      entity: tddEvent
    });

    if (!result.success) {
      return {
        success: false,
        eventId: '',
        error: `Failed to create TDD event: ${result.error}`
      };
    }

    return {
      success: true,
      eventId: result.entityId
    };

  } catch (error: any) {
    return {
      success: false,
      eventId: '',
      error: error.message
    };
  }
}

/**
 * Update change progress in KG
 */
export async function updateChangeProgress(
  projectRoot: string,
  changeId: string,
  progress: {
    completedTasks?: number;
    totalTasks?: number;
    requirementsImplemented?: number;
    totalRequirements?: number;
    codeFilesCreated?: number;
    testFilesCreated?: number;
    status?: 'in_progress' | 'completed' | 'archived';
  }
): Promise<{
  success: boolean;
  update?: any;
  error?: string;
}> {
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    const updates: any = {
      updatedAt: new Date()
    };

    if (progress.completedTasks !== undefined && progress.totalTasks !== undefined) {
      updates.progressPercentage = Math.round((progress.completedTasks / progress.totalTasks) * 100);
      updates.completedTasks = progress.completedTasks;
      updates.totalTasks = progress.totalTasks;
    }

    if (progress.requirementsImplemented !== undefined && progress.totalRequirements !== undefined) {
      updates.requirementsCoverage = Math.round((progress.requirementsImplemented / progress.totalRequirements) * 100);
      updates.requirementsImplemented = progress.requirementsImplemented;
      updates.totalRequirements = progress.totalRequirements;
    }

    if (progress.codeFilesCreated !== undefined) {
      updates.codeFilesCreated = progress.codeFilesCreated;
    }

    if (progress.testFilesCreated !== undefined) {
      updates.testFilesCreated = progress.testFilesCreated;
    }

    if (progress.status) {
      updates.status = progress.status;
      if (progress.status === 'completed') {
        updates.completedAt = new Date();
      }
    }

    const result = await kgInterface.execute('kg:update', {
      id: changeId,
      updates
    });

    if (!result.success) {
      return {
        success: false,
        error: `Failed to update change progress: ${result.error}`
      };
    }

    return {
      success: true,
      update: result
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate code complexity
 */
function calculateComplexity(content: string): number {
  // Simple complexity calculation based on:
  // - Number of functions/classes
  // - Cyclomatic complexity indicators
  // - Nesting depth

  const lines = content.split('\n');
  let complexity = 1; // Base complexity

  for (const line of lines) {
    // Count control flow statements
    if (line.match(/\b(if|else|for|while|switch|case|catch)\b/)) {
      complexity++;
    }

    // Count function declarations
    if (line.match(/\b(function|=>|class)\b/)) {
      complexity += 2;
    }

    // Count nested blocks (approximation)
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    complexity += Math.max(0, openBraces - closeBraces);
  }

  // Normalize to reasonable range (1-10)
  return Math.min(10, Math.max(1, Math.round(complexity / 10)));
}

/**
 * Estimate test coverage
 */
function estimateCoverage(codeContent: string, testContent?: string): number {
  if (!testContent) return 0;

  // Simple coverage estimation based on:
  // - Number of test cases vs functions
  // - Assertion count vs code complexity

  const codeFunctions = (codeContent.match(/\bfunction\s+\w+/g) || []).length;
  const testCases = (testContent.match(/\b(test|it|describe)\s*\(/g) || []).length;
  const assertions = (testContent.match(/\b(expect|assert|should)\b/g) || []).length;

  if (codeFunctions === 0) return 100; // No functions to test

  const coverage = Math.min(100, Math.round(
    (testCases / codeFunctions) * 50 + // 50% for test count
    (Math.min(assertions, codeFunctions * 3) / (codeFunctions * 3)) * 50 // 50% for assertion density
  ));

  return coverage;
}

/**
 * Detect programming language from file path
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'rb': 'ruby',
    'php': 'php'
  };

  return (ext && languageMap[ext]) || 'unknown';
}