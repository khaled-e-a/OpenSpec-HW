# KG-Integrated Run Tests Usage

This demonstrates how the enhanced `synspec:run-tests-kg` command works with the Knowledge Graph to intelligently execute tests and maintain complete test execution history.

## Overview

The KG-integrated run-tests command provides:
- Intelligent test selection based on KG relationships
- Real-time KG updates during test execution
- Complete test execution history in KG
- Enhanced test coverage tracking via KG

## Example Workflow

### 1. Initial State After Test Generation

After running test generation:

```bash
$ synspec:gen-tests-kg add-user-auth

📊 KG: 63 entities, 102 relationships, 100% coverage
```

### 2. Start Test Execution with KG

```bash
$ synspec:run-tests-kg add-user-auth

📊 KG: 63 entities, 102 relationships, 100% coverage

## Run Tests: add-user-auth (schema: spec-driven)

KG Coverage: 100% (8/8 requirements tested)
KG Test entities: 18
KG Code entities: 12

Querying KG for test execution...
```

### 3. KG Queries for Test Information

The command queries KG to understand the test landscape:

```typescript
// Get test entities from KG
const testEntities = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { changeId: 'add-user-auth' }
  }
});

console.log(`Found ${testEntities.entities.length} test entities in KG`);

// Get code entities that might need testing
const codeEntities = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'CodeFile',
    properties: { changeId: 'add-user-auth' }
  }
});

console.log(`Found ${codeEntities.entities.length} code entities in KG`);
```

### 4. Intelligent Test Selection Based on KG

The command uses KG to select which tests to run:

```typescript
// Get test files from KG entities
const testFiles = testEntities.entities.map(test => test.filePath);
const uniqueTestFiles = [...new Set(testFiles)];

// Filter to only run tests that exist
const fs = require('fs');
const existingTestFiles = uniqueTestFiles.filter(file => fs.existsSync(file));

console.log(`Running ${existingTestFiles.length} tests from KG entities`);
```

### 5. Test Execution with KG Tracking

For each test, the command:

```typescript
// Update test status to running
await kgInterface.execute('kg:update', {
  id: testEntity.id,
  updates: {
    status: 'running',
    startedAt: new Date()
  }
});

// Run the test
const result = await runSingleTest(testFile, runner);

// Update test results in KG
await updateTestResultsInKG(kgInterface, {
  testId: testEntity.id,
  file: testFile,
  passed: result.passed,
  failed: result.failed,
  skipped: result.skipped,
  duration: result.duration,
  error: result.error,
  coverage: result.coverage
});
```

### 6. Test Execution Process

```typescript
// Run tests with KG tracking
const results = await runTestsWithKGTracking(existingTestFiles, kgInterface);

// Update overall metrics in KG
await updateTestMetricsInKG(kgInterface, {
  totalTests: results.length,
  passedTests: results.filter(r => r.passed).length,
  failedTests: results.filter(r => r.failed).length,
  coveragePercentage: calculateOverallCoverage(results)
});
```

### 7. KG-Enhanced Test Coverage Report

The test report includes KG information:

```markdown
## Test Report: add-user-auth

### KG Test State
- Test entities: 18
- Code entities: 12
- Test coverage via KG: 100%
- KG relationships verified: 24

### Use Case Coverage Summary
| Use Case | Happy | Extensions | Overall | KG Verified |
|----------|-------|------------|---------|-------------|
| Login    | ✅ 2/2| ⚠️ 1/2      | 75%     | ✅ 100%     |
| JWT Gen  | ✅ 1/1| ✅ 1/1      | 100%    | ✅ 100%     |

### KG Test Coverage Details
| Requirement | Test Entities | Coverage | Test Files |
|-------------|---------------|----------|------------|
| User login | 2 | ✅ | test/login.test.ts, test/login-form.test.ts |
| JWT generation | 1 | ✅ | test/jwt.test.ts |

### PBT Results
| UC Step | Scenario | Outcome | Counterexample | Regression Test | KG Entity |
|---------|----------|---------|----------------|-----------------|-----------|
| UC1-S2 | Catalogue shows only absent widgets | ✅ passed (100 runs) | — | — | test-789 |
| UC1-E4a1 | Error when no grid space | ❌ failed | `gridSize=0, widgetCount=1` | `test/pbt-regression-uc1-e4a1-1.test.ts` | reg-123 |

### Test Run Results
✅ All tests passed (16/18)
❌ 2 tests failed
⏭️ 0 tests skipped

### KG Execution Summary
- Tests executed: 18
- Tests passed: 16
- Tests failed: 2
- New KG entities created: 2
- KG relationships updated: 4
```

### 8. Final KG Updates

```typescript
// Update overall test metrics in KG
await updateTestMetricsInKG(kgInterface, {
  totalTests: results.length,
  passedTests: passedCount,
  failedTests: failedCount,
  coveragePercentage: overallCoverage,
  kgEntitiesCreated: newEntitiesCount,
  kgRelationshipsUpdated: newRelationshipsCount
});

// Persist all KG changes
await kgInterface.execute('kg:persist', {});
```

## KG Query Examples After Execution

### Find Failing Tests via KG

```typescript
// Find failing tests via KG
const failingTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { isFailing: true, changeId: 'add-user-auth' }
  }
});

for (const test of failingTests.entities) {
  console.log(`Failing test: ${test.name} (${test.filePath})`);
}
```

### Get Test Execution History

```typescript
// Get test execution history
const testRuns = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestRun',
    properties: { changeId: 'add-user-auth' }
  }
});

for (const run of testRuns.entities) {
  console.log(`Test run: ${run.timestamp} - ${run.outcome}`);
}
```

### Find Flaky Tests

```typescript
// Find tests that might be flaky
const flakyTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: {
      changeId: 'add-user-auth',
      'metadata.flaky': true
    }
  }
});

for (const test of flakyTests.entities) {
  console.log(`Flaky test: ${test.name} (${test.filePath})`);
}
```

### Analyze Test Performance

```typescript
// Analyze test performance trends
const testRuns = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestRun',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalDuration = 0;
for (const run of testRuns.entities) {
  totalDuration += run.duration || 0;
}

console.log(`Total test execution time: ${totalDuration / 1000} seconds`);
console.log(`Average test duration: ${totalDuration / testRuns.entities.length}ms`);
```

## Advanced KG Features

### 1. Test Selection Based on KG Relationships

```typescript
// Get tests that test a specific requirement
const reqTests = await kgInterface.execute('kg:get-relationships', {
  entityId: 'add-user-auth-req-1',
  direction: 'in',
  relationshipTypes: ['tests']
});

// Run only tests for this requirement
const testFiles = reqTests.map(rel => rel.target.filePath);
await runTestsWithKGTracking(testFiles, kgInterface);
```

### 2. Test Impact Analysis

```typescript
// Find tests affected by code changes
const changedFiles = ['src/auth/login.ts'];
const affectedTests = [];

for (const file of changedFiles) {
  const relatedTests = await kgInterface.execute('kg:query', {
    query: {
      entityType: 'TestCase',
      properties: { filePath: { $regex: file.replace('.ts', '') } }
    }
  });
  affectedTests.push(...relatedTests.entities);
}
```

### 3. Test Coverage Analysis via KG

```typescript
// Analyze test coverage trends
const coverageEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestMetricsEvent',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalCoverage = 0;
for (const event of coverageEvents.entities) {
  totalCoverage += event.metadata.coveragePercentage || 0;
}

console.log(`Average coverage: ${totalCoverage / coverageEvents.entities.length}%`);
```

## Benefits of KG Integration

1. **Intelligent Execution** - Uses KG to decide what to test
2. **Complete Tracking** - All test activity tracked in KG
3. **Real-time Updates** - KG stays in sync with test execution
4. **Enhanced Discovery** - Finds tests and relationships via KG
5. **Audit Trail** - Complete history of test execution
6. **Relationship Management** - Maintains all test relationships

## Error Handling

If KG operations fail:
- Falls back to standard test execution
- Provides clear error messages
- Suggests KG re-initialization if needed
- Continues with available data

## Performance Optimization

- Batch KG operations when possible
- Cache frequently accessed test entities
- Limit queries to relevant test entities
- Provide progress indicators for large test suites

This comprehensive KG integration ensures that test execution is intelligent, traceable, and fully integrated with the Knowledge Graph, providing valuable insights into test execution and maintaining complete test execution history.