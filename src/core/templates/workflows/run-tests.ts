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

   Run \`openspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **NEVER auto-select**.

2. **Load spec-tests.md (if available)**

   Look for \`openspec/changes/<name>/spec-tests.md\`.
   If found, read it — it provides the Requirement Traceability Matrix and step-level IDs (e.g., UC1-S1) mapping spec steps/flows to test files.
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
   - ✅ **UC1-S1**: <description> (\`test/foo.test.ts:42\`)
   ...

   ### Uncovered Requirements
   - ❌ **UC1-E2a**: <description>: No test found
     → Run /opsx-hw:gen-tests to generate missing tests
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors.
   \`\`\`

5. **Generate Test Plan**

   **Trigger**: Run this step whenever \`test-report.md\` contains any ⚠️ partial or ❌ uncovered requirements.

   **Goal**: Save \`openspec/changes/<name>/test-plan.md\`.

   **Classification — for each ⚠️/❌ requirement, determine the blocking reason:**

   | Reason code | When to use |
   |-------------|-------------|
   | \`BROWSER\` | Requires real browser APIs (pointer events, drag-and-drop, WebGL, file picker, clipboard, Web Bluetooth, etc.) |
   | \`EXTERNAL_API\` | Calls a live third-party service (payment gateway, OAuth, email, SMS) |
   | \`INFRA\` | Needs real infrastructure (database, message queue, file system, OS service) |
   | \`ENV\` | Requires specific environment config (secrets, hardware, device, OS) |
   | \`TIMING\` | Depends on real time passage, animation frames, or flaky async behavior |
   | \`MANUAL_UX\` | Visual/UX assertion that requires human judgment (layout, animation smoothness, accessibility) |
   | \`OTHER\` | Blocking reason doesn't fit any category above, or cannot be determined — describe the actual reason in the entry body |

   **For each ⚠️/❌ requirement, write one entry in \`test-plan.md\`:**

   \`\`\`markdown
   ## TP-<N>: <use-case-step-id> — <step-description>

   **Blocking reason**: BROWSER — jsdom does not dispatch PointerEvents realistically
   **Recommended tool**: Playwright or Cypress

   **Preconditions**
   - <list what must be true before the test starts: app running, user logged in, data seeded, etc.>

   **Test Steps**
   1. <Exact action the tester performs, e.g., "Open the app at http://localhost:3000">
   2. <Next action>
   3. ...

   **Expected Result**
   <What the tester should observe when the test passes — be specific: UI state, network call, console output, etc.>

   **Failure indicators**
   <What they would see if the feature is broken>

   **Automation path** *(optional)*
   <If automatable in future: which tool, which API or selector, rough approach>
   \`\`\`

   **test-plan.md overall structure:**

   \`\`\`markdown
   ## Test Plan: <change-name>

   Generated: <date>
   Source: test-report.md

   ### Summary
   | ID | UC Step | Reason | Tool |
   |----|---------|--------|------|
   | TP-1 | UC1-S3 | BROWSER | Playwright |
   | TP-2 | UC1-E2a | BROWSER | Playwright |
   ...

   ---

   <one ## section per entry as above>

   ---

   ## How to Run These Tests

   For **BROWSER** tests: install Playwright (\`npx playwright install\`) and run each step in a real browser.
   For **EXTERNAL_API** tests: ensure the sandbox/staging credentials are configured in \`.env.test\`.
   For **INFRA** tests: spin up the required service (see docker-compose.yml or project README).
   For **MANUAL_UX** tests: perform the steps in the browser and compare against the design mockup.
   \`\`\`

   **Key writing rules for test steps:**
   - Steps must be concrete and literal — no "verify the behavior" or "check that it works"
   - Each step is a single atomic action (click, type, navigate, wait)
   - Expected results must reference actual UI text, element state, or network response — not vague outcomes
   - If a step depends on app state from the previous step, say so explicitly
   - Use \`<placeholder>\` for values the tester must substitute (e.g., \`<your email address>\`)

   **When there are no ⚠️/❌ requirements**: skip generating \`test-plan.md\` and note "All requirements covered by automated tests — no test plan needed."

**Graceful Degradation**

- If tests fail: still show the coverage report; highlight failures separately
- If no spec-tests.md: note "Run /opsx-hw:gen-tests first for accurate coverage mapping"

**Output Format**

- Use markdown tables for coverage summary
- ✅ covered, ⚠️ partial/uncertain, ❌ not covered
- File:line references for existing tests
- Specific, actionable recommendations for missing coverage
- If test plan was generated: "Test plan saved to \`openspec/changes/<name>/test-plan.md\` — follow it to manually verify N uncovered steps."
- If coverage is complete: suggest \`/opsx-hw:archive\` to archive and close the change`;

export function getRunTestsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-run-tests',
    description:
      'Run the test suite and generate a spec-coverage report. Reads spec-tests.md (produced by gen-tests) when available.',
    instructions: `Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec-hw CLI.',
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
