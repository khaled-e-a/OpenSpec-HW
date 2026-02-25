/**
 * Skill Template Workflow Modules
 *
 * Gen-tests workflow: parses spec.md use cases, discovers existing tests,
 * writes missing stubs, and produces a persistent spec-tests.md mapping file.
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

3. **Parse use case requirements from spec.md**

   Look for sections structured as:
   - \`### Use Case:\` or \`## Use Case:\` headings
   - Within each use case, identify sub-sections:
     - \`#### Happy Path\` / \`**Happy Path**\`
     - \`#### Alternative Paths\` / \`**Alternative Paths**\`
     - \`#### Exception/Error Paths\` / \`**Exception/Error Paths**\`

   Extract each path as a named requirement to test against.

4. **Discover existing tests**

   Search the codebase for test files (\`*.test.ts\`, \`*.spec.ts\`, \`*.test.js\`, \`*.spec.js\`, \`test/**/*.ts\`, \`__tests__/**/*.ts\`).
   Read them. Map test descriptions/names to use case requirements using keyword matching and semantic similarity.

5. **Generate missing test stubs**

   For each uncovered path:
   - Propose a test case: test name, input conditions, expected output/behavior
   - Write test stubs to the appropriate test file (or create one if none exists)
     following the project's existing test style (framework, describe/it blocks, etc.)
   - **Ask the user to confirm before writing if the number of new files > 0.**

6. **Write spec-tests.md**

   Write (or update) \`openspec/changes/<name>/spec-tests.md\`.

   Format:

   \`\`\`
   # Spec–Test Mapping: <change-name>
   Generated: <date>

   ## Use Case: <name>

   ### Happy Path: <path-name>
   - Status: ✅ covered / ⚠️ partial / ❌ not covered
   - Tests:
     - \`test/foo.test.ts:42\` — "<test description>"
     ...

   ### Alternative Path: <path-name>
   ...

   ### Exception/Error Path: <path-name>
   ...
   \`\`\`

   (Repeat for every use case and every path.)

**Heuristics**

- Prefer writing tests in the same file/directory as existing tests for that module
- Follow existing test framework (don't introduce a new one)
- Map requirements to tests via: exact name match, keyword match, file path match
- When uncertain about coverage, mark as ⚠️ (partial) not ✅

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
