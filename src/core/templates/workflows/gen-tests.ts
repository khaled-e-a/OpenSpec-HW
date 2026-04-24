/**
 * Skill Template Workflow Modules
 *
 * Gen-tests workflow: parses usecases.md use cases, discovers existing tests,
 * writes missing tests, test stubs, or mocks, and produces a persistent spec-tests.md mapping file.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Only show changes that have a spec artifact. **NEVER auto-select**.

2. **Load the use cases**

   \`\`\`bash
   synergyspec-hw instructions apply --change "<name>" --json
   \`\`\`

   From \`contextFiles\`, find and read \`usecases.md\` (and any spec files in \`synergyspec/changes/<name>/specs/\`).


3. **Create an empty spec-tests.md file**

   Create an empty file at \`synergyspec/changes/<name>/spec-tests.md\`.

   The file contains the following sections:
   - \`# Spec-Test Mapping: <change-name>\`
   - \`## Use Case ID Mapping\`
   - \`## Requirement Traceability Matrix\`
   - \`## Use Case Details\`
   - \`### Main Scenario\`
   - \`### Extensions\`
   - \`### Full Flow Tests\`


4. **Extract spec-to-usecase mapping from specs**

   Parse all spec files to extract:
   - Requirement ID (R1, R2, etc.)
   - "**Implements**" references (UC1-S1, UC1-E2a, etc.)
   - WHEN/THEN scenarios

   This mapping is already created during spec generation, just extract it.

5. **Discover existing tests**

   Search the codebase for test files.
   Read them. Map test descriptions/names to use case steps and extensions using keyword matching and semantic similarity.
   Classify each test by requirement scope — not by implementation style:
   - **Unit**: the test verifies exactly one spec step or extension (one ID: e.g., UC1-S2 or UC1-E3a).
   - **Component**: the test verifies multiple steps within a single use case (e.g., UC1-S1 through UC1-S4) but does not cross use case boundaries.
   - **Integration**: the test verifies the full flow of a use case (entire UC), or requirements that span multiple use cases.

6. **Generate missing example-based tests**

   For each uncovered step or extension:
   - Propose a test case: test name, **type based on requirement scope** (Unit = single step/extension; Component = multiple steps within one UC; Integration = full UC flow or cross-UC), input conditions, expected output/behavior.
   - Write test stubs, mocks, or tests to the appropriate test file (or create one if none exists).
   - Test files must be placed in an appropriate location in the codebase, follow the best practices of the codebase structure, and follow the same style as existing tests.

7. **Generate property-based tests (PBT)**

   First, detect which PBT framework to use:

   | Language | Framework | How to detect |
   |----------|-----------|---------------|
   | TypeScript / JavaScript | \`fast-check\` | import in existing test files or \`fast-check\` in package.json |
   | Python | \`hypothesis\` | import in existing test files or \`hypothesis\` in deps |
   | Java / Kotlin | \`jqwik\` | \`@Property\` annotation or jqwik in build file |
   | Go | \`rapid\` (\`pgregory.net/rapid\`) | import in existing test files or go.mod |
   | Rust | \`proptest\` | import in existing test files or Cargo.toml |
   | C / C++ | \`rapidcheck\` | include or CMake/Conan config |
   | Other / unknown | ask the user | use **AskUserQuestion** |

   Detection order: scan existing test files for PBT imports first; if none found, infer from project language; if ambiguous, use AskUserQuestion.

   **Every WHEN/THEN scenario extracted in step 4 must have exactly one PBT test** — no exceptions:
   - **WHEN** clause → generator expression + precondition guard (filter/assume)
   - **THEN** clause → invariant (property assertion that must hold for all generated inputs)
   - When the WHEN clause has no parameterisable variable (e.g. "WHEN the app loads"), generate arbitrary system/environment state as the input and use the THEN clause alone as the invariant.

   Write one PBT test per scenario, named \`<uc-id>_<scenario-slug>.property.test.<ext>\`, placed alongside the regular tests for that requirement. Example (fast-check / TypeScript):

   \`\`\`ts
   // UC1-S2: catalogue shows only absent widgets — property
   it('UC1-S2: catalogue always shows only absent widgets', () => {
     fc.assert(
       fc.property(
         fc.array(fc.string()),  // arbitrary set of widget IDs already on the grid
         (onGrid) => {
           const catalogue = openCatalogue({ onGrid });
           const listed = catalogue.getListedWidgetIds();
           // invariant: no listed widget is already on the grid
           return listed.every(id => !onGrid.includes(id));
         }
       )
     );
   });
   \`\`\`

8. **Update spec-tests.md**

   Update \`synergyspec/changes/<name>/spec-tests.md\`.

   **Note: A single requirement or step can (and often should) map to multiple tests of varying types.** Add multiple rows or comma-separated test files in the matrix if a step has multiple tests. \`PBT\` is a valid value for Test Type alongside Unit, Component, and Integration.

   Note for the requirement traceability matrix:
   - ID: The ID of the requirement or step.
   - Requirement: The description of the requirement or step.
   - Type: The type of the requirement or step (Flow, Step, or Extension).
   - Test Type: The type of the test (Unit, Component, Integration, or **PBT**).
   - Test Case: The test case that verifies the requirement or step.
   - Status: The status of the test case (✅ test exists, ⚠️ test exists but is partial, ❌ test does not exist).

   After the Requirement Traceability Matrix, add a **PBT Coverage** section tracking every WHEN/THEN scenario:

   Format:

   \`\`\`markdown
   # Spec-Test Mapping: <change-name>
   Generated: <date>

   ## Requirement Traceability Matrix

   | ID | Requirement | Type | Test Type | Test Case | Status |
   |----|-------------|------|-----------|-----------|--------|
   | UC1 | <Name> Full Flow | Flow | Integration | \`test/integration.test.ts\` | ✅ |
   | UC1-S1 | <Step Description> | Step | Unit | \`test/unit.test.ts\` | ✅ |
   | UC1-S1 | <Step Description> | Step | PBT | \`test/uc1-s1.property.test.ts\` | ✅ |
   | UC1-S1 | <Step Description> | Step | Component | \`test/comp.test.ts\` | ✅ |
   | UC1-E2a | <Extension Description>| Extension | Component | \`test/comp2.test.ts\` | ⚠️ |
   | UC1 | <Name> Full Flow | Flow | Integration |  | ❌ |
   ...

   ## PBT Coverage

   | UC Step | Scenario | PBT Test | Framework | Status |
   |---------|----------|----------|-----------|--------|
   | UC1-S1 | <scenario description> | \`test/uc1-s1.property.test.ts:5\` | fast-check | ✅ |
   | UC1-S2 | <scenario description> | \`test/uc1-s2.property.test.ts:12\` | fast-check | ✅ |
   | UC1-E2a | <scenario description> | \`test/uc1-e2a.property.test.ts:8\` | fast-check | ❌ missing |
   ...

   ## Use Case Details: <name> (ID: UC1)

   ### Main Scenario
   - **UC1-S1**: <description>
     - \`test/unit.test.ts:42\` <test description> (Unit)
     - \`test/comp.test.ts:12\` <test description> (Component)
     - \`test/uc1-s1.property.test.ts:5\` <property description> (PBT)
   - **UC1-S2**: <description> -> \`test/bar.test.ts:15\` <test description> (Component)
   - ...

   ### Extensions
   - **UC1-E2a**: <description> -> \`test/comp2.test.ts:5\` <test description> (Component)
   - ...

   ### Full Flow Tests
   - \`UC1\` — "<description>" -> \`test/integration.test.ts:10\` <test description> (Integration)
   \`\`\`

   (Repeat for every use case.)

9. **Decision point (Re-generate or output)**

   - Report missing or incomplete **example-based tests** AND any **PBT Coverage** rows marked \`❌ missing\`.
   - **Ask if they want to generate / update all missing and incomplete tests (both kinds).**
   - If the user confirms, go back to steps 6–7 and generate / update tests.
   - If the user does not confirm, proceed to the output step.
   - Do not proceed to the output step without user confirmation.


**Heuristics**

- Prefer writing tests in the same file/directory as existing tests for that module
- Follow existing test framework (don't introduce a new one)
- Follow the existing PBT framework — never introduce a PBT library that isn't already present unless the user confirms
- Classify by requirement boundary, not by code layer. A test that calls a low-level function but verifies a single spec step is still a Unit test. A test that exercises the UI but covers an entire use case flow is an Integration test.
- Map requirements to tests via: exact name match, keyword match, file path match
- When uncertain about test implementation status, mark as ⚠️ (partial) not ✅
- Every WHEN/THEN scenario must have a PBT test. When the WHEN clause has no parameterisable input, generate arbitrary system/environment state and use the THEN clause as the invariant — do not skip the scenario.

**Graceful Degradation**

- If no usecases.md found: report "No use cases found for change <name>. Cannot generate tests."
- If no use case sections found in usecases.md: list all top-level headings found and ask user
  to point to the relevant section

**Output**

- Summary of gaps found and stubs written
- Confirmation that spec-tests.md was written to \`synergyspec/changes/<name>/spec-tests.md\`
- Prompt: "Run \`/synspec:run-tests\` to execute the suite and generate a spec-coverage report."

**Knowledge Graph Integration (Optional)**

If KG is enabled (\`synergyspec/kg/\` exists), track generated tests in the graph:

1. Initialize: \`const kg = createKGToolInterface(projectRoot);\`
2. For each newly written test file, \`kg:create-entity\` a TestCase: \`{ id, type: 'TestCase', framework, testType, isFailing: true, filePath, changeId }\`.
3. \`kg:create-relationship\` link TestCase → Requirement via \`tests\` for every requirement the test covers.
4. Emit a \`TestGenerationEvent\` (Event) with outcome 'success' capturing which requirements got tests.
5. Call \`kg:persist\`. On KG error, warn and continue — test files are already written.`;

export function getGenTestsSkillTemplate(): SkillTemplate {
   return {
      name: 'synergyspec-gen-tests',
      description:
         'Analyse usecases.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.',
      instructions: `Analyse usecases.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.

${INSTRUCTIONS_BODY}`,
      license: 'MIT',
      compatibility: 'Requires synergyspec-hw CLI.',
      metadata: { author: 'synergyspec', version: '1.0' },
   };
}

export function getOpsxGenTestsCommandTemplate(): CommandTemplate {
   return {
      name: 'OPSX: Gen Tests',
      description: 'Analyse usecases.md use cases, discover existing tests, write missing stubs, and produce spec-tests.md',
      category: 'Workflow',
      tags: ['workflow', 'test', 'gen-tests', 'coverage'],
      content: `Analyse usecases.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.

**Input**: Optionally specify a change name after \`/synspec:gen-tests\` (e.g., \`/synspec:gen-tests add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
   };
}
