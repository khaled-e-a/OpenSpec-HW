/**
 * Skill Template Workflow Modules
 *
 * CI workflow: runs all tests, computes coverage, compares e2e screenshots,
 * and persists artifacts for future comparisons.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `**Input**: No change name required — CI runs across all changes in the project.

**Steps**

1. **Discover all changes**

   Run \`openspec-hw list --json\` to get all changes. No user selection needed.
   For each change, note whether \`spec-tests.md\` and \`test-report.md\` exist under
   \`openspec/changes/<name>/\`.

   Report any changes missing these files (suggest running gen-tests + run-tests for those),
   then continue with the changes that do have them.

2. **Run the full project test suite with coverage**

   Detect the project's test runner. If detection fails, ask the user.
   Run: \`<detected-runner> --coverage\` (or equivalent — add coverage flag if not in the
   runner config; reuse it if it is already there).
   Capture stdout/stderr. Record:
   - passed/failed/skipped counts
   - coverage metrics: lines, branches, functions, statements
     (parse \`coverage-summary.json\` if present, or the runner's table output)

   This single run covers all changes since the project test suite is shared.

3. **Collect and run all e2e test plans**

   Scan for \`test-plan.md\` files under \`openspec/changes/*/test-plan.md\`.
   If none found: note "No test-plan.md files found — skipping e2e phase."

   For each \`test-plan.md\`, collect all entries that have a \`**Recommended tool**\` field
   (any tool name counts — Playwright, Cypress, WebdriverIO, etc.). Determine which e2e
   tool(s) are required by inspecting those fields.

   For each required tool:
   - Detect if the tool is configured in the project (e.g. \`playwright.config.ts\`,
     \`cypress.config.ts\`, \`wdio.conf.ts\`, or a matching entry in \`package.json\` devDependencies).
   - If the tool config is not found: note "No config detected for <tool> — skipping those entries."
   - If the tool config is found but the tool or its dependencies are not installed,
     **install them automatically** — do not skip. For example:
     - Playwright: run \`npx playwright install --with-deps\`
     - Cypress: run \`npx cypress install\`
     - Any npm-based tool: run \`npm install\` (or \`pnpm install\` / \`yarn install\`) in the
       project directory to restore missing node_modules, then install tool-specific
       browsers/binaries as needed.
   - After ensuring the tool is installed, run the e2e suite using the appropriate command
     (e.g. \`npx playwright test --reporter=json\`, \`npx cypress run --reporter json\`) and
     save the output to \`e2e-results/latest/<tool>-results.json\`.
   - Map each TP entry result (pass/fail) from the tool's output.

   **Never skip e2e tests because a dependency is missing — always install it first.**

4. **Compare screenshots against previous run**

   - Current screenshots: \`e2e-results/latest/artifacts/*.png\`
   - Previous run: find the most recent timestamped directory under \`e2e-results/\`
     (format: \`YYYY-MM-DD_HH-MM-SS/artifacts/\`).

   **Never read or view image files directly.** For each PNG in the current run, find the
   matching filename in the previous run, then use the Skill tool to invoke
   \`openspec-compare-images\`, passing the two image paths and asking it to compare them.

   Classify each pair based on the \`percent_diff\` value returned by the skill:
   - **MATCH** — \`percent_diff\` is 0
   - **MINOR_DIFF** — \`percent_diff\` ≤ 1.0 — likely layout noise or anti-aliasing
   - **REGRESSION** — \`percent_diff\` > 1.0 — meaningful visual difference

   If no previous run exists: "No previous run found — screenshots saved as baseline."

5. **Archive artifacts**

   After comparison, copy \`e2e-results/latest/\` into a new timestamped directory:
   \`e2e-results/<YYYY-MM-DD_HH-MM-SS>/\`  (timestamp = current run start time).
   Keep at most the 5 most recent timestamped directories; delete the oldest if there are more.
   \`e2e-results/latest/\` remains as the live output directory.

6. **Write ci-report.md**

   Save to \`openspec/ci-report.md\` (project-level, not per-change):

   \`\`\`markdown
   ## CI Report
   Generated: <ISO timestamp>

   ### Changes Covered
   | Change | spec-tests.md | test-report.md | test-plan.md |
   |--------|--------------|----------------|--------------|
   | add-auth | ✅ | ✅ | ✅ |
   | fix-bug | ✅ | ✅ | ❌ no plan |
   | draft-change | ❌ missing | ❌ missing | ❌ |

   ### Unit/Integration Test Results
   | Suite | Tests | Pass | Fail | Skip |
   |-------|-------|------|------|------|
   | Full project suite | N | P | F | S |

   ### Code Coverage (Full Project)
   | Metric | Coverage |
   |--------|----------|
   | Lines | X% (A/B) |
   | Branches | X% (A/B) |
   | Functions | X% (A/B) |
   | Statements | X% (A/B) |

   ### E2E Test Plan Results
   | Change | ID | Description | Verdict |
   |--------|----|-------------|---------|
   | add-auth | TP-1 | ... | ✅ PASS |

   ### Screenshot Comparison
   | Screenshot | Compared Against | Result |
   |------------|-----------------|--------|
   | TP-1_before.png | 2026-03-11_13-32-24 | ✅ MATCH |

   ### Regressions
   <list REGRESSION items with description of what changed>

   ### Artifacts
   - Coverage: \`coverage/lcov-report/index.html\`
   - Screenshots: \`e2e-results/latest/artifacts/\`
   - Archived to: \`e2e-results/<timestamp>/\`
   \`\`\`

**Heuristics**

- If the test runner already produces coverage (e.g., \`vitest --coverage\` is in package.json scripts),
  reuse that output rather than adding a duplicate flag.
- e2e tests do not produce line coverage — note this in the coverage section.
- Screenshot comparison must always be done by invoking the \`openspec-compare-images\` skill
  via the Skill tool. Never read or view image files directly.
- Overall CI verdict: **PASS** (all suites pass + no REGRESSION), **FAIL** (any suite failure or REGRESSION),
  **PARTIAL** (e2e skipped, coverage data unavailable, or some changes lack spec-tests.md).

**Graceful Degradation**

- Some changes missing \`spec-tests.md\`/\`test-report.md\`: report those as unchecked, continue with the rest.
- No \`test-plan.md\` found in any change: run unit/integration only, skip e2e.
- E2e tool or browsers not installed: install the missing dependency automatically before running. Never skip e2e tests because a dependency is missing.
- No previous screenshots: save as baseline, skip comparison.
- Test runner detection fails: ask the user rather than failing silently.
- Coverage tooling not configured: skip coverage metrics, note the gap.

**Output**

- Overall CI verdict: PASS / FAIL / PARTIAL
- List critical failures first
- If regressions: "N visual regression(s) — review \`e2e-results/latest/artifacts/\`"
- Confirmation that \`openspec/ci-report.md\` was written
- If any change lacks spec-tests.md: suggest \`/opsx-hw:gen-tests\` + \`/opsx-hw:run-tests\` for those changes
- If overall PASS: suggest \`/opsx-hw:archive\` to close completed changes`;

export function getCiSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-ci',
    description:
      'Run all tests (unit, integration, e2e from test-plan.md), compute code coverage, compare e2e screenshots against previous runs, and save artifacts.',
    instructions: `Run all tests, compute coverage, compare e2e screenshots, and save artifacts.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec-hw CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxCiCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: CI',
    description: 'Run all tests, compute coverage, compare e2e screenshots, save artifacts',
    category: 'Workflow',
    tags: ['workflow', 'test', 'ci', 'coverage', 'e2e', 'screenshot'],
    content: `Run all tests, compute coverage, compare e2e screenshots, and save artifacts.

${INSTRUCTIONS_BODY}`,
  };
}
