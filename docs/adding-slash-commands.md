# Adding a New Slash Command


## 1. What a slash command actually is

A slash command is a **markdown file with frontmatter** that `synergyspec-hw init`. At runtime, the AI assistant reads that file and follows its instructions.

Each slash command comes with a **paired agent skill**. Both are generated from the same template module, but they target different delivery formats:

Slash commands:
- Live at `.claude/commands/synspec/<command_name>.md`
- Called by user

Skill:
- Lives at `.claude/skills/skill-name/`
- Called by user or agent

---

## 2. Where to modify / add commands or skills

```
src/core/templates/workflows/<name>.ts
  │
  ├── getXxxSkillTemplate()     → SkillTemplate
  └── getOpsxXxxCommandTemplate() → CommandTemplate
```

Key idea: **the template is tool-agnostic.** Adapters in `src/core/command-generation/adapters/` handle per AI tool quirks (file path, frontmatter shape). You almost never need to touch an adapter when adding a new command — only when adding a new *AI tool*.

---

## 3. Anatomy of a template module

Every workflow lives in a single file: `src/core/templates/workflows/<name>.ts`. It exports two getter functions that return plain objects.

```ts
// src/core/templates/workflows/my-feature.ts
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function get<name>SkillTemplate(): SkillTemplate {
  return {
    name: 'synergyspec-my-feature',
    description: 'Short description shown in skill listings. When should the assistant trigger this?',
    instructions: `Full markdown body that the assistant executes when this skill runs.

**Input**: ...

**Steps**
1. ...
2. ...

**Output**
- ...

**Guardrails**
- ...`,
    license: 'MIT',
    compatibility: 'Requires synergyspec-hw CLI.',
    metadata: { author: 'synergyspec', version: '1.0' },
  };
}

export function getOpsx<name>CommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: My Feature',
    description: 'One-sentence description used in the assistant\'s command picker.',
    category: 'Workflow',
    tags: ['workflow', 'artifacts'],
    content: `Same structure as the skill \`instructions\` field, but phrased for slash-command invocation.

**Input**: The argument after \`/synspec:my-feature\` is ...

**Steps**
1. ...
`,
  };
}
```

The `SkillTemplate` and `CommandTemplate` types live in `src/core/templates/types.ts`:

```ts
export interface SkillTemplate {
  name: string;             // Directory name used under skills/; also the YAML `name` field.
  description: string;      // Triggering hint — tells the assistant when to auto-invoke.
  instructions: string;     // The body that the assistant will follow.
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  scripts?: Record<string, string>;  // Optional sidecar files (relative path → content).
}

export interface CommandTemplate {
  name: string;             // Display name, e.g. "OPSX: New".
  description: string;
  category: string;         // Usually "Workflow".
  tags: string[];
  content: string;          // The body the assistant will follow when the command is invoked.
}
```

### Skill vs command content — why two versions?

The wording differs because the trigger differs:

- **Skill instructions** are followed when the assistant decides on its own to run the skill (based on `description`). They usually begin by asking the user what they want and derive inputs from conversation context.
- **Command content** is run when the user explicitly types `/synspec:<id>`. They can assume an argument may already be present after the command name and tell the assistant how to parse it.


## 4. Step-by-step: add a new slash command

The running example adds `/synspec:review`, which would walk the assistant through reviewing a change before archival.

### 4.1 Create the template module

Create `src/core/templates/workflows/review.ts`. Export two functions following the shape in §3: `getReviewSkillTemplate()` and `getOpsxReviewCommandTemplate()`. Use an existing workflow as a skeleton — `feedback.ts` is the smallest and `new-change.ts` is the most representative.

Naming conventions observed in the codebase:

| Thing                     | Convention                                                  | Example                         |
|---------------------------|-------------------------------------------------------------|---------------------------------|
| File name                 | kebab-case                        | `review.ts`                     |
| Skill getter              | `get<PascalCase>SkillTemplate`                              | `getReviewSkillTemplate`        |
| Command getter            | `getOpsx<PascalCase>CommandTemplate`                        | `getOpsxReviewCommandTemplate`  |
| Skill `name` field        | `synergyspec-<name>`                                    | `synergyspec-review`            |
| Command `name` field      | `OPSX: <Title Case>`                                        | `OPSX: Review`                  |
| Workflow id (used below)  | kebab-case, usually the file name without `.ts`             | `review`                        |

### 4.2 Re-export from the facade

Add an export line to `src/core/templates/skill-templates.ts`:

```ts
export { getReviewSkillTemplate, getOpsxReviewCommandTemplate } from './workflows/review.js';
```

Keep the import/export lists alphabetised within each group if you can — it's easier to diff in review.

### 4.3 Wire into the registries

Open `src/core/shared/skill-generation.ts` and add entries to **both** arrays.

In `getSkillTemplates(...)`:

```ts
{ template: getReviewSkillTemplate(), dirName: 'synergyspec-review', workflowId: 'review' },
```

- `dirName` is the folder name on disk (`.claude/skills/synergyspec-review/`).
- `workflowId` must match the id used in `src/core/profiles.ts` (next step). If you omit `workflowId`, the skill is treated as a **utility skill** and is always installed regardless of profile — only do that for things like `synergyspec-compare-images` that don't belong to a workflow.

In `getCommandTemplates(...)`:

```ts
{ template: getOpsxReviewCommandTemplate(), id: 'review' },
```

Also remember to add the import at the top of the file for both getters.

### 4.4 Register the workflow id

Open `src/core/profiles.ts`. Add your workflow id to `ALL_WORKFLOWS`:

```ts
export const ALL_WORKFLOWS = [
  'propose',
  'explore',
  // ...
  'review',   // new
  // ...
] as const;
```

If the workflow is fundamental enough to be part of the streamlined new-user experience, also add it to `CORE_WORKFLOWS` — but be conservative. Today `CORE_WORKFLOWS` is `['propose', 'explore', 'apply', 'archive']`; only extend it if the command is truly essential.

### 4.5 Update the parity test

Parity tests in `test/core/templates/skill-templates-parity.test.ts` snapshot each template with a sha256 hash. When you add a new one, you need to add both an import and an expected hash.

The fastest way:

1. Add the import to the test file (both the skill and the command getter, if applicable).
2. Add the function name to `EXPECTED_FUNCTION_HASHES` with a placeholder hash (any 64-char string).
3. Run `pnpm test test/core/templates/skill-templates-parity.test.ts`. The test will fail and print the actual hash.
4. Replace the placeholder with the real hash.

Future edits to the template content will then produce a test failure until you update the hash — that is intentional, it forces you to acknowledge copy changes.

### 4.6 Build and verify locally

```bash
pnpm build
pnpm test
```

---
