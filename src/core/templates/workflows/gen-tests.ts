/**
 * Skill Template Workflow Modules
 *
 * Gen-tests workflow: parses spec.md use cases, discovers existing tests,
 * writes missing tests, test stubs, or mocks, and produces a persistent spec-tests.md mapping file.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`openspec list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Only show changes that have a spec artifact. **NEVER auto-select**.

2. **Load the spec**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   From \`contextFiles\`, find and read \`spec.md\` (and any delta specs in \`openspec/changes/<name>/specs/\`).


3. **Create an empty spec-tests.md file**

   Create an empty file at \`openspec/changes/<name>/spec-tests.md\`.

   The file contains the following sections:
   - \`# Spec-Test Mapping: <change-name>\`
   - \`## Use Case ID Mapping\`
   - \`## Requirement Traceability Matrix\`
   - \`## Use Case Details\`
   - \`### Main Scenario\`
   - \`### Extensions\`
   - \`### Full Flow Tests\`


4. **Parse use case requirements from spec.md**

   Look for sections structured as:
   - \`### Use Case:\` or \`## Use Case:\` headings
   - Within each use case, identify sub-sections:
     - \`**Main Scenario**\` (Happy Path) - extract numbered steps.
     - \`**Extensions**\` (Alternative & Exception Paths) - extract paths like "2a. <condition>".

   Assign a unique ID to each use case:
   - ID each use case in each spec.md: R1-UC1, R1-UC2, R2-UC1, R2-UC2, ...
   - ID each step in the Main Scenario: R1-UC1-S1, R1-UC1-S2, R1-UC2-S1, R1-UC2-S2, ...
   - ID each extension: R1-UC1-E1, R1-UC1-E2, R1-UC2-E1, R1-UC2-E2, ...
   These IDs are the basis for traceability.

   Write the ID to spec and use case mapping in the \`## Use Case ID Mapping\` section of \`openspec/changes/<name>/spec-tests.md\`.

5. **Discover existing tests**

   Search the codebase for test files.
   Read them. Map test descriptions/names to use case steps and extensions using keyword matching and semantic similarity.
   Classify each test by requirement scope — not by implementation style:
   - **Unit**: the test verifies exactly one spec step or extension (one ID: e.g., UC1-S2 or UC1-E3a).
   - **Component**: the test verifies multiple steps within a single use case (e.g., UC1-S1 through UC1-S4) but does not cross use case boundaries.
   - **Integration**: the test verifies the full flow of a use case (entire UC), or requirements that span multiple use cases.

6. **Generate missing tests**

   For each uncovered step or extension:
   - Propose a test case: test name, **type based on requirement scope** (Unit = single step/extension; Component = multiple steps within one UC; Integration = full UC flow or cross-UC), input conditions, expected output/behavior.
   - Write test stubs, mocks, or tests to the appropriate test file (or create one if none exists).
   - Test files must be placed in an appropriate location in the codebase, follow the best practices of the codebase structure, and follow the same style as existing tests.

7. **Update spec-tests.md**

   Update \`openspec/changes/<name>/spec-tests.md\`.

   **Note: A single requirement or step can (and often should) map to multiple tests of varying types.** Add multiple rows or comma-separated test files in the matrix if a step has multiple tests.

   Note for the requirement traceability matrix:
   - ID: The ID of the requirement or step.
   - Requirement: The description of the requirement or step.
   - Type: The type of the requirement or step (Flow, Step, or Extension).
   - Test Type: The type of the test (Unit, Component, or Integration).
   - Test Case: The test case that verifies the requirement or step.
   - Status: The status of the test case (✅ test exists, ⚠️ test exists but is partial, ❌ test does not exist).

   Format:

   \`\`\`markdown
   # Spec-Test Mapping: <change-name>
   Generated: <date>

   ## Requirement Traceability Matrix

   | ID | Requirement | Type | Test Type | Test Case | Status |
   |----|-------------|------|-----------|-----------|--------|
   | R1-UC1 | <Name> Full Flow | Flow | Integration | \`test/integration.test.ts\` | ✅ |
   | R1-UC1-S1 | <Step Description> | Step | Unit | \`test/unit.test.ts\` | ✅ |
   | R1-UC1-S1 | <Step Description> | Step | Component | \`test/comp.test.ts\` | ✅ |
   | R1-UC1-E2a | <Extension Description>| Extension | Component | \`test/comp2.test.ts\` | ⚠️ |
   | R2-UC1 | <Name> Full Flow | Flow | Integration |  | ❌ |
   ...

   ## Use Case Details: <name> (ID: UC1)

   ### Main Scenario
   - **R1-UC1-S1**: <description>
     - \`test/unit.test.ts:42\` <test description> (Unit)
     - \`test/comp.test.ts:12\` <test description> (Component)
   - **R1-UC1-S2**: <description> -> \`test/bar.test.ts:15\` <test description> (Component)
   - ...

   ### Extensions
   - **R1-UC1-E2a**: <description> -> \`test/comp2.test.ts:5\` <test description> (Component)
   - ...

   ### Full Flow Tests
   - \`R1-UC1\` — "<description>" -> \`test/integration.test.ts:10\` <test description> (Integration)
   \`\`\`

   (Repeat for every use case.)

8. **Decision point (Re-generate or output)**

   - Report the missing or incomplete tests to the user.
   - **Ask if they want to generate / update missing and incomplete tests.**
   - If the user confirms, go back to step 6 and generate / update tests.
   - If the user does not confirm, proceed to the output step.
   - Do not proceed to the output step without user confirmation.


**Heuristics**

- Prefer writing tests in the same file/directory as existing tests for that module
- Follow existing test framework (don't introduce a new one)
- Classify by requirement boundary, not by code layer. A test that calls a low-level function but verifies a single spec step is still a Unit test. A test that exercises the UI but covers an entire use case flow is an Integration test.
- Map requirements to tests via: exact name match, keyword match, file path match
- When uncertain about test implementation status, mark as ⚠️ (partial) not ✅

**Graceful Degradation**

- If no spec.md found: report "No spec found for change <name>. Cannot generate tests."
- If no use case sections found in spec: list all top-level headings found and ask user
  to point to the relevant section

**Output**

- Summary of gaps found and stubs written
- Confirmation that spec-tests.md was written to \`openspec/changes/<name>/spec-tests.md\`
- Prompt: "Run \`/opsx-hw:run-tests\` to execute the suite and generate a spec-coverage report."`;

export function getGenTestsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-gen-tests',
    description:
      'Analyse spec.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.',
    instructions: `Analyse spec.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxGenTestsCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Gen Tests',
    description: 'Analyse spec.md use cases, discover existing tests, write missing stubs, and produce spec-tests.md',
    category: 'Workflow',
    tags: ['workflow', 'test', 'gen-tests', 'coverage'],
    content: `Analyse spec.md use cases, discover existing tests, write missing test stubs, and produce a spec-tests.md mapping file.

**Input**: Optionally specify a change name after \`/opsx-hw:gen-tests\` (e.g., \`/opsx-hw:gen-tests add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
