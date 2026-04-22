/**
 * Knowledge Graph Verification Utilities
 *
 * Helper functions for verifying KG connectivity and traceability
 */

import { createKGToolInterface } from './tool-interface.js';
import * as types from './types.js';

/**
 * Verify KG connectivity for a specific change
 */
export async function verifyKGConnectivity(
  projectRoot: string,
  changeId: string,
  options?: {
    autoFix?: boolean;
    verbose?: boolean;
  }
): Promise<{
  success: boolean;
  report: KGVerificationReport;
  fixed: number;
  issues: KGVerificationIssue[];
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const issues: KGVerificationIssue[] = [];
  let fixed = 0;

  try {
    // Get current KG state
    const traceResult = await kgInterface.execute('kg:get-change-traceability', {
      changeId
    });

    if (!traceResult.success) {
      return {
        success: false,
        report: createEmptyReport(changeId),
        fixed: 0,
        issues: [{
          type: 'error',
          severity: 'error',
          message: `Failed to get KG traceability: ${traceResult.error}`,
          entityId: changeId,
          autoFixable: false
        }]
      };
    }

    const { traceability } = traceResult;
    const report = createInitialReport(changeId, traceability);

    // 1. Verify use case connectivity
    const useCaseIssues = await verifyUseCaseConnectivity(
      kgInterface,
      changeId,
      traceability.useCaseSteps,
      options
    );
    issues.push(...useCaseIssues.issues);
    if (options?.autoFix && useCaseIssues.fixable) {
      const fixed = await fixUseCaseConnectivity(kgInterface, changeId, useCaseIssues.issues);
      fixed += fixed;
    }
    report.useCases.issues = useCaseIssues.issues.length;

    // 2. Verify requirement traceability
    const reqIssues = await verifyRequirementTraceability(
      kgInterface,
      changeId,
      traceability.requirements,
      options
    );
    issues.push(...reqIssues.issues);
    if (options?.autoFix && reqIssues.fixable) {
      const fixed = await fixRequirementTraceability(kgInterface, changeId, reqIssues.issues);
      fixed += fixed;
    }
    report.requirements.issues = reqIssues.issues.length;

    // 3. Verify task implementation
    const taskIssues = await verifyTaskImplementation(
      kgInterface,
      changeId,
      traceability.tasks || [],
      options
    );
    issues.push(...taskIssues.issues);
    if (options?.autoFix && taskIssues.fixable) {
      const fixed = await fixTaskImplementation(kgInterface, changeId, taskIssues.issues);
      fixed += fixed;
    }
    report.tasks.issues = taskIssues.issues.length;

    // 4. Verify artifact connectivity
    const artifactIssues = await verifyArtifactConnectivity(
      kgInterface,
      changeId,
      options
    );
    issues.push(...artifactIssues.issues);
    if (options?.autoFix && artifactIssues.fixable) {
      const fixed = await fixArtifactConnectivity(kgInterface, changeId, artifactIssues.issues);
      fixed += fixed;
    }
    report.artifacts.issues = artifactIssues.issues.length;

    // Update report with final state
    await updateReportWithFinalState(kgInterface, report);

    return {
      success: true,
      report,
      fixed,
      issues
    };

  } catch (error) {
    return {
      success: false,
      report: createEmptyReport(changeId),
      fixed: 0,
      issues: [{
        type: 'error',
        severity: 'error',
        message: `Verification failed: ${error.message}`,
        entityId: changeId,
        autoFixable: false
      }]
    };
  }
}

/**
 * Verify use case connectivity
 */
async function verifyUseCaseConnectivity(
  kgInterface: any,
  changeId: string,
  useCaseSteps: any[],
  options?: { verbose?: boolean }
): Promise<{
  issues: KGVerificationIssue[];
  fixable: boolean;
}> {
  const issues: KGVerificationIssue[] = [];

  for (const step of useCaseSteps) {
    const stepId = `${changeId}-${step.id}`;

    // Check step entity exists
    const stepEntity = await kgInterface.execute('kg:get-entity', {
      entityId: stepId
    });

    if (!stepEntity.success) {
      issues.push({
        type: 'missing-entity',
        severity: 'error',
        message: `Use case step ${step.id} not found in KG`,
        entityId: stepId,
        autoFixable: true,
        suggestedFix: {
          action: 'create-entity',
          entity: {
            id: stepId,
            type: 'UseCaseStep',
            name: step.description,
            stepNumber: step.stepNumber,
            stepType: step.stepType,
            action: step.description,
            changeId
          }
        }
      });
      continue;
    }

    // Check step is linked to use case
    const stepRelationships = await kgInterface.execute('kg:get-relationships', {
      entityId: stepId,
      direction: 'in',
      relationshipTypes: ['hasStep']
    });

    if (stepRelationships.length === 0) {
      issues.push({
        type: 'missing-relationship',
        severity: 'warning',
        message: `Use case step ${step.id} not linked to any use case`,
        entityId: stepId,
        autoFixable: true,
        suggestedFix: {
          action: 'create-relationship',
          sourceId: `${changeId}-${step.useCaseId}`,
          relationshipType: 'hasStep',
          targetId: stepId
        }
      });
    }

    if (options?.verbose) {
      console.log(`✓ Verified use case step ${step.id}`);
    }
  }

  return { issues, fixable: issues.some(i => i.autoFixable) };
}

/**
 * Verify requirement traceability
 */
async function verifyRequirementTraceability(
  kgInterface: any,
  changeId: string,
  requirements: any[],
  options?: { verbose?: boolean }
): Promise<{
  issues: KGVerificationIssue[];
  fixable: boolean;
}> {
  const issues: KGVerificationIssue[] = [];

  for (const req of requirements) {
    const reqId = req.id;

    // Check requirement exists
    const reqEntity = await kgInterface.execute('kg:get-entity', {
      entityId: reqId
    });

    if (!reqEntity.success) {
      issues.push({
        type: 'missing-entity',
        severity: 'error',
        message: `Requirement ${req.name} not found in KG`,
        entityId: reqId,
        autoFixable: true,
        suggestedFix: {
          action: 'create-entity',
          entity: req
        }
      });
      continue;
    }

    // Check requirement implements correct use case steps
    const implementsRel = await kgInterface.execute('kg:get-relationships', {
      entityId: reqId,
      direction: 'out',
      relationshipTypes: ['implements']
    });

    const implementedSteps = implementsRel.map(r => r.target.id);
    const expectedSteps = req.implements || [];

    for (const expectedStep of expectedSteps) {
      const stepId = `${changeId}-${expectedStep.split(' ')[0]}`;
      if (!implementedSteps.includes(stepId)) {
        issues.push({
          type: 'missing-relationship',
          severity: 'error',
          message: `Requirement ${req.name} does not implement ${expectedStep}`,
          entityId: reqId,
          autoFixable: true,
          suggestedFix: {
            action: 'create-relationship',
            sourceId: reqId,
            relationshipType: 'implements',
            targetId: stepId,
            properties: { reference: expectedStep }
          }
        });
      }
    }

    if (options?.verbose) {
      console.log(`✓ Verified requirement ${req.name}`);
    }
  }

  return { issues, fixable: issues.some(i => i.autoFixable) };
}

/**
 * Verify task implementation
 */
async function verifyTaskImplementation(
  kgInterface: any,
  changeId: string,
  tasks: any[],
  options?: { verbose?: boolean }
): Promise<{
  issues: KGVerificationIssue[];
  fixable: boolean;
}> {
  const issues: KGVerificationIssue[] = [];

  for (const task of tasks) {
    const taskId = task.id;

    // Check task exists
    const taskEntity = await kgInterface.execute('kg:get-entity', {
      entityId: taskId
    });

    if (!taskEntity.success) {
      issues.push({
        type: 'missing-entity',
        severity: 'warning',
        message: `Task ${task.description} not found in KG`,
        entityId: taskId,
        autoFixable: true,
        suggestedFix: {
          action: 'create-entity',
          entity: task
        }
      });
      continue;
    }

    // Check task implements requirements
    const implementsRel = await kgInterface.execute('kg:get-relationships', {
      entityId: taskId,
      direction: 'out',
      relationshipTypes: ['implements']
    });

    const implementedReqs = implementsRel.map(r => r.target.id);
    const expectedReqs = task.addresses || [];

    for (const expectedReq of expectedReqs) {
      const reqId = `${changeId}-${expectedReq}`;
      if (!implementedReqs.includes(reqId)) {
        issues.push({
          type: 'missing-relationship',
          severity: 'warning',
          message: `Task ${task.description} does not implement ${expectedReq}`,
          entityId: taskId,
          autoFixable: true,
          suggestedFix: {
            action: 'create-relationship',
            sourceId: taskId,
            relationshipType: 'implements',
            targetId: reqId,
            properties: { reference: expectedReq }
          }
        });
      }
    }

    if (options?.verbose) {
      console.log(`✓ Verified task ${task.description}`);
    }
  }

  return { issues, fixable: issues.some(i => i.autoFixable) };
}

/**
 * Verify artifact connectivity
 */
async function verifyArtifactConnectivity(
  kgInterface: any,
  changeId: string,
  options?: { verbose?: boolean }
): Promise<{
  issues: KGVerificationIssue[];
  fixable: boolean;
}> {
  const issues: KGVerificationIssue[] = [];
  const artifactTypes = ['usecases', 'specs', 'design', 'tasks'];

  for (const artifactType of artifactTypes) {
    const artifactId = `${changeId}-${artifactType}`;

    // Check artifact exists
    const artifactEntity = await kgInterface.execute('kg:get-entity', {
      entityId: artifactId
    });

    if (!artifactEntity.success) {
      issues.push({
        type: 'missing-entity',
        severity: 'error',
        message: `${artifactType} artifact not found in KG`,
        entityId: artifactId,
        autoFixable: false // Can't auto-fix missing artifact, would need to re-create
      });
      continue;
    }

    // Check artifact is linked to change
    const changeRelationships = await kgInterface.execute('kg:get-relationships', {
      entityId: changeId,
      direction: 'out',
      relationshipTypes: ['hasArtifact']
    });

    const hasArtifact = changeRelationships.some(r => r.target.id === artifactId);
    if (!hasArtifact) {
      issues.push({
        type: 'missing-relationship',
        severity: 'error',
        message: `${artifactType} artifact not linked to change`,
        entityId: changeId,
        autoFixable: true,
        suggestedFix: {
          action: 'create-relationship',
          sourceId: changeId,
          relationshipType: 'hasArtifact',
          targetId: artifactId,
          properties: { role: artifactType }
        }
      });
    }

    if (options?.verbose) {
      console.log(`✓ Verified ${artifactType} artifact connectivity`);
    }
  }

  return { issues, fixable: issues.some(i => i.autoFixable) };
}

/**
 * Fix KG connectivity issues
 */
async function fixKGConnectivity(
  kgInterface: any,
  changeId: string,
  issues: KGVerificationIssue[]
): Promise<number> {
  let fixed = 0;

  for (const issue of issues) {
    if (!issue.autoFixable || !issue.suggestedFix) continue;

    try {
      switch (issue.suggestedFix.action) {
        case 'create-entity':
          const createResult = await kgInterface.execute('kg:create-entity', {
            entity: issue.suggestedFix.entity
          });
          if (createResult.success) fixed++;
          break;

        case 'create-relationship':
          const relResult = await kgInterface.execute('kg:create-relationship', {
            sourceId: issue.suggestedFix.sourceId,
            relationshipType: issue.suggestedFix.relationshipType,
            targetId: issue.suggestedFix.targetId,
            properties: issue.suggestedFix.properties
          });
          if (relResult.success) fixed++;
          break;
      }
    } catch (error) {
      console.warn(`Failed to fix issue ${issue.type}: ${error.message}`);
    }
  }

  return fixed;
}

/**
 * Update report with final KG state
 */
async function updateReportWithFinalState(
  kgInterface: any,
  report: KGVerificationReport
): Promise<void> {
  try {
    // Get final KG summary
    const summaryResult = await kgInterface.execute('kg:get-summary', {});
    if (summaryResult.success && summaryResult.summary) {
      report.finalState = summaryResult.summary;
    }
  } catch (error) {
    console.warn('Failed to get final KG state:', error.message);
  }
}

/**
 * Create empty verification report
 */
function createEmptyReport(changeId: string): KGVerificationReport {
  return {
    changeId,
    initialState: {
      useCases: { entities: 0, relationships: 0 },
      requirements: { entities: 0, relationships: 0 },
      designDecisions: { entities: 0, relationships: 0 },
      tasks: { entities: 0, relationships: 0 },
      artifacts: { total: 0, linked: 0 },
      coverage: 0
    },
    finalState: null,
    issues: {
      useCases: 0,
      requirements: 0,
      designDecisions: 0,
      tasks: 0,
      artifacts: 0
    },
    autoFixed: 0,
    timestamp: new Date()
  };
}

/**
 * Create initial verification report
 */
function createInitialReport(
  changeId: string,
  traceability: any
): KGVerificationReport {
  return {
    changeId,
    initialState: {
      useCases: {
        entities: traceability.useCaseSteps?.length || 0,
        relationships: 0 // Will be calculated
      },
      requirements: {
        entities: traceability.requirements?.length || 0,
        relationships: 0 // Will be calculated
      },
      designDecisions: {
        entities: 0, // Will be updated
        relationships: 0
      },
      tasks: {
        entities: traceability.tasks?.length || 0,
        relationships: 0
      },
      artifacts: {
        total: 4,
        linked: 0 // Will be calculated
      },
      coverage: traceability.coverage || 0
    },
    finalState: null,
    issues: {
      useCases: 0,
      requirements: 0,
      designDecisions: 0,
      tasks: 0,
      artifacts: 0
    },
    autoFixed: 0,
    timestamp: new Date()
  };
}

// Types
interface KGVerificationIssue {
  type: 'missing-entity' | 'missing-relationship' | 'phantom-reference' | 'inaccurate-description' | 'error';
  severity: 'error' | 'warning' | 'info';
  message: string;
  entityId?: string;
  autoFixable: boolean;
  suggestedFix?: {
    action: 'create-entity' | 'create-relationship' | 'update-entity' | 'delete-relationship';
    [key: string]: any;
  };
}

interface KGVerificationReport {
  changeId: string;
  initialState: {
    useCases: { entities: number; relationships: number };
    requirements: { entities: number; relationships: number };
    designDecisions: { entities: number; relationships: number };
    tasks: { entities: number; relationships: number };
    artifacts: { total: number; linked: number };
    coverage: number;
  };
  finalState: any | null;
  issues: {
    useCases: number;
    requirements: number;
    designDecisions: number;
    tasks: number;
    artifacts: number;
  };
  autoFixed: number;
  timestamp: Date;
}