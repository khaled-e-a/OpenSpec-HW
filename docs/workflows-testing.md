# Testing Workflow

This guide covers the test commands and how they fit into the overall workflow. For general workflow patterns, see [Workflows](workflows.md). For the full command reference, see [Commands](commands.md).

## The Testing Flow

The testing workflow is flexible and non-linear, allowing you to validate changes at any stage of the development lifecycle.

```text
          ┌────────────────────────────────┐
          │                                │
          ▼                                │
/opsx-hw:apply ──► /opsx-hw:archive        │
     │   ▲              │                  │
     │   │              ▼                  │
     └───┼───► /opsx-hw:gen-tests ──► /opsx-hw:run-tests
         │                                 │
         └─────────────────────────────────┘
```

- **Post-Apply**: Run `/opsx-hw:gen-tests` immediately after implementation to ensure full coverage before archiving.
- **Post-Archive**: You can still generate and run tests for changes already in the archive.
- **Iterative Fixes**: If `/opsx-hw:run-tests` identifies failures, loop back to `/opsx-hw:apply` to refine the code or implementation.

`/opsx-hw:gen-tests` analyses the spec, finds gaps, and generates tests. `/opsx-hw:run-tests` runs the suite and reports coverage aligned to spec use case paths.

---

## Commands

### `/opsx-hw:gen-tests`

Analyse spec.md use cases, discover existing tests, generate missing unit/component/integration tests with all supporting code, and produce a `spec-tests.md` mapping file.

**Syntax:**
```
/opsx-hw:gen-tests [change-name]
```

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `change-name` | No | Which change to generate tests for (inferred from context if not provided) |

**What it does:**
- Loads the spec and parses use case requirements (Main Scenario, Extensions)
- Assigns unique IDs to each use case (UC1) and step (UC1-S1, UC1-E2a)
- Discovers existing test files and maps them to use case requirements/steps
- Classifies each gap as Unit, Component, or Integration test
- Writes the full test (not just stubs) for each uncovered path
- Generates any missing supporting code: mocks, fakes, fixtures, helpers, factory functions
- Asks for confirmation before creating new files
- Writes `openspec/changes/<name>/spec-tests.md` containing a Requirement Traceability Matrix (RTM) mapping each spec path/step to test files

**Tips:**
- Run after `/opsx-hw:apply` before archiving
- Generates full tests, not just stubs — follows existing framework and style
- `spec-tests.md` persists the spec→test mapping for use by `/opsx-hw:run-tests`
- Supporting code (mocks, fixtures, helpers) is placed in conventional project locations

---

### `/opsx-hw:run-tests`

Run the test suite and generate a spec-coverage report. Uses `spec-tests.md` (produced by `/opsx-hw:gen-tests`) when available.

**Syntax:**
```
/opsx-hw:run-tests [change-name]
```

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `change-name` | No | Which change to report coverage for (inferred from context if not provided) |

**What it does:**
- Loads `spec-tests.md` if it exists (for accurate spec-path → test-file mapping using IDs)
- Detects the project's test runner from `package.json` scripts
- Runs the full test suite and captures output
- Produces a coverage report mapping each use case path/step to a pass/fail/missing status
- Highlights failing tests and uncovered paths

**Coverage report format:**

| Use Case | Happy | Alt | Exception | Overall |
|---|---|---|---|---|
| UC-01: Drag Widget to New Position | ✅ 1/1 | ✅ 2/2 | ❌ 0/1 | 75% |
| UC-02: Snap Widget to Grid Cell | ✅ 1/1 | ✅ 1/1 | ✅ 1/1 | 100% |
| UC-03: Resize Widget | ✅ 1/1 | ✅ 1/1 | ✅ 1/1 | 100% |

**Tips:**
- Run after `/opsx-hw:gen-tests` for accurate per-path coverage
- Without `spec-tests.md`, falls back to keyword/file-path matching (less precise)
- Failing tests are listed with error details
- When coverage is complete or satisfactory, proceed to `/opsx-hw:archive`

---

## The `spec-tests.md` File

`/opsx-hw:gen-tests` writes `openspec/changes/<name>/spec-tests.md` — a persistent mapping of spec use case paths to test files. This file:

- Tracks which tests cover which spec paths/steps using IDs (UC-02-S1)
- Maps single requirements to one or more tests of varying types (Unit, Component, Integration)
- Is read by `/opsx-hw:run-tests` for accurate coverage reporting
- Documents generated test infrastructure (mocks, fixtures, helpers)
- Lives alongside the other change artifacts and is archived with the change

**Example Format:**

### Spec–Test Mapping: [feature name]
Generated: [date]

#### Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC-02 | Snap Widget to Grid Cell | Flow | Component | `src/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| UC-02-S1 | Calculate nearest cell | Step | Unit | `src/__tests__/snapCalculation.test.ts` | ✅ |
| UC-02-S2 | Check unoccupied/bounds | Step | Unit | `src/__tests__/layoutUtils.test.ts` | ✅ |
| UC-02-S3 | Place flush to corner | Step | Unit | `src/__tests__/snapCalculation.test.ts` | ✅ |
| UC-02-S4 | Remove preview/render snapped | Step | Component | - | ⚠️ |
| UC-02-A1 | Nearest cell occupied | Alt | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-02-E1 | No available cell | Exc | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |

#### Use Case Details: Snap Widget to Grid Cell (ID: UC-02)

##### Main Scenario
- **UC-02-S1**: Calculate nearest cell -> `src/__tests__/snapCalculation.test.ts` (Unit)
- **UC-02-S2**: Check unoccupied/bounds -> `src/__tests__/layoutUtils.test.ts:hasCollision` (Unit)
- **UC-02-S3**: Place flush to corner -> `src/__tests__/snapCalculation.test.ts` (Unit)
- **UC-02-S4**: Remove preview/render snapped -> MISSING (Component)

##### Extensions
- **UC-02-A1**: Nearest cell occupied -> `src/__tests__/layoutReducer.test.ts:UC-01 Alt A2` (Unit)
- **UC-02-E1**: No available cell -> `src/__tests__/layoutReducer.test.ts:UC-01 Alt A3` (Unit)
