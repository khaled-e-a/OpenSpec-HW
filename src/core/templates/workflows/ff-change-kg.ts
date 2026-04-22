/**
 * Knowledge Graph Integrated Fast-Forward Change Workflow
 *
 * Enhanced version of ff-change that updates KG when all artifacts are created
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';

/**
 * Get KG-integrated fast-forward change skill template
 */
export function getFfChangeKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-ff-change-kg',
    description: 'Fast-forward through SynergySpec artifact creation with KG tracking. Creates all artifacts and updates knowledge graph in one go.',
    instructions: `Fast-forward through artifact creation with KG tracking - generate everything needed to start implementation in one go, updating the knowledge graph as you go.

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → \`add-user-auth\`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Create the change directory with KG initialization**
   \`\`\`bash
   synergyspec-hw new change "<name>"
   \`\`\`
   This creates a scaffolded change at \`synergyspec/changes/<name>/\` and initializes KG.

3. **Get the artifact build order and KG state**
   \`\`\`bash
   synergyspec-hw status --change "<name>" --json
   \`\`\`
   Parse the JSON to get:
   - \`applyRequires\`: array of artifact IDs needed before implementation (e.g., \`["tasks"]\`)
   - \`artifacts\`: list of all artifacts with their status and dependencies

   Also check KG state:
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

4. **Create artifacts in sequence with KG tracking**

   Use the **TodoWrite tool** to track progress through the artifacts.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is \`ready\` (dependencies satisfied)**:
      - Get instructions:
        \`\`\`bash
        synergyspec-hw instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - The instructions JSON includes:
        - \`context\`: Project background (constraints for you - do NOT include in output)
        - \`rules\`: Artifact-specific rules (constraints for you - do NOT include in output)
        - \`template\`: The structure to use for your output file
        - \`instruction\`: Schema-specific guidance for this artifact type
        - \`outputPath\`: Where to write the artifact
        - \`dependencies\`: Completed artifacts to read for context
      - Read any completed dependency files for context
      - Check KG for existing entities from dependencies
      - Create the artifact file using \`template\` as the structure
      - Apply \`context\` and \`rules\` as constraints - but do NOT copy them into the file
      - **Update KG with created artifact**:
        \`\`\`typescript
        // Create artifact entity
        const artifactResult = await kgInterface.execute('kg:create-entity', {
          entity: {
             id: "<changeId>-<artifactType>",
             type: '<artifactType>',
             name: '<artifactName>',
             status: 'active',
             filePath: '<outputPath>',
             changeId: "<changeId>",
             createdAt: new Date()
           }
        });

        // Create relationship to change
        await kgInterface.execute('kg:create-relationship', {
          sourceId: changeId,
          relationshipType: 'hasArtifact',
          targetId: artifactResult.entityId,
          properties: { role: '<artifactType>', createdAt: new Date() }
        });

        // Extract entities from content
        const extracted = await extractEntitiesFromArtifact(
          projectRoot,
          changeId,
          artifactResult.entityId,
          createdContent,
          artifactType
        );
        \`\`\`
      - Show brief progress: "✓ Created <artifact-id> (KG updated)"

   b. **Continue until all \`applyRequires\` artifacts are complete**
      - After creating each artifact, re-run \`synergyspec-hw status --change "<name>" --json\`
      - Check if every artifact ID in \`applyRequires\` has \`status: "done"\` in the artifacts array
      - Stop when all \`applyRequires\` artifacts are done

   c. **If an artifact requires user input** (unclear context):
      - Use **AskUserQuestion tool** to clarify
      - Then continue with creation

5. **Show final status and KG summary**
   \`\`\`bash
   synergyspec-hw status --change "<name>"
   \`\`\`

   Also show KG traceability:
   \`\`\`typescript
   const traceResult = await kgInterface.execute('kg:get-change-traceability', {
     changeId: "<name>"
   });
   \`\`\`

   Summarize:
   - All artifacts created with KG tracking
   - KG entities created: useCaseSteps, requirements, etc.
   - Coverage percentage from KG
   - "Ready for implementation"

**Output**

After completing all artifacts, summarize:
- Change name and location
- List of artifacts created with KG updates
- KG traceability summary (entities, coverage)
- "Ready for implementation with full KG tracking"
- Prompt: "Run \`/synspec:apply\` to implement tasks, or \`/synspec:tdd\` for red-green-refactor TDD."

**KG Integration Guidelines**

1. **Track all artifact creation**:
   - Every artifact file gets a KG entity
   - Link artifacts to parent change
   - Update KG state after each artifact

2. **Extract structured data**:
   - Parse requirements from specs/
   - Parse use cases from usecases.md
   - Parse tasks from tasks.md
   - Create KG entities for all structured content

3. **Maintain traceability**:
   - Link requirements to use case steps
   - Link tasks to requirements
   - Track coverage through relationships

4. **Batch operations**:
   - Create all entities at once when possible
   - Persist after major operations
   - Minimize individual tool calls

5. **Error resilience**:
   - Continue if KG operations fail
   - Log warnings but don't block
   - Provide fallback behavior

**Example: Creating specs with KG tracking**

\`\`\`typescript
// When creating specs artifact:
const specEntity = {
  id: \`\${changeId}-specs\`,
  type: 'Spec',
  name: 'Specifications',
  status: 'active',
  filePath: outputPath,
  changeId,
  capability: 'change-specs',
  specType: 'new'
};

// Create in KG
const specResult = await kgInterface.execute('kg:create-entity', {
  entity: specEntity
});

// Link to change
await kgInterface.execute('kg:create-relationship', {
  sourceId: changeId,
  relationshipType: 'hasArtifact',
  targetId: specResult.entityId
});

// Extract requirements from content
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

// Update traceability
const traceResult = await kgInterface.execute('kg:get-change-traceability', {
  changeId: changeId
});

console.log(\`KG updated: \${traceResult.traceability.requirements.length} requirements, \${traceResult.traceability.coverage}% coverage\`);
\`\`\``,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI and KG support.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

/**
 * Get KG-integrated fast-forward command template
 */
export function getOpsxFfKGCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Fast-Forward with KG',
    description: 'Fast-forward through artifact creation with KG tracking - creates all artifacts and updates knowledge graph',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'kg', 'fast-forward', 'bulk'],
    content: `Fast-forward through artifact creation with KG tracking.

** Input **: The argument after \`/synspec:ff\` is the change name (kebab-case), OR a description of what the user wants to build.

${getFfChangeKGSkillTemplate().instructions}`,
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
  // This would parse different artifact types and extract structured entities
  // For now, return empty - real implementation would parse content
  return {
    success: true,
    entities: [],
    relationships: []
  };
}