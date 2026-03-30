/**
 * Skill Template Workflow Modules
 *
 * TDD workflow: implements tasks from tasks.md one at a time using strict
 * red-green-refactor discipline. An alternative to apply-change.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `Implement tasks from an OpenSpec change using red-green-refactor TDD.

**Input**: Optionally specify a change name. If omitted, check context. If ambiguous, prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`openspec-hw list--json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/ opsx - hw: tdd <other>\`).

2. **Check status and get apply instructions**

   \`\`\`bash
openspec - hw status--change "<name>" --json
openspec - hw instructions apply--change "<name>" --json
  \`\`\`

   Handle states identically to apply-change:
   - If \`state: "blocked"\` (missing artifacts): show message, suggest \` / opsx - hw: continue\`
   - If \`state: "all_done"\`: congratulate, suggest \` / opsx - hw: gen - tests\`
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

5. **For each pending task — red-green-refactor test-drive-development (one task at a time)**


## Overview of per-task test-drive-development

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your human partner):**
- Throwaway prototypes
- Generated code
- Configuration files

Thinking "skip TDD just this once"? Stop. That's rationalization.

## The Iron Law

\`\`\`
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
\`\`\`

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

Implement fresh from tests. Period.

## Red-Green-Refactor

\`\`\`dot
digraph tdd_cycle {
  rankdir = LR;
  red[label = "RED\nWrite failing test", shape = box, style = filled, fillcolor = "#ffcccc"];
  verify_red[label = "Verify fails\ncorrectly", shape = diamond];
  green[label = "GREEN\nMinimal code", shape = box, style = filled, fillcolor = "#ccffcc"];
  verify_green[label = "Verify passes\nAll green", shape = diamond];
  refactor[label = "REFACTOR\nClean up", shape = box, style = filled, fillcolor = "#ccccff"];
  next[label = "Next", shape = ellipse];

  red -> verify_red;
  verify_red -> green[label = "yes"];
  verify_red -> red[label = "wrong\nfailure"];
  green -> verify_green;
  verify_green -> refactor[label = "yes"];
  verify_green -> green[label = "no"];
  refactor -> verify_green[label = "stay\ngreen"];
  verify_green -> next;
  next -> red;
}
\`\`\`

### RED - Write Failing Test

Write one minimal test showing what should happen.

<Good>
  \`\`\`typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
\`\`\`
Clear name, tests real behavior, one thing
  </Good>

    <Bad>
    \`\`\`typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
\`\`\`
Vague name, tests mock not code
  </Bad>

  ** Requirements:**
    - One behavior
      - Clear name
        - Real code(no mocks unless unavoidable)

### Verify RED - Watch It Fail

  ** MANDATORY.Never skip.**

    \`\`\`bash
npm test path / to / test.test.ts
  \`\`\`

Confirm:
- Test fails(not errors)
  - Failure message is expected
    - Fails because feature missing(not typos)

      ** Test passes ?** You're testing existing behavior. Fix test.

        ** Test errors ?** Fix error, re - run until it fails correctly.

### GREEN - Minimal Code

Write simplest code to pass the test.

<Good>
  \`\`\`typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
\`\`\`
Just enough to pass
  </Good>

  <Bad>
\`\`\`typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // YAGNI
}
\`\`\`
Over - engineered
  </Bad>

Don't add features, refactor other code, or "improve" beyond the test.

### Verify GREEN - Watch It Pass

  ** MANDATORY.**

  \`\`\`bash
npm test path / to / test.test.ts
  \`\`\`

Confirm:
- Test passes
  - Other tests still pass
    - Output pristine(no errors, warnings)

      ** Test fails ?** Fix code, not test.

** Other tests fail ?** Fix now.

### REFACTOR - Clean Up

After green only:
- Remove duplication
  - Improve names
    - Extract helpers

Keep tests green.Don't add behavior.

### Repeat

Next failing test for next feature.

## Good Tests

  | Quality | Good | Bad |
| ---------| ------| -----|
| ** Minimal ** | One thing. "and" in name ? Split it. | \`test('validates email and domain and whitespace')\` |
| ** Clear ** | Name describes behavior | \`test('test1')\` |
| ** Shows intent ** | Demonstrates desired API | Obscures what code should do |

## Why Order Matters

  ** "I'll write tests after to verify it works" **

  Tests written after code pass immediately.Passing immediately proves nothing:
- Might test wrong thing
  - Might test implementation, not behavior
    - Might miss edge cases you forgot
      - You never saw it catch the bug

Test - first forces you to see the test fail, proving it actually tests something.

** "I already manually tested all the edge cases" **

  Manual testing is ad - hoc.You think you tested everything but:
- No record of what you tested
  - Can't re-run when code changes
    - Easy to forget cases under pressure
      - "It worked when I tried it" ≠ comprehensive

Automated tests are systematic.They run the same way every time.

** "Deleting X hours of work is wasteful" **

  Sunk cost fallacy.The time is already gone.Your choice now:
- Delete and rewrite with TDD(X more hours, high confidence)
- Keep it and add tests after(30 min, low confidence, likely bugs)

The "waste" is keeping code you can't trust. Working code without real tests is technical debt.

  ** "TDD is dogmatic, being pragmatic means adapting" **

  TDD IS pragmatic:
- Finds bugs before commit(faster than debugging after)
  - Prevents regressions(tests catch breaks immediately)
- Documents behavior(tests show how to use code)
  - Enables refactoring(change freely, tests catch breaks)

"Pragmatic" shortcuts = debugging in production = slower.

** "Tests after achieve the same goals - it's spirit not ritual" **

  No.Tests - after answer "What does this do?" Tests - first answer "What should this do?"

Tests - after are biased by your implementation.You test what you built, not what's required. You verify remembered edge cases, not discovered ones.

Tests - first force edge case discovery before implementing.Tests - after verify you remembered everything(you didn't).

30 minutes of tests after ≠ TDD.You get coverage, lose proof tests work.

## Common Rationalizations

| Excuse | Reality |
| --------| ---------|
| "Too simple to test" | Simple code breaks.Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests - after = "what does this do?" Tests - first = "what should this do?" |
| "Already manually tested" | Ad - hoc ≠ systematic.No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy.Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after.Delete means delete. |
| "Need to explore first" | Fine.Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to test.Hard to test = hard to use. |
| "TDD will slow me down" | TDD faster than debugging.Pragmatic = test - first. |
| "Manual test faster" | Manual doesn't prove edge cases. You'll re - test every change. |
| "Existing code has no tests" | You're improving it. Add tests for existing code. |

## Red Flags - STOP and Start Over

  - Code before test
    - Test after implementation
      - Test passes immediately
        - Can't explain why test failed
          - Tests added "later"
            - Rationalizing "just this once"
              - "I already manually tested it"
              - "Tests after achieve the same purpose"
              - "It's about spirit not ritual"
              - "Keep as reference" or "adapt existing code"
                - "Already spent X hours, deleting is wasteful"
                - "TDD is dogmatic, I'm being pragmatic"
                - "This is different because..."

                ** All of these mean: Delete code.Start over with TDD.**

## Example: Bug Fix

  ** Bug:** Empty email accepted

    ** RED **
    \`\`\`typescript
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
\`\`\`

    ** Verify RED **
      \`\`\`bash
$ npm test
FAIL: expected 'Email required', got undefined
  \`\`\`

  ** GREEN **
  \`\`\`typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}
\`\`\`

  ** Verify GREEN **
    \`\`\`bash
$ npm test
PASS
  \`\`\`

  ** REFACTOR **
  Extract validation for multiple fields if needed.

## Verification Checklist

Before marking work complete:

-[] Every new function/ method has a test
  - [] Watched each test fail before implementing
    - [] Each test failed for expected reason(feature missing, not typo)
      - [] Wrote minimal code to pass each test
        - [] All tests pass
          - [] Output pristine(no errors, warnings)
            - [] Tests use real code(mocks only if unavoidable)
  -[] Edge cases and errors covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck

  | Problem | Solution |
| ---------| ----------|
| Don't know how to test | Write wished-for API. Write assertion first. Ask your human partner. |
  | Test too complicated | Design too complicated.Simplify interface. |
| Must mock everything | Code too coupled.Use dependency injection. |
| Test setup huge | Extract helpers.Still complex ? Simplify design. |

## Debugging Integration

Bug found ? Write failing test reproducing it.Follow TDD cycle.Test proves fix and prevents regression.

Never fix bugs without a test.

## Testing Anti - Patterns

When adding mocks or test utilities, read @testing-anti-patterns.md to avoid common pitfalls:
- Testing mock behavior instead of real behavior
  - Adding test - only methods to production classes
    - Mocking without understanding dependencies

## Final Rule

  \`\`\`
Production code → test exists and failed first
Otherwise → not TDD
  \`\`\`

No exceptions without your human partner's permission.

6. ** On completion or pause, show status **

  Display tasks completed this session and overall progress: "N/M tasks complete".

   ** If all tasks done:**

  \`\`\`
   ## TDD Complete: <change-name >
  <N>/<N> tasks complete ✓

   All tasks implemented with red - green - refactor discipline.

   Next steps:
1. Run \`/ opsx - hw: gen - tests\` — generate any missing tests(PBT, coverage gaps) and map all use -case steps
2. Run \`/ opsx - hw: run - tests\` — run the full suite and produce the spec - coverage report
3. Run \`/ opsx - hw: ci\` — full CI run(e2e, screenshots, artifact archiving)
4. Run \`/ opsx - hw: archive\` — close the change once CI passes
  \`\`\`

  ** If paused:** explain the reason and wait for guidance.

** Output During Implementation **

  \`\`\`
## TDD: <change-name > (schema: <schema-name >)

Task 3 / 7: <task description >
  "#ffcccc" RED   — wrote failing test\`test / widget - add.test.ts: 45\`("UC1-S2: ...")
"#ccffcc" GREEN — implemented\`src / catalogue / filterWidgets.ts\`
"#ccccff" REFACTOR — extracted \`isOnGrid()\` helper
✓ Task 3 complete

Task 4 / 7: <task description >
  ...
\`\`\`

  ** Heuristics **

  - Detect the test framework from existing test files; follow the same style and conventions
    - Each task's test should reference a specific use-case step ID when possible
      - A task that spans multiple spec steps may need multiple failing tests in the RED phase
  before switching to GREEN

  ** Graceful Degradation **

    - If blocked(missing spec artifacts): show message, suggest\`/ opsx - hw: continue\`
      - If test runner not found: ask the user for the command rather than guessing
        - If a task was already completed(checkbox already ticked): skip it silently
          - If the change has no tasks.md: report "No tasks.md found — cannot run TDD. Run \`/ opsx - hw: continue\` to generate tasks."

            ** Fluid Workflow Integration **

- ** Can be invoked anytime **: interleaved with other actions, or resumed after a pause
  - ** Interoperates with apply **: tasks completed by apply or tdd are both tracked via the
same \`- [x]\` checkboxes in tasks.md; either command can pick up where the other left off`;

export function getTddSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-tdd',
    description:
      'Implement tasks from an OpenSpec change using red-green-refactor TDD. For each task: write a failing test (red), implement the minimum code to pass it (green), then refactor.',
    instructions: `Implement tasks from an OpenSpec change using red-green - refactor TDD.

  ${INSTRUCTIONS_BODY} `,
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
    content: `Implement tasks from an OpenSpec change using red-green - refactor TDD.

** Input **: Optionally specify a change name after \`/opsx-hw:tdd\` (e.g., \`/opsx-hw:tdd add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

${INSTRUCTIONS_BODY}`,
  };
}
