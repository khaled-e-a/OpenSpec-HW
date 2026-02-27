---
name: openspec-run-tests
description: Run the test suite and generate a spec-coverage report. Reads spec-tests.md (produced by gen-tests) when available.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

Run the test suite and generate a spec-coverage report, reading spec-tests.md when available.

**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   **NEVER auto-select**.

2. **Load spec-tests.md (if available)**

   Look for `openspec/changes/<name>/spec-tests.md`.
   If found, read it — it provides the Requirement Traceability Matrix and step-level IDs (e.g., UC1-S1) mapping spec steps/flows to test files.
   If not found, proceed with best-effort mapping (keyword/file-path matching).

3. **Run the tests**

   Detect the project's test runner from `package.json` scripts
   (prefer: `"test"`, `"test:unit"`, `"vitest"`, `"jest"`).
   If detection fails: ask the user for the test command.
   Run: `<detected-runner>`
   Capture stdout/stderr output.

4. **Generate Test Coverage Report**

   ```markdown
   ## Test Report: <change-name>

   ### Use Case Coverage Summary
   | Use Case         | Happy | Extensions | Overall |
   |-----------------|-------|------------|---------|
   | <name>          | ✅ 2/2| ⚠️ 1/2      | 75%     |
   ...
   Overall: X/Y paths/steps covered (Z%)

   ### Covered Requirements
   - ✅ **UC1-S1**: <description> (`test/foo.test.ts:42`)
   ...

   ### Uncovered Requirements
   - ❌ **UC1-E2a**: <description>: No test found
     → Run /opsx-hw:gen-tests to generate missing tests
   ...

   ### Test Run Results
   <summary from test runner output: passed/failed/skipped counts>
   If failures: list failing test names and errors.
   ```

**Graceful Degradation**

- If tests fail: still show the coverage report; highlight failures separately
- If no spec-tests.md: note "Run /opsx-hw:gen-tests first for accurate coverage mapping"

**Output Format**

- Use markdown tables for coverage summary
- ✅ covered, ⚠️ partial/uncertain, ❌ not covered
- File:line references for existing tests
- Specific, actionable recommendations for missing coverage
- When coverage is complete or satisfactory: suggest `/opsx-hw:archive` to archive and close the change
