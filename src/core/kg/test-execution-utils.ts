/**
 * Knowledge Graph Test Execution Utilities
 *
 * Helper functions for running tests with KG integration
 * and updating KG with test results
 */

import { createKGToolInterface } from './tool-interface.js';
import * as types from './types.js';

/**
 * Run tests with KG integration
 */
export async function runTestsWithKGTracking(
  testFiles: string[],
  kgInterface: any
): Promise<Array<{
  file: string;
  passed: boolean;
  failed: boolean;
  skipped: boolean;
  duration: number;
  error?: string;
  coverage?: number;
}>> {
  const results: Array<any> = [];

  try {
    // Detect test runner
    const runner = await detectTestRunner(testFiles);

    for (const testFile of testFiles) {
      try {
        // Get the corresponding KG entity
        const testEntity = await kgInterface.execute('kg:query', {
          query: {
            entityType: 'TestCase',
            properties: { filePath: testFile }
          }
        });

        let testId = null;
        if (testEntity.success && testEntity.entities.length > 0) {
          testId = testEntity.entities[0].id;
        }

        // Update test status to running
        if (testId) {
          await kgInterface.execute('kg:update', {
            id: testId,
            updates: {
              status: 'running',
              startedAt: new Date()
            }
          });
        }

        // Run the test
        const result = await runSingleTest(testFile, runner);

        // Update test results in KG
        if (testId) {
          await updateTestResultsInKG(kgInterface, {
            testId,
            file: testFile,
            passed: result.passed,
            failed: result.failed,
            skipped: result.skipped,
            duration: result.duration,
            error: result.error,
            coverage: result.coverage
          });
        }

        results.push(result);

      } catch (error) {
        results.push({
          file: testFile,
          passed: false,
          failed: true,
          skipped: false,
          duration: 0,
          error: error.message
        });
      }
    }

    return results;

  } catch (error) {
    return [{
      file: 'all',
      passed: false,
      failed: true,
      skipped: false,
      duration: 0,
      error: error.message
    }];
  }
}

/**
 * Update test results in KG
 */
export async function updateTestResultsInKG(
  kgInterface: any,
  result: {
    testId?: string;
    file: string;
    passed: boolean;
    failed: boolean;
    skipped: boolean;
    duration: number;
    error?: string;
    coverage?: number;
  }
): Promise<void> {
  try {
    // Update existing test entity if we have the ID
    if (result.testId) {
      const updateResult = await kgInterface.execute('kg:update', {
        id: result.testId,
        updates: {
          status: result.passed ? 'active' : 'failed',
          isFailing: !result.passed,
          completedAt: new Date(),
          duration: result.duration,
          error: result.error,
          coverage: result.coverage
        }
      });

      if (!updateResult.success) {
        console.warn('Failed to update test entity:', updateResult.error);
      }
    }

    // Create test run event
    const eventId = `test-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const testRunEvent: types.Event = {
      id: eventId,
      type: 'TestRun',
      timestamp: new Date(),
      type: 'test_run',
      outcome: result.passed ? 'success' : 'failure',
      duration: result.duration,
      metadata: {
        file: result.file,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        error: result.error,
        coverage: result.coverage
      }
    };

    const eventResult = await kgInterface.execute('kg:create-entity', {
      entity: testRunEvent
    });

    if (!eventResult.success) {
      console.warn('Failed to create test run event:', eventResult.error);
    }

  } catch (error) {
    console.error('Failed to update test results in KG:', error.message);
  }
}

/**
 * Update overall test metrics in KG
 */
export async function updateTestMetricsInKG(
  kgInterface: any,
  metrics: {
    totalTests?: number;
    passedTests?: number;
    failedTests?: number;
    skippedTests?: number;
    coveragePercentage?: number;
    kgEntitiesCreated?: number;
    kgRelationshipsUpdated?: number;
  }
): Promise<void> {
  try {
    // Update change entity with test metrics
    // This would need to be implemented based on your change entity structure
    // For now, we'll create a metrics event

    const metricsEvent: types.Event = {
      id: `test-metrics-${Date.now()}`,
      type: 'TestMetricsEvent',
      timestamp: new Date(),
      type: 'test_metrics',
      outcome: 'success',
      metadata: {
        ...metrics,
    timestamp: new Date()
      }
    };

    const result = await kgInterface.execute('kg:create-entity', {
      entity: metricsEvent
    });

    if (!result.success) {
      console.warn('Failed to create test metrics event:', result.error);
    }

  } catch (error) {
    console.error('Failed to update test metrics in KG:', error.message);
  }
}

/**
 * Detect test runner from files
 */
async function detectTestRunner(testFiles: string[]): Promise<string> {
  // Common test runners and their detection patterns
  const runners = [
    {
      name: 'vitest',
      patterns: ['vitest.config.ts', 'vitest.config.js'],
      command: 'vitest run'
    },
    {
      name: 'jest',
      patterns: ['jest.config.js', 'jest.config.ts'],
      command: 'jest'
    },
    {
      name: 'mocha',
      patterns: ['mocha.opts', '.mocharc.json'],
      command: 'mocha'
    },
    {
      name: 'pytest',
      patterns: ['pytest.ini', 'conftest.py'],
      command: 'pytest'
    }
  ];

  // Check for config files
  const fs = require('fs');
  const path = require('path');

  for (const runner of runners) {
    for (const pattern of runner.patterns) {
      if (fs.existsSync(pattern)) {
        return runner.command;
      }
    }
  }

  // Check package.json for test scripts
  try {
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      if (pkg.scripts && pkg.scripts.test) {
        return pkg.scripts.test;
      }
    }
  } catch (error) {
    // Continue with other detection methods
  }

  // Default fallback
  return 'npm test';
}

/**
 * Run a single test file
 */
async function runSingleTest(testFile: string, runner: string): Promise<{
  passed: boolean;
  failed: boolean;
  skipped: boolean;
  duration: number;
  error?: string;
  coverage?: number;
}> {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(`${runner} ${testFile}`);
    const duration = Date.now() - startTime;

    // Parse test results from output
    const passed = !stdout.includes('FAIL') && !stderr.includes('FAIL');
    const failed = stdout.includes('FAIL') || stderr.includes('FAIL');
    const skipped = stdout.includes('SKIP') || stderr.includes('SKIP');

    // Extract coverage if available
    let coverage: number | undefined;
    const coverageMatch = stdout.match(/Coverage:\s+(\d+)%/);
    if (coverageMatch) {
      coverage = parseInt(coverageMatch[1]);
    }

    return {
      passed,
      failed,
      skipped,
      duration,
      error: failed ? stderr || stdout : undefined,
      coverage
    };

  } catch (error) {
    // exec throws on non-zero exit code
    const duration = Date.now() - (error as any).startTime || 0;

    // Try to parse results from error output
    const output = (error as any).stdout || (error as any).stderr || '';
    const failed = output.includes('FAIL') || output.includes('ERROR');
    const passed = !failed && output.includes('PASS');
    const skipped = output.includes('SKIP');

    let coverage: number | undefined;
    const coverageMatch = output.match(/Coverage:\s+(\d+)%/);
    if (coverageMatch) {
      coverage = parseInt(coverageMatch[1]);
    }

    return {
      passed,
      failed,
      skipped,
      duration,
      error: output
    };
  }
}

/**
 * Scan for PBT failures in test output
 */
export async function scanPBTFailures(
  testOutput: string
): Promise<Array<{
  id: string;
  ucStep: string;
  framework: string;
  counterexample: string;
  originalTest: string;
}>> {
  const failures: Array<any> = [];
  const pbtMarkers = [
    { framework: 'fast-check', marker: /Property failed after (\d+) tests[\s\S]*?Counterexample: ([\s\S]*?)(?:\n|$)/g },
    { framework: 'hypothesis', marker: /Falsifying example:([\s\S]*?)(?:\n|$)/g },
    { framework: 'jqwik', marker: /Falsified![\s\S]*?parameter values:([\s\S]*?)(?:\n|$)/g },
    { framework: 'rapid', marker: /Falsifiable input:([\s\S]*?)(?:\n|$)/g },
    { framework: 'proptest', marker: /FAILED\. Minimal failing input:([\s\S]*?)(?:\n|$)/g }
  ];

  for (const { framework, marker } of pbtMarkers) {
    let match;
    while ((match = marker.exec(testOutput)) !== null) {
      failures.push({
        id: `pbt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ucStep: extractUCStepFromOutput(testOutput, match.index),
        framework: framework,
        counterexample: match[2] ? match[2].trim() : match[1].trim(),
        originalTest: extractOriginalTestFromOutput(testOutput, match.index)
      });
    }
  }

  return failures;
}

/**
 * Extract UC step from test output
 */
function extractUCStepFromOutput(output: string, index: number): string {
  // Look backwards from the match for UC step ID
  const beforeMatch = output.substring(0, index);
  const ucMatch = beforeMatch.match(/UC\d+-[SE]\d+[a-z]?/g);
  if (ucMatch && ucMatch.length > 0) {
    return ucMatch[ucMatch.length - 1];
  }
  return 'unknown';
}

/**
 * Extract original test from test output
 */
function extractOriginalTestFromOutput(output: string, index: number): string {
  // Look backwards from the match for test file path
  const beforeMatch = output.substring(0, index);
  const testMatch = beforeMatch.match(/(test[\/\w.-]*\.test\.\w+)/g);
  if (testMatch && testMatch.length > 0) {
    return testMatch[testMatch.length - 1];
  }
  return 'unknown';
}

/**
 * Calculate overall test metrics
 */
export function calculateTestMetrics(
  results: Array<{
    passed: boolean;
    failed: boolean;
    skipped: boolean;
  }>
): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
} {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.failed).length;
  const skipped = results.filter(r => r.skipped).length;

  return {
    total,
    passed,
    failed,
    skipped,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0
  };
}