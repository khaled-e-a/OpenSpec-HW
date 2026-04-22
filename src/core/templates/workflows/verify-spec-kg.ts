/**
 * Knowledge Graph Integrated Verify Spec Workflow
 *
 * Enhanced version of verify-spec that checks KG connectivity
 * instead of manual traceability matrices
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';
import {
  parseUseCases,
  parseUseCaseSteps,
  parseRequirements,
  parseTasks,
  extractArtifactMetadata
} from '../../kg/content-parser.js';

/**
 * Get KG-integrated verify spec skill template
 */
export function getVerifySpecKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-verify-spec-kg',
    description: 'Verify KG connectivity and traceability across all artifacts. Use when the user wants to audit KG relationships and ensure all documents are properly connected.',
    instructions: `Verify KG connectivity and traceability across all artifacts for a change.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check KG availability and get change state**
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

   If KG is not available:
   - Show message: "KG not available, falling back to manual traceability verification"
   - Suggest: "Run standard /synspec:verify-spec for manual verification"
   - Return early

3. **Get change traceability from KG**
   \`\`\`typescript
   const traceResult = await kgInterface.execute('kg:get-change-traceability', {
     changeId: "<name>"
   });
   \`\`\`
   This provides the current KG state including entities and relationships.

4. **Load artifacts to compare with KG state**
   \`\`\`bash
   synergyspec-hw instructions apply --change "<name>" --json
   \`\`\`

   From the returned \`contextFiles\`, read:
   - \`usecases.md\` — parse use cases and steps
   - \`specs/**/*.md\` — parse requirements
   - \`design.md\` — parse design decisions
   - \`tasks.md\` — parse tasks

5. **Parse content and extract ground truth**

   a. **Parse usecases.md**:
      \`\`\`typescript
      const useCases = parseUseCases(usecasesContent);
      const useCaseSteps = parseUseCaseSteps(usecasesContent);
      \`\`\`

      Extract all use cases and steps with their exact IDs and descriptions.

   b. **Parse specs/**/*.md**:
      \`\`\`typescript
      const requirements = parseRequirements(specContent);
      \`\`\`

      Extract all requirements with their implements annotations.

   c. **Parse design.md**:
      \`\`\`typescript
      const designDecisions = parseDesignDecisions(designContent);
      \`\`\`

      Extract design decisions with their addresses annotations.

   d. **Parse tasks.md**:
      \`\`\`typescript
      const tasks = parseTasks(tasksContent);
      \`\`\`

      Extract all tasks with their addresses annotations.

6. **Verify KG connectivity**

   Compare parsed content with KG state:

   a. **Verify use case connectivity**:
      \`\`\`typescript
      // Check each use case exists in KG
      for (const uc of useCases) {
        const ucEntity = await kgInterface.execute('kg:get-entity', {
          entityId: `${changeId}-${uc.id}`
        });

        if (!ucEntity.success) {
          reportIssue(`Use case ${uc.id} not found in KG`);
        }
      }

      // Check each use case step exists in KG
      for (const step of useCaseSteps) {
        const stepEntity = await kgInterface.execute('kg:get-entity', {
          entityId: `${changeId}-${step.id}`
        });

        if (!stepEntity.success) {
          reportIssue(`Use case step ${step.id} not found in KG`);
        }

        // Verify step is linked to use case
        const stepRelationships = await kgInterface.execute('kg:get-relationships', {
          entityId: `${changeId}-${step.id}`,
          direction: 'in',
          relationshipTypes: ['hasStep']
        });

        if (stepRelationships.length === 0) {
          reportIssue(`Use case step ${step.id} not linked to any use case`);
        }
      }
      \`\`\`

   b. **Verify requirement connectivity**:
      \`\`\`typescript
      // Check each requirement exists in KG
      for (const req of requirements) {
        const reqEntity = await kgInterface.execute('kg:get-entity', {
          entityId: `${changeId}-${req.id}`
        });

        if (!reqEntity.success) {
          reportIssue(`Requirement ${req.id} not found in KG`);
          continue;
        }

        // Verify requirement implements correct use case steps
        const implementsRel = await kgInterface.execute('kg:get-relationships', {
          entityId: reqEntity.entity.id,
          direction: 'out',
          relationshipTypes: ['implements']
        });

        const implementedSteps = implementsRel.map(r => r.target.id);
        const expectedSteps = req.implements || [];

        for (const expectedStep of expectedSteps) {
          const stepId = `${changeId}-${expectedStep.split(' ')[0]}`;
          if (!implementedSteps.includes(stepId)) {
            reportIssue(`Requirement ${req.id} does not implement ${expectedStep}`);
          }
        }
      }
      \`\`\`

   c. **Verify design decision connectivity**:
      \`\`\`typescript
      // Check design decisions are linked to use case steps
      for (const decision of designDecisions) {
        const addressesRel = await kgInterface.execute('kg:get-relationships', {
          entityId: `${changeId}-${decision.id}`,
          direction: 'out',
          relationshipTypes: ['addresses']
        });

        const addressedSteps = addressesRel.map(r => r.target.id);
        const expectedSteps = decision.addresses || [];

        for (const expectedStep of expectedSteps) {
          const stepId = `${changeId}-${expectedStep.split(' ')[0]}`;
          if (!addressedSteps.includes(stepId)) {
            reportIssue(`Design decision ${decision.id} does not address ${expectedStep}`);
          }
        }
      }
      \`\`\`

   d. **Verify task connectivity**:
      \`\`\`typescript
      // Check tasks are linked to requirements
      for (const task of tasks) {
        const taskEntity = await kgInterface.execute('kg:get-entity', {
          entityId: `${changeId}-${task.id}`
        });

        if (!taskEntity.success) {
          reportIssue(`Task ${task.id} not found in KG`);
          continue;
        }

        // Verify task implements correct requirements
        const implementsRel = await kgInterface.execute('kg:get-relationships', {
          entityId: taskEntity.entity.id,
          direction: 'out',
          relationshipTypes: ['implements']
        });

        const implementedReqs = implementsRel.map(r => r.target.id);
        const expectedReqs = task.addresses || [];

        for (const expectedReq of expectedReqs) {
          const reqId = `${changeId}-${expectedReq}`;
          if (!implementedReqs.includes(reqId)) {
            reportIssue(`Task ${task.id} does not implement ${expectedReq}`);
          }
        }
      }
      \`\`\`

   e. **Verify artifact relationships**:
      \`\`\`typescript
      // Check all artifacts are linked to the change
      const artifactTypes = ['usecases', 'specs', 'design', 'tasks'];

      for (const artifactType of artifactTypes) {
        const artifactId = `${changeId}-${artifactType}`;

        // Check artifact exists
        const artifactEntity = await kgInterface.execute('kg:get-entity', {
          entityId: artifactId
        });

        if (!artifactEntity.success) {
          reportIssue(`${artifactType} artifact not found in KG`);
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
          reportIssue(`${artifactType} artifact not linked to change`);
        }
      }
      \`\`\`

7. **Generate verification report**

   \`\`\`typescript
   const report = {
     useCases: { total: useCases.length, missing: 0, unlinked: 0 },
     useCaseSteps: { total: useCaseSteps.length, missing: 0, unlinked: 0 },
     requirements: { total: requirements.length, missing: 0, unlinked: 0 },
     designDecisions: { total: designDecisions.length, missing: 0, unlinked: 0 },
     tasks: { total: tasks.length, missing: 0, unlinked: 0 },
     artifacts: { total: 4, missing: 0, unlinked: 0 },
     issues: []
   };
   \`\`\`

8. **Fix issues automatically where possible**

   For missing entities:
   \`\`\`typescript
   // Create missing use case
   if (!ucEntity.success) {
     await kgInterface.execute('kg:create-entity', {
       entity: {
         id: `${changeId}-${uc.id}`,
         type: 'UseCase',
         name: uc.title,
         primaryActor: uc.actor || 'User',
         goal: uc.goal || 'Complete task',
         level: uc.level || 'user',
         changeId: changeId
       }
     });

     // Link to change
     await kgInterface.execute('kg:create-relationship', {
       sourceId: changeId,
       relationshipType: 'hasArtifact',
       targetId: `${changeId}-${uc.id}`,
       properties: { role: 'usecase', createdAt: new Date() }
     });
   }
   \`\`\`

   For missing relationships:
   \`\`\`typescript
   // Create missing implements relationship
   await kgInterface.execute('kg:create-relationship', {
     sourceId: `${changeId}-${req.id}`,
     relationshipType: 'implements',
     targetId: `${changeId}-${stepId}`,
     properties: {
       reference: expectedStep,
       createdAt: new Date()
     }
   });
   \`\`\`

9. **Show final verification report**

   \`\`\`
   ## KG Traceability Verification Report: <change-name>

   ### Knowledge Graph State
   - Use cases: N entities, M relationships
   - Requirements: N entities, M relationships
   - Design decisions: N entities, M relationships
   - Tasks: N entities, M relationships
   - Overall coverage: X%

   ### Verification Results
   - Missing entities: X (auto-fixed)
   - Missing relationships: Y (auto-fixed)
   - Unlinked artifacts: Z (auto-fixed)
   - Remaining issues: [list]

   ### Result
   All KG traceability is now consistent. ✓
   — or —
   Could not fully resolve: <list remaining issues>

   KG traceability is now available for querying and analysis.
   \`\`\`

10. **Persist KG changes**
    \`\`\`typescript
    await kgInterface.execute('kg:persist', {});
    \`\`\`

**Output**

Show:
- Detailed verification results
- Number of issues found and fixed
- Final KG state summary
- Suggestions for any remaining manual fixes
- Prompt to run other commands or query KG

**Example Output**

\`\`\`
## KG Traceability Verification Report: add-user-auth

### Knowledge Graph State
- Use cases: 3 entities, 12 relationships
- Requirements: 8 entities, 12 relationships
- Design decisions: 5 entities, 8 relationships
- Tasks: 12 entities, 15 relationships
- Overall coverage: 100%

### Verification Results
- Missing entities: 0
- Missing relationships: 0
- Unlinked artifacts: 0
- Phantom references: 0
- Inaccurate descriptions: 0

### Result
All KG traceability is consistent. ✓

KG is ready for implementation phase.
Run /synspec:apply to implement tasks with KG tracking.
\`\`\`",
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI and KG support.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

/**
 * Get KG-integrated verify spec command template
 */
export function getOpsxVerifySpecKGCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Verify Spec with KG',
    description: 'Verify KG connectivity and traceability across all artifacts',
    category: 'Workflow',
    tags: ['workflow', 'verify', 'traceability', 'kg', 'audit'],
    content: `Verify KG connectivity and traceability across all artifacts for a change.

**Input**: Optionally specify a change name after \`/synspec:verify-spec-kg\` (e.g., \`/synspec:verify-spec-kg add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${getVerifySpecKGSkillTemplate().instructions}`,
  };
}