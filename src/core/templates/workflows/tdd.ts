/**
 * Skill Template Workflow Modules
 *
 * TDD workflow: implements tasks from tasks.md one at a time using strict
 * red-green-refactor discipline. An alternative to apply-change.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`openspec-hw list --json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/opsx-hw:tdd <other>\`).

2. **Check status and get apply instructions**

   \`\`\`bash
   openspec-hw status --change "<name>" --json
   openspec-hw instructions apply --change "<name>" --json
   \`\`\`

   Handle states identically to apply-change:
   - If \`state: "blocked"\` (missing artifacts): show message, suggest \`/opsx-hw:continue\`
   - If \`state: "all_done"\`: congratulate, suggest \`/opsx-hw:gen-tests\`
   - Otherwise: proceed to implementation

3. **Read context files**

   Read all files listed in \`contextFiles\` from the apply instructions output
   (typically: proposal, usecases, specs, design, tasks).

4. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

5. **For each pending task — red-green-refactor loop (one task at a time)**

   **a. 🔴 RED — Write a failing test**

   - Identify the requirement or spec step the task satisfies by cross-referencing
     the task description with the usecases/specs context files.
     Reference the specific step ID (e.g., UC1-S2) in the test name or a comment.
   - Write a test that asserts the task's expected behaviour using the project's
     existing test framework and style.
   - Run the test suite and confirm the new test **FAILS**.
     - If the test passes immediately without any implementation, the test is wrong
       or tests a behaviour that already exists — revise the test before proceeding.
       Do NOT skip to green.

   **b. 🟢 GREEN — Implement the minimum code**

   - Write the smallest possible implementation that makes the failing test pass.
     Resist premature abstractions — write just enough code.
   - Run the test suite and confirm **ALL tests pass** (not just the new one).
     - If making the new test pass breaks existing tests, stop and fix before continuing.

   **c. 🔵 REFACTOR — Clean up**

   - Improve naming, extract small functions, remove duplication — without changing
     observable behaviour.
   - Run the test suite again and confirm **ALL tests still pass**.
     - If refactoring breaks tests, fix immediately; do not move to the next task
       until the suite is green.

   **d. Mark task complete**

   Update tasks.md: \`- [ ]\` → \`- [x]\` for this task.

   **e. Report and continue**

   Print a summary line and move to the next pending task:
   \`\`\`
   ✓ [RED→GREEN→REFACTOR] Task <N>/<total>: <task description>
     🔴 test/widget-add.test.ts:45 — "UC1-S2: catalogue filters on-grid widgets"
     🟢 src/catalogue/filterWidgets.ts
     🔵 extracted isOnGrid() helper
   \`\`\`

   **Pause if:**
   - Cannot identify a meaningful failing test (e.g., pure infrastructure or config task
     with no observable behaviour) → note "No automatable test for this task" and ask
     the user whether to implement it without TDD discipline or skip. If they confirm,
     implement it normally, mark it done with a note, and continue.
   - Test suite cannot be run (missing runner, broken environment) → report and wait.
   - RED phase: new test passes without any implementation → revise test, do not proceed.
   - GREEN phase: cannot make test pass without breaking existing tests → pause and report.
   - Task description is ambiguous → ask for clarification before writing tests.
   - User interrupts.

6. **On completion or pause, show status**

   Display tasks completed this session and overall progress: "N/M tasks complete".

   **If all tasks done:**

   \`\`\`
   ## TDD Complete: <change-name>
   <N>/<N> tasks complete ✓

   All tasks implemented with red-green-refactor discipline.

   Next steps:
   1. Run \`/opsx-hw:gen-tests\` — generate any missing tests (PBT, coverage gaps) and map all use-case steps
   2. Run \`/opsx-hw:run-tests\` — run the full suite and produce the spec-coverage report
   3. Run \`/opsx-hw:ci\` — full CI run (e2e, screenshots, artifact archiving)
   4. Run \`/opsx-hw:archive\` — close the change once CI passes
   \`\`\`

   **If paused:** explain the reason and wait for guidance.

**Output During Implementation**

\`\`\`
## TDD: <change-name> (schema: <schema-name>)

Task 3/7: <task description>
  🔴 RED   — wrote failing test \`test/widget-add.test.ts:45\` ("UC1-S2: ...")
  🟢 GREEN — implemented \`src/catalogue/filterWidgets.ts\`
  🔵 REFACTOR — extracted \`isOnGrid()\` helper
✓ Task 3 complete

Task 4/7: <task description>
  ...
\`\`\`

**Heuristics**

- Detect the test framework from existing test files; follow the same style and conventions
- For infrastructure tasks (install deps, configure bundler, add types) with no testable
  behaviour: note this, offer to implement without TDD discipline, and mark done with a note
- Keep GREEN implementations minimal — resist writing "good" code during the green phase;
  save that for REFACTOR
- Each task's test should reference a specific use-case step ID when possible
- A task that spans multiple spec steps may need multiple failing tests in the RED phase
  before switching to GREEN

**Graceful Degradation**

- If blocked (missing spec artifacts): show message, suggest \`/opsx-hw:continue\`
- If test runner not found: ask the user for the command rather than guessing
- If a task was already completed (checkbox already ticked): skip it silently
- If the change has no tasks.md: report "No tasks.md found — cannot run TDD. Run \`/opsx-hw:continue\` to generate tasks."

**Fluid Workflow Integration**

- **Can be invoked anytime**: interleaved with other actions, or resumed after a pause
- **Interoperates with apply**: tasks completed by apply or tdd are both tracked via the
  same \`- [x]\` checkboxes in tasks.md; either command can pick up where the other left off`;

export function getTddSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-tdd',
    description:
      'Implement tasks from an OpenSpec change using red-green-refactor TDD. For each task: write a failing test (red), implement the minimum code to pass it (green), then refactor.',
    instructions: `Implement tasks from an OpenSpec change using red-green-refactor TDD.

${INSTRUCTIONS_BODY}`,
    license: 'MIT',
    compatibility: 'Requires openspec-hw CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxTddCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: TDD',
    description: 'Implement tasks one by one using red-green-refactor TDD — write failing test first, then minimum code, then refactor',
    category: 'Workflow',
    tags: ['workflow', 'tdd', 'test', 'red-green-refactor'],
    content: `Implement tasks from an OpenSpec change using red-green-refactor TDD.

**Input**: Optionally specify a change name after \`/opsx-hw:tdd\` (e.g., \`/opsx-hw:tdd add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
