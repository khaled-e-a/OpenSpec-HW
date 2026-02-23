/**
 * Skill Template Workflow Modules
 *
 * Test workflow: generates and runs test cases from spec.md use case requirements.
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

5. **Generate missing test cases**

   For each uncovered path:
   - Propose a test case: test name, input conditions, expected output/behavior
   - Write test stubs to the appropriate test file (or create one if none exists)
     following the project's existing test style (framework, describe/it blocks, etc.)
   - **Ask the user to confirm before writing if the number of new files > 0.**

6. **Run the tests**

   Detect the project's test runner from \`package.json\` scripts
   (prefer: \`"test"\`, \`"test:unit"\`, \`"vitest"\`, \`"jest"\`).
   Run: \`<detected-runner>\`
   Capture stdout/stderr output.

7. **Generate Test Coverage Report**

   \`\`\`
   ## Test Report: <change-name>

   ### Use Case Coverage Summary
   | Use Case         | Happy | Alt | Exception | Overall |
   |-----------------|-------|-----|-----------|---------|
   | <name>          | ✅ 2/2| ⚠️ 1/2| ❌ 0/1  | 60%    |
   ...
   Overall: X/Y paths covered (Z%)

   ### Covered Paths
   - ✅ <use case> — <happy path name> (\`test/foo.test.ts:42\`)
   ...

   ### Uncovered Paths
   - ❌ <use case> — <exception path name>: No test found
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors.
   \`\`\`

**Heuristics**

- Prefer writing tests in the same file/directory as existing tests for that module
- Follow existing test framework (don't introduce a new one)
- Map requirements to tests via: exact name match, keyword match, file path match
- When uncertain about coverage, mark as ⚠️ (partial) not ✅

**Graceful Degradation**

- If no spec.md found: report "No spec found for change <name>. Cannot generate tests."
- If no use case sections found in spec: list all top-level headings found and ask user
  to point to the relevant section
- If test runner detection fails: ask user for the test command
- If tests fail: still show coverage report, highlight failures separately

**Output Format**

- Use markdown tables for coverage summary
- ✅ covered, ⚠️ partial/uncertain, ❌ not covered
- File:line references for existing tests
- Specific, actionable recommendations for missing coverage`;

export function getTestSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-test',
    description:
      'Generate and run test cases from spec.md use case requirements. Reports coverage of happy paths, alternative paths, and exception/error paths.',
    instructions: `Generate and run test cases from spec.md use case requirements, then report coverage.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxTestCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Test',
    description: 'Generate and run test cases from spec.md use case requirements',
    category: 'Workflow',
    tags: ['workflow', 'test', 'coverage'],
    content: `Generate and run test cases from spec.md use case requirements, then report coverage.

**Input**: Optionally specify a change name after \`/opsx-hw:test\` (e.g., \`/opsx-hw:test add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
