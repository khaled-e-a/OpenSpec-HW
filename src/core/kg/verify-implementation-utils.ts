/**
 * Knowledge Graph Implementation Verification Utilities
 *
 * Helper functions for verifying that implemented code correctly
 * connects to specifications in the KG
 */

import { createKGToolInterface } from './tool-interface.js';

/**
 * Verify that all tasks have corresponding code entities in KG
 */
export async function verifyTaskKGConnectivity(
  projectRoot: string,
  changeId: string
): Promise<{
  success: boolean;
  tasksWithCode: number;
  totalTasks: number;
  issues: Array<{
    taskId: string;
    taskName: string;
    status: string;
    issue: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const issues: Array<any> = [];

  try {
    // Get all tasks for the change
    const tasksResult = await kgInterface.execute('kg:query', {
      query: {
        entityType: 'Task',
        properties: { changeId }
      }
    });

    if (!tasksResult.success) {
      return {
        success: false,
        tasksWithCode: 0,
        totalTasks: 0,
        issues: [{
          taskId: '',
          taskName: '',
          status: '',
          issue: `Failed to query tasks: ${tasksResult.error}`,
          severity: 'error'
        }]
      };
    }

    let tasksWithCode = 0;

    for (const task of tasksResult.entities) {
      // Check if task has implementing code
      const implementations = await kgInterface.execute('kg:get-relationships', {
        entityId: task.id,
        direction: 'in',
        relationshipTypes: ['implementedBy']
      });

      const hasCode = implementations.length > 0;
      if (hasCode) tasksWithCode++;

      // Check for issues
      if (task.status === 'completed' && !hasCode) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          status: task.status,
          issue: 'Task marked complete but no code entities found in KG',
          severity: 'warning'
        });
      } else if (task.status === 'in_progress' && !hasCode) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          status: task.status,
          issue: 'Task in progress but no code entities found in KG',
          severity: 'info'
        });
      }
    }

    return {
      success: true,
      tasksWithCode,
      totalTasks: tasksResult.entities.length,
      issues
    };

  } catch (error: any) {
    return {
      success: false,
      tasksWithCode: 0,
      totalTasks: 0,
      issues: [{
        taskId: '',
        taskName: '',
        status: '',
        issue: `Verification failed: ${error.message}`,
        severity: 'error'
      }]
    };
  }
}

/**
 * Verify that requirements have implementing code entities in KG
 */
export async function verifyRequirementKGConnectivity(
  projectRoot: string,
  changeId: string
): Promise<{
  success: boolean;
  requirementsWithCode: number;
  totalRequirements: number;
  uncoveredRequirements: Array<{
    reqId: string;
    reqName: string;
    severity: 'error' | 'warning';
  }>;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const uncovered: Array<any> = [];

  try {
    // Get all requirements for the change
    const requirementsResult = await kgInterface.execute('kg:query', {
      query: {
        entityType: 'Requirement',
        properties: { changeId }
      }
    });

    if (!requirementsResult.success) {
      return {
        success: false,
        requirementsWithCode: 0,
        totalRequirements: 0,
        uncoveredRequirements: []
      };
    }

    let requirementsWithCode = 0;

    for (const req of requirementsResult.entities) {
      // Check if requirement has implementing code
      const implementations = await kgInterface.execute('kg:get-relationships', {
        entityId: req.id,
        direction: 'in',
        relationshipTypes: ['implementedBy']
      });

      if (implementations.length > 0) {
        requirementsWithCode++;
      } else {
        uncovered.push({
          reqId: req.id,
          reqName: req.name,
          severity: 'warning'
        });
      }
    }

    return {
      success: true,
      requirementsWithCode,
      totalRequirements: requirementsResult.entities.length,
      uncoveredRequirements: uncovered
    };

  } catch (error: any) {
    return {
      success: false,
      requirementsWithCode: 0,
      totalRequirements: 0,
      uncoveredRequirements: []
    };
  }
}

/**
 * Verify test coverage for requirements in KG
 */
export async function verifyTestKGConnectivity(
  projectRoot: string,
  changeId: string
): Promise<{
  success: boolean;
  requirementsWithTests: number;
  totalRequirements: number;
  untestedRequirements: Array<{
    reqId: string;
    reqName: string;
    testCount: number;
  }>;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const untested: Array<any> = [];

  try {
    // Get all requirements for the change
    const requirementsResult = await kgInterface.execute('kg:query', {
      query: {
        entityType: 'Requirement',
        properties: { changeId }
      }
    });

    if (!requirementsResult.success) {
      return {
        success: false,
        requirementsWithTests: 0,
        totalRequirements: 0,
        untestedRequirements: []
      };
    }

    let requirementsWithTests = 0;

    for (const req of requirementsResult.entities) {
      // Check if requirement has tests
      const tests = await kgInterface.execute('kg:get-relationships', {
        entityId: req.id,
        direction: 'in',
        relationshipTypes: ['tests']
      });

      if (tests.length > 0) {
        requirementsWithTests++;
      } else {
        untested.push({
          reqId: req.id,
          reqName: req.name,
          testCount: 0
        });
      }
    }

    return {
      success: true,
      requirementsWithTests,
      totalRequirements: requirementsResult.entities.length,
      untestedRequirements: untested
    };

  } catch (error: any) {
    return {
      success: false,
      requirementsWithTests: 0,
      totalRequirements: 0,
      untestedRequirements: []
    };
  }
}

/**
 * Cross-verify KG relationships with actual code implementation
 */
export async function crossVerifyKGWithCode(
  projectRoot: string,
  changeId: string,
  codeFiles: string[]
): Promise<{
  success: boolean;
  discrepancies: Array<{
    entityId: string;
    entityType: string;
    entityName: string;
    issue: string;
    kgRelationship: string;
    codeEvidence?: string;
  }>;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const discrepancies: Array<any> = [];

  try {
    // Get KG entities that should relate to code
    const codeEntities = await kgInterface.execute('kg:query', {
      query: {
        entityType: 'CodeFile',
        properties: { changeId }
      }
    });

    const testEntities = await kgInterface.execute('kg:query', {
      query: {
        entityType: 'TestCase',
        properties: { changeId }
      }
    });

    // Check each KG entity against actual code
    for (const entity of [...codeEntities.entities, ...testEntities.entities]) {
      // Verify the file actually exists
      const fs = require('fs');
      const fileExists = fs.existsSync(entity.filePath);

      if (!fileExists) {
        discrepancies.push({
          entityId: entity.id,
          entityType: entity.type,
          entityName: entity.name,
          issue: 'KG entity references non-existent file',
          kgRelationship: entity.filePath,
          codeEvidence: 'File not found'
        });
        continue;
      }

      // Read the file content
      try {
        const content = fs.readFileSync(entity.filePath, 'utf-8');

        // Verify the content matches KG metadata
        if (entity.type === 'CodeFile') {
          const actualLines = content.split('\n').length;
          if (Math.abs(actualLines - (entity.linesOfCode || 0)) > 10) {
            discrepancies.push({
              entityId: entity.id,
              entityType: entity.type,
              entityName: entity.name,
              issue: 'KG line count significantly differs from actual file',
              kgRelationship: `${entity.linesOfCode} lines`,
              codeEvidence: `${actualLines} lines`
            });
          }
        }

        // Check for implementation evidence
        if (entity.type === 'TestCase' && entity.tests) {
          for (const reqId of entity.tests) {
            // Simple check - look for requirement name in test
            const reqName = await getRequirementName(kgInterface, reqId);
            if (reqName && !content.includes(reqName)) {
              discrepancies.push({
                entityId: entity.id,
                entityType: entity.type,
                entityName: entity.name,
                issue: 'Test claims to test requirement but requirement name not found in test',
                kgRelationship: `tests ${reqId}`,
                codeEvidence: `Requirement name "${reqName}" not found in test`
              });
            }
          }
        }

      } catch (readError: any) {
        discrepancies.push({
          entityId: entity.id,
          entityType: entity.type,
          entityName: entity.name,
          issue: 'Failed to read file for verification',
          kgRelationship: entity.filePath,
          codeEvidence: `Error: ${readError.message}`
        });
      }
    }

    return {
      success: true,
      discrepancies
    };

  } catch (error: any) {
    return {
      success: false,
      discrepancies: [{
        entityId: '',
        entityType: '',
        entityName: '',
        issue: `Cross-verification failed: ${error.message}`,
        kgRelationship: '',
        codeEvidence: ''
      }]
    };
  }
}

/**
 * Get requirement name from KG
 */
async function getRequirementName(
  kgInterface: any,
  reqId: string
): Promise<string | null> {
  try {
    const result = await kgInterface.execute('kg:get-entity', {
      entityId: reqId
    });

    if (result.success && result.entity) {
      return result.entity.name;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate KG verification report
 */
export function generateKGVerificationReport(
  results: {
    taskConnectivity: any;
    requirementConnectivity: any;
    testConnectivity: any;
    crossVerification: any;
  }
): string {
  let report = '# KG Implementation Verification Report\n\n';

  // Task connectivity
  report += '## Task KG Connectivity\n';
  report += `- Tasks with code entities: ${results.taskConnectivity.tasksWithCode}/${results.taskConnectivity.totalTasks}\n`;
  if (results.taskConnectivity.issues.length > 0) {
    report += '- Issues found:\n';
    for (const issue of results.taskConnectivity.issues) {
      report += `  - ${issue.severity}: ${issue.issue} (${issue.taskName})\n`;
    }
  }

  // Requirement connectivity
  report += '\n## Requirement KG Connectivity\n';
  report += `- Requirements with code: ${results.requirementConnectivity.requirementsWithCode}/${results.requirementConnectivity.totalRequirements}\n`;
  if (results.requirementConnectivity.uncoveredRequirements.length > 0) {
    report += '- Requirements without code entities:\n';
    for (const req of results.requirementConnectivity.uncoveredRequirements) {
      report += `  - ${req.reqName} (${req.severity})\n`;
    }
  }

  // Test connectivity
  report += '\n## Test KG Connectivity\n';
  report += `- Requirements with tests: ${results.testConnectivity.requirementsWithTests}/${results.testConnectivity.totalRequirements}\n`;
  if (results.testConnectivity.untestedRequirements.length > 0) {
    report += '- Requirements without test coverage:\n';
    for (const req of results.testConnectivity.untestedRequirements) {
      report += `  - ${req.reqName}\n`;
    }
  }

  // Cross-verification
  if (results.crossVerification.discrepancies.length > 0) {
    report += '\n## KG vs Code Discrepancies\n';
    for (const disc of results.crossVerification.discrepancies) {
      report += `  - ${disc.issue} (${disc.entityName})\n`;
    }
  }

  return report;
}