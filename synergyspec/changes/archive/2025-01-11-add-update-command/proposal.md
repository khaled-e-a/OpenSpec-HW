# Add Update Command

## Why

Users need a way to update their local SynergySpec instructions (README.md and CLAUDE.md) when the SynergySpec package releases new versions with improved AI agent instructions or structural conventions.

## What Changes

- Add new `openspec update` CLI command that updates SynergySpec instructions
- Replace `synergyspec/README.md` with the latest template
  - Safe because this file is fully SynergySpec-managed
- Update only the SynergySpec-managed block in `CLAUDE.md` using markers
  - Preserve all user content outside markers
  - If `CLAUDE.md` is missing, create it with the managed block
- Display success message after update (ASCII-safe): "Updated SynergySpec instructions"
  - A leading checkmark MAY be shown when the terminal supports it
  - Operation is idempotent (re-running yields identical results)

## Impact

- Affected specs: `cli-update` (new capability)
- Affected code:
  - `src/core/update.ts` (new command class, mirrors `InitCommand` placement)
  - `src/cli/index.ts` (register new command)
  - Uses existing templates via `TemplateManager` and `readmeTemplate`

## Out of Scope

- No `.synergyspec/config.json` is introduced by this change. The default directory name `openspec` is used.