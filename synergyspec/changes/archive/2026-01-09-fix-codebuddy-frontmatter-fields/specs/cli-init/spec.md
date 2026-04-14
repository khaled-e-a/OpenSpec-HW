## MODIFIED Requirements

### Requirement: Slash Command Configuration

The init command SHALL generate slash command files for supported editors using shared templates.

#### Scenario: Generating slash commands for Antigravity
- **WHEN** the user selects Antigravity during initialization
- **THEN** create `.agent/workflows/synergyspec-proposal.md`, `.agent/workflows/synergyspec-apply.md`, and `.agent/workflows/synergyspec-archive.md`
- **AND** ensure each file begins with YAML frontmatter that contains only a `description: <stage summary>` field followed by the shared SynergySpec workflow instructions wrapped in managed markers
- **AND** populate the workflow body with the same proposal/apply/archive guidance used for other tools so Antigravity behaves like Windsurf while pointing to the `.agent/workflows/` directory

#### Scenario: Generating slash commands for Claude Code
- **WHEN** the user selects Claude Code during initialization
- **THEN** create `.claude/commands/synergyspec/proposal.md`, `.claude/commands/synergyspec/apply.md`, and `.claude/commands/synergyspec/archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for CodeBuddy Code
- **WHEN** the user selects CodeBuddy Code during initialization
- **THEN** create `.codebuddy/commands/synergyspec/proposal.md`, `.codebuddy/commands/synergyspec/apply.md`, and `.codebuddy/commands/synergyspec/archive.md`
- **AND** populate each file from shared templates that include CodeBuddy-compatible YAML frontmatter for the `description` and `argument-hint` fields
- **AND** use square bracket format for `argument-hint` parameters (e.g., `[change-id]`)
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Cline
- **WHEN** the user selects Cline during initialization
- **THEN** create `.clinerules/workflows/synergyspec-proposal.md`, `.clinerules/workflows/synergyspec-apply.md`, and `.clinerules/workflows/synergyspec-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** include Cline-specific Markdown heading frontmatter
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Crush
- **WHEN** the user selects Crush during initialization
- **THEN** create `.crush/commands/synergyspec/proposal.md`, `.crush/commands/synergyspec/apply.md`, and `.crush/commands/synergyspec/archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** include Crush-specific frontmatter with SynergySpec category and tags
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Cursor
- **WHEN** the user selects Cursor during initialization
- **THEN** create `.cursor/commands/synergyspec-proposal.md`, `.cursor/commands/synergyspec-apply.md`, and `.cursor/commands/synergyspec-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SynergySpec workflow stage

#### Scenario: Generating slash commands for Factory Droid
- **WHEN** the user selects Factory Droid during initialization
- **THEN** create `.factory/commands/synergyspec-proposal.md`, `.factory/commands/synergyspec-apply.md`, and `.factory/commands/synergyspec-archive.md`
- **AND** populate each file from shared templates that include Factory-compatible YAML frontmatter for the `description` and `argument-hint` fields
- **AND** include the `$ARGUMENTS` placeholder in the template body so droid receives any user-supplied input
- **AND** wrap the generated content in SynergySpec managed markers so `openspec update` can safely refresh the commands

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