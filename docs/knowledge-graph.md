# Knowledge Graph

The SynergySpec Knowledge Graph (KG) is a structured, queryable representation
of every change in your project — its artifacts, the use cases they describe,
the requirements that derive from them, the tasks that implement them, and the
relationships between all of those. It exists alongside your hand-authored
markdown so the same content is also available as a typed graph that workflows,
verification, blast-radius analysis, and AI-driven coordination can rely on.

This document describes how the KG is stored, what it tracks, how it's kept in
sync with your markdown, the CLI commands that operate on it, and the
integration points with Claude Code that make sync automatic.

---

## 1. Storage layout

The KG is per-project. It lives inside the project's `synergyspec/` directory
alongside the change files it describes:

```
your-project/
├── synergyspec/
│   ├── changes/
│   │   └── <change-name>/
│   │       ├── .synergyspec.yaml
│   │       ├── proposal.md
│   │       ├── usecases.md
│   │       ├── design.md
│   │       ├── specs/
│   │       │   └── *.md
│   │       └── tasks.md
│   ├── kg/
│   │   ├── config.json    ← KG metadata
│   │   └── data.json      ← entities + relationships (the graph itself)
│   └── archive/
└── .claude/
    └── settings.local.json    ← (Claude Code projects only) contains hooks
```

`config.json` is a small metadata file (version, schema, creation date). The
real data lives in `data.json`, which is two arrays: `entities` (typed records
with stable ids) and `relationships` (typed edges between entity ids).

The KG was previously stored at `.synergyspec/kg/`. It now lives inside the
visible `synergyspec/` directory so users can discover it, gitignore it
selectively, and have it next to the markdown it describes. Both files are
plain JSON and safe to commit to version control if you want the graph state
auditable in PRs alongside the markdown changes.

---

## 2. Entity model

The ontology is defined in `src/core/kg/types.ts`. Every entity inherits from
one of three abstract base types and adds typed fields and relationships.

### 2.1 Base types

- **`Artifact`** — anything that has a file path and a status. Subclasses:
  `Spec`, `DesignDoc`, `TestCase`, `CodeFile`, plus the generic `Artifact` for
  things like `usecases.md`/`tasks.md` that don't fit a specialized subtype.
- **`Entity`** — content extracted from artifacts. Subclasses: `UseCase`,
  `UseCaseStep`, `Requirement`, `Task`, `DesignDecision`, `Scenario`,
  `MockObject`, `CoverageGap`, etc.
- **`Event`** — something that happened with a timestamp and outcome.
  Subclasses: `TestRun`, `ScreenshotCapture`, `CIReport`, `VisualRegression`,
  `ImplementationEvent`, `TDDEvent`.

There is also a top-level `Change` entity that owns everything else for one
change.

### 2.2 Concrete types currently populated by refresh

| Entity         | Source                           | Id pattern                       |
| -------------- | -------------------------------- | -------------------------------- |
| `Change`       | `synergyspec-hw new change`      | `<changeId>`                     |
| `DesignDoc`    | `proposal.md` and `design.md`    | `<changeId>-proposal`, `<changeId>-design` |
| `Artifact`     | `usecases.md` and `tasks.md`     | `<changeId>-usecases`, `<changeId>-tasks` |
| `Spec`         | `specs/` directory               | `<changeId>-specs`               |
| `UseCase`      | `### UC1: …` in `usecases.md`    | `<changeId>-uc<N>`               |
| `UseCaseStep`  | rows in the traceability table   | `<changeId>-UC<N>-S<M>`          |
| `Requirement`  | `### Requirement: …` in specs    | `<changeId>-req<N>`              |
| `Task`         | `- [ ] N.M` lines in `tasks.md`  | `<changeId>-task<N>_<M>`         |

### 2.3 Concrete types defined but not yet populated

`CodeFile`, `TestCase`, `TestRun`, `Function`, `MockObject`, `CoverageGap`,
`DesignDecision`, `Scenario`, `E2ETest`, `E2EStep`, `ScreenshotCapture`,
`VisualRegression`, `CIReport`, `Capability`. The schema is ready for them;
the parser doesn't yet wire them up. See **Section 10 — Limitations**.

### 2.4 Relationships

Relationships are typed directed edges between entity ids. Names match the
ontology:

| Type              | Source               | Target           | Created when                                    |
| ----------------- | -------------------- | ---------------- | ----------------------------------------------- |
| `hasArtifact`     | `Change`             | document entity  | `kg refresh` finds the artifact file on disk    |
| `definesUseCase`  | `usecases` artifact  | `UseCase`        | `### UC<N>: ...` parsed                          |
| `hasStep`         | `UseCase`            | `UseCaseStep`    | row in traceability table parsed                |
| `hasRequirement`  | `specs` artifact     | `Requirement`    | `### Requirement: ...` parsed                    |
| `implements`      | `Requirement`        | `UseCaseStep`    | `**Implements**: UC1-S2` line in spec            |
| `hasTask`         | `tasks` artifact     | `Task`           | `- [ ] N.M ...` line parsed                      |
| `addresses`       | `Task`               | `UseCaseStep`    | `(Addresses: UC1-S1, UC1-S2)` annotation        |

---

## 3. CLI commands

All commands live under the `kg` subcommand group and operate against the
project at the current working directory.

### 3.1 `synergyspec-hw kg refresh`

Re-reads the markdown for one change (or all changes) and rebuilds the
fine-grained graph. **Authoritative**: the graph after refresh reflects
exactly what is on disk right now.

```text
synergyspec-hw kg refresh                     # all changes
synergyspec-hw kg refresh --change <name>     # one change
synergyspec-hw kg refresh -v                  # warnings for placeholder content
synergyspec-hw kg refresh --silent            # exit 0 silently on non-KG projects
```

What refresh does, per change:

1. Loads the cached, file-backed `KGClient` (or constructs one from
   `synergyspec/kg/data.json` if not yet cached).
2. Deletes every sub-entity (`UseCase`, `UseCaseStep`, `Requirement`, `Task`,
   `DesignDecision`, `Scenario`) tagged with this `changeId`. This cascades
   their relationships through the client's `delete` cleanup.
3. Reconciles document-level entities against disk:
   - Any `Artifact`/`Spec`/`DesignDoc`/`TestCase`/`CodeFile` whose `filePath`
     no longer points to a real file/directory is deleted (cascades).
   - For each known artifact slot (`proposal.md`, `usecases.md`, `specs/`,
     `design.md`, `tasks.md`) that exists on disk, ensures a doc entity exists
     with the right type, and that there is a `hasArtifact` edge from the
     `Change` to it.
4. Walks the markdown and runs the parsers in `src/core/kg/content-parser.ts`:
   - `parseUseCases` — handles both `### Use Case: Name` (template form) and
     `### UC1: Name` (the form AIs typically generate).
   - `parseUseCaseSteps` — reads rows from the use-case traceability table.
   - `parseRequirements` — reads each `### Requirement:` block, extracts the
     SHALL statement and any `**Implements**:` references.
   - `parseTasks` — reads `- [ ] N.M description (Addresses: UC1-S1, ...)`
     lines, including their checkbox status.
5. Bulk-creates the new sub-entities, then creates each edge (skipping any
   edge whose target wasn't found, with a warning).
6. Persists the in-memory graph to `synergyspec/kg/data.json` via
   `saveKGState`.

**Idempotency** — running refresh multiple times on the same disk state
produces the same graph. Repeated runs do not duplicate entities or edges.

**Output (default mode)**:

```
KG refresh complete (1 change):
  auth-feature: removed 7 stale (0 doc entities for missing files), created 0 docs, 2 use cases, 5 steps, 3 requirements, 4 tasks, 23 relationships
```

### 3.2 `synergyspec-hw kg view`

Starts a tiny local HTTP server on `127.0.0.1` (random free port unless
`--port` is given), serves an HTML viewer plus the project's `data.json`,
and opens the default browser.

```text
synergyspec-hw kg view                        # auto-opens browser
synergyspec-hw kg view --no-open              # just print the URL (useful over SSH)
synergyspec-hw kg view --port 8080
```

The viewer is implemented as a single string in `src/core/kg/viewer-html.ts`
(no asset pipeline) and uses [vis-network](https://visjs.github.io/vis-network/)
from a CDN. It provides:

- Force-directed interactive graph (drag, zoom, pan).
- Box-shaped nodes labelled with the entity id and type, color-coded per type
  (Change=red, Spec=blue, DesignDoc=purple, etc.; unknown types get a
  deterministic hash-based colour).
- Left pane: live entity/relationship counts, per-type filter checkboxes,
  per-relationship-type filter checkboxes, search box, refit/physics toggle.
- Right pane: full JSON of the selected node or edge.
- Visible error banner if any runtime error occurs (e.g., CDN blocked, JSON
  fetch failed).

The server only binds to loopback, so the viewer is not exposed on your
network.

### 3.3 `synergyspec-hw kg watch`

Watches `synergyspec/changes/` recursively for `*.md` edits and runs refresh
in the background, debounced.

```text
synergyspec-hw kg watch                       # default 500ms debounce
synergyspec-hw kg watch --debounce 1000
```

Useful when you edit markdown directly in your editor without going through a
slash command. Runs an initial refresh on startup, then logs each subsequent
refresh with a timestamp:

```
[14:55:42] auth-feature: 9 entities, 11 edges
[14:55:43] auth-feature: 12 entities, 17 edges
```

Per-change refreshes are debounced separately and a new request is dropped if
one is already in flight for that change. Clean SIGINT/SIGTERM shutdown.

### 3.4 `synergyspec-hw kg install-hooks`

Installs Claude Code hooks (`PostToolUse` + `Stop`) into
`.claude/settings.local.json` so the KG auto-refreshes after every AI
`Write`/`Edit`/`MultiEdit` and at end-of-turn.

```text
synergyspec-hw kg install-hooks
```

Idempotent: re-running won't duplicate the entries. Created `.claude/`
directory if missing. Merges with any existing `permissions` and `hooks`
already present in the file.

`synergyspec-hw init` runs this automatically when Claude Code is among the
selected tools, so new projects get the hooks installed for free.

---

## 4. Markdown parsers

The parsing engine lives in `src/core/kg/content-parser.ts`. It contains pure
functions that read markdown content and produce structured records. None of
them touch the filesystem or the KG client — they're deterministic,
side-effect-free, and unit-testable in isolation. `kg refresh` invokes them
per artifact and feeds the results into graph construction.

This section is the contract between markdown content and the parsers.
Content that matches the patterns documented here gets extracted; content
that doesn't match is silently ignored. If you find the graph missing
something it should have, the cause is almost always a mismatch between
your markdown shape and one of the parsers below.

### 4.1 `parseUseCases(content)`

**Input file**: `synergyspec/changes/<name>/usecases.md`

**Pattern matched**: use-case section headers. Two forms accepted, both
case-insensitive:

```markdown
### Use Case: <Name>           ← canonical template form
### UC1: <Name>                ← AI-generated form (also UC1.<Name>, UC1 - <Name>)
```

The regex is `^### (?:Use Case:|UC(\d+)[:.\-\s]+)\s*(.+)$` (multiline).

**Returns**: `Array<{ id, title, actor?, goal?, level? }>`

**Id stability**: when the AI uses the `### UC<N>:` form, the explicit number
is captured and the entity id becomes `uc<N>`. With the canonical template
form (no number in the header), ids are sequential (`uc1`, `uc2`, …) in
document order. Prefer the AI form for stable ids across edits.

**Per-section fields**: for each use case, the parser slices content from
the header to the next `###` (or end of file) and inside that slice extracts:

| Field   | Pattern                                  | Default       |
| ------- | ---------------------------------------- | ------------- |
| `actor` | `**Primary Actor**: (.+)`                | `undefined`   |
| `goal`  | `**Goal**: (.+)`                         | `undefined`   |
| `level` | `level: (summary\|user\|subfunction)`    | `'user'`      |

**Example input → output**:

```markdown
### UC1: Reposition a Widget
**Primary Actor**: Dashboard User
**Goal**: Move a widget to a new position
```

→ `{ id: 'uc1', title: 'Reposition a Widget', actor: 'Dashboard User', goal: 'Move a widget to a new position', level: 'user' }`

### 4.2 `parseUseCaseSteps(content)`

**Input file**: same `usecases.md`.

**Pattern matched**: rows of the canonical traceability table:

```markdown
## Use Case Traceability Mapping

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User picks up widget |
| UC1-S2 | User drops widget at target slot |
| UC1-E1a | Drag cancelled |
```

The parser first locates the table by matching the literal header
`| Use Case Step | Description |`, then extracts rows that match
`\| (UC\d+-[SE]\d+[a-z]?) \| (.+?) \|`.

**Returns**: `Array<{ id, useCaseId, number, description, type: 'main' | 'extension' }>`

- `id` — the literal step id (`UC1-S1`, `UC1-E1a`).
- `useCaseId` — the parent use case (the `UC<N>` prefix).
- `number` — just the step part (`S1`, `E1a`).
- `type` — `'extension'` when the number starts with `E`, else `'main'`.

**Limitation**: the parser requires the verbatim header string. AI-generated
tables with a different first column name (e.g., `| Step | Description |`)
won't be parsed.

**Cross-document role**: every step parsed here can become the target of an
`implements` edge from a `Requirement` or an `addresses` edge from a `Task`.
If a downstream artifact references a step id that wasn't parsed here, refresh
emits a "dangling edge" warning.

### 4.3 `parseRequirements(content)`

**Input files**: any markdown file under `synergyspec/changes/<name>/specs/`
(`walkMarkdown` is recursive — nested capability folders work).

**Pattern matched**: requirement section headers and their body fields.

```markdown
## ADDED Requirements

### Requirement: Validate password
**Implements**: UC1-S2 - System validates and grants access
The system SHALL hash and compare passwords using bcrypt.

#### Scenario: Correct password
- **WHEN** user submits matching password
- **THEN** access is granted
```

The parser locates each `### Requirement: <Name>` header. For each match it
computes the section bounds as: from this header to the next of
`\n### Requirement:`, `\n## `, or end of file (whichever comes first).

> **Subtle correctness invariant**: an earlier version used `content.indexOf('##', sectionStart + 1)` which matched the current header itself (since `### Req…` contains `##` at its second character), collapsing the section to a single character and silently returning `implements: undefined` for every requirement. The fix anchors the search to `\n## ` and `\n### Requirement:` so the current header can't self-match.

**Returns**: `Array<{ id, name, shallStatement, requirementType, priority?, implements? }>`

| Field             | Source                                                         | Default               |
| ----------------- | -------------------------------------------------------------- | --------------------- |
| `name`            | text after `### Requirement: `                                 | required              |
| `shallStatement`  | first line matching `The system SHALL (.+)` (case-insensitive) | derived from name     |
| `requirementType` | enclosing `## (ADDED\|MODIFIED\|REMOVED\|RENAMED) Requirements` | `'added'`             |
| `priority`        | `priority: (high\|medium\|low)` line in body                   | `'medium'`            |
| `implements`      | `**Implements**: <list>` line, semicolon-split, then `[0]` of each piece's space-split (so `UC1-S2 - description` → `UC1-S2`) | `undefined`           |

**Cross-document role**: each entry of `implements` produces a
`Requirement →implements→ UseCaseStep` edge. Step ids must match those
parsed from `usecases.md`; mismatches produce dangling-edge warnings on
refresh.

### 4.4 `parseTasks(content)`

**Input file**: `synergyspec/changes/<name>/tasks.md`

**Pattern matched**: GitHub-flavoured task list items with a numeric prefix:

```markdown
## 1. Backend
- [ ] 1.1 Add password hashing helper (Addresses: UC1-S2)
- [x] 1.2 Wire login endpoint (Addresses: UC1-S1, UC1-S2) [Priority: High]
- [ ] 1.3 Wire logout endpoint
```

Regex: `^\s*- \[([ x])\] (\d+\.\d+) (.+)$` (multiline).

**Returns**: `Array<{ id, taskNumber, description, status, priority?, addresses? }>`

| Field         | Source                                                         | Default     |
| ------------- | -------------------------------------------------------------- | ----------- |
| `taskNumber`  | the `\d+\.\d+` prefix (e.g., `1.2`)                            | required    |
| `status`      | `'completed'` if checkbox is `x`, else `'pending'`             | required    |
| `description` | rest of the line, with `(Addresses: …)` and `[Priority: …]` annotations stripped | required    |
| `addresses`   | `(Addresses: <list>)` annotation, comma-separated              | `undefined` |
| `priority`    | `[Priority: High\|Medium\|Low]` annotation (case-insensitive)  | `'medium'`  |

**Id encoding**: the entity id is `<changeId>-task<N>_<M>` (e.g.,
`auth-feature-task1_2`). The dot in the task number is replaced with an
underscore to keep the id a valid identifier.

**Cross-document role**: each entry of `addresses` produces a
`Task →addresses→ UseCaseStep` edge. Step references must match ids parsed
from `usecases.md`.

### 4.5 `extractArtifactMetadata(content, artifactType)`

Returns `Record<string, any>` with metadata about the artifact. Always
populates:

- `wordCount`, `lineCount`
- `hasTraceabilityTable` — true if the canonical traceability header is present
- `hasImplementationMapping` — true if `**Implements**:` appears anywhere
- `extractionDate` — ISO timestamp

Then per-type extras:

| `artifactType` | Extra fields                                                  |
| -------------- | ------------------------------------------------------------- |
| `'usecases'`   | `useCaseCount`, `stepCount`, `hasActorGoals`                  |
| `'specs'`      | `requirementCount`, `scenarioCount`, `hasShallStatements`     |
| `'design'`     | `decisionCount`, `hasMigrationPlan`, `riskCount`              |
| `'tasks'`      | `taskCount`, `completedTaskCount`, `completionPercentage`     |

This metadata is informational. It can be attached to an entity's `metadata`
field but does not affect graph structure.

### 4.6 `validateExtractedEntities(entities, artifactType)`

Returns `{ valid: any[], invalid: any[], errors: string[] }`. Common checks
(every entity): `id`, `type`, `name` must be present. Type-specific checks:

| Type           | Required fields                                 |
| -------------- | ----------------------------------------------- |
| `UseCase`      | `primaryActor`, `goal`                          |
| `UseCaseStep`  | `stepNumber`, `action`                          |
| `Requirement`  | `shallStatement`, valid `requirementType` enum  |
| `Task`         | `taskNumber`, valid `status` enum               |

The validator is exposed as a function but **not called by `kg refresh`** —
refresh trusts the parsers. The validator is available for callers that
want to dry-run extraction before committing. (`kg:validate-entity` tool
also uses the schema validator from `validator.ts`, which is a separate,
stricter check against the YAML ontology.)

### 4.7 What the parsers don't do (yet)

- **Code, test, scenario extraction.** The schema has `CodeFile`,
  `TestCase`, `Scenario`, `DesignDecision` types but no parsers populate
  them. See Section 10.1.
- **YAML frontmatter.** Per-artifact YAML headers are not parsed. Anything
  in frontmatter is ignored.
- **Multi-language artifacts.** Parsers assume English markers (`Primary
  Actor`, `Goal`, `Implements`, `Addresses`). Translated templates won't
  parse.
- **Custom schemas.** The parsers and `ARTIFACT_SLOTS` in `kg-refresh.ts`
  are tuned for the spec-driven schema. Other schemas may parse partially
  or not at all.
- **In-line code-or-test references inside `tasks.md`.** Forms like
  `(Implements: src/auth/login.ts)` are not currently extracted; that's the
  proposed Option 1 from Section 10.1.

### 4.8 Adding or modifying a parser

The contract for any parser added to `content-parser.ts`:

1. **Pure function**: takes a string, returns an array of plain records. No
   `fs`, no network, no side effects. This keeps parsers unit-testable in
   isolation.
2. **Stable id derivation**: when possible, derive ids from content (like
   the `UC<N>` capture in `parseUseCases`) so they don't shift on edits. If
   forced to use sequential numbering, document it.
3. **Optional fields are optional**: never throw on missing fields; return
   `undefined` and let the caller decide.
4. **Match what the AI actually writes, not just templates**: real-world AI
   output drifts from the template. Be tolerant of common variations
   (different casing, different separators, different field names) where it
   doesn't introduce ambiguity.
5. **Section bounds need newline anchors**: when computing where a section
   ends, anchor on `\n## ` / `\n### ` rather than bare `##` / `###`. The
   former avoids the self-match bug documented in §4.3.

After adding a parser, wire it into `refreshChange` in
`src/commands/kg-refresh.ts` — that's the single integration point between
parsers and graph construction. Add the entity-type to `SUB_ENTITY_TYPES`
in the same file so refresh knows to clear it on each rebuild.

### 4.9 Parser ↔ entity ↔ relationship reference

Quick lookup of which parser produces what:

| Parser                  | Entity type produced | Relationships produced (and their targets)        |
| ----------------------- | -------------------- | ------------------------------------------------- |
| `parseUseCases`         | `UseCase`            | `usecases artifact →definesUseCase→ UseCase`       |
| `parseUseCaseSteps`     | `UseCaseStep`        | `UseCase →hasStep→ UseCaseStep`                    |
| `parseRequirements`     | `Requirement`        | `specs artifact →hasRequirement→ Requirement`, `Requirement →implements→ UseCaseStep` |
| `parseTasks`            | `Task`               | `tasks artifact →hasTask→ Task`, `Task →addresses→ UseCaseStep` |

The cross-document edges (`implements`, `addresses`) are how multi-file
traceability emerges in the graph: a parser in one file produces a
relationship whose target is an entity created by a parser running on a
different file. Order doesn't matter — `kg refresh` runs all parsers
first, then creates all edges, with target-existence checks.

---

## 5. Claude Code integration

There are three layers, ordered from most-deterministic to least:

### 5.1 Hooks (deterministic, runtime-enforced)

The `kg install-hooks` command installs two hook entries into
`.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "synergyspec-hw kg refresh --silent 2>/dev/null || true" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "synergyspec-hw kg refresh --silent 2>/dev/null || true" }
        ]
      }
    ]
  }
}
```

`PostToolUse` fires after every `Write`/`Edit`/`MultiEdit` tool invocation —
the AI cannot bypass this. `Stop` fires once at the end of each turn. Both
run `synergyspec-hw kg refresh --silent`, which:

- Returns success silently if the project has no KG (so the hook is safe to
  configure globally).
- Is idempotent and fast (~tens of milliseconds for typical change sizes).
- Cleans up its own output (`2>/dev/null || true`) so failures never block the
  AI's next action.

This is the load-bearing sync mechanism. The hooks ensure the graph is
correct after every meaningful AI action even if the AI forgets every other
sync mechanism.

### 5.2 In-skill instructions (advisory, model-driven)

Each of the eight workflow templates (`continue-change`, `apply-change`,
`verify-change`, `verify-spec`, `gen-tests`, `run-tests`, `tdd`, `ff-change`)
ends with two prominent blocks rendered into the skill markdown:

1. **Sync Knowledge Graph (REQUIRED)** — instructs the AI to run
   `synergyspec-hw kg refresh --change "<name>"` itself after completing the
   workflow. Redundant with the hooks but useful for AIs that don't honour
   hooks (e.g., other tools), and a clear signal that sync is part of the
   contract.
2. **Manual Edit Notice (tell the user)** — instructs the AI to include a
   verbatim reminder in its final user-facing message:

   > 💡 If you edit any change artifact (`usecases.md`, `specs/*.md`,
   > `tasks.md`) by hand outside of slash commands, run `synergyspec-hw kg
   > refresh` to keep the Knowledge Graph in sync — or run `synergyspec-hw kg
   > watch` in a side terminal to auto-refresh on every save.

These are best-effort. The hooks are the actual guarantee.

### 5.3 CLI auto-refresh

`synergyspec-hw new change <name>` calls `kgRefreshCommand({ change, silent,
projectRoot })` at the end. This makes "every command that touches change
files leaves a synced KG" the convention even for CLI commands.

---

## 6. End-to-end lifecycle

### 6.1 Project initialization

```bash
$ synergyspec-hw init --tools claude
```

- Creates `synergyspec/` and writes initial config.
- Generates `.claude/commands/synspec/*.md` (slash commands) and
  `.claude/skills/synergyspec-*/` (skills).
- **Auto-installs** the KG hooks into `.claude/settings.local.json`.

### 6.2 Creating a change

```bash
$ synergyspec-hw new change my-feature --description "..."
```

- Creates `synergyspec/changes/my-feature/` with `.synergyspec.yaml`.
- Initializes the KG (`synergyspec/kg/config.json` and `data.json`).
- Creates the `Change` entity.
- Calls `kgRefreshCommand({ change, silent, projectRoot })` to register doc
  entities for any markdown that's already on disk (a no-op for fresh
  scaffolds).

### 6.3 AI workflow execution

```text
User: /synspec:continue
```

- AI reads the skill template, follows its steps, writes `proposal.md`
  using the `Write` tool.
- `PostToolUse` hook fires after `Write` returns → runs
  `synergyspec-hw kg refresh --silent` → graph now contains the new
  `DesignDoc` entity for `proposal.md` plus its `hasArtifact` edge.
- AI continues with subsequent steps; each `Write`/`Edit` triggers another
  refresh.
- AI may also explicitly run `synergyspec-hw kg refresh --change <name>` per
  the in-skill instruction (redundant but harmless).
- `Stop` hook fires at end of turn → final refresh.

### 6.4 Direct user edits

```text
User opens usecases.md in their editor and adds a new use case.
```

- If `synergyspec-hw kg watch` is running in a side terminal, the file
  watcher picks up the change, debounces, and runs refresh.
- If `kg watch` is not running, the graph is stale until the user (or AI)
  next runs refresh. The Manual Edit Notice tells users this; the next AI
  turn that edits anything also triggers a hook-driven refresh.

### 6.5 Inspecting the graph

```bash
$ synergyspec-hw kg view
```

Opens the browser viewer pointed at the local server. Click any node to see
its full JSON; toggle types to filter; search by name or id.

---

## 7. Idempotency and safety

The KG is designed so any operation is safe to repeat:

- **`createRelationship` deduplicates**: if `(sourceId, type, targetId)`
  already exists, it's a no-op (`src/core/kg/client.ts`).
- **`delete` cleans up dangling edges**: deleting an entity also removes any
  edges originating from or pointing at it.
- **`saveKGState` exports each edge once** — uses `direction='out'` when
  collecting per-entity relationships, so an edge isn't double-counted from
  both endpoints.
- **`getRelationships` filters on exact source/target id** — uses
  `rel.sourceId === entityId` rather than a string-prefix match on the
  storage key, so an entity's edges aren't conflated with descendant entities
  whose ids share the same prefix.
- **`createChangeRefresh` rebuilds, doesn't accumulate** — every refresh
  deletes the previous sub-entities for the change and re-derives them from
  current markdown. Prunes doc entities whose files have been removed.
- **Hooks safely no-op outside KG projects** — `kg refresh --silent` returns
  exit code 0 and writes nothing if the current directory has no
  `synergyspec/kg/`. Configure the hook globally without worrying about
  projects that don't use SynergySpec.

A single shared `KGClient` is cached per resolved project root in
`src/utils/kg-utils.ts` (`clientCache: Map<string, KGClient>`). All KG
operations within a process share this client so entities created in one tool
call are visible to subsequent calls. The client is file-backed
(`type: 'file'`, `connectionString: <projectRoot>/synergyspec/kg/data.json`),
so `client.persist()` and `saveKGState` both write to disk.

---

## 8. Architecture / file map

```text
src/core/kg/
├── client.ts              KGClient interface + InMemoryKGClient (entities,
│                          relationships, persistence, full CRUD + traversal).
├── types.ts               TypeScript types for the entire ontology
│                          (Artifact, Entity, Event + all subtypes,
│                          relationship types, query types).
├── content-parser.ts      Pure markdown parsers: parseUseCases,
│                          parseUseCaseSteps, parseRequirements, parseTasks,
│                          extractArtifactMetadata.
├── tool-interface.ts      KG_TOOL_REGISTRY (tool definitions for AI
│                          assistants), executeKGTool dispatcher,
│                          createKGToolInterface factory.
├── tools.ts               Single-params-object tool implementations: kg:init,
│                          kg:create-entity, kg:create-entities,
│                          kg:create-relationship, kg:query, kg:get-entity,
│                          kg:get-change-traceability, kg:persist,
│                          kg:validate-entity, kg:get-summary.
├── init.ts                initializeKG, initializeChangeKG, saveKGState,
│                          loadKGState. Constructs the file-backed client and
│                          registers it in the cache.
├── validator.ts           Schema validator (parses the YAML ontology and
│                          checks entities/relationships against it).
├── workflow-utils.ts      Higher-level helpers used by tools (extract
│                          entities from artifact content, etc.).
├── verify-utils.ts        verifyKGConnectivity and the per-section verifier
│                          functions used by /synspec:verify.
├── implementation-utils.ts trackImplementationStart/Complete, code/test
│                          entity creation helpers, TDDEvent emission.
├── test-execution-utils.ts runTestsWithKGTracking, updateTestResultsInKG,
│                          updateTestMetricsInKG.
├── blast-radius-utils.ts  analyzeBlastRadiusViaKG and
│                          generateKGBlastRadiusReport for /synspec:verify.
├── viewer-html.ts         Self-contained HTML viewer rendered by `kg view`.
└── index.ts               Barrel: re-exports everything plus the convenient
                          `KG.createKGClient(...)` factory.

src/commands/
├── kg-refresh.ts          The `kg refresh` command, kgRefreshCommand fn.
├── kg-view.ts             The `kg view` command, tiny http server.
├── kg-watch.ts             The `kg watch` command, fs.watch + debounced refresh.
└── kg-install-hooks.ts    The `kg install-hooks` command.

src/utils/
└── kg-utils.ts            isKGEnabled, getKGClient (cached), registerKGClient,
                          resetKGClientCache, persistKGState, getKGSummary,
                          formatKGInfo, withKGInfo, handleKGError.

src/core/
└── init.ts                The synergyspec-hw init command. Auto-calls
                          kgInstallHooksCommand when Claude is selected.

src/cli/index.ts           Wires all of the above into the commander CLI.
```

---

## 9. Bug history and fixes

Several bugs were discovered and fixed while building this. They are
documented here because they describe correctness expectations the code now
relies on.

| Bug | Root cause | Fix |
| --- | ---------- | --- |
| `getRelationships` over-matched | `key.startsWith(entityId)` returned edges of any descendant entity whose id shared the prefix. | Filter by exact `rel.sourceId === entityId` / `rel.targetId === entityId` instead of by storage key. |
| `saveKGState` double-counted edges | Default `direction='both'` collected each edge twice (once from source, once from target). | Use `direction='out'` so each edge is exported exactly once at its source. |
| `createRelationship` was non-idempotent | Re-running refresh duplicated edges. | Skip when the same `(source, type, target)` triple already exists. |
| `delete` left dangling edges | `entities.delete(id)` did not remove relationships involving the entity. | Sweep both outbound (key prefix) and inbound (rel.targetId match) relationships and remove them when an entity is deleted. |
| `parseRequirements` truncated at the header | `content.indexOf('##', sectionStart + 1)` matched the current `### Requirement:` header itself, collapsing the section. | Anchor search to `\n## ` and `\n### Requirement:` so the current header doesn't self-match. |
| `parseUseCases` didn't recognise AI output | Only matched `### Use Case: Name` (template form), not `### UC1: Name` (what the AI actually generates). | Broaden regex to `^### (?:Use Case:|UC(\d+)[:.\-\s]+)\s*(.+)$`; use the explicit number when present so ids stay stable. |
| Stale doc entities for missing files | `/synspec:new` pre-registered entities for all five expected artifacts even though only the directory is created on disk. Refresh ignored doc entities. | Make refresh authoritative for doc entities too: prune any whose filePath doesn't exist, create one for each artifact slot whose file does exist. |
| `loadFromDisk` silently failed | `require('fs')` inside an ES module produced `require is not defined`, so subsequent runs lost previously persisted state. | Replace with ESM `import { existsSync, readFileSync, writeFileSync } from 'fs'`. |
| Tool dispatcher passed wrong shape | `executeKGTool` called `tool.implementation(parameters)` with a single object but tools used positional args; `projectRoot` ended up being the params object. | Refactor every `*Tool` function to accept a single params object and destructure internally. |
| Per-call clients lost data | Each `getKGClient` call constructed a fresh memory-backed client; entities created in one tool call were not visible to the next; `kg:persist` was called with `null`. | Cache one file-backed client per resolved project root in `src/utils/kg-utils.ts` and have all tool calls share it. |
| KG storage was hidden | Originally at `.synergyspec/kg/`, easy to miss because of the leading dot. | Moved to `synergyspec/kg/` so it sits next to the markdown it describes. |

---

## 10. Limitations and known gaps

### 10.1 Code and test files are not tracked

The ontology defines `CodeFile`, `TestCase`, and `TestRun` types with
relationships like `Task →implementedBy→ CodeFile`, `TestCase →tests→
Requirement`, `TestCase →covers→ UseCaseStep`. **Refresh does not currently
populate any of these.**

The reason: refresh only walks `synergyspec/changes/<name>/` and parses the
markdown there. Source code and test files live elsewhere in the project
(`src/`, `test/`, `__tests__/`, etc.) and they don't carry metadata that
ties them to a specific `Task` or `Requirement`. The connection only exists
in the AI's mental model while it's writing the file.

This means the graph captures the spec → use case → requirement → task
traceability, but stops there. It does not show which code file implements a
given task, nor which test covers a given requirement.

Three possible ways to bridge this gap (none implemented):

1. **Augment `tasks.md` with `(Implements: src/...)` and `(Tests: src/...)`
   annotations.** AI updates the line after writing each file. Refresh's
   `parseTasks` would learn the new fields.
2. **Header annotations in source files.** AI writes `// @synspec implements:
   req2` style comments; refresh greps for them.
3. **Git-based discovery.** When `/synspec:apply` finishes, `git diff`
   identifies changed files and attributes them to the active change.

### 10.2 Test runs and CI events are not recorded

`TestRun` and `CIReport` events have type definitions but no current code
path that creates them. `runTestsWithKGTracking` exists in
`test-execution-utils.ts` but isn't invoked by `synergyspec-hw run-tests` or
the slash command pipeline.

### 10.3 The ontology validator is not enforced on writes

`KGSchemaValidator` reads `schemas/kg-ontology.yaml` and can validate
entities. `kg:validate-entity` exposes this as a tool. `client.create`
currently does not call it on every write. Validation is opt-in per call.

### 10.4 Direct file edits without `kg watch`

Hooks fire on Claude Code tool use, not on raw filesystem edits. Editing
markdown in your editor without the watcher running leaves the graph stale
until the next AI turn that triggers a hook. The Manual Edit Notice block in
every workflow template flags this; running `kg watch` is the
zero-touch solution.

### 10.5 No multi-process safety

The cached client is per-process. If two `synergyspec-hw` invocations run
concurrently against the same project, both load and write `data.json`
without coordination. In practice this rarely matters because hooks are
serial within a Claude Code session; the watcher debounces; CLI commands
generally don't overlap. There is no file locking.

### 10.6 Schema-driven artifact slots are hardcoded

`kg-refresh.ts` has a hardcoded `ARTIFACT_SLOTS` list (`proposal`, `usecases`,
`specs`, `design`, `tasks`). Custom schemas with different artifact layouts
won't be fully discovered. This should be schema-driven (read the project
schema and use its declared artifacts), but isn't yet.

---

## 11. Glossary

- **Change** — a unit of work that touches one or more capabilities. Lives
  under `synergyspec/changes/<name>/` until archived.
- **Artifact** — any file under a change (proposal, usecases, design, specs,
  tasks). Has a typed entity in the KG.
- **Entity** — content extracted from an artifact (use case, step, requirement,
  task, etc.). Lives only in the KG, not on disk as its own file.
- **Relationship** — directed typed edge between two entity ids. Examples:
  `hasArtifact`, `implements`, `addresses`, `hasStep`.
- **Sub-entity** — a non-document Entity (`UseCase`, `UseCaseStep`,
  `Requirement`, `Task`, etc.) that is rebuilt from scratch on every refresh.
- **Doc entity** — a document-level entity (`Spec`, `DesignDoc`, `Artifact`,
  `TestCase`, `CodeFile`) tied to a file path. Reconciled with disk on every
  refresh.
- **Refresh** — the operation that re-derives the graph from current markdown.
  Idempotent and authoritative.
- **Hook** — a Claude Code runtime entry in `.claude/settings.local.json` that
  fires deterministically on tool use or end-of-turn.

---

## 12. Quick reference

```bash
# One-time per project (auto-installed by synergyspec-hw init for Claude):
synergyspec-hw kg install-hooks

# Bring the graph in sync with disk (idempotent, fast):
synergyspec-hw kg refresh
synergyspec-hw kg refresh --change my-feature
synergyspec-hw kg refresh -v

# Open the browser viewer:
synergyspec-hw kg view
synergyspec-hw kg view --no-open --port 8080

# Auto-refresh on direct file edits (run in a side terminal):
synergyspec-hw kg watch

# Where to look on disk:
synergyspec/kg/config.json
synergyspec/kg/data.json
.claude/settings.local.json   # Claude Code hooks
```
