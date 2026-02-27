/**
 * Skill Template Workflow Modules
 *
 * Run-tests workflow: runs the test suite and generates a coverage report,
 * using spec-tests.md (written by gen-tests) when available.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`openspec list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **NEVER auto-select**.

2. **Load spec-tests.md (if available)**

   Look for \`openspec/changes/<name>/spec-tests.md\`.
   If found, read it — it provides the Requirement Traceability Matrix and step-level IDs (e.g., R1-UC1-S1) mapping spec steps/flows to test files.
   If not found, proceed with best-effort mapping (keyword/file-path matching).

3. **Run the tests**

   Detect the project's test runner.
   If detection fails: ask the user to provide the test command.
   Run: \`<detected-runner>\`
   Capture stdout/stderr output.

4. **Generate Test Coverage Report**

   Save this file to \`openspec/changes/<name>/test-report.md\`.

   \`\`\`markdown
   ## Test Report: <change-name>

   ### Use Case Coverage Summary
   | Use Case         | Happy | Extensions | Overall |
   |-----------------|-------|------------|---------|
   | <name>          | ✅ 2/2| ⚠️ 1/2      | 75%     |
   ...
   Overall: X/Y paths/steps covered (Z%)

   ### Covered Requirements
   - ✅ **R1-UC1-S1**: <description> (\`test/foo.test.ts:42\`)
   ...

   ### Uncovered Requirements
   - ❌ **R1-UC1-E2a**: <description>: No test found
     → Run /opsx-hw:gen-tests to generate missing tests
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors.
   \`\`\`

**Graceful Degradation**

- If tests fail: still show the coverage report; highlight failures separately
- If no spec-tests.md: note "Run /opsx-hw:gen-tests first for accurate coverage mapping"

**Output Format**

- Use markdown tables for coverage summary
- ✅ covered, ⚠️ partial/uncertain, ❌ not covered
- File:line references for existing tests
- Specific, actionable recommendations for missing coverage
- When coverage is complete or satisfactory: suggest \`/opsx-hw:archive\` to archive and close the change`;

export function getRunTestsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-run-tests',
    description:
      'Run the test suite and generate a spec-coverage report. Reads spec-tests.md (produced by gen-tests) when available.',
    instructions: `Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxRunTestsCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Run Tests',
    description: 'Run the test suite and generate a spec-coverage report',
    category: 'Workflow',
    tags: ['workflow', 'test', 'run-tests', 'coverage'],
    content: `Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

**Input**: Optionally specify a change name after \`/opsx-hw:run-tests\` (e.g., \`/opsx-hw:run-tests add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
