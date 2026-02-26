# Testing Workflow

This guide covers the test commands and how they fit into the overall workflow. For general workflow patterns, see [Workflows](workflows.md). For the full command reference, see [Commands](commands.md).

## The Testing Flow

After implementing a change with `/opsx-hw:apply`, the recommended path before archiving is:

```text
/opsx-hw:apply ──► /opsx-hw:gen-tests ──► /opsx-hw:run-tests ──► /opsx-hw:archive
                         │                        │
                  generates missing         validates coverage
                  tests + spec-tests.md     against spec paths
```

`/opsx-hw:gen-tests` analyses the spec, finds gaps, and generates tests. `/opsx-hw:run-tests` runs the suite and reports coverage aligned to spec use case paths. When coverage is complete or satisfactory, proceed to archive.

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
- Writes \`openspec/changes/<name>/spec-tests.md\` containing a Requirement Traceability Matrix (RTM) mapping each spec path/step to test files

**Tips:**
- Run after \`/opsx-hw:apply\` before archiving
- Generates full tests, not just stubs — follows existing framework and style
- \`spec-tests.md\` persists the spec→test mapping for use by \`/opsx-hw:run-tests\`
- Supporting code (mocks, fixtures, helpers) is placed in conventional project locations

---

### \`/opsx-hw:run-tests\`

Run the test suite and generate a spec-coverage report. Uses \`spec-tests.md\` (produced by \`/opsx-hw:gen-tests\`) when available.

**Syntax:**
```
/opsx-hw:run-tests [change-name]
```

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| \`change-name\` | No | Which change to report coverage for (inferred from context if not provided) |

**What it does:**
- Loads \`spec-tests.md\` if it exists (for accurate spec-path → test-file mapping using IDs)
- Detects the project's test runner from \`package.json\` scripts
- Runs the full test suite and captures output
- Produces a coverage report mapping each use case path/step to a pass/fail/missing status
- Highlights failing tests and uncovered paths

**Coverage report format:**

| Use Case | Happy | Extensions | Overall |
|----------|-------|------------|---------|
| \`<name>\` | ✅ N/N | ⚠️ N/N | X% |

**Tips:**
- Run after \`/opsx-hw:gen-tests\` for accurate per-path coverage
- Without \`spec-tests.md\`, falls back to keyword/file-path matching (less precise)
- Failing tests are listed with error details
- When coverage is complete or satisfactory, proceed to \`/opsx-hw:archive\`

---

## The \`spec-tests.md\` File

\`/opsx-hw:gen-tests\` writes \`openspec/changes/<name>/spec-tests.md\` — a persistent mapping of spec use case paths to test files. This file:

- Tracks which tests cover which spec paths/steps using IDs (UC1-S1)
- Maps single requirements to one or more tests of varying types (Unit, Component, Integration)
- Is read by \`/opsx-hw:run-tests\` for accurate coverage reporting
- Documents generated test infrastructure (mocks, fixtures, helpers)
- Lives alongside the other change artifacts and is archived with the change

**Format:**
\`\`\`markdown
# Spec–Test Mapping: <change-name>
Generated: <date>

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | <Name> Full Flow | Flow | Integration | \`test/integration.test.ts\` | ✅ |
| UC1-S1 | <Step Description> | Step | Unit | \`test/unit.test.ts\` | ✅ |
| UC1-S1 | <Step Description> | Step | Component | \`test/comp.test.ts\` | ✅ |
| UC1-E2a | <Extension Description>| Extension | Component | \`test/comp2.test.ts\` | ⚠️ |

## Use Case Details: <name> (ID: UC1)

### Main Scenario
- **UC1-S1**: <description> 
  - \`test/unit.test.ts:42\` (Unit)
  - \`test/comp.test.ts:12\` (Component)
- **UC1-S2**: <description> -> \`test/bar.test.ts:15\` (Component)

### Extensions
- **UC1-E2a**: <condition> -> \`test/comp2.test.ts:5\` (Component)

## Test Infrastructure

### Mocks & Fakes
- \`test/mocks/foo.mock.ts\` — <what it mocks and which tests use it>

### Fixtures & Seed Data
- \`test/fixtures/foo.json\` — <what data it contains and which tests use it>

### Helpers & Utilities
- \`test/helpers/foo.helper.ts\` — <what it provides and which tests use it>
\`\`\`

---

## Next Steps

- [Workflows](workflows.md) - General workflow patterns
- [Commands](commands.md) - Full command reference
