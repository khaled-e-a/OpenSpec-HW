/**
 * Knowledge Graph Integrated Verify Change Workflow
 *
 * Enhanced version of verify-change that checks KG connectivity
 * between implemented code and specifications
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';
import { createKGToolInterface } from '../../kg/tool-interface.js';
import { extractArtifactMetadata } from '../../kg/content-parser.js';
import { analyzeBlastRadiusViaKG, generateKGBlastRadiusReport } from '../../kg/blast-radius-utils.js';

/**
 * Get KG-integrated verify change skill template
 */
export function getVerifyChangeKGSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-verify-change-kg',
    description: 'Verify implementation matches change artifacts with KG connectivity checks. Ensures code entities are properly connected to specifications in the knowledge graph.',
    instructions: `Verify that an implementation matches the change artifacts with KG connectivity checks.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show changes that have implementation tasks (tasks artifact exists).
   Include the schema used for each change if available.
   Mark changes with incomplete tasks as "(In Progress)".

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check KG availability and initialize**
   \`\`\`typescript
   const kgInterface = createKGToolInterface(projectRoot);
   const kgSummary = await kgInterface.execute('kg:get-summary', {});
   \`\`\`

   If KG is not available:
   - Show message: "KG not available, falling back to manual verification"
   - Continue with standard verification (steps 3-9 from original)
   - Note KG limitations in final report

3. **Get the change directory and load artifacts**
   \`\`\`bash
   synergyspec-hw instructions apply --change "<name>" --json
   \`\`\`

   This returns the change directory and context files. Read all available artifacts from \`contextFiles\`.

4. **Initialize KG-based verification report**

   Create a report structure with KG connectivity checks:
   - **KG Connectivity**: Verify code entities link to spec entities
   - **Implementation Completeness**: Check all tasks have code entities
   - **Requirement Coverage**: Verify requirements have implementing code
   - **Code-to-Spec Mapping**: Ensure code implements correct specs

5. **Verify KG Connectivity**

   a. **Check implementation entities exist**:
      \`\`\`typescript
      const codeFiles = await kgInterface.execute('kg:query', {
        query: {
          entityType: 'CodeFile',
          properties: { changeId: "<name>" }
        }
      });

      const tests = await kgInterface.execute('kg:query', {
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

      If no implementation entities found:
      - CRITICAL: "No implementation tracked in KG"
      - Recommendation: "Run /synspec:apply or /synspec:tdd to implement with KG tracking"

   b. **Verify code-to-task connectivity**:
      \`\`\`typescript
      // For each task, check if it has implementing code
      const tasks = await kgInterface.execute('kg:query', {
        query: {
          entityType: 'Task',
          properties: { changeId: "<name>" }
        }
      });

      for (const task of tasks.entities) {
        const implementations = await kgInterface.execute('kg:get-relationships', {
          entityId: task.id,
          direction: 'in',
          relationshipTypes: ['implementedBy']
        });

        if (implementations.length === 0 && task.status === 'completed') {
          WARNING: "Task marked complete but no code entities found in KG"
          Recommendation: "Code may exist but wasn't tracked - consider re-running implementation with KG"
        }
      }
      \`\`\`

   c. **Verify requirement-to-code connectivity**:
      \`\`\`typescript
      const requirements = await kgInterface.execute('kg:query', {
        query: {
          entityType: 'Requirement',
          properties: { changeId: "<name>" }
        }
      });

      for (const req of requirements.entities) {
        const implementations = await kgInterface.execute('kg:get-relationships', {
          entityId: req.id,
          direction: 'in',
          relationshipTypes: ['implementedBy']
        });

        if (implementations.length === 0) {
          WARNING: "Requirement has no implementing code entities in KG"
          Recommendation: "Verify requirement is implemented or run implementation with KG tracking"
        }
      }
      \`\`\`

   d. **Verify test-to-requirement connectivity**:
      \`\`\`typescript
      for (const req of requirements.entities) {
        const tests = await kgInterface.execute('kg:get-relationships', {
          entityId: req.id,
          direction: 'in',
          relationshipTypes: ['tests']
        });

        if (tests.length === 0) {
          INFO: "Requirement has no test coverage in KG"
          Recommendation: "Consider adding tests or ensure tests are tracked in KG"
        }
      }
      \`\`\`

6. **Verify implementation against specs (with KG cross-check)**

   a. **Load and parse specs from KG**:
      \`\`\`typescript
      // Get requirements from KG (more reliable than file parsing)
      const kgRequirements = await kgInterface.execute('kg:query', {
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
      \`\`\`

   b. **Cross-reference with actual implementation**:
      - For each requirement, check if corresponding code exists
      - For each use case step, verify implementation in code
      - Check if test coverage matches KG relationships
      - Identify any KG relationships that don't match actual code

   c. **Verify KG relationships match implementation**:
      - Parse actual code to find implementations
      - Compare with KG relationships
      - Flag discrepancies between KG and reality

7. **Generate KG-enhanced verification report**

   **KG Connectivity Summary**:
   \`\`\`
   ## KG Verification Report: <change-name>

   ### Knowledge Graph State
   - Code entities: N
   - Test entities: M
   - Implementation events: P
   - Overall KG coverage: X%

   ### KG Connectivity Results
   - Tasks with code entities: X/Y
   - Requirements with implementations: A/B
   - Requirements with test coverage: C/D
   - KG relationship accuracy: Z%
   \`\`\`

   **KG-Specific Issues**:
   1. **CRITICAL** (KG connectivity broken):
      - Missing code entities for completed tasks
      - Requirements without any implementation tracking
      - Each with specific KG query to investigate

   2. **WARNING** (KG coverage gaps):
      - Requirements lacking test coverage in KG
      - Incomplete KG relationship mapping
      - Each with specific recommendation

   3. **INFO** (KG optimization opportunities):
      - Minor KG inconsistencies
      - Suggestions for better KG usage

8. **Spec Impact Analysis with KG Blast Radius**

   This step identifies which existing specs in \`synergyspec/specs/\` are affected
   by the code changes, using KG relationships to enhance the analysis.

   **8a. Get changed files and KG entities**
   \`\`\`bash
   git diff --name-only $(git merge-base HEAD main) HEAD
   \`\`\`

   **8b. Enhanced blast radius analysis with KG traversal**
   \`\`\`typescript
   // Get changed files via git diff (original approach)
   const changedFiles = await getChangedFiles();

   // Enhanced blast radius analysis using KG traversal
   const blastRadiusResult = await analyzeBlastRadiusViaKG(
     projectRoot,
     "<name>",
     changedFiles
   );

   if (blastRadiusResult.success) {
     // Process KG-based findings
     for (const impact of blastRadiusResult.impactedSpecs) {
       // Report KG-based spec impact
       reportKGSpecImpact(impact);
     }

     // Report KG analysis summary
     console.log(`KG blast radius analysis complete:`);
     console.log(`- Total specs found: ${blastRadiusResult.analysis.totalSpecsFound}`);
     console.log(`- Direct impacts: ${blastRadiusResult.analysis.directImpacts}`);
     console.log(`- Indirect impacts: ${blastRadiusResult.analysis.indirectImpacts}`);
     console.log(`- Confidence: ${(blastRadiusResult.analysis.confidenceScore * 100).toFixed(1)}%`);

     // Add KG-specific findings to report
     if (blastRadiusResult.impactedSpecs.length > 0) {
       const kgReport = generateKGBlastRadiusReport({
         impactedSpecs: blastRadiusResult.impactedSpecs,
         impactGraph: blastRadiusResult.impactGraph,
         analysis: blastRadiusResult.analysis,
         issues: blastRadiusResult.issues
       });

       // Add KG findings to final report
       finalReport += '\n\n' + kgReport;
     }
   }

   // Continue with standard blast radius analysis as fallback
   // (original git-based analysis)
   \`\`\`

9. **Final Assessment with KG Integration**

   **If KG issues exist**:
   - "X KG connectivity issues found. Fix before archiving or re-run implementation with KG."
   - Provide specific KG queries to investigate

   **If KG is consistent**:
   - "KG traceability verified. Implementation properly tracked in knowledge graph."
   - Include summary of KG coverage improvements

10. **Persist KG changes**
    \`\`\`typescript
    await kgInterface.execute('kg:persist', {});
    \`\`\`

**KG Integration Guidelines**

1. **Always check KG first** - Verify KG availability before proceeding
2. **Use KG entities as ground truth** - Prefer KG data over file parsing when available
3. **Cross-validate KG with reality** - Ensure KG relationships match actual implementation
4. **Provide KG-specific recommendations** - Include KG queries and fixes in recommendations
5. **Maintain KG consistency** - Flag any discrepancies between KG and actual code

/**
 * Report KG-based spec impact
 */
function reportKGSpecImpact(impact: any): void {
  console.log(`KG Impact: ${impact.specName} (${impact.specPath})`);
  console.log(`  - Impact type: ${impact.impactType}`);
  console.log(`  - Confidence: ${(impact.confidence * 100).toFixed(0)}%`);
  console.log(`  - Impact path: ${impact.impactPath.map((p: any) => p.relationship).join(' → ')}`);
}

/**
 * Get changed files (placeholder function)
 */
function getChangedFiles(): string[] {
  // This would be implemented to get files from git diff
  // For now, return placeholder
  return [];
}

**Benefits of KG Integration**

1. **Objective Verification** - KG provides structured, queryable verification data
2. **Automatic Discovery** - KG reveals implementation patterns not visible in files
3. **Relationship Validation** - Ensures all traceability links are properly maintained
4. **Implementation Audit** - Complete record of what was implemented and how
5. **Gap Detection** - Easily find missing implementations or coverage gaps

**Example Output**

```
## KG Verification Report: add-user-auth

### Knowledge Graph State
- Code entities: 8
- Test entities: 12
- Implementation events: 7
- Overall KG coverage: 92%

### KG Connectivity Results
✓ All 7 tasks have code entities
✓ All 8 requirements have implementing code
⚠️  2 requirements lack test coverage in KG
✓ All KG relationships verified against actual code

### Verification Results
- KG connectivity: All good
- Implementation completeness: 100%
- KG relationship accuracy: 100%

### Result
KG traceability is consistent with implementation. ✓

Implementation is properly tracked in the knowledge graph.
Ready for archive with full KG traceability.
```

This enhanced verification ensures that the Knowledge Graph accurately reflects the implementation and maintains complete traceability between code, tests, and specifications.`,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI and KG support.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

/**
 * Get KG-integrated verify change command template
 */
export function getOpsxVerifyChangeKGCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Verify Change with KG',
    description: 'Verify implementation matches specs with KG connectivity checks - ensures code entities are properly connected to specifications',
    category: 'Workflow',
    tags: ['workflow', 'verify', 'implementation', 'kg', 'traceability'],
    content: `Verify implementation matches specs with KG connectivity checks. Ensures code entities are properly connected to specifications in the knowledge graph.

**Input**: Optionally specify a change name after \`/synspec:verify-kg\` (e.g., \`/synspec:verify-kg add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${getVerifyChangeKGSkillTemplate().instructions}`,
  };
}