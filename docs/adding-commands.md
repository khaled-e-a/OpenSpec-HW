# Adding a New CLI Command

This guide is for developers contributing to SynergySpec. It walks through how to add a new command to the `synergyspec-hw` CLI (the binary published in `bin/synergyspec.js`).

If you are looking for slash commands (e.g. `/synspec:new`) consumed by AI assistants, see [Commands](commands.md). Those are generated from templates in `src/core/templates/` and follow a different lifecycle.

---

## 1. How the CLI is wired

The CLI entry point is built with [`commander`](https://github.com/tj/commander.js) and lives in one place:

```
bin/synergyspec.js          # Thin shim: imports dist/cli/index.js
└── src/cli/index.ts        # Single root program; registers every command
    ├── src/commands/*.ts            # Command implementations
    └── src/commands/workflow/*.ts   # Workflow subcommand family
```

`src/cli/index.ts` does four things, in order:

1. Creates the root `program` (name `synergyspec-hw`).
2. Wires global flags and the `preAction` / `postAction` hooks that drive the telemetry `trackCommand(...)` call.
3. Registers every command, either inline or via a `registerXxxCommand(program)` function exported by a sibling file.
4. Calls `program.parse()`.

Because every command is attached to a single `program`, adding a new one always comes down to: write a handler, export a registration function (or block), and call it from `src/cli/index.ts`.

---

## 2. Pick a pattern

Three patterns exist in the codebase today. Pick the one that matches your command's shape.

### Pattern A — Inline action (simple, single command)

Use when the command is a flat verb with a handful of flags and no subcommands. Examples: `init`, `list`, `view`, `archive`, `feedback`.

The handler is defined inline in `src/cli/index.ts`, and the "logic" lives in a class under `src/core/` or `src/commands/`:

```ts
// src/cli/index.ts
program
  .command('archive [change-name]')
  .description('Archive a completed change and update main specs')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (changeName?: string, options?: { yes?: boolean }) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });
```

### Pattern B — Registration function (command with subcommands)

Use when the command has its own subcommands. Examples: `spec show|list|validate`, `config`, `schema`.

The file under `src/commands/` exports a single `registerXxxCommand(program)` function that takes the root program and hangs its subcommands off it. `src/cli/index.ts` calls it:

```ts
// src/commands/spec.ts
export function registerSpecCommand(rootProgram: typeof program) {
  const specCommand = rootProgram
    .command('spec')
    .description('Manage and view SynergySpec specifications');

  specCommand.command('show [spec-id]') /* … */;
  specCommand.command('list')           /* … */;
  specCommand.command('validate [spec-id]') /* … */;

  return specCommand;
}
```

```ts
// src/cli/index.ts
registerSpecCommand(program);
```

### Pattern C — Workflow-style function exports (artifact-driven commands)

Use when the command is part of the artifact-workflow surface and should also be importable from tests or other code. Examples: `status`, `instructions`, `templates`, `schemas`, `new change`.

Each command lives as its own file under `src/commands/workflow/`, exports a top-level `async function xxxCommand(options)` plus an `XxxOptions` interface, and the folder's `index.ts` re-exports everything. `src/cli/index.ts` imports from `../commands/workflow/index.js` and wires it up inline:

```ts
// src/commands/workflow/status.ts
export interface StatusOptions { change?: string; schema?: string; json?: boolean }

export async function statusCommand(options: StatusOptions): Promise<void> { /* … */ }
```

```ts
// src/commands/workflow/index.ts
export { statusCommand } from './status.js';
export type { StatusOptions } from './status.js';
```

```ts
// src/cli/index.ts
program
  .command('status')
  .description('Display artifact completion status for a change')
  .option('--change <id>', 'Change name to show status for')
  .option('--json', 'Output as JSON')
  .action(async (options: StatusOptions) => {
    try { await statusCommand(options); }
    catch (error) { /* standard error handling */ }
  });
```

**Rule of thumb:** new commands should prefer Pattern C (or B if they have subcommands). Pattern A is fine for one-offs, but pulling the logic out of `src/cli/index.ts` keeps that file readable and makes the command testable in isolation.

---

## 3. Step-by-step: add a new command

The running example below adds a verb-first command `synergyspec-hw doctor` that reports on project health. It uses Pattern C.

### 3.1 Create the handler

Create `src/commands/doctor.ts` (or `src/commands/workflow/doctor.ts` if it belongs in the workflow family):

```ts
import ora from 'ora';

export interface DoctorOptions {
  json?: boolean;
  fix?: boolean;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  const spinner = ora('Running diagnostics...').start();
  try {
    const report = await runChecks(process.cwd(), { fix: options.fix ?? false });
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    printHumanReport(report);

    if (!report.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    spinner.stop();
    throw error;
  }
}
```

Keep the handler pure: take an options object, do work, write to stdout, and *throw* on unexpected errors. Set `process.exitCode` rather than calling `process.exit()` for non-zero but expected failure states (e.g. validation failed) — this lets wrapping code and tests observe the result.

### 3.2 Register it in the CLI

Edit `src/cli/index.ts`:

```ts
import { doctorCommand, type DoctorOptions } from '../commands/doctor.js';

program
  .command('doctor')
  .description('Diagnose common problems in a SynergySpec project')
  .option('--fix', 'Attempt to auto-fix issues')
  .option('--json', 'Output report as JSON')
  .action(async (options: DoctorOptions) => {
    try {
      await doctorCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });
```

Follow the conventions already present in `src/cli/index.ts`:

- Use `ora().fail(...)` for user-facing failures, preceded by a blank `console.log()` for spacing.
- `process.exit(1)` is used in the `.action` wrapper for unexpected errors; inside handlers, prefer `process.exitCode = 1`.
- Put `--json` flags on any command an agent might consume.

### 3.3 Import note: always use the `.js` extension

The project builds ESM. Imports from TypeScript source must carry a `.js` extension (not `.ts`) because that is what the emitted output resolves to:

```ts
import { doctorCommand } from '../commands/doctor.js';   // correct
import { doctorCommand } from '../commands/doctor';      // wrong (runtime error)
```

---

## 4. Options and flags

Commander conventions used in this repo:

| Flag shape            | Meaning                                              |
|-----------------------|------------------------------------------------------|
| `--fix`               | Boolean flag (`options.fix === true` when provided). |
| `--no-validate`       | Inverted boolean (`options.validate === false`).     |
| `--schema <name>`     | Required value (string).                             |
| `--schema [name]`     | Optional value.                                      |
| `-r, --requirement <id>` | Short + long form with a value.                   |

Typing: declare a dedicated `XxxOptions` interface next to the handler and reuse it in the `.action(...)` signature. Every long flag with a dash becomes a camelCase property (`--no-interactive` → `noInteractive`).

`allowUnknownOption(true)` on `program.command(...)` is used when the action forwards options to a downstream implementation — only reach for it if you have that use case (see the top-level `show` command).

---

## 5. Positional arguments

Use `<name>` for required, `[name]` for optional:

```ts
program.command('new change <name>')        // required
program.command('archive [change-name]')    // optional — may prompt interactively
```

When an argument is optional and the runtime is interactive, fall back to an `@inquirer/prompts` selector, as `SpecCommand.show` does:

```ts
import { isInteractive } from '../utils/interactive.js';

if (!specId) {
  if (isInteractive(options)) {
    const { select } = await import('@inquirer/prompts');
    specId = await select({ /* … */ });
  } else {
    throw new Error('Missing required argument <spec-id>');
  }
}
```

Always honour `--no-interactive` (`options.noInteractive === true`) so scripts and agents can call the command deterministically.

---

## 6. Deprecation notices

If you are replacing an existing command with a new verb-first form, add a `preAction` hook on the *old* command that prints a warning to stderr, rather than removing it outright. Look at `changeCmd.hook('preAction', ...)` and `specCommand.hook('preAction', ...)` in the source for the pattern. Keep the warning on stderr (`console.error`) so `--json` output on stdout stays clean.

---

## 7. Register for shell completion

If users will tab-complete the new command, add an entry to `COMMAND_REGISTRY` in `src/core/completions/command-registry.ts`:

```ts
{
  name: 'doctor',
  description: 'Diagnose common problems in a SynergySpec project',
  flags: [
    { name: 'fix', description: 'Attempt to auto-fix issues' },
    COMMON_FLAGS.json,
  ],
},
```

For commands with subcommands, add a `subcommands: [...]` array (see the existing `change` entry). Re-use the entries in the `COMMON_FLAGS` object at the top of the file for `--json`, `--strict`, `--no-interactive`, and `--type` to keep completion descriptions consistent.

Do **not** duplicate the flag definitions from `src/cli/index.ts`; the registry exists so the completion scripts can mirror the real CLI. Keep both in sync when you add or rename flags.

---

## 8. Telemetry is automatic

You do not need to call `trackCommand` yourself. The root `program.hook('preAction', …)` in `src/cli/index.ts` computes a colon-joined path (e.g. `change:show`) from the command being invoked and fires telemetry before the action runs. As long as the command is attached to `program` via the normal `.command(...)` API, it gets tracked.

---

## 9. Write tests

Command tests live in `test/commands/<name>.test.ts` and use `vitest`. Two styles coexist:

- **Unit style:** import the handler function and call it directly. This is fastest and works for Pattern C commands because they expose a plain `async function`.
- **CLI style:** shell out to `bin/synergyspec.js` via `execSync`. Use this when the behaviour depends on Commander wiring (flag parsing, exit codes, stderr routing). See `test/commands/spec.test.ts` for the template: stand up a `test-xxx-tmp` directory in `beforeEach`, chdir into it, run `node bin/synergyspec.js ...`, assert on stdout/stderr and exit code, clean up in `afterEach`.

Minimum coverage for a new command:

1. Happy path, human output.
2. `--json` output shape if the command supports JSON.
3. At least one failure path (missing argument, non-existent item, invalid flag combination).
4. Exit code is non-zero on failure.

Run the suite with `pnpm test` (one-shot) or `pnpm test:watch` while developing.

---

## 10. Update the documentation

Any new user-visible command or flag should show up in:

- `docs/cli.md` — the canonical CLI reference, including the "Human vs Agent Commands" table near the top and the per-command sections lower down.
- `README.md` — only if the command belongs in the top-level quick tour.
- `CHANGELOG.md` — via a `changeset` entry (`pnpm changeset`) if the change is being released.

If the command interacts with slash commands or the workflow model, cross-link to `docs/commands.md` and `docs/workflows.md` as appropriate.

---

## 11. Checklist

Before opening a PR for a new CLI command:

- [ ] Handler lives in `src/commands/` (or `src/commands/workflow/`), not inline in `src/cli/index.ts`, if it is non-trivial.
- [ ] Command is registered in `src/cli/index.ts` with the standard `try/catch` + `ora().fail(...)` wrapper.
- [ ] `XxxOptions` interface is exported alongside the handler.
- [ ] Imports use the `.js` extension.
- [ ] `--json` flag is supported if an agent might call the command.
- [ ] `--no-interactive` is honoured if interactive prompts are possible.
- [ ] Exit codes: `process.exitCode = 1` for expected failures, `process.exit(1)` only in the CLI wrapper for unexpected errors.
- [ ] Entry added to `COMMAND_REGISTRY` in `src/core/completions/command-registry.ts`.
- [ ] Tests added under `test/commands/`.
- [ ] `docs/cli.md` updated.
- [ ] `pnpm build && pnpm test && pnpm lint` all pass.

---

## 12. Reference: files touched when adding a command

| File | Why |
|------|-----|
| `src/commands/<name>.ts` (or `src/commands/workflow/<name>.ts`) | Handler + options type. |
| `src/commands/workflow/index.ts` | Re-export, if using Pattern C. |
| `src/cli/index.ts` | Register the command on `program`. |
| `src/core/completions/command-registry.ts` | Shell completion entry. |
| `test/commands/<name>.test.ts` | Tests. |
| `docs/cli.md` | User-facing reference. |
| `CHANGELOG.md` / changeset | Release note. |
