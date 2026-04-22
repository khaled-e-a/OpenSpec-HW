/**
 * Knowledge Graph Integrated TDD Workflow
 *
 * Enhanced version of TDD workflow that updates KG with code and test information
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';
import { extractArtifactMetadata } from '../../kg/content-parser.js';

/**
 * Get KG-integrated TDD skill template
 */
export function getTddKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-tdd-kg',
    description: 'Implement tasks using red-green-refactor TDD with KG tracking. Updates knowledge graph with code and test information as you implement.',
    instructions: `Implement tasks from an SynergySpec change using red-green-refactor TDD with KG tracking.

**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **Select the change and initialize KG**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`synergyspec-hw list--json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/synergyspec: tdd <other>\`).

   Initialize KG interface:
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   \`\`\`

2. **Check status and get KG state**
   \`\`\`bash
   synergyspec-hw status--change "<name>" --json
   synergyspec-hw instructions apply--change "<name>" --json
   \`\`\`

   Also check KG traceability:
   \`\`\`typescript
   const traceResult = await kgInterface.execute('kg:get-change-traceability', {
     changeId: "<name>"
   });
   \`\`\`

   Handle states identically to apply-change:
   - If \`state: "blocked"\` (missing artifacts): show message, suggest \` /synspec: continue\`
   - If \`state: "all_done"\`: congratulate, suggest \` /synspec: gen - tests\`
   - Otherwise: proceed to implementation

3. **Read context files and KG entities**

   Read all files listed in \`contextFiles\` from the apply instructions output
   (typically: proposal, usecases, specs, design, tasks).

   Also read KG entities for context:
   \`\`\`typescript
   const requirements = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'Requirement',
       properties: { changeId: "<name>" }
     }
   });

   const tasks = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'Task',
       properties: { changeId: "<name>" }
     }
   });
   \`\`\`

4. **Show current progress with KG info**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - KG coverage: "X% requirements covered by tests"
   - Remaining tasks overview
   - Dynamic instruction from CLI

5. **For each pending task — red-green-refactor with KG tracking**

   For each task with \`- [ ]\` (unchecked):

   a. **Create failing test with KG metadata**
      \`\`\`typescript
      // Create test entity in KG
      const testEntity = {
        id: \`\${changeId}-test-\${task.id}\`,
        type: 'TestCase',
        name: \`Test: \${task.description}\`,
        framework: 'vitest', // or detected from project
        testType: 'unit',
        isFailing: true,
        filePath: \`src/__tests__/\${task.id}.test.ts\`,
        changeId: changeId,
        createdAt: new Date(),
        status: 'active'
      };

      const testResult = await kgInterface.execute('kg:create-entity', {
        entity: testEntity
      });

      // Link test to requirement
      if (task.addresses && task.addresses.length > 0) {
        for (const reqRef of task.addresses) {
          await kgInterface.execute('kg:create-relationship', {
            sourceId: testResult.entityId,
            relationshipType: 'tests',
            targetId: \`\${changeId}-\${reqRef}\`,
            properties: {
              testType: 'unit',
              coversTask: true,
              createdAt: new Date()
            }
          });
        }
      }
      \`\`\`

   b. **Implement minimal code to pass test**
      - Write minimal production code
      - Update KG with code entity:
        \`\`\`typescript
        const codeEntity = {
          id: \`\${changeId}-code-\${task.id}\`,
          type: 'CodeFile',
          name: \`Implementation for \${task.description}\`,
          status: 'active',
          filePath: \`src/\${task.id}.ts\`,
          changeId: changeId,
          createdAt: new Date(),
          language: 'typescript',
          complexity: 1 // Will be updated
        };

        await kgInterface.execute('kg:create-entity', {
          entity: codeEntity
        });

        // Link code to task
        await kgInterface.execute('kg:create-relationship', {
          sourceId: task.id,
          relationshipType: 'implementedBy',
          targetId: codeEntity.id,
          properties: {
            implementationDate: new Date(),
            implementationType: 'tdd'
          }
        });
        \`\`\`

   c. **Update task status in KG**
      \`\`\`typescript
      // Update task status
      await kgInterface.execute('kg:update', {
        id: task.id,
        updates: {
          status: 'completed',
          completedAt: new Date(),
          implementationMethod: 'tdd'
        }
      });
      \`\`\`

   d. **Track TDD cycle in KG**
      \`\`\`typescript
      // Create TDD cycle event
      const tddEvent = {
        id: \`tdd-\${changeId}-\${task.id}-\${Date.now()}\`,
        type: 'TDDEvent',
        timestamp: new Date(),
        outcome: 'success',
        duration: Date.now() - startTime, // milliseconds
        metadata: {
          cycle: 'red-green-refactor',
          taskId: task.id,
          testPassed: true,
          codeWritten: true,
          refactored: false
        }
      };

      await kgInterface.execute('kg:create-entity', {
        entity: tddEvent
      });
      \`\`\`

6. **Update KG with implementation metadata**

   After each task:
   \`\`\`typescript
   // Update code complexity
   const complexity = calculateComplexity(codeContent);
   await kgInterface.execute('kg:update', {
     id: codeEntity.id,
     updates: {
       complexity: complexity,
       linesOfCode: codeContent.split('\\n').length,
       testCoverage: calculateCoverage(testContent, codeContent)
     }
   });
   \`\`\`

7. **Show progress and KG updates**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - KG updates: "Created test entity for task X"
   - Coverage improvement: "Coverage now X%"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

8. **Persist KG changes**

   \`\`\`typescript
   await kgInterface.execute('kg:persist', {});
   \`\`\`

**KG Integration Guidelines**

1. **Create entities for all artifacts**:
   - Tests get TestCase entities
   - Code gets CodeFile entities
   - Track metadata like complexity and coverage

2. **Maintain traceability**:
   - Link tests to requirements they test
   - Link code to tasks that implement them
   - Track implementation method (TDD)

3. **Track implementation progress**:
   - Update task status in KG
   - Record TDD cycles as events
   - Track time spent on each task

4. **Update coverage metrics**:
   - Calculate test coverage
   - Track which requirements are tested
   - Update overall change coverage

5. **Persist after changes**:
   - Always persist after major updates
   - Batch operations when possible

**TDD-Specific KG Updates**

For each red-green-refactor cycle:
1. **RED**: Create failing test entity
2. **GREEN**: Create passing test, link to code, update task
3. **REFACTOR**: Update code entity with new complexity

**Output During Implementation**

\`\`\`
## TDD: <change-name> (schema: <schema-name>)

Task 3/7: <task description>
"#ffcccc" RED   — wrote failing test \`test/auth.test.ts:45\` (KG entity created)
"#ccffcc" GREEN — implemented \`src/auth/login.ts\` (KG entity created)
"#ccccff" REFACTOR — extracted \`validateCredentials()\` helper (KG updated)
✓ Task 3 complete (KG status updated)

KG Coverage: 85% → 92%

Task 4/7: <task description>
...
\`\`\`

**Benefits of KG Integration**

1. **Automatic tracking** - No manual updates needed
2. **Full traceability** - Code ↔ Test ↔ Requirement links
3. **Progress visibility** - Real-time coverage and status
4. **Implementation history** - TDD cycles recorded as events
5. **Queryable metrics** - Easy to analyze implementation patterns

**Error Handling**

If KG operations fail:
- Log warnings but continue with TDD
- Don't let KG failures block implementation
- Provide fallback to non-KG behavior
- Clear error messages for debugging`,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI and KG support.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

/**
 * Get KG-integrated TDD command template
 */
export function getOpsxTddKGCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: TDD with KG',
    description: 'Implement tasks using red-green-refactor TDD with KG tracking - updates knowledge graph with code and test information',
    category: 'Workflow',
    tags: ['workflow', 'tdd', 'test', 'red-green-refactor', 'kg', 'traceability'],
    content: `Implement tasks using red-green-refactor TDD with KG tracking. Updates the knowledge graph with code and test information as you implement.

** Input **: Optionally specify a change name after \`/synspec:tdd-kg\` (e.g., \`/synspec:tdd-kg add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${getTddKGSkillTemplate().instructions}`,
  };
}