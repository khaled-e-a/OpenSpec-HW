## Why
The project root currently receives a full copy of the SynergySpec agent instructions, duplicating the content that also lives in `synergyspec/AGENTS.md`. When teams edit one copy but not the other, the files drift and onboarding assistants see conflicting guidance.

## What Changes
- Keep generating the complete template in `synergyspec/AGENTS.md` during `openspec init` and follow-up updates.
- Replace the root-level file (`AGENTS.md` or `CLAUDE.md`, depending on tool selection) with a short hand-off that explains the project uses SynergySpec and points directly to `synergyspec/AGENTS.md`.
- Add a dedicated stub template so both the init and update flows reuse the same minimal copy instructions.
- Update CLI tests and documentation to reflect the new root-level messaging and ensure the SynergySpec marker block still protects future updates.

## Impact
- Affected specs: `cli-init`, `cli-update`
- Affected code: `src/core/init.ts`, `src/core/update.ts`, `src/core/templates/agents-template.ts`
- Update assets/readmes that mention the root `AGENTS.md` contents to reference the new stub message.
