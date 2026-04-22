/**
 * Knowledge Graph Integrated Run Tests Workflow
 *
 * Enhanced version of run-tests that queries KG for test execution
 * and updates KG with test results and any generated code/tests
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';

/**
 * Get KG-integrated run tests skill template
 */
export function getRunTestsKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synspec-run-tests-kg',
    description: 'Run test suite with KG integration - queries KG for tests to run, updates KG with results and generated code/tests.',
    instructions: `Run test suite with KG integration - queries KG for tests to run, updates KG with results and generated code/tests.

**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **NEVER auto-select**.

2. **Check KG availability and load test information**
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

   If KG is not available:
   - Show message: "KG not available, falling back to standard test execution"
   - Continue with standard run-tests workflow
   - Note KG limitations in final report

3. **Query KG for test information**
   \`\`\`typescript
   // Get test entities from KG
   const testEntities = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'TestCase',
       properties: { changeId: "<name>" }
     }
   });

   const codeEntities = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'CodeFile',
       properties: { changeId: "<name>" }
     }
   });

   const testEvents = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'TestRun',
       properties: { changeId: "<name>" }
     }
   });

   console.log(`Found ${testEntities.entities.length} test entities in KG`);
   console.log(`Found ${codeEntities.entities.length} code entities in KG`);
   \`\`\`

4. **Load spec-tests.md (if available)**

   Look for \`synergyspec/changes/<name>/spec-tests.md\`.
   If found, read it — it provides the Requirement Traceability Matrix and step-level IDs (e.g., UC1-S1) mapping spec steps/flows to test files.
   If not found, use KG data for mapping (KG entity IDs and relationships).

5. **Run tests with KG integration**

   a. **Detect test runner and prepare KG-aware execution**:
      \`\`\`typescript
      // Get test files from KG entities
      const testFiles = testEntities.entities.map(test => test.filePath);
      const uniqueTestFiles = [...new Set(testFiles)];

      // Filter to only run tests that exist
      const fs = require('fs');
      const existingTestFiles = uniqueTestFiles.filter(file => fs.existsSync(file));

      console.log(`Running ${existingTestFiles.length} tests from KG entities`);
      \`\`\`

   b. **Execute tests with KG tracking**:
      \`\`\`typescript
      // Run tests and capture results
      const testResults = await runTestsWithKGTracking(existingTestFiles, kgInterface);

      // Update KG with test results
      for (const result of testResults) {
         await updateTestResultsInKG(kgInterface, result);
       }
      \`\`\`

   c. **Promote PBT counterexamples to regression tests with KG tracking**:
      \`\`\`typescript
      // Scan for PBT failures and create regression tests
      const pbtFailures = await scanPBTFailures(testOutput);

      for (const failure of pbtFailures) {
         // Create regression test entity in KG
         const regressionEntity = {
           id: \`pbt-regression-\${changeId}-\${failure.id}-\${Date.now()}\`,
           type: 'TestCase',
           name: \`PBT Regression: \${failure.scenario}\`,
           framework: failure.framework,
           testType: 'unit',
           isFailing: true,
           filePath: \`test/pbt-regression-\${failure.id}.test.ts\`,
           changeId: changeId,
           createdAt: new Date(),
           status: 'active',
           metadata: {
             counterexample: failure.counterexample,
             originalTest: failure.originalTest,
             isRegression: true
           }
         };

         await kgInterface.execute('kg:create-entity', {
           entity: regressionEntity
         });

         // Link regression test to original test
         await kgInterface.execute('kg:create-relationship', {
           sourceId: regressionEntity.id,
           relationshipType: 'regresses',
           targetId: failure.originalTest,
           properties: {
             counterexample: failure.counterexample,
             createdAt: new Date()
           }
         });
       }
      \`\`\`

6. **Generate KG-enhanced test coverage report**

   Save this file to \`synergyspec/changes/<name>/test-report.md\`.

   \`\`\`markdown
   ## Test Report: <change-name>

   ### KG Test State
   - Test entities: N
   - Code entities: M
   - Test coverage via KG: X%
   - KG relationships verified: Y

   ### Use Case Coverage Summary
   | Use Case         | Happy | Extensions | Overall | KG Verified |
   |-----------------|-------|------------|---------|-------------|
   | <name>          | ✅ 2/2| ⚠️ 1/2      | 75%     | ✅ 100%     |
   ...
   Overall: X/Y paths/steps covered (Z%)

   ### Covered Requirements (KG Verified)
   - ✅ **UC1-S1**: <description> (\`test/foo.test.ts:42\`, KG: test-123)
   - ✅ **UC1-S2**: <description> (\`test/bar.test.ts:15\`, KG: test-456)
   ...

   ### KG Test Coverage Details
   | Requirement | Test Entities | KG Status | Test Files |
   |-------------|---------------|-----------|------------|
   | User login | 2 | ✅ | test/login.test.ts, test/login-form.test.ts |
   | JWT generation | 1 | ✅ | test/jwt.test.ts |

   ### PBT Results
   | UC Step | Scenario | Outcome | Counterexample | Regression Test | KG Entity |
   |---------|----------|---------|----------------|-----------------|-----------|
   | UC1-S2 | Catalogue shows only absent widgets | ✅ passed (100 runs) | — | — | test-789 |
   | UC1-E4a1 | Error when no grid space | ❌ failed | \`gridSize=0, widgetCount=1\` | \`test/pbt-regression-uc1-e4a1-1.test.ts\` | reg-123 |
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors with KG entity IDs.

   ### KG Execution Summary
   - Tests executed: N
   - Tests passed: M
   - Tests failed: F
   - New KG entities created: E
   - KG relationships updated: R
n   \`\`\`

7. **Generate Test Plan with KG integration**

   **Trigger**: Run this step whenever \`test-report.md\` contains any ⚠️ partial or ❌ uncovered requirements.

   **Enhanced with KG data**:
   - Use KG relationships to identify which requirements lack test coverage
   - Query KG for existing test entities to avoid duplication
   - Suggest KG-based solutions for test coverage gaps

   **KG-enhanced test plan structure**:
   \`\`\`markdown
   ## Test Plan: <change-name>

   ### KG Analysis Summary
   - Requirements lacking test coverage: N (via KG query)
   - Test entities available but not covering: M
   - KG-based test generation recommended: Y

   ### Summary
   | ID | UC Step | Reason | Tool | KG Entity |
   |----|---------|--------|------|-----------|
   | TP-1 | UC1-S3 | BROWSER | Playwright | test-123 |
   | TP-2 | UC1-E2a | BROWSER | Playwright | test-456 |
   ...

   ---

   <one ## section per entry as above>

   ---

   ## KG-Based Recommendations

   Based on KG analysis, the following requirements need test coverage:
   - UC1-S3: Generate test entity linked to requirement via KG
   - UC1-E2a: Create PBT test for edge case coverage

   ## How to Run These Tests

   For **BROWSER** tests: install Playwright and run via KG-tracked test entities
   For **KG** recommendations: follow KG relationship suggestions
   \`\`\`

8. **Update KG with final results**

   \`\`\`typescript
   // Update overall test metrics in KG
   await updateTestMetricsInKG(kgInterface, {
     totalTests: testResults.length,
     passedTests: passedCount,
     failedTests: failedCount,
     coveragePercentage: coveragePercentage,
     kgEntitiesCreated: newEntitiesCount,
     kgRelationshipsUpdated: newRelationshipsCount
   });

   // Persist all KG changes
   await kgInterface.execute('kg:persist', {});
   \`\`\`

**KG Integration Guidelines**

1. **Always query KG first** - Use KG to understand current test state
2. **Track all test execution** - Record test runs as KG events
3. **Update KG with results** - Keep KG in sync with reality
4. **Use KG for intelligent decisions** - Let KG guide test selection and execution
5. **Maintain KG relationships** - Ensure all changes are properly tracked

**KG-Specific Features**

1. **Intelligent Test Selection**:
   - Uses KG to find which tests exist and their relationships
   - Prioritizes tests based on KG coverage gaps
   - Avoids running tests that don't exist in KG

2. **Real-time KG Updates**:
   - Updates test status in KG as tests run
   - Records test execution as KG events
   - Tracks test results and coverage in KG

3. **Enhanced Test Discovery**:
   - Uses KG relationships to find related tests
   - Maps test failures to KG entities for tracking
   - Provides KG-based test recommendations

4. **Complete Execution History**:
   - Records all test runs as KG events
   - Tracks test evolution over time
   - Maintains complete audit trail

**Benefits of KG Integration**

1. **Intelligent Execution** - Uses KG to decide what to test
2. **Complete Tracking** - All test activity tracked in KG
3. **Real-time Updates** - KG stays in sync with test execution
4. **Enhanced Discovery** - Finds tests and relationships via KG
5. **Audit Trail** - Complete history of test execution
6. **Relationship Management** - Maintains all test relationships

**Example KG Queries After Execution**

```typescript
// Find failing tests via KG
const failingTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { isFailing: true, changeId: 'add-user-auth' }
  }
});

// Get test execution history
const testRuns = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestRun',
    properties: { changeId: 'add-user-auth' }
  }
});

// Find tests that need attention
const flakyTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: {
      changeId: 'add-user-auth',
      'metadata.flaky': true
    }
  }
});
```

**Error Handling**

If KG operations fail:
- Falls back to standard test execution
- Provides clear error messages
- Suggests KG re-initialization if needed
- Continues with available data

**Performance Optimization**

- Batch KG operations when possible
- Cache frequently accessed test entities
- Limit queries to relevant test entities
- Provide progress indicators for large test suites

This comprehensive KG integration ensures that test execution is intelligent, traceable, and fully integrated with the Knowledge Graph, providing valuable insights into test execution and maintaining complete test execution history.