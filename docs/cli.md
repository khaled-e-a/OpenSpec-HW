# CLI Reference

The SynergySpec CLI (`synergyspec-hw`) provides terminal commands for project setup, validation, status inspection, and management. These commands complement the AI slash commands (like `/synspec:new`) documented in [Commands](commands.md).

## Summary

| Category | Commands | Purpose |
|----------|----------|---------|
| **Setup** | `init`, `update` | Initialize and update SynergySpec in your project |
| **Browsing** | `list`, `view`, `show` | Explore changes and specs |
| **Validation** | `validate` | Check changes and specs for issues |
| **Lifecycle** | `archive` | Finalize completed changes |
| **Workflow** | `status`, `instructions`, `templates`, `schemas` | Artifact-driven workflow support |
| **Schemas** | `schema init`, `schema fork`, `schema validate`, `schema which` | Create and manage custom workflows |
| **Config** | `config` | View and modify settings |
| **Utility** | `feedback`, `completion` | Feedback and shell integration |

---

## Human vs Agent Commands

Most CLI commands are designed for **human use** in a terminal. Some commands also support **agent/script use** via JSON output.

### Human-Only Commands

These commands are interactive and designed for terminal use:

| Command | Purpose |
|---------|---------|
| `synergyspec-hw init` | Initialize project (interactive prompts) |
| `synergyspec-hw view` | Interactive dashboard |
| `synergyspec-hw config edit` | Open config in editor |
| `synergyspec-hw feedback` | Submit feedback via GitHub |
| `synergyspec-hw completion install` | Install shell completions |

### Agent-Compatible Commands

These commands support `--json` output for programmatic use by AI agents and scripts:

| Command | Human Use | Agent Use |
|---------|-----------|-----------|
| `synergyspec-hw list` | Browse changes/specs | `--json` for structured data |
| `synergyspec-hw show <item>` | Read content | `--json` for parsing |
| `synergyspec-hw validate` | Check for issues | `--all --json` for bulk validation |
| `synergyspec-hw status` | See artifact progress | `--json` for structured status |
| `synergyspec-hw instructions` | Get next steps | `--json` for agent instructions |
| `synergyspec-hw templates` | Find template paths | `--json` for path resolution |
| `synergyspec-hw schemas` | List available schemas | `--json` for schema discovery |

---

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show version number |
| `--no-color` | Disable color output |
| `--help`, `-h` | Display help for command |

---

## Setup Commands

### `synergyspec-hw init`

Initialize SynergySpec in your project. Creates the folder structure and configures AI tool integrations.

```
synergyspec-hw init [path] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--tools <list>` | Configure AI tools non-interactively. Use `all`, `none`, or comma-separated list |
| `--force` | Auto-cleanup legacy files without prompting |

**Supported tools:** `amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codex`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `opencode`, `qoder`, `qwen`, `roocode`, `windsurf`

**Examples:**

```bash
# Interactive initialization
synergyspec-hw init

# Initialize in a specific directory
synergyspec-hw init ./my-project

# Non-interactive: configure for Claude and Cursor
synergyspec-hw init --tools claude,cursor

# Configure for all supported tools
synergyspec-hw init --tools all

# Skip prompts and auto-cleanup legacy files
synergyspec-hw init --force
```

**What it creates:**

```
synergyspec/
├── specs/              # Your specifications (source of truth)
├── changes/            # Proposed changes
└── config.yaml         # Project configuration

.claude/skills/         # Claude Code skill files (if claude selected)
.cursor/rules/          # Cursor rules (if cursor selected)
... (other tool configs)
```

---

### `synergyspec-hw update`

Update SynergySpec instruction files after upgrading the CLI. Re-generates AI tool configuration files.

```
synergyspec-hw update [path] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Force update even when files are up to date |

**Example:**

```bash
# Update instruction files after npm upgrade
npm update @khaledea/synergyspec-hw
synergyspec-hw update
```

---

## Browsing Commands

### `synergyspec-hw list`

List changes or specs in your project.

```
synergyspec-hw list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--specs` | List specs instead of changes |
| `--changes` | List changes (default) |
| `--sort <order>` | Sort by `recent` (default) or `name` |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all active changes
synergyspec-hw list

# List all specs
synergyspec-hw list --specs

# JSON output for scripts
synergyspec-hw list --json
```

**Output (text):**

```
Active changes:
  add-dark-mode     UI theme switching support
  fix-login-bug     Session timeout handling
```

---

### `synergyspec-hw view`

Display an interactive dashboard for exploring specs and changes.

```
synergyspec-hw view
```

Opens a terminal-based interface for navigating your project's specifications and changes.

---

### `synergyspec-hw show`

Display details of a change or spec.

```
synergyspec-hw show [item-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Name of change or spec (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--type <type>` | Specify type: `change` or `spec` (auto-detected if unambiguous) |
| `--json` | Output as JSON |
| `--no-interactive` | Disable prompts |

**Change-specific options:**

| Option | Description |
|--------|-------------|
| `--deltas-only` | Show only delta specs (JSON mode) |

**Spec-specific options:**

| Option | Description |
|--------|-------------|
| `--requirements` | Show only requirements, exclude scenarios (JSON mode) |
| `--no-scenarios` | Exclude scenario content (JSON mode) |
| `-r, --requirement <id>` | Show specific requirement by 1-based index (JSON mode) |

**Examples:**

```bash
# Interactive selection
synergyspec-hw show

# Show a specific change
synergyspec-hw show add-dark-mode

# Show a specific spec
synergyspec-hw show auth --type spec

# JSON output for parsing
synergyspec-hw show add-dark-mode --json
```

---

## Validation Commands

### `synergyspec-hw validate`

Validate changes and specs for structural issues.

```
synergyspec-hw validate [item-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Specific item to validate (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | Validate all changes and specs |
| `--changes` | Validate all changes |
| `--specs` | Validate all specs |
| `--type <type>` | Specify type when name is ambiguous: `change` or `spec` |
| `--strict` | Enable strict validation mode |
| `--json` | Output as JSON |
| `--concurrency <n>` | Max parallel validations (default: 6, or `SYNERGYSPEC_CONCURRENCY` env) |
| `--no-interactive` | Disable prompts |

**Examples:**

```bash
# Interactive validation
synergyspec-hw validate

# Validate a specific change
synergyspec-hw validate add-dark-mode

# Validate all changes
synergyspec-hw validate --changes

# Validate everything with JSON output (for CI/scripts)
synergyspec-hw validate --all --json

# Strict validation with increased parallelism
synergyspec-hw validate --all --strict --concurrency 12
```

**Output (text):**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**Output (JSON):**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## Lifecycle Commands

### `synergyspec-hw archive`

Archive a completed change and merge delta specs into main specs.

```
synergyspec-hw archive [change-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `change-name` | No | Change to archive (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--skip-specs` | Skip spec updates (for infrastructure/tooling/doc-only changes) |
| `--no-validate` | Skip validation (requires confirmation) |

**Examples:**

```bash
# Interactive archive
synergyspec-hw archive

# Archive specific change
synergyspec-hw archive add-dark-mode

# Archive without prompts (CI/scripts)
synergyspec-hw archive add-dark-mode --yes

# Archive a tooling change that doesn't affect specs
synergyspec-hw archive update-ci-config --skip-specs
```

**What it does:**

1. Validates the change (unless `--no-validate`)
2. Prompts for confirmation (unless `--yes`)
3. Merges delta specs into `synergyspec/specs/`
4. Moves change folder to `synergyspec/changes/archive/YYYY-MM-DD-<name>/`

---

## Workflow Commands

These commands support the artifact-driven OPSX workflow. They're useful for both humans checking progress and agents determining next steps.

### `synergyspec-hw status`

Display artifact completion status for a change.

```
synergyspec-hw status [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (prompts if omitted) |
| `--schema <name>` | Schema override (auto-detected from change's config) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive status check
synergyspec-hw status

# Status for specific change
synergyspec-hw status --change add-dark-mode

# JSON for agent use
synergyspec-hw status --change add-dark-mode --json
```

**Output (text):**

```
Change: add-dark-mode
Schema: spec-driven

Artifacts:
  ✓ proposal     proposal.md exists
  ✓ specs        specs/ exists
  ◆ design       ready (requires: specs)
  ○ tasks        blocked (requires: design)

Next: Create design using /synspec:continue
```

**Output (JSON):**

```json
{
  "change": "add-dark-mode",
  "schema": "spec-driven",
  "artifacts": [
    {"id": "proposal", "status": "complete", "path": "proposal.md"},
    {"id": "specs", "status": "complete", "path": "specs/"},
    {"id": "design", "status": "ready", "requires": ["specs"]},
    {"id": "tasks", "status": "blocked", "requires": ["design"]}
  ],
  "next": "design"
}
```

---

### `synergyspec-hw instructions`

Get enriched instructions for creating an artifact or applying tasks. Used by AI agents to understand what to create next.

```
synergyspec-hw instructions [artifact] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `artifact` | No | Artifact ID: `proposal`, `specs`, `design`, `tasks`, or `apply` |

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (required in non-interactive mode) |
| `--schema <name>` | Schema override |
| `--json` | Output as JSON |

**Special case:** Use `apply` as the artifact to get task implementation instructions.

**Examples:**

```bash
# Get instructions for next artifact
synergyspec-hw instructions --change add-dark-mode

# Get specific artifact instructions
synergyspec-hw instructions design --change add-dark-mode

# Get apply/implementation instructions
synergyspec-hw instructions apply --change add-dark-mode

# JSON for agent consumption
synergyspec-hw instructions design --change add-dark-mode --json
```

**Output includes:**

- Template content for the artifact
- Project context from config
- Content from dependency artifacts
- Per-artifact rules from config

---

### `synergyspec-hw templates`

Show resolved template paths for all artifacts in a schema.

```
synergyspec-hw templates [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--schema <name>` | Schema to inspect (default: `spec-driven`) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Show template paths for default schema
synergyspec-hw templates

# Show templates for custom schema
synergyspec-hw templates --schema my-workflow

# JSON for programmatic use
synergyspec-hw templates --json
```

**Output (text):**

```
Schema: spec-driven

Templates:
  proposal  → ~/.synergyspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.synergyspec/schemas/spec-driven/templates/specs.md
  design    → ~/.synergyspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.synergyspec/schemas/spec-driven/templates/tasks.md
```

---

### `synergyspec-hw schemas`

List available workflow schemas with their descriptions and artifact flows.

```
synergyspec-hw schemas [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
synergyspec-hw schemas
```

**Output:**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## Schema Commands

Commands for creating and managing custom workflow schemas.

### `synergyspec-hw schema init`

Create a new project-local schema.

```
synergyspec-hw schema init <name> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Schema name (kebab-case) |

**Options:**

| Option | Description |
|--------|-------------|
| `--description <text>` | Schema description |
| `--artifacts <list>` | Comma-separated artifact IDs (default: `proposal,specs,design,tasks`) |
| `--default` | Set as project default schema |
| `--no-default` | Don't prompt to set as default |
| `--force` | Overwrite existing schema |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive schema creation
synergyspec-hw schema init research-first

# Non-interactive with specific artifacts
synergyspec-hw schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**What it creates:**

```
synergyspec/schemas/<name>/
├── schema.yaml           # Schema definition
└── templates/
    ├── proposal.md       # Template for each artifact
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `synergyspec-hw schema fork`

Copy an existing schema to your project for customization.

```
synergyspec-hw schema fork <source> [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `source` | Yes | Schema to copy |
| `name` | No | New schema name (default: `<source>-custom`) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing destination |
| `--json` | Output as JSON |

**Example:**

```bash
# Fork the built-in spec-driven schema
synergyspec-hw schema fork spec-driven my-workflow
```

---

### `synergyspec-hw schema validate`

Validate a schema's structure and templates.

```
synergyspec-hw schema validate [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema to validate (validates all if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--verbose` | Show detailed validation steps |
| `--json` | Output as JSON |

**Example:**

```bash
# Validate a specific schema
synergyspec-hw schema validate my-workflow

# Validate all schemas
synergyspec-hw schema validate
```

---

### `synergyspec-hw schema which`

Show where a schema resolves from (useful for debugging precedence).

```
synergyspec-hw schema which [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema name |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | List all schemas with their sources |
| `--json` | Output as JSON |

**Example:**

```bash
# Check where a schema comes from
synergyspec-hw schema which spec-driven
```

**Output:**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/@khaledea/synergyspec-hw/schemas/spec-driven
```

**Schema precedence:**

1. Project: `synergyspec/schemas/<name>/`
2. User: `~/.local/share/synergyspec/schemas/<name>/`
3. Package: Built-in schemas

---

## Configuration Commands

### `synergyspec-hw config`

View and modify global SynergySpec configuration.

```
synergyspec-hw config <subcommand> [options]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `path` | Show config file location |
| `list` | Show all current settings |
| `get <key>` | Get a specific value |
| `set <key> <value>` | Set a value |
| `unset <key>` | Remove a key |
| `reset` | Reset to defaults |
| `edit` | Open in `$EDITOR` |
| `profile [preset]` | Configure workflow profile interactively or via preset |

**Examples:**

```bash
# Show config file path
synergyspec-hw config path

# List all settings
synergyspec-hw config list

# Get a specific value
synergyspec-hw config get telemetry.enabled

# Set a value
synergyspec-hw config set telemetry.enabled false

# Set a string value explicitly
synergyspec-hw config set user.name "My Name" --string

# Remove a custom setting
synergyspec-hw config unset user.name

# Reset all configuration
synergyspec-hw config reset --all --yes

# Edit config in your editor
synergyspec-hw config edit

# Configure profile with action-based wizard
synergyspec-hw config profile

# Fast preset: switch workflows to core (keeps delivery mode)
synergyspec-hw config profile core
```

`synergyspec-hw config profile` starts with a current-state summary, then lets you choose:
- Change delivery + workflows
- Change delivery only
- Change workflows only
- Keep current settings (exit)

If you keep current settings, no changes are written and no update prompt is shown.
If there are no config changes but the current project files are out of sync with your global profile/delivery, SynergySpec will show a warning and suggest running `synergyspec-hw update`.
Pressing `Ctrl+C` also cancels the flow cleanly (no stack trace) and exits with code `130`.
In the workflow checklist, `[x]` means the workflow is selected in global config. To apply those selections to project files, run `synergyspec-hw update` (or choose `Apply changes to this project now?` when prompted inside a project).

**Interactive examples:**

```bash
# Delivery-only update
synergyspec-hw config profile
# choose: Change delivery only
# choose delivery: Skills only

# Workflows-only update
synergyspec-hw config profile
# choose: Change workflows only
# toggle workflows in the checklist, then confirm
```

---

## Utility Commands

### `synergyspec-hw feedback`

Submit feedback about SynergySpec. Creates a GitHub issue.

```
synergyspec-hw feedback <message> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `message` | Yes | Feedback message |

**Options:**

| Option | Description |
|--------|-------------|
| `--body <text>` | Detailed description |

**Requirements:** GitHub CLI (`gh`) must be installed and authenticated.

**Example:**

```bash
synergyspec-hw feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `synergyspec-hw completion`

Manage shell completions for the SynergySpec CLI.

```
synergyspec-hw completion <subcommand> [shell]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `generate [shell]` | Output completion script to stdout |
| `install [shell]` | Install completion for your shell |
| `uninstall [shell]` | Remove installed completions |

**Supported shells:** `bash`, `zsh`, `fish`, `powershell`

**Examples:**

```bash
# Install completions (auto-detects shell)
synergyspec-hw completion install

# Install for specific shell
synergyspec-hw completion install zsh

# Generate script for manual installation
synergyspec-hw completion generate bash > ~/.bash_completion.d/openspec

# Uninstall
synergyspec-hw completion uninstall
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failure, missing files, etc.) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SYNERGYSPEC_CONCURRENCY` | Default concurrency for bulk validation (default: 6) |
| `EDITOR` or `VISUAL` | Editor for `synergyspec-hw config edit` |
| `NO_COLOR` | Disable color output when set |

---

## Related Documentation

- [Commands](commands.md) - AI slash commands (`/synspec:new`, `/synspec:apply`, etc.)
- [Workflows](workflows.md) - Common patterns and when to use each command
- [Customization](customization.md) - Create custom schemas and templates
- [Getting Started](getting-started.md) - First-time setup guide
