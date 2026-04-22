/**
 * Knowledge Graph Integrated Gen Tests Workflow
 *
 * Enhanced version of gen-tests that queries KG for test generation
 * and updates KG with generated tests and test tracking
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';
import { extractArtifactMetadata } from '../../kg/content-parser.js';

/**
 * Get KG-integrated gen tests skill template
 */
export function getGenTestsKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-gen-tests-kg',
    description: 'Generate tests with KG integration - queries KG for test generation, updates KG with tests, and maintains test traceability.',
    instructions: `Generate tests with KG integration - queries KG for test generation, updates KG with tests, and maintains test traceability.

**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Only show changes that have a spec artifact. **NEVER auto-select**.

2. **Check KG availability and initialize**
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

   If KG is not available:
   - Show message: "KG not available, falling back to standard test generation"
   - Continue with standard gen-tests workflow
   - Note KG limitations in final report

3. **Load artifacts and KG entities**
   \`\`\`bash
   synergyspec-hw instructions apply --change "<name>" --json
   \`\`\`

   From \`contextFiles\`, find and read \`usecases.md\` (and any spec files in \`synergyspec/changes/<name>/specs/\`).

   Also query KG for existing entities:
   \`\`\`typescript
   // Get existing implementation entities
     const codeFiles = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'CodeFile',
         properties: { changeId: "<name>" }
       }
     });

     const existingTests = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'TestCase',
         properties: { changeId: "<name>" }
       }
     });

     const implementationEvents = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'ImplementationEvent',
         properties: { changeId: "<name>" }
       }
     });
   \`\`\`

4. **Create empty spec-tests.md file with KG tracking**

   Create an empty file at \`synergyspec/changes/<name>/spec-tests.md\`.

   The file contains KG-enhanced sections:
   - \`# Spec-Test Mapping: <change-name>\`
   - \`## KG Test Entities\` - Track test entities in KG
   - \`## Use Case ID Mapping\`
   - \`## Requirement Traceability Matrix\` - Enhanced with KG entity IDs
   - \`## Use Case Details\`
   - \`### Main Scenario\`
   - \`### Extensions\`
   - \`### Full Flow Tests\`
   - \`### KG Test Coverage\` - Track KG test entities

5. **Extract spec-to-usecase mapping from KG**

   Parse all spec files to extract:
   - Requirement ID (R1, R2, etc.)
   - "**Implements**" references (UC1-S1, UC1-E2a, etc.)
   - WHEN/THEN scenarios

   Also extract from KG entities:
   \`\`\`typescript
   // Get requirements and their KG IDs
     const requirements = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'Requirement',
         properties: { changeId: "<name>" }
       }
     });

     // Get use case steps from KG
     const useCaseSteps = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'UseCaseStep',
         properties: { changeId: "<name>" }
       }
     });

     // Build mapping with KG entity IDs
     const kgMapping = {};
     for (const req of requirements.entities) {
       kgMapping[req.id] = {
         ...req,
         kgEntityId: req.id,
         implements: req.implements || []
       };
     }
   \`\`\`

6. **Discover existing tests via KG**

   Enhanced test discovery using KG:
   \`\`\`typescript
   // Query existing tests from KG
     const existingTests = await kgInterface.execute('kg:query', {
       query: {
         entityType: 'TestCase',
         properties: { changeId: "<name>" }
       }
     });

     // Map tests to requirements using KG relationships
     for (const test of existingTests.entities) {
       const testsReqs = await kgInterface.execute('kg:get-relationships', {
         entityId: test.id,
         direction: 'out',
         relationshipTypes: ['tests']
       });

       // Classify test by requirement scope
       const testType = classifyTestByScope(testsReqs.length);

       // Add to mapping with KG entity ID
       testMapping[test.id] = {
         ...test,
         kgEntityId: test.id,
         testType: testType,
         coversRequirements: testsReqs.map(r => r.target.id),
         status: '✅'
       };
     }
   \`\`\`

7. **Generate missing tests with KG tracking**

   Enhanced test generation with KG updates:
   \`\`\`typescript
   // For each uncovered requirement/step
     for (const req of uncoveredRequirements) {
       // Create test entity in KG
       const testEntity = {
         id: \`\${changeId}-test-\${req.id}-\${Date.now()}\`,
         type: 'TestCase',
         name: \`Test: \${req.name}\`,
         framework: detectedFramework,
         testType: 'unit',
         isFailing: true,
         filePath: \`src/__tests__/\${req.id}.test.ts\`,
         changeId: changeId,
         createdAt: new Date(),
         status: 'active'
       };

       const testResult = await kgInterface.execute('kg:create-entity', {
         entity: testEntity
       });

       // Link test to requirement
       await kgInterface.execute('kg:create-relationship', {
         sourceId: testResult.entityId,
         relationshipType: 'tests',
         targetId: req.id,
         properties: {
           testType: 'unit',
           coversRequirement: true,
           createdAt: new Date()
         }
       });

       // Create test implementation event
       const testEvent: types.Event = {
         id: \`test-gen-\${changeId}-\${req.id}-\${Date.now()}\`,
         type: 'TestGenerationEvent',
         timestamp: new Date(),
         type: 'test_generation',
         outcome: 'success',
         metadata: {
           requirementId: req.id,
           testType: 'unit',
           framework: detectedFramework,
           generatedAt: new Date()
         }
       };

       await kgInterface.execute('kg:create-entity', {
         entity: testEvent
       });
     }
   \`\`\`

8. **Generate property-based tests with KG tracking**

   Enhanced PBT generation:
   \`\`\`typescript
   // For each WHEN/THEN scenario
     for (const scenario of scenarios) {
       // Create PBT test entity in KG
       const pbtEntity = {
         id: \`\${changeId}-pbt-\${scenario.id}-\${Date.now()}\`,
         type: 'TestCase',
         name: \`PBT: \${scenario.description}\`,
         framework: detectedFramework,
         testType: 'pbt',
         isFailing: false,
         filePath: \`test/\${scenario.id}.property.test.ts\`,
         changeId: changeId,
         createdAt: new Date(),
         status: 'active'
       };

       const pbtResult = await kgInterface.execute('kg:create-entity', {
         entity: pbtEntity
       });

       // Link PBT test to scenario
       await kgInterface.execute('kg:create-relationship', {
         sourceId: pbtResult.entityId,
         relationshipType: 'tests',
         targetId: scenario.id,
         properties: {
           testType: 'pbt',
           isPropertyBased: true,
           createdAt: new Date()
         }
       });

       // Create PBT generation event
       const pbtEvent: types.Event = {
         id: \`pbt-gen-\${changeId}-\${scenario.id}-\${Date.now()}\`,
         type: 'PBTGenerationEvent',
         timestamp: new Date(),
         type: 'pbt_generation',
         outcome: 'success',
         metadata: {
           scenarioId: scenario.id,
           framework: detectedFramework,
           generatedAt: new Date()
         }
       };

       await kgInterface.execute('kg:create-entity', {
         entity: pbtEvent
       });
     }
   \`\`\`

9. **Update spec-tests.md with KG tracking**

   Enhanced spec-tests.md with KG information:
   \`\`\`typescript
   // Add KG test entities section
   specTestsContent += '\\n## KG Test Entities\\n\\n';
   specTestsContent += '| Test ID | Name | Type | Status | KG Entity ID |\\n';
   specTestsContent += '|---------|------|------|--------|--------------|\\n';

   for (const test of allTests) {
     specTestsContent += \`| \${test.id} | \${test.name} | \${test.testType} | \${test.status} | \${test.kgEntityId} |\\n\`;
   }

   // Add KG test coverage section
   specTestsContent += '\\n## KG Test Coverage\\n\\n';
   specTestsContent += '| Requirement | Test Entities | Coverage |\\n';
   specTestsContent += '|-------------|---------------|----------|\\n';

   for (const req of requirements) {
     const reqTests = allTests.filter(t =>
       t.coversRequirements?.includes(req.id)
     );
     specTestsContent += \`| \${req.name} | \${reqTests.length} | \${reqTests.length > 0 ? '✅' : '❌'} |\\n\`;
   }
   \`\`\`

10. **Persist KG changes and generate summary**

    \`\`\`typescript
    // Persist all KG changes
    await kgInterface.execute('kg:persist', {});

    // Generate summary with KG metrics
    const summary = {
      totalTests: allTests.length,
      kgEntitiesCreated: generatedTests.length,
      kgRelationshipsCreated: generatedTests.length * 2, // tests + relationships
      pbtTestsGenerated: pbtTests.length,
      coverage: calculateCoverage(requirements, allTests)
     };

    return summary;
   \`\`\`

**KG Integration Guidelines**

1. **Always check KG first** - Verify KG availability before proceeding
2. **Use KG as ground truth** - Prefer KG data over file parsing when available
3. **Create KG entities for all tests** - Every test gets a TestCase entity
4. **Maintain traceability** - Link tests to requirements they verify
5. **Track generation events** - Record when tests are generated
6. **Update KG after changes** - Always persist after major operations

**KG-Specific Features**

1. **Intelligent Test Discovery**:
   - Uses KG to find existing tests
   - Maps tests to requirements via KG relationships
   - Classifies tests by requirement scope using KG data

2. **Smart Test Generation**:
   - Generates tests based on KG requirement entities
   - Creates appropriate test entities in KG
   - Links tests to requirements they verify

3. **Enhanced Test Tracking**:
   - Tracks all tests as KG entities
   - Records test generation as events
   - Maintains complete test audit trail

4. **KG-Enhanced Mapping**:
   - Includes KG entity IDs in mapping
   - Tracks test coverage through KG
   - Provides KG-based test metrics

**Benefits of KG Integration**

1. **Complete Traceability** - All tests tracked in KG with relationships
2. **Intelligent Generation** - Uses KG to understand what to test
3. **Automatic Discovery** - Finds existing tests via KG relationships
4. **Enhanced Mapping** - KG provides structured test-to-spec mapping
5. **Audit Trail** - Complete record of test generation process
6. **Queryable Metrics** - Easy to analyze test coverage via KG

**Example KG Queries After Generation**

```typescript
// Find untested requirements
const untested = await verifyTestKGConnectivity(projectRoot, 'add-user-auth');

// Get all tests for a requirement
const reqTests = await kgInterface.execute('kg:get-relationships', {
  entityId: 'req-1',
  direction: 'in',
  relationshipTypes: ['tests']
});

// Find PBT tests
const pbtTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { testType: 'pbt' }
  }
});

// Analyze test generation patterns
const genEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestGenerationEvent',
    properties: { changeId: 'add-user-auth' }
  }
});
```

**Error Handling**

If KG operations fail:
- Falls back to standard test generation
- Provides clear error messages
- Suggests KG re-initialization if needed
- Continues with available data

**Performance Optimization**

- Batch KG operations when possible
- Cache frequently accessed entities
- Limit queries to relevant entities
- Provide progress indicators for large test suites

This comprehensive KG integration ensures that test generation is intelligent, traceable, and fully integrated with the Knowledge Graph, providing valuable insights into test coverage and test-to-specification relationships.