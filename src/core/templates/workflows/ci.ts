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

   For each \`test-plan.md\`, for entries with \`**Recommended tool**: Playwright\`:
   - Check for \`playwright.config.ts\` or \`playwright.config.js\` in the project root.
   - If found: run \`npx playwright test --reporter=json\` (once, not per plan) and save
     output to \`e2e-results/latest/playwright-results.json\`.
   - If not found: note "Playwright config not detected — skipping browser tests.
     Run \`npx playwright install\` to enable."
   - Map each TP entry result (pass/fail) from the Playwright output.

4. **Compare screenshots against previous run**

   - Current screenshots: \`e2e-results/latest/artifacts/*.png\`
   - Previous run: find the most recent timestamped directory under \`e2e-results/\`
     (format: \`YYYY-MM-DD_HH-MM-SS/artifacts/\`).

   For each PNG in the current run, find the matching filename in the previous run.
   Read both images and compare visually. Classify each pair as:
   - **MATCH** — no meaningful visual difference
   - **MINOR_DIFF** — layout noise, font rendering, or anti-aliasing artifact
   - **REGRESSION** — visible functional difference (missing element, wrong color, broken layout)

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
- Screenshot comparison uses visual judgment; err toward MINOR_DIFF over REGRESSION for
  sub-pixel or font-rendering differences.
- Overall CI verdict: **PASS** (all suites pass + no REGRESSION), **FAIL** (any suite failure or REGRESSION),
  **PARTIAL** (e2e skipped, coverage data unavailable, or some changes lack spec-tests.md).

**Graceful Degradation**

- Some changes missing \`spec-tests.md\`/\`test-report.md\`: report those as unchecked, continue with the rest.
- No \`test-plan.md\` found in any change: run unit/integration only, skip e2e.
- Playwright not installed: skip e2e, note how to install.
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
