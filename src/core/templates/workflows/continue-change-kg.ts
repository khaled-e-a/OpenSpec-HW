/**
 * Knowledge Graph Integrated Continue Change Workflow
 *
 * Enhanced version of continue-change that updates KG when artifacts are created
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';

/**
 * Get KG-integrated continue change skill template
 */
export function getContinueChangeKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-continue-change-kg',
    description: 'Continue working on an SynergySpec change with KG tracking. Creates next artifact and updates knowledge graph.',
    instructions: `Continue working on a change by creating the next artifact with KG tracking.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes sorted by most recently modified. Then use the **AskUserQuestion tool** to let the user select which change to work on.

   Present the top 3-4 most recently modified changes as options, showing:
   - Change name
   - Schema (from \`schema\` field if present, otherwise "spec-driven")
   - Status (e.g., "0/5 tasks", "complete", "no tasks")
   - How recently it was modified (from \`lastModified\` field)

   Mark the most recently modified change as "(Recommended)" since it's likely what the user wants to continue.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check current status and KG state**
   \`\`\`bash
   synergyspec-hw status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand current state. The response includes:
   - \`schemaName\`: The workflow schema being used (e.g., "spec-driven")
   - \`artifacts\`: Array of artifacts with their status ("done", "ready", "blocked")
   - \`isComplete\`: Boolean indicating if all artifacts are complete

3. **Get KG traceability for the change**
   Use KG tool to get current traceability:
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const traceResult = await kgInterface.execute('kg:get-change-traceability', {
     changeId: "<name>"
   });
   \`\`\`
   This provides:
   - useCaseSteps: Current use case steps
   - requirements: Current requirements
   - testCases: Current test cases
   - codeFiles: Current code files
   - coverage: Overall coverage percentage

4. **Act based on status**:

   ---

   **If all artifacts are complete (\`isComplete: true\`)**:
   - Update KG status to reflect completion
   - Congratulate the user
   - Show final status including KG traceability
   - Suggest: "All artifacts created! You can now implement this change or archive it."
   - STOP

   ---

   **If artifacts are ready to create** (status shows artifacts with \`status: "ready"\`):
   - Pick the FIRST artifact with \`status: "ready"\` from the status output
   - Get its instructions:
     \`\`\`bash
     synergyspec-hw instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - Parse the JSON. The key fields are:
     - \`context\`: Project background (constraints for you - do NOT include in output)
     - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
     - \`template\`: The structure to use for your output file
     - \`instruction\`: Schema-specific guidance
     - \`outputPath\`: Where to write the artifact
     - \`dependencies\`: Completed artifacts to read for context
   - **Read dependency artifacts for context**:
     - For each dependency, check if it exists in KG
     - Use KG to get entity information if needed
   - **Create the artifact file**:
     - Use \`template\` as the structure - fill in its sections
     - Apply \`context\` and \`rules\` as constraints when writing - but do NOT copy them into the file
     - Write to the output path specified in instructions
   - **Update KG with created artifact**:
     \`\`\`typescript
     // Create artifact entity
     const artifactResult = await kgInterface.execute('kg:create-entity', {
       entity: {
         id: "<changeId>-<artifactType>",
         type: '<artifactType>', // e.g., 'Spec', 'DesignDoc', 'Artifact'
         name: '<artifactName>',
         status: 'active',
         filePath: '<outputPath>',
         changeId: "<changeId>",
         createdAt: new Date()
       }
     });

     // Create relationship to change
     await kgInterface.execute('kg:create-relationship', {
       sourceId: "<changeId>",
       relationshipType: 'hasArtifact',
       targetId: artifactResult.entityId,
       properties: { role: '<artifactType>', createdAt: new Date() }
     });
     \`\`\`
   - **Extract and create entities from artifact content**:
     \`\`\`typescript
     // Extract entities from content (requirements, use cases, etc.)
     const extracted = await extractEntitiesFromArtifact(
       projectRoot,
       changeId,
       artifactResult.entityId,
       createdContent,
       artifactType
     );
     \`\`\`
   - Show what was created and what's now unlocked
   - Update KG traceability
   - STOP after creating ONE artifact

   ---

   **If no artifacts are ready (all blocked)**:
   - Show status and suggest checking for issues
   - Check KG for any missing dependencies

5. **Show updated status and KG summary**
   \`\`\`bash
   synergyspec-hw status --change "<name>"
   \`\`\`

   Also show KG summary:
   \`\`\`typescript
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

**Output**

After each invocation, show:
- Which artifact was created
- Schema workflow being used
- Current progress (N/M complete)
- KG traceability update
- What artifacts are now unlocked
- Prompt: "Want to continue? Just ask me to continue or tell me what to do next."

**KG Integration Guidelines**

1. **Always check KG availability first**:
   \`\`\`typescript
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   if (!kgSummary.summary?.enabled) {
     console.log('KG not available, continuing without traceability...');
     // Continue with non-KG implementation
   }
   \`\`\`

2. **Create entities for all artifacts**:
   - Every artifact file should have a corresponding KG entity
   - Use appropriate entity types (Spec, DesignDoc, Artifact)
   - Link artifacts to their parent change

3. **Extract structured data from artifacts**:
   - Parse requirements from specs/
   - Parse use cases from usecases.md
   - Parse tasks from tasks.md
   - Create corresponding KG entities
   - Maintain traceability links

4. **Update status in KG**:
   - Mark artifacts as 'active' when created
   - Update metadata with creation details
   - Track relationships between entities

5. **Persist after changes**:
   - Always call kg:persist after making changes
   - This ensures changes are saved to disk

**Error Handling**

If KG operations fail:
1. Log warning but continue with artifact creation
2. Don't let KG failures block the workflow
3. Provide clear feedback about what succeeded/failed
4. Suggest re-running if KG becomes available

**Example Integration**

Here's how the workflow integrates KG when creating a spec artifact:

\`\`\`typescript
// 1. Create the spec artifact entity
const specEntity = {
  id: `${changeId}-specs`,
  type: 'Spec',
  name: 'Specifications',
  status: 'active',
  filePath: outputPath,
  changeId,
  capability: 'change-specs',
  specType: 'new'
};

const specResult = await kgInterface.execute('kg:create-entity', {
  entity: specEntity
});

// 2. Link to change
await kgInterface.execute('kg:create-relationship', {
  sourceId: changeId,
  relationshipType: 'hasArtifact',
  targetId: specResult.entityId
});

// 3. Extract requirements from content
const requirements = parseRequirements(content);
for (const req of requirements) {
  const reqResult = await kgInterface.execute('kg:create-entity', {
    entity: req
  });

  // Link requirement to spec
  await kgInterface.execute('kg:create-relationship', {
    sourceId: specResult.entityId,
    relationshipType: 'hasRequirement',
    targetId: reqResult.entityId
  });
}

// 4. Persist changes
await kgInterface.execute('kg:persist', {});
\`\`\``,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI and KG support.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

/**
 * Get KG-integrated continue command template
 */
export function getOpsxContinueKGCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Continue with KG',
    description: 'Continue working on a change with KG tracking - creates next artifact and updates knowledge graph',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'kg', 'traceability'],
    content: `Continue working on a change by creating the next artifact with KG tracking.

** Input **: Optionally specify a change name after \`/synspec:continue\` (e.g., \`/synspec:continue add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${getContinueChangeKGSkillTemplate().instructions}`,
  };
}

/**
 * Helper to extract entities from artifact content
 */
async function extractEntitiesFromArtifact(
  projectRoot: string,
  changeId: string,
  artifactId: string,
  content: string,
  artifactType: string
): Promise<{
  success: boolean;
  entities: any[];
  relationships: any[];
}> {
  // This would be implemented to parse different artifact types
  // and extract structured entities (requirements, use cases, tasks, etc.)
  // For now, return empty - real implementation would parse content
  return {
    success: true,
    entities: [],
    relationships: []
  };
}