/**
 * Knowledge Graph Integrated Apply Change Workflow
 *
 * Enhanced version of apply-change that updates KG with implementation progress
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';
import { extractArtifactMetadata } from '../../kg/content-parser.js';

/**
 * Get KG-integrated apply change skill template
 */
export function getApplyChangeKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-apply-change-kg',
    description: 'Implement tasks from an SynergySpec change with KG tracking. Updates knowledge graph with implementation progress and code artifacts.',
    instructions: `Implement tasks from an SynergySpec change with KG tracking.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change and initialize KG**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`synergyspec-hw list --json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/synspec:apply <other>\`).

   Initialize KG interface:
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   \`\`\`

2. **Check status and get KG state**
   \`\`\`bash
   synergyspec-hw status --change "<name>" --json
   synergyspec-hw instructions apply--change "<name>" --json
   \`\`\`

   Also check KG traceability:
   \`\`\`typescript
   const traceResult = await kgInterface.execute('kg:get-change-traceability', {
     changeId: "<name>"
   });
   \`\`\`

   Handle states identically to apply-change:
   - If \`state: "blocked"\` (missing artifacts): show message, suggest using synergyspec-continue-change
   - If \`state: "all_done"\`: congratulate, suggest archive
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

   const codeFiles = await kgInterface.execute('kg:query', {
     query: {
       entityType: 'CodeFile',
       properties: { changeId: "<name>" }
     }
   });
   \`\`\`

4. **Show current progress with KG info**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - KG coverage: "X% requirements implemented"
   - Code entities: "Y code files in KG"
   - Remaining tasks overview
   - Dynamic instruction from CLI

5. **Implement tasks with KG tracking (loop until done or blocked)**

   For each task with \`- [ ]\` (unchecked):

   a. **Show task context from KG**
      \`\`\`typescript
       // Get task details from KG
       const taskEntity = await kgInterface.execute('kg:get-entity', {
         entityId: task.id
       });

       // Get related requirements
       const taskReqs = await kgInterface.execute('kg:get-relationships', {
         entityId: task.id,
         direction: 'out',
         relationshipTypes: ['implements']
       });

       console.log(\`Task: \${task.description}\`);
       console.log(\`Implements \${taskReqs.length} requirements\`);
       if (taskEntity.entity.estimatedEffort) {
         console.log(\`Estimated effort: \${taskEntity.entity.estimatedEffort} hours\`);
       }
      \`\`\`

   b. **Create code entity in KG before implementation**
      \`\`\`typescript
      // Create or update code entity
      const codeEntity = {
        id: \`\${changeId}-code-\${task.id}\`,
        type: 'CodeFile',
        name: \`Implementation for \${task.description}\`,
        status: 'in_progress',
        filePath: \`src/\${task.id}.ts\`, // Will be updated with actual path
        changeId: changeId,
        createdAt: new Date(),
        language: 'typescript',
        complexity: 1, // Initial estimate
        estimatedLines: 50 // Initial estimate
      };

      const codeResult = await kgInterface.execute('kg:create-entity', {
        entity: codeEntity
      });

      // Link code to task
      await kgInterface.execute('kg:create-relationship', {
        sourceId: task.id,
        relationshipType: 'implementedBy',
        targetId: codeResult.entityId,
        properties: {
          implementationDate: new Date(),
          implementationType: 'direct',
          startedAt: new Date()
        }
      });
      \`\`\`

   c. **Implement the code changes**
      - Make the code changes required by the task
      - Follow existing patterns and style
      - Keep changes minimal and focused

   d. **Update KG with implementation results**
      \`\`\`typescript
       // Extract metadata from implemented code
       const metadata = extractArtifactMetadata(codeContent, 'code');

       // Update code entity with actual implementation
       await kgInterface.execute('kg:update', {
         id: codeResult.entityId,
         updates: {
           status: 'active',
           complexity: calculateComplexity(codeContent),
           linesOfCode: codeContent.split('\\n').length,
           testCoverage: estimateCoverage(codeContent),
           metadata: metadata,
           completedAt: new Date()
         }
       });

       // Create implementation event
       const implEvent = {
         id: \`impl-\${changeId}-\${task.id}-\${Date.now()}\`,
         type: 'ImplementationEvent',
         timestamp: new Date(),
         outcome: 'success',
         duration: Date.now() - startTime,
         metadata: {
           taskId: task.id,
           implementationMethod: 'direct',
           linesAdded: linesAdded,
           filesModified: filesModified
         }
       };

       await kgInterface.execute('kg:create-entity', {
         entity: implEvent
       });
      \`\`\`

   e. **Update task status in KG**
      \`\`\`typescript
       // Update task status and metrics
       await kgInterface.execute('kg:update', {
         id: task.id,
         updates: {
           status: 'completed',
           completedAt: new Date(),
           actualEffort: actualHours, // if tracked
           implementationMethod: 'direct'
         }
       });
      \`\`\`

   f. **Update implementation progress in KG**
      \`\`\`typescript
       // Calculate and update overall progress
       const progressUpdate = {
         id: \`progress-\${changeId}-\${Date.now()}\`,
         type: 'ProgressEvent',
         timestamp: new Date(),
         outcome: 'success',
         metadata: {
           completedTasks: completedTasks,
           totalTasks: totalTasks,
           progressPercentage: Math.round((completedTasks / totalTasks) * 100),
           requirementsImplemented: requirementsImplemented
         }
       };

       await kgInterface.execute('kg:create-entity', {
         entity: progressUpdate
       });
      \`\`\`

6. **Show progress and KG updates**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - KG updates: "Created code entity for task X"
   - Implementation metrics: "Added Y lines of code"
   - Coverage improvement: "Implemented Z requirements"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

7. **Update overall change progress in KG**

   After each task or session:
   \`\`\`typescript
   // Update change entity with overall progress
   await kgInterface.execute('kg:update', {
     id: changeId,
     updates: {
       status: allTasksDone ? 'completed' : 'in_progress',
       updatedAt: new Date(),
       progressPercentage: Math.round((completedTasks / totalTasks) * 100),
       implementationComplete: allTasksDone
     }
   });
   \`\`\`

8. **Persist KG changes**

   \`\`\`typescript
   await kgInterface.execute('kg:persist', {});
   \`\`\`

**KG Integration Guidelines**

1. **Track all implementation artifacts**:
   - Code files get CodeFile entities
   - Track complexity, lines of code, test coverage
   - Link code to implementing tasks

2. **Maintain implementation traceability**:
   - Link code to requirements it implements
   - Track which tasks implement which requirements
   - Record implementation events for history

3. **Track implementation progress**:
   - Update task status and completion time
   - Track actual vs estimated effort
   - Record implementation method used

4. **Update coverage and metrics**:
   - Calculate test coverage for code
   - Track which requirements are implemented
   - Update overall change progress

5. **Track implementation events**:
   - Record when implementation starts/ends
   - Track time spent on each task
   - Record major implementation decisions

**Implementation-Specific KG Updates**

For each task implementation:
1. **Before**: Create code entity, link to task
2. **During**: Update progress, track time
3. **After**: Update with final metrics, mark complete
4. **Events**: Record implementation events

**Output During Implementation**

\`\`\`
## Apply: <change-name> (schema: <schema-name>)

Task 3/7: <task description>
✓ Created code entity in KG
✓ Implementation complete
✓ Updated task status in KG
✓ KG coverage: 85% → 92%

KG Progress: 3/7 tasks complete (42%)

Task 4/7: <task description>
...
\`\`\`

**Benefits of KG Integration**

1. **Automatic progress tracking** - No manual updates needed
2. **Full implementation traceability** - Code ↔ Task ↔ Requirement links
3. **Real-time metrics** - Coverage, complexity, progress visible
4. **Implementation history** - Complete audit trail
5. **Performance insights** - Time tracking and effort analysis

**Implementation Patterns**

The KG tracks different implementation patterns:
- **Direct implementation** - Code implements task directly
- **Test-driven** - Code created via TDD process
- **Refactoring** - Code modified during refactoring
- **Bug fix** - Code changed to fix issues

**Error Handling**

If KG operations fail:
- Log warnings but continue with implementation
- Don't let KG failures block progress
- Provide fallback to non-KG behavior
- Clear error messages for debugging

**Performance Optimization**

- Batch KG operations when possible
- Update KG after major operations, not every line
- Cache frequently accessed entities
- Minimize individual tool calls during hot paths`