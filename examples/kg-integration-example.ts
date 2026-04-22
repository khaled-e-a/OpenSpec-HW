/**
 * Example: Integrating Knowledge Graph into Synspec Commands
 *
 * This example shows how other synspec commands can use the KG
 * that was initialized by synspec:new
 */

import { KG } from '../src/core/kg/index.js';
import { getKGClient, shouldUseKG, handleKGError, persistKGState } from '../src/utils/kg-utils.js';

/**
 * Example: /synspec:apply command using KG
 */
async function applyCommandExample(changeName: string, taskId?: string): Promise<void> {
  const projectRoot = process.cwd();

  // Check if we should use KG
  if (!shouldUseKG('apply', {})) {
    // Fall back to non-KG implementation
    console.log('Running apply without KG...');
    return;
  }

  try {
    // Get KG client for this change
    const kg = await getKGClient(projectRoot);
    if (!kg) {
      console.log('KG not available, running without traceability...');
      return;
    }

    // Get change information
    const change = await kg.read(changeName, 'Change');
    if (!change) {
      throw new Error(`Change '${changeName}' not found in KG`);
    }

    // Get pending tasks
    const tasks = await kg.find({
      entityType: 'Task',
      properties: { changeId: changeName, status: 'pending' }
    });

    console.log(`Found ${tasks.length} pending tasks for change '${changeName}'`);

    // Process each task
    for (const task of tasks) {
      if (taskId && task.id !== taskId) continue;

      console.log(`\nProcessing task: ${task.name}`);

      // Get requirements this task implements
      const requirements = await kg.getRelationships(task.id, 'out', ['implements']);
      console.log(`  Implements ${requirements.length} requirements`);

      // Get use case steps for these requirements
      for (const reqRel of requirements) {
        const useCaseSteps = await kg.getRelationships(reqRel.target.id, 'out', ['implements']);
        console.log(`  - Requirement ${reqRel.target.name} implements ${useCaseSteps.length} use case steps`);
      }

      // Simulate task completion
      await kg.update(task.id, { status: 'in_progress' });

      // TODO: Actually implement the task here
      // This is where the real implementation would go

      // Mark task as completed
      await kg.update(task.id, { status: 'completed' });

      // Update related artifacts
      const createdFiles = await kg.getRelationships(task.id, 'out', ['creates']);
      for (const fileRel of createdFiles) {
        await kg.update(fileRel.target.id, { status: 'active' });
      }
    }

    // Save KG state
    await persistKGState(projectRoot, kg);

    console.log('\n✅ Apply completed with KG tracking');

  } catch (error) {
    handleKGError(error);
    // Continue without KG or rethrow based on error severity
  }
}

/**
 * Example: /synspec:gen-tests command using KG
 */
async function genTestsCommandExample(changeName: string): Promise<void> {
  const projectRoot = process.cwd();
  const kg = await getKGClient(projectRoot);

  if (!kg) {
    console.log('KG not available, generating tests without traceability...');
    return;
  }

  // Get change and its requirements
  const requirements = await kg.find({
    entityType: 'Requirement',
    properties: { changeId: changeName }
  });

  console.log(`Analyzing ${requirements.length} requirements for test coverage...`);

  // Find requirements without tests
  const uncoveredReqs: types.Requirement[] = [];
  for (const req of requirements) {
    const tests = await kg.getRelationships(req.id, 'in', ['tests']);
    if (tests.length === 0) {
      uncoveredReqs.push(req as types.Requirement);
    }
  }

  console.log(`Found ${uncoveredReqs.length} requirements without test coverage`);

  // Generate tests for uncovered requirements
  for (const req of uncoveredReqs) {
    console.log(`\nGenerating test for requirement: ${req.name}`);

    // Get use case steps this requirement implements
    const useCaseSteps = await kg.getRelationships(req.id, 'out', ['implements']);

    // Create test case
    const testCase: types.TestCase = {
      id: `test-${req.id}`,
      type: 'TestCase',
      name: `Test: ${req.name}`,
      framework: 'vitest', // Detect from project
      testType: 'unit',
      isFailing: true, // Start with failing test (TDD)
      filePath: `src/__tests__/${req.id}.test.ts`,
      changeId: changeName,
      createdAt: new Date(),
      status: 'active',
      tests: [req.id],
      covers: useCaseSteps.map(s => s.target.id)
    };

    await kg.create(testCase);

    // Link test to requirement
    await kg.createRelationship(testCase.id, 'tests', req.id);

    // Link test to use case steps
    for (const step of useCaseSteps) {
      await kg.createRelationship(testCase.id, 'covers', step.target.id);
    }

    console.log(`  ✓ Created test case: ${testCase.name}`);
  }

  // Save KG state
  await persistKGState(projectRoot, kg);

  console.log('\n✅ Test generation completed with KG tracking');
}

/**
 * Example: /synspec:verify command using KG
 */
async function verifyCommandExample(changeName: string): Promise<void> {
  const projectRoot = process.cwd();
  const kg = await getKGClient(projectRoot);

  if (!kg) {
    console.log('KG not available, verification limited...');
    return;
  }

  const issues: string[] = [];

  // 1. Check task completion
  const incompleteTasks = await kg.find({
    entityType: 'Task',
    properties: { changeId: changeName, status: 'pending' }
  });

  if (incompleteTasks.length > 0) {
    issues.push(`${incompleteTasks.length} tasks are incomplete`);
  }

  // 2. Check requirement implementation
  const unimplementedReqs = await kg.find({
    query: `
      MATCH (r:Requirement {changeId: $changeId})
      WHERE NOT (r)-[:implements]-(:UseCaseStep)
      RETURN r
    `,
    parameters: { changeId: changeName }
  });

  if (unimplementedReqs.length > 0) {
    issues.push(`${unimplementedReqs.length} requirements lack implementation`);
  }

  // 3. Check test coverage
  const lowCoverageFiles = await kg.find({
    entityType: 'CodeFile',
    properties: { changeId: changeName },
    query: 'testCoverage < 80'
  });

  if (lowCoverageFiles.length > 0) {
    issues.push(`${lowCoverageFiles.length} files have low test coverage`);
  }

  // 4. Check for failing tests
  const failingTests = await kg.find({
    entityType: 'TestCase',
    properties: { changeId: changeName, isFailing: true }
  });

  if (failingTests.length > 0) {
    issues.push(`${failingTests.length} tests are failing`);
  }

  // Report results
  if (issues.length === 0) {
    console.log('✅ All verifications passed!');
  } else {
    console.log('❌ Verification issues found:');
    for (const issue of issues) {
      console.log(`  - ${issue}`);
    }
  }
}

/**
 * Example: Custom query for impact analysis
 */
async function impactAnalysisExample(entityId: string): Promise<void> {
  const projectRoot = process.cwd();
  const kg = await getKGClient(projectRoot);

  if (!kg) {
    console.log('KG not available for impact analysis');
    return;
  }

  // Get upstream dependencies
  const upstream = await kg.getNeighbors(entityId, [], 2);
  console.log(`Upstream dependencies: ${upstream.length}`);

  // Get downstream impacts
  const downstream = await kg.getNeighbors(entityId, [], 2);
  console.log(`Downstream impacts: ${downstream.length}`);

  // Find all paths to tests
  const testPaths = await kg.findAllPaths(
    entityId,
    'test-001',
    { relationshipTypes: ['implements', 'tests'] }
  );

  console.log(`Test paths found: ${testPaths.length}`);

  // Calculate blast radius
  const impacted = new Set([...upstream, ...downstream]);
  console.log(`Total entities impacted: ${impacted.size}`);
}

// Export examples
export const KGExamples = {
  applyCommand: applyCommandExample,
  genTestsCommand: genTestsCommandExample,
  verifyCommand: verifyCommandExample,
  impactAnalysis: impactAnalysisExample
};