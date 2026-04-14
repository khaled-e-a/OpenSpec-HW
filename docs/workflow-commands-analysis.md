# SynergySpec New Workflow Commands — Detailed Technical Report

**Modified/New Commands**: `new`, `continue`, `verify-spec`, `verify`, `tdd`, `gen-tests`, `run-tests`, `ci`.

---

## The new workflow

```
[Planning] new ─► continue × N ─► [Repair] verify-spec ─► [Implementation] tdd | apply ─► [Testing] gen-tests ─► run-tests ─► [Maintenance] verify ─► ci ─► archive
```


## Schemas and artifact graphs

A **schema** defines the ordered set of artifacts for a change, their dependencies, the per-artifact template, context bundle, and rules. The default is `spec-driven` whose artifact chain is:

```
proposal ─► [New] usecases ─► specs/**/*.md ─► design ─► tasks
```

In SynergySpec, we add the new `usecases` artifact after the `proposal` artifact, unlike OpenSpec which has no `usecases` artifact.

Every artifact has a state: `blocked` (upstream missing), `ready` (ok to create), or `done` (file exists). The CLI exposes the state machine via three key commands the workflows invoke:

| CLI call | Returns |
|---|---|
| `synergyspec-hw list --json` | All changes, sorted by `lastModified`, with `schema` and progress |
| `synergyspec-hw status --change <name> --json` | `schemaName`, per-artifact state, `isComplete` |
| `synergyspec-hw instructions <artifact\|apply> --change <name> --json` | `template`, `context`, `rules`, `outputPath`, `dependencies`, `contextFiles` |
| `synergyspec-hw new change <name> [--schema X]` | Create a scaffold for a change |

The workflow commands never manipulate state directly; they **drive the CLI as the state authority** and only use the filesystem for artifact content.

## Traceability — `UCn-Sm` / `UCn-Ema`

Every requirement, task, design decision, and test ultimately refers back to a single **Use Case Traceability ID** defined in `usecases.md`. The ID format is:

- `UCn` — use case main path (`UC1`)
- `UCn-Sm` — main scenario step (`UC1-S3`)
- `UCn-Em` - extension path (`UC1-E2`)
- `UCn-Ema` — extension step (`UC1-E2a`, `UC2-E3b`)

This is the glue between specs, design, tasks, tests, and the code.

The `usecases.md` file **must** contain a section called `## Use Case Traceability Mapping` — a flat table of `| ID | Canonical Description |`. All downstream artifacts copy descriptions **verbatim** from this table:

```markdown
| ID | Canonical Description |
|----|-----------------------|
| UC1 | User wants to use the timer for a work session|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins countdown from 30:00, updating each second |
| UC1-E5a | Timer completes while user is away; system holds completion state |
| ... | ... |
```

This table is the **single source of truth**. Downstream artifacts reference each ID depending on artifact type:

| Artifact | Annotation | Semantics |
|---|---|---|
| `specs/**/spec.md` | `**Implements**: UC1-S3 - <canonical description>` | This requirement *realises* the step |
| `design.md` | `**Addresses**: UC1-S3 - <canonical description>` | This design decision *enables* the step |
| `tasks.md` | `(Addresses: UC1-S3)` or `(Addresses: UC1-S3, UC2-S1)` | This task *implements* the step |
| `spec-tests.md` | Row with `ID=UC1-S3` mapping to a test case | This test *verifies* the step |
| `test-report.md` | Coverage bullet with `UC1-S3` + test path | The step is/isn’t observed to pass |

Because every annotation contains the canonical ID + prose, mechanical verification is possible — and that is precisely what `verify-spec` does.

---

## Command-by-command analysis

### `new` — Scaffold a new change

**Source**: `src/core/templates/workflows/new-change.ts`
**Invocation**: `/synspec:new <name-or-description>`

#### Goal
Create the `synergyspec/changes/<name>/` directory for a new change, initialise it against a schema, and *show* (not write) the first artifact template to the user. It is deliberately an inspection-only command — it never generates content.

#### Flow
1. **Derive name**. If the user omits a name, invoke the `AskUserQuestion` tool (open-ended) to ask “What change do you want to work on?” and derive a kebab-case name from the description (“add user authentication” → `add-user-auth`). Non-kebab-case names are rejected.
2. **Pick schema**. Default = omit `--schema` (uses the project default from `config.yaml`). Only if the user explicitly mentioned a schema, pass `--schema <name>`. Never auto-negotiate.
3. **`synergyspec-hw new change "<name>"`** — CLI scaffolds the directory with empty artifact slots for the chosen schema.
4. **`synergyspec-hw status --change "<name>"`** — prints the initial artifact graph: `0/N` complete, first artifact is `ready`, rest are `blocked`.
5. **`synergyspec-hw instructions <first-artifact-id> --change "<name>"`** — prints the template, context, and rules for the first artifact (typically `proposal`).
6. **STOP**. Does not write the artifact.

#### Output sections
- Change name + directory path
- Schema name and ordered artifact sequence
- Current progress (`0/N`)
- The rendered template for the first artifact
- A prompt: *“Ready to create the first artifact? Describe the change, or run `/synspec:continue`.”*

#### Guardrails
- Never creates any artifact file — only `new change` + printing.
- Never auto-advances beyond the first artifact.
- If `<name>` already exists, suggest `/synspec:continue` instead.

---

### `continue` — Create the next artifact

**Source**: `src/core/templates/workflows/continue-change.ts`
**Invocation**: `/synspec:continue [name]`

#### Goal
Advance a change by exactly **one** artifact per invocation, driven by the schema’s dependency graph. It is the general-purpose authoring loop the user runs repeatedly until `isComplete: true`.

#### Flow
1. **Select change**. If ambiguous, `list --json` and use `AskUserQuestion` to present the top 3–4 most-recently-modified changes with name, schema, progress, and `lastModified`; the most recent is labelled “(Recommended)”. **Never auto-select**.
2. **`status --change <name> --json`** — determine `schemaName`, artifact states, and `isComplete`.
3. **Branch on state**:
   - `isComplete` → congratulate, suggest `/synspec:apply` or `/synspec:tdd`, STOP.
   - At least one `ready` → pick the **first** `ready` artifact; fetch `instructions <id> --change <name> --json`.
   - All blocked → error (shouldn’t happen with a valid schema).
4. **Parse the instructions JSON**:
   - `context` — project background (for the agent, not the file)
   - `rules` — artifact-specific rules (for the agent, not the file)
   - `template` — markdown skeleton to fill in
   - `instruction` — schema-specific prose
   - `outputPath` — where to write
   - `dependencies` — upstream files to read for context
5. **Read all dependency files**, then **write the artifact** by filling the `template` sections under the guidance of `context` + `rules`. Critically: `<context>`, `<rules>`, `<project_context>` blocks are *never* copied into the output — they are prompt constraints, not content.
6. **Re-run `status`** to show the new unlock delta, then STOP.

#### Spec-driven playbook (embedded in the template)
The command template hard-codes a detailed authoring playbook for the default schema so an agent that has never run it can produce valid artifacts:

- **proposal.md** — Why, What Changes, Capabilities, Impact, Use Case Requirements. Each capability listed here becomes a future `specs/<capability>/spec.md`. The pomodoro demo signs each proposal with `Created by Khaled@Huawei` (a project convention captured in the template).
- **usecases.md** — Cockburn-style use cases (Name, Primary Actor, Stakeholders & Interests, Preconditions, Trigger, Main Success Scenario 3–9 steps, Extensions, Postconditions). Then appends the canonical `## Use Case Traceability Mapping` table — the ground truth for everything downstream.
- **specs/\<capability\>/spec.md** — one spec per capability; every requirement carries `**Implements**: UCn-Sm - <canonical description>`, copied verbatim from the mapping table. In the pomodoro demo, `task-notes/spec.md` opens with a `## Use Case Traceability` preamble listing all UC steps it owns, then every `### Requirement` block carries the `**Implements**` annotation:

```markdown
### Requirement: Display task-notes panel during work session
**Implements**: UC3-S1 - System displays the task-notes panel during the work session
The system SHALL render the task-notes panel in the UI when and only when
`sessionType` is `work`.

#### Scenario: Panel visible during work session
- **WHEN** sessionType is `work`
- **THEN** the task-notes panel SHALL be visible in the UI
```

Note that (a) a single requirement can own multiple steps (`**Implements**` lines can repeat) and (b) each requirement contains one or more `#### Scenario: <name>` blocks with `**WHEN**` / `**THEN**` pairs — these become the input for property-based test generation in `gen-tests`.

- **design.md** — technical decisions with `**Addresses**: UCn-Sm - <canonical description>` annotations. Each decision maps to the step it enables.
- **tasks.md** — implementation checklist with `(Addresses: UCn-Sm)` trailing each task. Every main scenario step must appear in at least one task. Demo excerpt:

```markdown
- [x] 1.1 Update `WORK_DURATION` in `src/types/timer.ts` from 1500 to 1800
      (Addresses: UC1-S1, UC1-S2, UC1-S4)
- [x] 4.3 Add a `useEffect` in `App.tsx` watching `[state.sessionType, state.status]`
      that calls `setNote('')` when `state.sessionType === 'work' && state.status === 'idle'`
      (Addresses: UC4-S1, UC4-S2, UC4-S3, UC4-E1a)
```

#### Output sections
- Which artifact was created (path)
- Schema name
- New progress (`N/M`)
- What artifacts are now unlocked
- Prompt to continue

#### Guardrails
- Exactly one artifact per invocation.
- Dependencies must be read before writing.
- Never skip or re-order artifacts.
- Verify file exists on disk before reporting progress.

---

### `verify-spec` — Traceability repair

**Source**: `src/core/templates/workflows/verify-spec.ts`
**Invocation**: `/synspec:verify-spec [name]`

#### Goal
Enforce exact, bidirectional traceability between `usecases.md` and every dependent artifact (`specs/**/spec.md`, `design.md`, `tasks.md`). It **repairs** existing files — it never creates new ones. It is the auditor that makes the traceability tables trustworthy.

#### Flow

1. **Select** a change; require `usecases.md` to exist (filter `list --json` on that).
2. **Load artifacts** via `instructions apply --change <name> --json` → use the returned `contextFiles` to read `usecases.md` (required), plus optional `specs/**/*.md`, `design.md`, `tasks.md`.
3. **Parse ground truth**. For each `### Use Case N:` section, walk the Main Success Scenario’s numbered list (→ `UCn-Sm`) and Extensions (`2a.`, `3b.` → `UCn-Ema`). Capture the **exact prose** of each step. That is the canonical description.
4. **Verify the Traceability Mapping table**:
   - Missing step → insert a row in step-ID order.
   - Description differs from canonical → overwrite with exact canonical prose.
   - Phantom row (ID has no matching step in the scenarios) → delete.
5. **For each `specs/**/spec.md`**:
   - **Preamble block**: ensure a `## Use Case Traceability` section exists listing every owned step with canonical prose.
   - **Requirement annotations**: walk every `**Implements**: UCn-Sm - description` line. Phantom → remove; inaccurate → rewrite to canonical text; missing for a relevant step → add a new requirement referencing the step ID.
6. **For `design.md`**: same logic as the specs but for `**Addresses**: UCn-Sm - description` lines.
7. **For `tasks.md`**: same logic as the specs but for `(Addresses: UCn-Sm)` tags.
8. **Never create a file** that doesn’t already exist.
9. **Print a verification report** :

```
## Traceability Verification Report: <change-name>

### Ground Truth
- Use cases found: N
- Total steps (main + extensions): M

### usecases.md
- Rows added: X | Rows fixed: Y | Phantom rows removed: Z

### specs/<name>/spec.md
- Preamble entries fixed: X
- Requirement annotations: added N, fixed M, removed Z

### design.md
- Annotations: added N, fixed M, removed Z

### tasks.md
- Annotations: added N, fixed M, removed Z

### Result
All traceability annotations are consistent. ✓
```

#### Why it matters
Without `verify-spec`, traceability annotations rot — a step ID gets renamed in `specs.md`, but none of the downstream files notice. `verify-spec` makes `usecases.md` the single source of truth and every other artifact reference it. `gen-tests`, `verify`, and `ci` all rely on this table being correct, so `verify-spec` is can be run after any `continue` iteration that touched `usecases.md`.

---

### `tdd` — Red-Green-Refactor implementation

**Source**: `src/core/templates/workflows/tdd.ts`
**Invocation**: `/synspec:tdd [name]`

#### Goal
Implement `tasks.md` under strict Red-Green-Refactor discipline as an alternative to `/synspec:apply`. Both commands consume/update the same `- [x]` checkboxes, so they are freely interchangeable mid-change.

**Note:** The instructions for this command are copied from Superpowers.

#### Flow
1. **Select** the change (by arg, context inference, or `AskUserQuestion`). Announce: `Using change: <name>` and how to override.
2. **`status --json` + `instructions apply --change <name> --json`**. Branch on state:
   - `blocked` → suggest `/synspec:continue`.
   - `all_done` → suggest `/synspec:gen-tests`.
   - Otherwise → proceed.
3. **Read all `contextFiles`** — proposal, usecases, specs, design, tasks.
4. **Display progress**: schema, `N/M tasks complete`, remaining tasks, CLI-provided dynamic instruction.
5. **For each pending task — the TDD cycle**, embedded in full in the template:

   **Iron Law** — *NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.* Wrote code before the test? Delete it. Start over. No keeping “for reference,” no “adapting” — delete means delete.

   **RED**:
   - Write one minimal test of exactly one behaviour, named after the behaviour and, wherever possible, tagged with a UC step ID (e.g. `test('UC1-S2: catalogue always shows only absent widgets', ...)`).
   - Prefer real code over mocks; mocks only where unavoidable.

   **Verify RED** (mandatory):
   - Run `<test runner> <path>`. Confirm (1) the test *fails* (not errors), (2) the failure message is what you expected, (3) failure is because the feature is missing — not a typo. A test that passes immediately is a bad test; a test that errors is a broken test. Both require fixing before green.

   **GREEN**:
   - Write the *simplest* code that makes the test pass. No extras, no YAGNI. The template contrasts a 6-line `retryOperation` against an over-engineered version with `maxRetries`, `backoff`, `onRetry` — and flags the latter as wrong.

   **Verify GREEN** (mandatory):
   - Run the target test plus the rest of the suite. All must pass, output pristine (no warnings or errors). If the target test still fails, fix the code, not the test. If another test fails, fix it now.

   **REFACTOR**:
   - Only after green. Remove duplication, improve names, extract helpers. No behaviour changes. Keep tests green.

6. **Mark the task** complete (`- [x]` in `tasks.md`) and move on.

#### Output sections (per task)
```
## TDD: <change-name> (schema: <schema-name>)

Task 3/7: <task description>
  RED      — wrote failing test `test/widget-add.test.ts:45` ("UC1-S2: ...")
  GREEN    — implemented `src/catalogue/filterWidgets.ts`
  REFACTOR — extracted `isOnGrid()` helper
  ✓ Task 3 complete
```

On completion:
```
## TDD Complete: <change-name>
<N>/<N> tasks complete ✓

Next steps:
1. /synspec:gen-tests — generate any missing tests
2. /synspec:run-tests — run the full suite and produce coverage report
3. /synspec:ci        — full CI run
4. /synspec:archive   — close the change
```

#### The rationalizations table
The template bakes in a long table of common TDD excuses with rebuttals:

| Excuse | Reality |
|---|---|
| “Too simple to test” | Simple code breaks. Test takes 30 seconds. |
| “I’ll test after” | Tests passing immediately prove nothing. |
| “Already manually tested” | Ad-hoc ≠ systematic. No record, can’t re-run. |
| “Deleting X hours is wasteful” | Sunk cost fallacy. |
| “Keep as reference” | You’ll adapt it — that’s testing-after. |
| “TDD is dogmatic; I’m being pragmatic” | TDD is pragmatic — it’s faster than debugging. |

And a **Red Flags / STOP** list that triggers a start-over: code before test, test passes immediately, tests added “later”, can’t explain why test failed. All these map to *delete and restart*.

#### Testing anti-patterns
The skill template bundles a companion file `testing-anti-patterns.md` (shipped as part of the skill installation) covering 10 patterns to avoid: testing implementation details, excessive mocking, testing mock behaviour, brittle test data, multi-behaviour tests, skipping edge cases, copy-pasted setup, time-dependent tests, testing private methods, overly complex setup. Each carries a ❌/✅ code pair. `tdd` explicitly references `@testing-anti-patterns.md` when adding mocks.

#### Heuristics
- Detect existing test framework/style — never introduce a new one without asking the user.
- A task spanning multiple spec steps may need multiple failing tests in RED before switching to GREEN.
---

### 2.5 `gen-tests` — Spec-to-test coverage generator

**Source**: `src/core/templates/workflows/gen-tests.ts`
**Invocation**: `/synspec:gen-tests [name]`

#### Goal
Produce `synergyspec/changes/<name>/spec-tests.md` — the authoritative mapping from every requirement and UC step to the test(s) that verify it — and write any missing regular and property-based tests so the mapping can be fully populated.

#### Flow

1. **Select** a change with at least one spec artifact (`list --json` + `AskUserQuestion`).
2. **Load use cases** via `instructions apply --json` → `contextFiles` → read `usecases.md` and every spec in `synergyspec/changes/<name>/specs/`.
3. **Scaffold `spec-tests.md`** with its fixed section skeleton.
4. **Extract spec→usecase mapping** from the spec files: Requirement ID, `**Implements**` references, `#### Scenario:` blocks with `WHEN`/`THEN`.
5. **Discover existing tests** in the codebase. Classify each by **requirement scope** — not by code layer:
   - **Unit**: verifies exactly one step or extension (one ID).
   - **Component**: verifies multiple steps within a single UC.
   - **Integration**: verifies the full flow of a UC, or cross-UC requirements.

   Note: a React Testing Library test that calls into the DOM is still “Unit” if it verifies one step; an API-level test that walks the entire happy path is “Integration”. The axis is spec coverage, not framework.

6. **Generate missing example-based tests** for every uncovered step/extension. Pick the test file closest to the existing code location; follow existing style; write stubs where a full test can’t be reasonably inferred.

7. **Generate property-based tests (PBT)**. Detect the PBT framework from existing imports / package metadata:

   | Language | Framework | Detection |
   |---|---|---|
   | TS/JS | `fast-check` | import or `package.json` |
   | Python | `hypothesis` | import or deps |
   | Java/Kotlin | `jqwik` | `@Property` or build file |
   | Go | `rapid` | import or `go.mod` |
   | Rust | `proptest` | import or `Cargo.toml` |
   | C/C++ | `rapidcheck` | include or CMake/Conan |
   | Unknown | ask user via `AskUserQuestion` | — |

   **Every WHEN/THEN scenario must have exactly one PBT test.** The mapping is:
   - `WHEN` → a generator expression plus a precondition guard (`fc.pre`, `assume`, etc.)
   - `THEN` → an invariant the property must hold over all generated inputs
   - If `WHEN` has no parameterisable variable (“WHEN the app loads”), generate arbitrary system/environment state as input and use `THEN` alone as the invariant — never skip the scenario.

8. **Write `spec-tests.md`**. The file has a fixed structure. Multiple rows per step are expected — a single step may have Unit, Component, Integration, and PBT tests simultaneously.

#### Output file structure — with demo data

Example:


```markdown
# Spec-Test Mapping: timer-adjustments-and-task-notes
Generated: 2026-04-02

## Requirement Traceability Matrix

| ID       | Requirement                                      | Type      | Test Type   | Test Case                                              | Status |
|----------|--------------------------------------------------|-----------|-------------|--------------------------------------------------------|--------|
| UC1      | Complete an Extended Work Session — Full Flow    | Flow      | Integration | `src/test/usePomodoro.test.tsx:93`                     | ✅     |
| UC1-S1   | User starts the timer to begin a work session    | Step      | Unit        | `src/test/timerDisplay.test.tsx:118`                   | ✅     |
| UC1-S1   | User starts the timer to begin a work session    | Step      | PBT         | `src/test/timerEngine.property.test.ts:18`             | ✅     |
| UC1-S2   | System begins countdown from 30:00...            | Step      | Unit        | `src/test/timerDisplay.test.tsx:15`                    | ✅     |
| UC1-S2   | System begins countdown from 30:00...            | Step      | PBT         | `src/test/timerEngine.property.test.ts:30`             | ✅     |
| UC1-S2   | System begins countdown from 30:00...            | Step      | PBT         | `src/test/timerDisplay.property.test.tsx:43`           | ✅     |
| UC3-E4a  | User manually clears the note...                 | Extension | Unit        | `src/test/taskNotes.test.tsx:86`                       | ✅     |
| UC3-E4a  | User manually clears the note...                 | Extension | PBT         | `src/test/taskNotes.property.test.tsx:94`              | ✅     |
| ...      | ...                                              | ...       | ...         | ...                                                    | ...    |
```

Columns:
- **ID** — UC step ID or full-flow UC ID
- **Requirement** — canonical prose (copied from the traceability mapping; must match)
- **Type** — `Flow` (entire UC), `Step` (main scenario), or `Extension` (UCn-Ema)
- **Test Type** — `Unit`, `Component`, `Integration`, or `PBT`
- **Test Case** — file:line reference with optional inline description
- **Status** — ✅ passing, ⚠️ partial/uncertain, ❌ missing

After the matrix, a dedicated **PBT Coverage** table tracks every WHEN/THEN scenario:

```markdown
## PBT Coverage

| UC Step | Scenario                                       | PBT Test                                       | Framework  | Status |
|---------|------------------------------------------------|------------------------------------------------|------------|--------|
| UC1-S2  | formatTime always produces valid MM:SS         | `src/test/timerDisplay.property.test.tsx:23`   | fast-check | ✅     |
| UC1-S4  | Running timer always decrements without input  | `src/test/timerEngine.property.test.ts:50`     | fast-check | ✅     |
| UC3-E4a | Panel always in DOM after Clear + reset to ""  | `src/test/taskNotes.property.test.tsx:108`     | fast-check | ✅     |
| UC4-E1a | Note always empty after prop transitions to "" | `src/test/taskNotes.property.test.tsx:132`     | fast-check | ✅     |
```

Then a **Use Case Details** section per UC groups tests by step + extension + full flow:

```markdown
## Use Case Details: Complete an Extended Work Session (ID: UC1)

### Main Scenario
- **UC1-S1**: User starts the timer to begin a work session
  - `src/test/timerDisplay.test.tsx:118` — Start button visible when idle (Unit)
  - `src/test/timerEngine.property.test.ts:18` — timer always starts from full duration (PBT)
- **UC1-S2**: System begins countdown from 30:00, updating each second
  - `src/test/timerDisplay.test.tsx:15` — renders 30:00 for a fresh work session (Unit)
  - `src/test/timerEngine.property.test.ts:30` — each tick decrements by 1 second (PBT)
  - `src/test/timerDisplay.property.test.tsx:43` — renders valid MM:SS (PBT)
- ...

### Extensions
- **UC1-E5a**: Timer completes while user is away; system holds completion state
  - `src/test/timerEngine.property.test.ts:72` — completed state persists (PBT)

### Full Flow Tests
- `UC1` — "Complete an Extended Work Session" → `src/test/usePomodoro.test.tsx:93` (Integration)
```

9. **Decision point**. Report missing example-based tests and any ❌ rows in PBT Coverage. **Ask** whether to regenerate. Do not proceed without confirmation.

#### Heuristics:
   - Prefer writing tests in the same file/directory as existing tests for the module.
   - Never introduce a new test framework or PBT library. Ask before adding.
   - Classify by requirement boundary, not code layer.
   - When uncertain about a test, mark ⚠️ not ✅ (false positives > false confidence).

#### Output
- Confirmation `spec-tests.md` was written
- Prompt: `Run /synspec:run-tests to execute the suite and generate a coverage report.`

---

### `run-tests` — Execute suite + coverage report + test plan

**Source**: `src/core/templates/workflows/run-tests.ts`
**Invocation**: `/synspec:run-tests [name]`

#### Goal
Actually run the test suite, produce a use-case-keyed coverage report, promote any PBT failures to deterministic regression tests, and emit a manual test plan for anything that cannot be verified automatically.

#### Flow

1. **Select** a change (never auto).
2. **Load `spec-tests.md`** if present — it provides the ground-truth ID→test mapping. If absent, fall back to heuristic (keyword/file-path) matching during the report phase.
3. **Detect and run the test runner**; if detection fails, ask the user. Capture stdout + stderr.
4. **Step 3b — PBT promotion to regression test**. Scan stdout for framework-specific counterexample markers:

   | Framework | Marker |
   |---|---|
   | fast-check | `Property failed after N tests` + `Counterexample: [...]` |
   | Hypothesis | `Falsifying example:` |
   | jqwik | `Falsified!` + parameter values |
   | rapid / rapidcheck | `Falsifiable input:` |
   | proptest | `FAILED. Minimal failing input:` |

   For each counterexample:
   1. Extract the minimal shrunk input.
   2. Write a deterministic regression test `pbt-regression-<uc-id>-<N>.<ext>` in the same directory as the failing property test, hardcoding the input. This test must pass after the fix and **must never be deleted**.
   3. Append a row to `synergyspec/changes/<name>/pbt-regressions.md`:

```markdown
## PBT Regressions: <change-name>

| # | UC Step | Framework | Counterexample     | Regression Test                                 | Status |
|---|---------|-----------|--------------------|-------------------------------------------------|--------|
| 1 | UC1-S2  | fast-check| `onGrid=["clock"]` | `test/pbt-regression-uc1-s2-1.test.ts`          | ❌ open |
```

   On later runs that pass the regression test, flip its status to `✅ fixed`. The pomodoro demo had **zero counterexamples**, so its `pbt-regressions.md` was never created.

5. **Generate `test-report.md`** at `synergyspec/changes/<name>/test-report.md`. Sections (with demo data):

   **Use Case Coverage Summary**:
```markdown
| Use Case | Happy Path | Extensions | Overall |
|---|---|---|---|
| UC1: Complete an Extended Work Session | ✅ 6/6 | ✅ 1/1 | 100% |
| UC2: Recover with an Extended Long Rest | ✅ 5/5 | ✅ 1/1 | 100% |
| UC3: Capture a Note During a Work Session | ✅ 5/5 | ✅ 2/2 | 100% |
| UC4: Note Is Cleared at Session Boundary | ✅ 3/3 | ✅ 1/1 | 100% |

**Overall: 24/24 use case steps covered (100%)**
```

   **Covered Requirements** — every UC step with at least one ✅ test and its file:line references by test type.
   **Uncovered Requirements** — every ❌ / ⚠️ with a recommendation to run `/synspec:gen-tests`.
   **PBT Results** — table per property: step, scenario, outcome (`✅ passed (100 runs)` or `❌ failed`), counterexample, regression test.
   **Test Run Results** — summary plus a per-file count table:

```markdown
Test Files  8 passed (8)
     Tests  100 passed (100)
  Duration  18.93s

| File                                      | Tests | Type                     |
|-------------------------------------------|-------|--------------------------|
| src/test/sessionUtils.test.ts             | 10    | Unit                     |
| src/test/usePomodoro.test.tsx             | 10    | Unit + Integration + PBT |
| src/test/timerDisplay.test.tsx            | 27    | Unit + Component         |
| src/test/sessionManager.property.test.ts  | 12    | PBT                      |
| src/test/timerEngine.property.test.ts     | 8     | PBT                      |
| src/test/timerDisplay.property.test.tsx   | 10    | PBT                      |
| src/test/taskNotes.test.tsx               | 13    | Unit + Component         |
| src/test/taskNotes.property.test.tsx      | 10    | PBT                      |
```

6. **Step 5 — Generate `test-plan.md`** if any ⚠️/❌ requirement exists in the report. For each, classify the blocking reason:

   | Code | When |
   |---|---|
   | `BROWSER` | Needs real browser APIs (PointerEvents, drag-and-drop, WebGL, clipboard, file picker) |
   | `EXTERNAL_API` | Live third-party service (payment, OAuth, email, SMS) |
   | `INFRA` | Real infrastructure (DB, queue, filesystem, OS service) |
   | `ENV` | Specific env config (secrets, hardware, device, OS) |
   | `TIMING` | Real time passage, animation frames, flaky async |
   | `MANUAL_UX` | Visual/UX judgment (layout, animation, a11y) |
   | `OTHER` | Anything else; describe in the entry |

   One entry per uncovered item:

```markdown
## TP-1: UC1-S3 — User drags a widget onto the grid

**Blocking reason**: BROWSER — jsdom does not dispatch PointerEvents realistically
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at http://localhost:5173
- Catalogue has at least 3 widgets

**Test Steps**
1. Open the app at http://localhost:5173
2. Click the "Catalogue" button in the header
3. Press and hold the "clock" widget card
4. Drag the cursor to grid cell (2, 3)
5. Release the mouse button

**Expected Result**
- Clock widget appears at grid cell (2, 3)
- Catalogue no longer lists "clock"
- Grid row count increases by 1

**Failure indicators**
- Widget snaps back to catalogue
- Grid cell remains empty
- Console shows "drop rejected"

**Automation path** *(optional)*
Playwright `locator.dragTo()` with `{ sourcePosition, targetPosition }`.
```

   Rules: steps must be concrete and atomic (click/type/navigate/wait); expected results must reference actual UI text, element state, or network response; use `<placeholder>` for tester-substituted values.

   If all requirements are covered automatically, **skip** `test-plan.md` — note “All requirements covered — no test plan needed.”

#### Output
- Markdown tables with ✅ / ⚠️ / ❌ status for passing, warning, or failing tests.
- File:line references for every existing test.
- Suggest `/synspec:archive` if coverage is complete; suggest `/synspec:ci` for full CI.

---

### `verify` — Implementation audit + blast radius

**Source**: `src/core/templates/workflows/verify-change.ts`
**Invocation**: `/synspec:verify [name]`

#### Goal
Determine whether the implemented code actually satisfies the change artifacts, along three dimensions (Completeness / Correctness / Coherence), and identify which existing specs in `synergyspec/specs/` are impacted by the code diff. It is the pre-archive audit.

#### Flow

1. **Select** a change with `tasks.md`, marking in-progress changes as such.
2. **`status --json`** → determine schema + existing artifacts.
3. **`instructions apply --change <name> --json`** → change directory + context files.
4. **Initialise the report** with three dimensions, each allowing CRITICAL / WARNING / SUGGESTION issues.

5. **Completeness**:
   - Parse `tasks.md` for `- [ ]` vs `- [x]`; count complete vs total; each incomplete = CRITICAL.
   - Parse every `### Requirement:` in delta specs; search codebase for keyword evidence; each missing requirement = CRITICAL.

6. **Correctness**:
   - For each requirement, search code for implementation evidence; if found, note `file.ts:123`; if divergence (implementation does the wrong thing) = WARNING with review recommendation.
   - For each `#### Scenario:` in delta specs, check (a) behaviour is present in code, (b) a test exists covering it. Uncovered = WARNING.

7. **Coherence**:
   - Extract design decisions from `design.md` (`Decision:`, `Approach:`, `Architecture:`); verify each is followed. Contradiction = WARNING; `Update implementation or revise design.md to match reality`.
   - Code-pattern consistency (file naming, directory structure, style) — SUGGESTION only, never escalate.

8. **Generate `verification-report.md`**. Demo excerpt (excellent reference because it exercises every table):

```markdown
# Verification Report: timer-adjustments-and-task-notes

## Summary
| Dimension    | Status                                              |
|--------------|-----------------------------------------------------|
| Completeness | ✅ 23/23 tasks · 18 requirements across 4 specs     |
| Correctness  | ✅ All requirements implemented · 0 divergences     |
| Coherence    | ✅ All 4 design decisions followed                  |

## ✅ COMPLETENESS

**Task completion**: 23/23 complete — all checkboxes marked `[x]`.

| Spec                   | Requirements     | Evidence                                                 |
|------------------------|------------------|----------------------------------------------------------|
| `timer-engine` (delta) | 3 MODIFIED       | `src/types/timer.ts:8` — `WORK_DURATION = 30 * 60` ✓    |
| `session-manager`      | 5 MODIFIED       | `src/utils/sessionUtils.ts` — all named constants ✓      |
| `timer-display`        | 4 MODIFIED + 1 ADDED | `App.tsx:52` conditional render ✓                    |
| `task-notes` (new)     | 5 ADDED          | `TaskNotes.tsx` — controlled textarea + Clear ✓          |

## ✅ CORRECTNESS

| Requirement            | Scenario                      | Implementation                              | Verdict |
|------------------------|-------------------------------|---------------------------------------------|---------|
| Display panel during work | Panel visible → `work`     | `App.tsx:52` `sessionType === 'work'`       | ✅      |
| Accept user input         | Textarea editable          | `TaskNotes.tsx:15-19`                       | ✅      |
| Persist note              | Survives focus loss        | State in `App`, not tied to session status  | ✅      |
| Clear at session boundary | Note cleared on new work   | `App.tsx:21-25` `useEffect`                 | ✅      |
| ...                       | ...                        | ...                                         | ...     |

## ✅ COHERENCE

All 4 design decisions followed:
- Decision 1: constants only in `src/types/timer.ts` → ✅
- Decision 2: conditional render `{sessionType === 'work' && <TaskNotes />}` → ✅
- Decision 3: TaskNotes as controlled textarea → ✅
- Decision 4: `useEffect` watching `[sessionType, status]` → ✅

## 💡 SUGGESTIONS
**S1**: Existing main specs in `synergyspec/specs/` still reference old durations
(deferred to archive delta sync).
**S2**: No CSS defined for `.task-notes` — cosmetic, not functional.
**S3**: No automated tests yet for task-notes — run `/opsx-hw:gen-tests`.

## Final Assessment
✅ Implementation is complete and correct. Ready for `/opsx-hw:gen-tests` → `/opsx-hw:archive`.

📍 Blast radius: 3 spec(s) impacted → `...spec-blast-radius.md`
```

9. **Spec Impact Analysis — Blast Radius**. This is `verify`'s most novel contribution: it identifies which *existing* main specs are now stale because of the code the change introduced.

   **9a — get changed files**:
```bash
git diff --name-only $(git merge-base HEAD main) HEAD
# fallback
git diff --name-only HEAD~1 HEAD
```
   No git or no diff → note it and write a minimal `spec-blast-radius.md` saying so.

   **9b — keyword index**: for each changed file, extract (i) directory path segments (`src/auth/session.ts` → `["auth", "session"]`) and (ii) exported symbol names (`export (function|class|const|type|interface) \w+`).

   **9c — enumerate existing specs**: every `synergyspec/specs/**/*.md`. For each: capture the capability name (parent folder), every `### Requirement:` heading, every `**Implements**: UCx-Sy` pattern, and a keyword set of meaningful (>4 chars) words from requirements and WHEN/THEN clauses.

   **9d — score each spec**:
   - **High impact** — either:
     - a changed file path segment exactly matches the spec's capability folder name (`src/user-auth/*` ↔ `synergyspec/specs/user-auth/spec.md`); or
     - the change's **own** delta specs (`synergyspec/changes/<name>/specs/`) contain `**Implements**` UC step IDs that also appear in this existing spec (same step referenced on both sides = direct overlap).
   - **Medium impact** — ≥2 keyword matches between changed-file path segments/exported symbols and the existing spec's requirement text or scenarios.
   - **Low / None** — <2 matches; excluded.

   **9e — attach affected tests**: for each impacted spec, look in `synergyspec/changes/<name>/spec-tests.md` Requirement Traceability Matrix; rows whose Requirement column matches an impacted requirement contribute their Test Case file paths.

   **9f — write `spec-blast-radius.md`**. Example:

```markdown
# Spec Blast Radius: timer-adjustments-and-task-notes
Generated: 2026-04-02T14:45:00Z

## Summary
2 spec(s) impacted by this change.

## Impacted Specs

### synergyspec/specs/session-manager/spec.md
**Impact Level**: High
**Reason**: Delta spec directly modifies requirements in this spec. Changed file
`src/types/timer.ts` modifies `LONG_REST_DURATION` (600→1500) and `WORK_DURATION`
(1500→1800), which are directly asserted in session-manager requirements. Delta
spec shares UC step references (UC2-S1, UC2-S5, UC2-E3a).
**Impacted Requirements**:
- Advance to long rest after 4th work session — asserts `remainingSeconds === 600` (now 1500)
- Advance from short rest to next work session — asserts `remainingSeconds === 1500` (now 1800)
- Reset session state to defaults — asserts `remainingSeconds === 1500` (now 1800)
**Affected Tests**: `src/test/sessionManager.property.test.ts`, `src/test/sessionUtils.test.ts`

### synergyspec/specs/timer-display/spec.md
**Impact Level**: High
**Reason**: Delta spec directly modifies requirements. Changed files include
`src/components/TimerDisplay.tsx` and `src/App.tsx`. Shared UC step references
(UC1-S2, UC2-S1, UC3-S1). "Full-duration display at start" scenario references
`25:00` (now `30:00`).
**Impacted Requirements**:
- Display countdown in MM:SS — "Full-duration display at start" references `25:00`
- Reflect reset in display — references `25:00`, label "Work"
**Affected Tests**: `src/test/timerDisplay.test.tsx`, `src/test/timerDisplay.property.test.tsx`

### synergyspec/specs/timer-engine/spec.md
**Impact Level**: Medium
**Reason**: `WORK_DURATION` referenced in "Start countdown" scenario (1500 s → 1800 s).
**Affected Tests**: `src/test/timerEngine.property.test.ts`

## Unimpacted Specs
(No specs outside the three above)
```

   **9g — append to verification report**: one line at the bottom:
   `📍 Blast radius: N spec(s) impacted → synergyspec/changes/<name>/spec-blast-radius.md`

#### Heuristics
- Completeness uses objective checklists (checkboxes, requirement lists).
- Correctness uses keyword search + reasonable inference — not perfect certainty.
- Coherence looks for glaring inconsistencies only.

---

### `ci` — Project-wide test + coverage + visual regression pipeline

**Source**: `src/core/templates/workflows/ci.ts`
**Invocation**: `/synspec:ci` (no change name — runs project-wide)

#### Goal
One-shot full-project CI: unit/integration with coverage, blast-radius cross-check, e2e from every `test-plan.md`, screenshot diffing, artifact archival, and a consolidated verdict written to `synergyspec/ci-report.md`.

#### Flow

1. **Enumerate all changes** via `list --json`. Inventory per-change presence of `spec-tests.md`, `test-report.md`, `test-plan.md`. Changes missing those are flagged but not blocking.

2. **Run the full project test suite with coverage**. Detect the runner; ask if detection fails; run with `--coverage` (or reuse existing coverage flag). Capture pass/fail/skip counts; parse `coverage-summary.json` for lines/branches/functions/statements.

3. **Step 2b — Spec Blast Radius Coverage**. For every `synergyspec/changes/*/spec-blast-radius.md`, walk "## Impacted Specs":
   - Extract spec path, impact level, impacted requirements, and listed Affected Tests.
   - Cross-reference Affected Tests with step 2 results:
     - Test file ran + passed → ✅ PASS
     - Test file ran + failed → ❌ FAIL
     - Test file not run, or no Affected Tests listed for a High-impact spec → ⚠️ NO COVERAGE
   - Write a new `### Spec Blast Radius Coverage` section into `ci-report.md`.

   **Scoring rules**:
   - A ❌ FAIL row counts toward CI failure.
   - A ⚠️ NO COVERAGE row does **not** fail CI by itself, but triggers a `/synspec:gen-tests` suggestion.

4. **Step 3 — e2e**. Scan `synergyspec/changes/*/test-plan.md`; collect every entry with a `**Recommended tool**` field. Determine required tools (Playwright, Cypress, WebdriverIO, etc.). For each:
   - Detect tool config (`playwright.config.ts`, `cypress.config.ts`, etc.).
   - **Auto-install missing dependencies** — e.g. `npx playwright install --with-deps`, `npx cypress install`, `npm install`. **Never skip e2e due to missing deps.**
   - Run the tool (`npx playwright test --reporter=json`, `npx cypress run --reporter json`), save JSON to `e2e-results/latest/<tool>-results.json`.
   - Map each `TP-N` entry to pass/fail.

5. **Step 4 — Screenshot comparison**. Current PNGs live in `e2e-results/latest/artifacts/*.png`. Find the most recent timestamped archive `e2e-results/YYYY-MM-DD_HH-MM-SS/artifacts/`. **Never read images directly** — invoke the `synergyspec-compare-images` Skill tool passing the two paths. Classify on `percent_diff`:
   - **MATCH** — `percent_diff == 0`
   - **MINOR_DIFF** — `percent_diff ≤ 1.0` (layout noise)
   - **REGRESSION** — `percent_diff > 1.0`

6. **Step 5 — Archive**. Copy `e2e-results/latest/` → `e2e-results/<YYYY-MM-DD_HH-MM-SS>/`. Retain only the 5 most recent timestamped dirs; delete the oldest. `latest/` stays live.

7. **Step 6 — Write `synergyspec/ci-report.md`** at project level (not per-change). Example:

```markdown
## CI Report
Generated: 2026-04-02T15:31:15Z

### Changes Covered
| Change                            | spec-tests.md | test-report.md | test-plan.md              |
|-----------------------------------|---------------|----------------|---------------------------|
| timer-adjustments-and-task-notes  | ✅            | ✅             | ✅ |

### Unit/Integration Test Results
| Suite              | Tests | Pass | Fail | Skip |
|--------------------|-------|------|------|------|
| Full project suite | 100   | 100  | 0    | 0    |

**8 test files · 100 tests · 0 failures · 0 skipped**

| File                                      | Tests | Pass   |
|-------------------------------------------|-------|--------|
| src/test/sessionUtils.test.ts             | 10    | ✅ 10  |
| src/test/usePomodoro.test.tsx             | 10    | ✅ 10  |
| src/test/timerDisplay.test.tsx            | 27    | ✅ 27  |
| src/test/sessionManager.property.test.ts  | 12    | ✅ 12  |
| src/test/timerEngine.property.test.ts     | 8     | ✅ 8   |
| src/test/timerDisplay.property.test.tsx   | 10    | ✅ 10  |
| src/test/taskNotes.test.tsx               | 13    | ✅ 13  |
| src/test/taskNotes.property.test.tsx      | 10    | ✅ 10  |

### Code Coverage (Full Project)
| Metric     | Coverage | Covered / Total |
|------------|----------|-----------------|
| Statements | 70.85%   | 175 / 247       |
| Branches   | 94.54%   | 52 / 55         |
| Functions  | 84.61%   | 11 / 13         |
| Lines      | 70.85%   | 175 / 247       |

Coverage notes:
- `App.tsx` (0%) — `useEffect` note-clearing requires full App render; acceptable MVP gap.
- `audioUtils.ts` (0%) — mocked via `vi.mock`; real audio requires a browser.
- `sessionUtils.ts` 54–59 (76%) — dead code.
- All directly tested production components — 100% coverage.

### Spec Blast Radius Coverage
| Change                            | Impacted Spec                       | Impact  | Affected Tests                        | Status  |
|-----------------------------------|-------------------------------------|---------|---------------------------------------|---------|
| timer-adjustments-and-task-notes  | specs/session-manager/spec.md       | High    | sessionManager.property.test.ts, ...  | ✅ PASS |
| timer-adjustments-and-task-notes  | specs/timer-display/spec.md         | High    | timerDisplay.test.tsx, ...            | ✅ PASS |
| timer-adjustments-and-task-notes  | specs/timer-engine/spec.md          | Medium  | timerEngine.property.test.ts          | ✅ PASS |

✅ All blast-radius-impacted specs have passing test coverage.


### E2E Test Plan Results

| Change | ID | Description | Verdict |
|--------|----|-------------|---------|
| archive/2026-03-13-widget-drag-drop | TP-1 | UC1-S1 — Dragging a widget dims original slot to opacity 0.3 | ✅ PASS |
| archive/2026-03-13-widget-drag-drop | TP-2 | UC1-E3a1 — DropPreview shows red highlight over occupied cell | ✅ PASS |
| archive/2026-03-13-widget-drag-drop | TP-3 | UC2-S3/S4 — Resize handle drag shows live DropPreview overlay | ✅ PASS |

**E2E tool:** Playwright 1.58.2 | **Browser:** Chromium (headless)
**Duration:** 6.0s (3 tests, 1 worker)

---

### Screenshot Comparison

Compared against previous run: `2026-03-13_13-26-14`

| Screenshot | percent_diff | Result |
|------------|-------------|--------|
| `TP-1_before.png` | 2.01% | 🔴 REGRESSION |
| `TP-1_during_drag.png` | 5.00% | 🔴 REGRESSION |
| `TP-2_drag_invalid.png` | 4.73% | 🔴 REGRESSION |
| `TP-2_drag_valid.png` | 5.76% | 🔴 REGRESSION |
| `TP-3_after_resize.png` | 1.75% | 🔴 REGRESSION |
| `TP-3_before_resize.png` | 1.76% | 🔴 REGRESSION |
| `TP-3_during_resize.png` | 5.38% | 🔴 REGRESSION |

---

### Regressions

**7 visual regression(s) detected** — all screenshots differ from the 2026-03-13 baseline by more than 1.0%.

| Screenshot | percent_diff | Notes |
|------------|-------------|-------|
| `TP-1_before.png` | 2.01% | App idle state differs — possible style/layout shift since 2026-03-13 |
| `TP-1_during_drag.png` | 5.00% | Drag ghost / dimming differs — check DragOverlay or opacity animation |
| `TP-2_drag_invalid.png` | 4.73% | Red DropPreview highlight area differs — collision zone or colour shifted |
| `TP-2_drag_valid.png` | 5.76% | Blue DropPreview highlight area differs — snap target rendering changed |
| `TP-3_after_resize.png` | 1.75% | Post-resize widget dimensions differ slightly from baseline |
| `TP-3_before_resize.png` | 1.76% | App idle state (before resize) differs — same root cause as TP-1_before |
| `TP-3_during_resize.png` | 5.38% | Live resize DropPreview differs — rafThrottle timing or overlay geometry changed |

> **Likely root cause**: Screenshots were captured on 2026-03-16 with Playwright 1.58.2; the baseline was captured on 2026-03-13. Differences may reflect intentional UI changes introduced by the `widget-management` change (add/remove widget features). If the new visuals are correct, the current run is now the new baseline.


### PBT
| Change                            | PBT Tests     | Counterexamples | Regression Tests | Status |
|-----------------------------------|---------------|-----------------|------------------|--------|
| timer-adjustments-and-task-notes  | 38 properties | 0               | 0                | ✅     |

No PBT counterexamples across 38 properties (~1,010+ total runs).


### Artifacts
- Coverage HTML: `pomodoro-app/coverage/lcov-report/index.html`
- Coverage JSON: `pomodoro-app/coverage/coverage-summary.json`
- Screenshots:  N/A

## Overall Verdict: ✅ PASS
All 100 tests pass · No PBT counterexamples · No visual regressions · All blast-radius specs covered.
```

#### Overall verdict
- **PASS** — all suites pass + no REGRESSION + no open PBT counterexample in any `pbt-regressions.md`.
- **FAIL** — any suite failure, REGRESSION screenshot diff, or open counterexample.
- **PARTIAL** — e2e skipped, coverage data unavailable, some changes lack `spec-tests.md`, or `pbt-regressions.md` never generated.

#### Heuristics
- If the runner already has coverage configured (`vitest --coverage` in `package.json`), reuse rather than add a duplicate flag.
- e2e does not produce line coverage — note this gap.
- Screenshot comparison must go through the `synergyspec-compare-images` Skill — never read images directly.

#### Graceful degradation
- Some changes missing spec-tests/test-report → mark unchecked, continue.
- No `test-plan.md` anywhere → skip e2e.
- Tool not installed → install automatically.
- No previous screenshots → save as baseline, skip comparison.
- No `pbt-regressions.md` for a change → treat as PARTIAL, not FAIL.
- Runner detection fails → ask user.
- No coverage tooling → skip the table; note the gap.

---

## Cross-cutting design observations

### Single source of truth, enforced mechanically
`usecases.md` — specifically the `## Use Case Traceability Mapping` table — is canonical. Every downstream artifact references the same `UCn-Sm` / `UCn-Ema` IDs and copies the same canonical prose verbatim. `verify-spec` enforces this mechanically: any drift is fixed by the `/synspec:verify-spec` command. The result is that `gen-tests`, `run-tests`, `verify`, and `ci` can all trust the traceability graph without re-parsing natural language.

### The full artifact dependency chain
```
usecases.md (ground truth, UCn-Sm + canonical prose)
    │
    └──► specs/**/spec.md       (**Implements**: UCn-Sm - ...)
            │
            ├──► scenarios (WHEN/THEN → PBT properties)
            │
            ├──► design.md              (**Addresses**: UCn-Sm - ...)
            │
            ├──► tasks.md               ((Addresses: UCn-Sm))
            │       │
            │       ├──► code (implementation in src/)
            │       │
            │       └──► tests (src/test/**, including *.property.test.*)
            │               │
            │               └──► spec-tests.md (Requirement Traceability Matrix)
            │                       │
            │                       └──► test-report.md (coverage by UC step)
            │                               │
            │                               ├──► test-plan.md (manual items)
            │                               └──► pbt-regressions.md (counterexamples)
            │
            └──► verification-report.md (3-dim audit)
                    │
                    └──► spec-blast-radius.md (impacted existing specs)
                            │
                            └──► ci-report.md (project-level verdict)
```

Every node in this graph is produced by exactly one command and consumed by the next. Nothing is duplicated; every cross-reference uses the same ID vocabulary.

### Classification by requirement boundary, not code layer
`gen-tests` explicitly rejects the conventional “unit = function, integration = API” taxonomy. Instead:
- **Unit** = verifies exactly one `UCn-Sm` or `UCn-Ema`.
- **Component** = verifies multiple steps within a single UC.
- **Integration** = verifies a whole UC or crosses UCs.
- **PBT** = invariant over generated inputs for a WHEN/THEN scenario.

Two tests using identical tooling can land in different rows if one tests a single step and the other spans a full flow. This makes `spec-tests.md` rows meaningful beyond the test file name.

### Property-based tests as first-class citizens
Every `WHEN`/`THEN` scenario in every spec requires exactly one PBT test — no exceptions, even when the WHEN clause has no parameterisable input (use arbitrary env state as the generator). Counterexamples automatically become **permanent** regression tests via `run-tests` step 3b; they never get deleted. `ci` tracks open counterexamples as a hard failure and flips them to `✅ fixed` once the regression test passes. This closes the PBT feedback loop without manual bookkeeping.

### Spec blast radius
Most traceability systems stop at “did we verify what this change claims to change?”. `verify` adds “did this change break anything we *didn't* claim to touch?” by:
1. Taking the git diff.
2. Extracting keywords from changed paths and exported symbols.
3. Scoring every existing spec.
4. Attaching tests via `spec-tests.md`.
5. Letting `ci` cross-reference that with the actual run results.

### CLI as state authority, agent as artifact author
The commands treat `synergyspec-hw` as the single source of truth for change metadata (`list`, `status`, `instructions`, `new`). Agents never bypass the CLI for state — they query it and then write files. This keeps the TS core and the per-adapter markdown templates independently upgradeable: the CLI owns schemas, templates, rules, and dependency ordering; the agent owns natural-language authoring.

### Graceful degradation is explicit
Every command enumerates fallback behaviour: missing `design.md`, no git, missing PBT framework, no test runner, absent `spec-tests.md`, no previous screenshots, empty `synergyspec/specs/`. The commands don't silently fail; they emit explicit notes, skip the relevant section, and point the user at the next action.

### Persistent cross-run state
`pbt-regressions.md`, `spec-blast-radius.md`, `test-plan.md`, `test-report.md`, and `ci-report.md` are deliberately persisted so later runs can compare, update statuses in place, and accumulate history. `e2e-results/` similarly keeps the 5 most recent timestamped archives for screenshot diffing. Nothing is transient beyond the test runner stdout itself.

---
