import { Command } from 'commander';
import { createRequire } from 'module';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import { AI_TOOLS } from '../core/config.js';
import { UpdateCommand } from '../core/update.js';
import { ListCommand } from '../core/list.js';
import { ArchiveCommand } from '../core/archive.js';
import { ViewCommand } from '../core/view.js';
import { registerSpecCommand } from '../commands/spec.js';
import { ChangeCommand } from '../commands/change.js';
import { ValidateCommand } from '../commands/validate.js';
import { ShowCommand } from '../commands/show.js';
import { CompletionCommand } from '../commands/completion.js';
import { FeedbackCommand } from '../commands/feedback.js';
import { kgViewCommand } from '../commands/kg-view.js';
import { kgRefreshCommand } from '../commands/kg-refresh.js';
import { kgWatchCommand } from '../commands/kg-watch.js';
import { kgInstallHooksCommand } from '../commands/kg-install-hooks.js';
import { registerConfigCommand } from '../commands/config.js';
import { registerSchemaCommand } from '../commands/schema.js';
import {
  statusCommand,
  instructionsCommand,
  applyInstructionsCommand,
  templatesCommand,
  schemasCommand,
  newChangeCommand,
  DEFAULT_SCHEMA,
  type StatusOptions,
  type InstructionsOptions,
  type TemplatesOptions,
  type SchemasOptions,
  type NewChangeOptions,
} from '../commands/workflow/index.js';
import { maybeShowTelemetryNotice, trackCommand, shutdown } from '../telemetry/index.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

/**
 * Get the full command path for nested commands.
 * For example: 'change show' -> 'change:show'
 */
function getCommandPath(command: Command): string {
  const names: string[] = [];
  let current: Command | null = command;

  while (current) {
    const name = current.name();
    // Skip the root 'synergyspec-hw' command
    if (name && name !== 'synergyspec-hw') {
      names.unshift(name);
    }
    current = current.parent;
  }

  return names.join(':') || 'synergyspec-hw';
}

program
  .name('synergyspec-hw')
  .description('AI-native system for spec-driven development')
  .version(version);

// Global options
program.option('--no-color', 'Disable color output');

// Apply global flags and telemetry before any command runs
// Note: preAction receives (thisCommand, actionCommand) where:
// - thisCommand: the command where hook was added (root program)
// - actionCommand: the command actually being executed (subcommand)
program.hook('preAction', async (thisCommand, actionCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    process.env.NO_COLOR = '1';
  }

  // Show first-run telemetry notice (if not seen)
  await maybeShowTelemetryNotice();

  // Track command execution (use actionCommand to get the actual subcommand)
  const commandPath = getCommandPath(actionCommand);
  await trackCommand(commandPath, version);
});

// Shutdown telemetry after command completes
program.hook('postAction', async () => {
  await shutdown();
});

const availableToolIds = AI_TOOLS.filter((tool) => tool.skillsDir).map((tool) => tool.value);
const toolsOptionDescription = `Configure AI tools non-interactively. Use "all", "none", or a comma-separated list of: ${availableToolIds.join(', ')}`;

program
  .command('init [path]')
  .description('Initialize SynergySpec in your project')
  .option('--tools <tools>', toolsOptionDescription)
  .option('--force', 'Auto-cleanup legacy files without prompting')
  .option('--profile <profile>', 'Override global config profile (core or custom)')
  .action(async (targetPath = '.', options?: { tools?: string; force?: boolean; profile?: string }) => {
    try {
      // Validate that the path is a valid directory
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(`Path "${targetPath}" is not a directory`);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, but we can create it
          console.log(`Directory "${targetPath}" doesn't exist, it will be created.`);
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(`Cannot access path "${targetPath}": ${error.message}`);
        }
      }

      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tools,
        force: options?.force,
        profile: options?.profile,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Hidden alias: 'experimental' -> 'init' for backwards compatibility
program
  .command('experimental', { hidden: true })
  .description('Alias for init (deprecated)')
  .option('--tool <tool-id>', 'Target AI tool (maps to --tools)')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (options?: { tool?: string; noInteractive?: boolean }) => {
    try {
      console.log('Note: "synergyspec-hw experimental" is deprecated. Use "synergyspec-hw init" instead.');
      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tool,
        interactive: options?.noInteractive === true ? false : undefined,
      });
      await initCommand.execute('.');
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('update [path]')
  .description('Update SynergySpec instruction files')
  .option('--force', 'Force update even when tools are up to date')
  .action(async (targetPath = '.', options?: { force?: boolean }) => {
    try {
      const resolvedPath = path.resolve(targetPath);
      const updateCommand = new UpdateCommand({ force: options?.force });
      await updateCommand.execute(resolvedPath);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List items (changes by default). Use --specs to list specs.')
  .option('--specs', 'List specs instead of changes')
  .option('--changes', 'List changes explicitly (default)')
  .option('--sort <order>', 'Sort order: "recent" (default) or "name"', 'recent')
  .option('--json', 'Output as JSON (for programmatic use)')
  .action(async (options?: { specs?: boolean; changes?: boolean; sort?: string; json?: boolean }) => {
    try {
      const listCommand = new ListCommand();
      const mode: 'changes' | 'specs' = options?.specs ? 'specs' : 'changes';
      const sort = options?.sort === 'name' ? 'name' : 'recent';
      await listCommand.execute('.', mode, { sort, json: options?.json });
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('view')
  .description('Display an interactive dashboard of specs and changes')
  .action(async () => {
    try {
      const viewCommand = new ViewCommand();
      await viewCommand.execute('.');
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Change command with subcommands
const changeCmd = program
  .command('change')
  .description('Manage SynergySpec change proposals');

// Deprecation notice for noun-based commands
changeCmd.hook('preAction', () => {
  console.error('Warning: The synergyspec-hw change ... commands are deprecated. Prefer verb-first commands (e.g., "synergyspec-hw list", "synergyspec-hw validate --changes").');
});

changeCmd
  .command('show [change-name]')
  .description('Show a change proposal in JSON or markdown format')
  .option('--json', 'Output as JSON')
  .option('--deltas-only', 'Show only deltas (JSON only)')
  .option('--requirements-only', 'Alias for --deltas-only (deprecated)')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (changeName?: string, options?: { json?: boolean; requirementsOnly?: boolean; deltasOnly?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.show(changeName, options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('list')
  .description('List all active changes (DEPRECATED: use "synergyspec-hw list" instead)')
  .option('--json', 'Output as JSON')
  .option('--long', 'Show id and title with counts')
  .action(async (options?: { json?: boolean; long?: boolean }) => {
    try {
      console.error('Warning: "synergyspec-hw change list" is deprecated. Use "synergyspec-hw list".');
      const changeCommand = new ChangeCommand();
      await changeCommand.list(options);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

changeCmd
  .command('validate [change-name]')
  .description('Validate a change proposal')
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation report as JSON')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (changeName?: string, options?: { strict?: boolean; json?: boolean; noInteractive?: boolean }) => {
    try {
      const changeCommand = new ChangeCommand();
      await changeCommand.validate(changeName, options);
      if (typeof process.exitCode === 'number' && process.exitCode !== 0) {
        process.exit(process.exitCode);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command('archive [change-name]')
  .description('Archive a completed change and update main specs')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--skip-specs', 'Skip spec update operations (useful for infrastructure, tooling, or doc-only changes)')
  .option('--no-validate', 'Skip validation (not recommended, requires confirmation)')
  .action(async (changeName?: string, options?: { yes?: boolean; skipSpecs?: boolean; noValidate?: boolean; validate?: boolean }) => {
    try {
      const archiveCommand = new ArchiveCommand();
      await archiveCommand.execute(changeName, options);
    } catch (error) {
      console.log(); // Empty line for spacing
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

registerSpecCommand(program);
registerConfigCommand(program);
registerSchemaCommand(program);

// Top-level validate command
program
  .command('validate [item-name]')
  .description('Validate changes and specs')
  .option('--all', 'Validate all changes and specs')
  .option('--changes', 'Validate all changes')
  .option('--specs', 'Validate all specs')
  .option('--type <type>', 'Specify item type when ambiguous: change|spec')
  .option('--strict', 'Enable strict validation mode')
  .option('--json', 'Output validation results as JSON')
  .option('--concurrency <n>', 'Max concurrent validations (defaults to env SYNERGYSPEC_CONCURRENCY or 6)')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (itemName?: string, options?: { all?: boolean; changes?: boolean; specs?: boolean; type?: string; strict?: boolean; json?: boolean; noInteractive?: boolean; concurrency?: string }) => {
    try {
      const validateCommand = new ValidateCommand();
      await validateCommand.execute(itemName, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Top-level show command
program
  .command('show [item-name]')
  .description('Show a change or spec')
  .option('--json', 'Output as JSON')
  .option('--type <type>', 'Specify item type when ambiguous: change|spec')
  .option('--no-interactive', 'Disable interactive prompts')
  // change-only flags
  .option('--deltas-only', 'Show only deltas (JSON only, change)')
  .option('--requirements-only', 'Alias for --deltas-only (deprecated, change)')
  // spec-only flags
  .option('--requirements', 'JSON only: Show only requirements (exclude scenarios)')
  .option('--no-scenarios', 'JSON only: Exclude scenario content')
  .option('-r, --requirement <id>', 'JSON only: Show specific requirement by ID (1-based)')
  // allow unknown options to pass-through to underlying command implementation
  .allowUnknownOption(true)
  .action(async (itemName?: string, options?: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any }) => {
    try {
      const showCommand = new ShowCommand();
      await showCommand.execute(itemName, options ?? {});
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Feedback command
program
  .command('feedback <message>')
  .description('Submit feedback about SynergySpec')
  .option('--body <text>', 'Detailed description for the feedback')
  .action(async (message: string, options?: { body?: string }) => {
    try {
      const feedbackCommand = new FeedbackCommand();
      await feedbackCommand.execute(message, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Completion command with subcommands
const completionCmd = program
  .command('completion')
  .description('Manage shell completions for SynergySpec CLI');

completionCmd
  .command('generate [shell]')
  .description('Generate completion script for a shell (outputs to stdout)')
  .action(async (shell?: string) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.generate({ shell });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

completionCmd
  .command('install [shell]')
  .description('Install completion script for a shell')
  .option('--verbose', 'Show detailed installation output')
  .action(async (shell?: string, options?: { verbose?: boolean }) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.install({ shell, verbose: options?.verbose });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

completionCmd
  .command('uninstall [shell]')
  .description('Uninstall completion script for a shell')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (shell?: string, options?: { yes?: boolean }) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.uninstall({ shell, yes: options?.yes });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Hidden command for machine-readable completion data
program
  .command('__complete <type>', { hidden: true })
  .description('Output completion data in machine-readable format (internal use)')
  .action(async (type: string) => {
    try {
      const completionCommand = new CompletionCommand();
      await completionCommand.complete({ type });
    } catch (error) {
      // Silently fail for graceful shell completion experience
      process.exitCode = 1;
    }
  });

// ═══════════════════════════════════════════════════════════
// Workflow Commands (formerly experimental)
// ═══════════════════════════════════════════════════════════

// Status command
program
  .command('status')
  .description('Display artifact completion status for a change')
  .option('--change <id>', 'Change name to show status for')
  .option('--schema <name>', 'Schema override (auto-detected from config.yaml)')
  .option('--json', 'Output as JSON')
  .action(async (options: StatusOptions) => {
    try {
      await statusCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Instructions command
program
  .command('instructions [artifact]')
  .description('Output enriched instructions for creating an artifact or applying tasks')
  .option('--change <id>', 'Change name')
  .option('--schema <name>', 'Schema override (auto-detected from config.yaml)')
  .option('--json', 'Output as JSON')
  .action(async (artifactId: string | undefined, options: InstructionsOptions) => {
    try {
      // Special case: "apply" is not an artifact, but a command to get apply instructions
      if (artifactId === 'apply') {
        await applyInstructionsCommand(options);
      } else {
        await instructionsCommand(artifactId, options);
      }
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('Show resolved template paths for all artifacts in a schema')
  .option('--schema <name>', `Schema to use (default: ${DEFAULT_SCHEMA})`)
  .option('--json', 'Output as JSON mapping artifact IDs to template paths')
  .action(async (options: TemplatesOptions) => {
    try {
      await templatesCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Schemas command
program
  .command('schemas')
  .description('List available workflow schemas with descriptions')
  .option('--json', 'Output as JSON (for agent use)')
  .action(async (options: SchemasOptions) => {
    try {
      await schemasCommand(options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// New command group with change subcommand
const newCmd = program.command('new').description('Create new items');

newCmd
  .command('change <name>')
  .description('Create a new change directory')
  .option('--description <text>', 'Description to add to README.md')
  .option('--schema <name>', `Workflow schema to use (default: ${DEFAULT_SCHEMA})`)
  .action(async (name: string, options: NewChangeOptions) => {
    try {
      await newChangeCommand(name, options);
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

const kgCmd = program.command('kg').description('Knowledge Graph utilities');

kgCmd
  .command('view')
  .description('Open an interactive visualization of the local KG in the browser')
  .option('--port <number>', 'Port to bind the local viewer server (default: random free port)')
  .option('--no-open', 'Do not auto-open the browser; just print the URL')
  .action(async (options: { port?: string; open?: boolean }) => {
    try {
      await kgViewCommand({ port: options.port, noOpen: options.open === false });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

kgCmd
  .command('refresh')
  .description('Re-parse change artifacts and rebuild fine-grained KG entities (use cases, steps, requirements, tasks, edges)')
  .option('--change <name>', 'Only refresh this specific change (default: all changes)')
  .option('-v, --verbose', 'Print warnings for empty/placeholder artifacts')
  .option('--silent', 'Suppress all output and exit 0 on non-KG projects (intended for hooks)')
  .action(async (options: { change?: string; verbose?: boolean; silent?: boolean }) => {
    try {
      await kgRefreshCommand({ change: options.change, verbose: options.verbose, silent: options.silent });
    } catch (error) {
      if (options.silent) { process.exit(0); return; }
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

kgCmd
  .command('install-hooks')
  .description('Install Claude Code hooks (.claude/settings.local.json) so the KG auto-refreshes after every AI Write/Edit and at end-of-turn')
  .action(async () => {
    try {
      await kgInstallHooksCommand();
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

kgCmd
  .command('watch')
  .description('Watch synergyspec/changes/ and auto-refresh the KG on every markdown edit')
  .option('--debounce <ms>', 'Debounce window in milliseconds (default: 500)')
  .action(async (options: { debounce?: string }) => {
    try {
      const debounceMs = options.debounce ? parseInt(options.debounce, 10) : undefined;
      await kgWatchCommand({ debounceMs });
    } catch (error) {
      console.log();
      ora().fail(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
