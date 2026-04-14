## MODIFIED Requirements
### Requirement: AI Tool Configuration Details

The command SHALL properly configure selected AI tools with SynergySpec-specific instructions using a marker system.

#### Scenario: Configuring Claude Code

- **WHEN** Claude Code is selected
- **THEN** create or update `CLAUDE.md` in the project root directory (not inside synergyspec/)
- **AND** populate the managed block with a short stub that points teammates to `@/synergyspec/AGENTS.md`

#### Scenario: Configuring CodeBuddy Code

- **WHEN** CodeBuddy Code is selected
- **THEN** create or update `CODEBUDDY.md` in the project root directory (not inside synergyspec/)
- **AND** populate the managed block with a short stub that points teammates to `@/synergyspec/AGENTS.md`

#### Scenario: Configuring Cline

- **WHEN** Cline is selected
- **THEN** create or update `CLINE.md` in the project root directory (not inside synergyspec/)
- **AND** populate the managed block with a short stub that points teammates to `@/synergyspec/AGENTS.md`

#### Scenario: Creating new CLAUDE.md

- **WHEN** CLAUDE.md does not exist
- **THEN** create new file with stub instructions wrapped in markers so the full workflow stays in `synergyspec/AGENTS.md`:
```markdown
<!-- OPENSPEC:START -->
# SynergySpec Instructions

This project uses SynergySpec to manage AI assistant workflows.

- Full guidance lives in '@/synergyspec/AGENTS.md'.
- Keep this managed block so 'openspec update' can refresh the instructions.
<!-- OPENSPEC:END -->
```

### Requirement: Slash Command Configuration
The init command SHALL generate slash command files for supported editors using shared templates.

#### Scenario: Generating slash commands for Claude Code
- **WHEN** the user selects Claude Code during initialization
- **THEN** create `.claude/commands/synergyspec/proposal.md`, `.claude/commands/synergyspec/apply.md`, and `.claude/commands/synergyspec/archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for CodeBuddy Code
- **WHEN** the user selects CodeBuddy Code during initialization
- **THEN** create `.codebuddy/commands/synergyspec/proposal.md`, `.codebuddy/commands/synergyspec/apply.md`, and `.codebuddy/commands/synergyspec/archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Cline
- **WHEN** the user selects Cline during initialization
- **THEN** create `.clinerules/synergyspec-proposal.md`, `.clinerules/synergyspec-apply.md`, and `.clinerules/synergyspec-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** include Cline-specific Markdown heading frontmatter
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Cursor
- **WHEN** the user selects Cursor during initialization
- **THEN** create `.cursor/commands/synergyspec-proposal.md`, `.cursor/commands/synergyspec-apply.md`, and `.cursor/commands/synergyspec-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for OpenCode
- **WHEN** the user selects OpenCode during initialization
- **THEN** create `.opencode/commands/synergyspec-proposal.md`, `.opencode/commands/synergyspec-apply.md`, and `.opencode/commands/synergyspec-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Windsurf
- **WHEN** the user selects Windsurf during initialization
- **THEN** create `.windsurf/workflows/synergyspec-proposal.md`, `.windsurf/workflows/synergyspec-apply.md`, and `.windsurf/workflows/synergyspec-archive.md`
- **AND** populate each file from shared templates (wrapped in SynergySpec markers) so workflow text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Kilo Code
- **WHEN** the user selects Kilo Code during initialization
- **THEN** create `.kilocode/workflows/synergyspec-proposal.md`, `.kilocode/workflows/synergyspec-apply.md`, and `.kilocode/workflows/synergyspec-archive.md`
- **AND** populate each file from shared templates (wrapped in SynergySpec markers) so workflow text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Codex
- **WHEN** the user selects Codex during initialization
- **THEN** create global prompt files at `~/.codex/prompts/synergyspec-proposal.md`, `~/.codex/prompts/synergyspec-apply.md`, and `~/.codex/prompts/synergyspec-archive.md` (or under `$CODEX_HOME/prompts` if set)
- **AND** populate each file from shared templates that map the first numbered placeholder (`$1`) to the primary user input (e.g., change identifier or question text)
- **AND** wrap the generated content in SynergySpec markers so `openspec update` can refresh the prompts without touching surrounding custom notes

#### Scenario: Generating slash commands for GitHub Copilot
- **WHEN** the user selects GitHub Copilot during initialization
- **THEN** create `.github/prompts/synergyspec-proposal.prompt.md`, `.github/prompts/synergyspec-apply.prompt.md`, and `.github/prompts/synergyspec-archive.prompt.md`
- **AND** populate each file with YAML frontmatter containing a `description` field that summarizes the workflow stage
- **AND** include `$ARGUMENTS` placeholder to capture user input
- **AND** wrap the shared template body with SynergySpec markers so `openspec update` can refresh the content
- **AND** each template includes instructions for the relevant SynergySpec workflow stage
