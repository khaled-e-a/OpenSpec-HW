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

   Run \`synergyspec-hw list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **NEVER auto-select**.

2. **Load spec-tests.md (if available)**

   Look for \`synergyspec/changes/<name>/spec-tests.md\`.
   If found, read it — it provides the Requirement Traceability Matrix and step-level IDs (e.g., UC1-S1) mapping spec steps/flows to test files.
   If not found, proceed with best-effort mapping (keyword/file-path matching).

3. **Run the tests**

   Detect the project's test runner.
   If detection fails: ask the user to provide the test command.
   Run: \`<detected-runner>\`
   Capture stdout/stderr output.

3b. **Promote PBT counterexamples to regression tests**

   Scan the captured stdout/stderr for PBT failure markers. Each major framework prints a minimal (shrunk) counterexample when a property fails:

   | Framework | Failure marker in output |
   |-----------|--------------------------|
   | fast-check | \`Property failed after N tests\` + \`Counterexample: [...]\` |
   | Hypothesis | \`Falsifying example:\` |
   | jqwik | \`Falsified!\` + parameter values |
   | rapid / rapidcheck | \`Falsifiable input:\` |
   | proptest | \`FAILED. Minimal failing input:\` |

   For each counterexample found:
   1. Extract the minimal failing input values from the output.
   2. Write a **deterministic regression unit test** that hardcodes those exact inputs, named \`pbt-regression-<uc-id>-<N>.<ext>\`, placed in the same test directory as the failing property test. This test must pass once the bug is fixed and must never be deleted.
   3. Append an entry to \`synergyspec/changes/<name>/pbt-regressions.md\` (create the file if it does not exist):

   \`\`\`markdown
   ## PBT Regressions: <change-name>

   | # | UC Step | Framework | Counterexample | Regression Test | Status |
   |---|---------|-----------|----------------|-----------------|--------|
   | 1 | UC1-S2 | fast-check | \`onGrid=["clock"]\` | \`test/pbt-regression-uc1-s2-1.test.ts\` | ❌ open |
   \`\`\`

   Status starts as \`❌ open\`. On a subsequent run where the regression test passes, update its status to \`✅ fixed\`.

   **If no PBT failures are found**: note "No PBT counterexamples found" and skip the rest of this step.

   **If no PBT tests exist** (no \`.property.test.*\` files found anywhere): note "No PBT tests found — run \`/synspec:gen-tests\` to generate them."

4. **Generate Test Coverage Report**

   Save this file to \`synergyspec/changes/<name>/test-report.md\`.

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
     → Run /synspec:gen-tests to generate missing tests
   ...

   ### PBT Results
   | UC Step | Scenario | Outcome | Counterexample | Regression Test |
   |---------|----------|---------|----------------|-----------------|
   | UC1-S2 | Catalogue shows only absent widgets | ✅ passed (100 runs) | — | — |
   | UC1-E4a1 | Error when no grid space | ❌ failed | \`gridSize=0, widgetCount=1\` | \`test/pbt-regression-uc1-e4a1-1.test.ts\` |
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors.
   \`\`\`

5. **Generate Test Plan**

   **Trigger**: Run this step whenever \`test-report.md\` contains any ⚠️ partial or ❌ uncovered requirements.

   **Goal**: Save \`synergyspec/changes/<name>/test-plan.md\`.

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
- If no spec-tests.md: note "Run /synspec:gen-tests first for accurate coverage mapping"
- If no PBT tests found: note "No PBT tests found — run /synspec:gen-tests to generate them" and skip step 3b
- If pbt-regressions.md already exists: update it in place (append new entries, update status of previously open regressions that now pass)

**Output Format**

- Use markdown tables for coverage summary
- ✅ covered, ⚠️ partial/uncertain, ❌ not covered
- File:line references for existing tests
- Specific, actionable recommendations for missing coverage
- If test plan was generated: "Test plan saved to \`synergyspec/changes/<name>/test-plan.md\` — follow it to manually verify N uncovered steps."
- If coverage is complete: suggest \`/synspec:archive\` to archive and close the change
- For full CI pipeline (all tests + e2e + coverage + screenshot comparison in one step): run \`/synspec:ci\`

**Knowledge Graph Integration (Optional)**

If KG is enabled (\`.synergyspec/kg/\` exists), record test execution in the graph:

1. Initialize: \`const kg = createKGToolInterface(projectRoot);\`
2. Before running, query \`kg:query\` for existing TestCase entities in the change to map test files to entities.
3. After each test file runs, emit a \`TestRun\` Event with \`{ outcome: pass|fail|warning, duration, metadata: { file, passed, failed, skipped, coverage } }\`.
4. \`kg:update\` the TestCase with \`{ isFailing: !passed }\` so verify-change can query failing tests.
5. For PBT counterexamples promoted to regression tests, \`kg:create-entity\` a new TestCase and link it to the original via \`regresses\`.
6. Call \`kg:persist\`. On KG error, warn and continue — test report is already generated.`;

export function getRunTestsSkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-run-tests',
    description:
      'Run the test suite and generate a spec-coverage report. Reads spec-tests.md (produced by gen-tests) when available.',
    instructions: `Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

export function getOpsxRunTestsCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Run Tests',
    description: 'Run the test suite and generate a spec-coverage report',
    category: 'Workflow',
    tags: ['workflow', 'test', 'run-tests', 'coverage'],
    content: `Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

**Input**: Optionally specify a change name after \`/synspec:run-tests\` (e.g., \`/synspec:run-tests add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
