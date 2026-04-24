/**
 * New Change Command - Refactored with KG Tool Interface
 *
 * Creates a new change directory and initializes KG using tool calls
 * for deterministic behavior
 */

import ora from 'ora';
import path from 'path';
import { createChange, validateChangeName } from '../../utils/change-utils.js';
import { validateSchemaExists } from './shared.js';
import { createKGToolInterface } from '../../core/kg/tool-interface.js';
import { types } from '../../core/kg/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewChangeOptions {
  description?: string;
  schema?: string;
}

// ---------------------------------------------------------------------------
// Command Implementation with Tool Calls
// ---------------------------------------------------------------------------

export async function newChangeCommand(name: string | undefined, options: NewChangeOptions): Promise<void> {
  if (!name) {
    throw new Error('Missing required argument <name>');
  }

  const validation = validateChangeName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const projectRoot = process.cwd();

  // Validate schema if provided
  if (options.schema) {
    validateSchemaExists(options.schema, projectRoot);
  }

  const schemaDisplay = options.schema ? ` with schema '${options.schema}'` : '';
  const spinner = ora(`Creating change '${name}'${schemaDisplay}...`).start();

  try {
    // Step 1: Create the change directory structure
    const result = await createChange(projectRoot, name, { schema: options.schema });

    // Step 2: Initialize Knowledge Graph using tool interface
    spinner.text = `Setting up knowledge graph...`;
    const kgInterface = createKGToolInterface(projectRoot);

    // Initialize KG
    const kgInit = await kgInterface.execute('kg:init', {
      type: 'file',
      schema: result.schema,
      forceRecreate: false
    });

    if (!kgInit.success) {
      throw new Error(`Failed to initialize knowledge graph: ${kgInit.message}`);
    }

    // Step 3: Create change with artifacts using tool interface
    const changeData = {
      id: name,
      name: name,
      schema: result.schema,
      description: options.description
    };

    const kgResult = await kgInterface.createChange(changeData);

    if (!kgResult.success) {
      throw new Error(`Failed to create KG entities: ${kgResult.error}`);
    }

    // Step 4: Create README.md if description provided
    if (options.description) {
      const { promises: fs } = await import('fs');
      const changeDir = path.join(projectRoot, 'synergyspec', 'changes', name);
      const readmePath = path.join(changeDir, 'README.md');

      // Get KG summary for README
      const kgSummary = await kgInterface.execute('kg:get-summary', {});
      const kgInfo = kgSummary.success && kgSummary.summary?.enabled
        ? `\n\n## Knowledge Graph\n\nThis change is tracked in the SynergySpec Knowledge Graph.\n\nEntities created: ${kgResult.entities.length}\nRelationships created: ${kgResult.relationships.length}\n`
        : '';

      await fs.writeFile(
        readmePath,
        `# ${name}\n\n${options.description}${kgInfo}`,
        'utf-8'
      );
    }

    spinner.succeed(`Created change '${name}' at synergyspec/changes/${name}/ (schema: ${result.schema})`);

    // Log KG info
    console.log(`\n📊 Knowledge Graph initialized with:`);
    console.log(`   - ${kgResult.entities.length} entities`);
    console.log(`   - ${kgResult.relationships.length} relationships`);
    console.log(`   - KG stored at: ${kgInit.kgPath || '.synergyspec/kg'}`);

    // Step 5: Show next steps with KG integration
    console.log(`\n✨ Ready to continue with KG integration:`);
    console.log(`   - Run /synspec:continue to create artifacts`);
    console.log(`   - KG will track all changes and traceability`);

  } catch (error) {
    spinner.fail(`Failed to create change '${name}'`);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Alternative Implementation: Step-by-step with individual tool calls
// ---------------------------------------------------------------------------

export async function newChangeCommandWithTools(
  name: string | undefined,
  options: NewChangeOptions
): Promise<void> {
  if (!name) {
    throw new Error('Missing required argument <name>');
  }

  const validation = validateChangeName(name);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const projectRoot = process.cwd();

  if (options.schema) {
    validateSchemaExists(options.schema, projectRoot);
  }

  const spinner = ora(`Creating change '${name}'...`).start();
  const kgInterface = createKGToolInterface(projectRoot);

  try {
    // 1. Create directory structure
    const result = await createChange(projectRoot, name, { schema: options.schema });
    spinner.text = 'Setting up knowledge graph...';

    // 2. Initialize KG
    await kgInterface.execute('kg:init', {
      type: 'file',
      schema: result.schema
    });

    // 3. Create change entity
    const changeEntity: types.Change = {
      id: name,
      type: 'Change',
      name: name,
      schema: result.schema,
      status: 'proposed',
      createdDate: new Date(),
      description: options.description
    };

    await kgInterface.execute('kg:create-entity', {
      entity: changeEntity
    });

    // 4. Create artifacts based on schema
    const artifacts = await createArtifactsForSchema(name, result.schema);
    if (artifacts.length > 0) {
      await kgInterface.execute('kg:create-entities', {
        entities: artifacts
      });

      // 5. Create relationships
      for (const artifact of artifacts) {
        await kgInterface.execute('kg:create-relationship', {
          sourceId: name,
          relationshipType: 'hasArtifact',
          targetId: artifact.id,
          properties: { role: artifact.type.toLowerCase() }
        });
      }
    }

    // 6. Persist changes
    await kgInterface.execute('kg:persist', {});

    // 7. Update README if needed
    if (options.description) {
      const { promises: fs } = await import('fs');
      const changeDir = path.join(projectRoot, 'synergyspec', 'changes', name);
      const readmePath = path.join(changeDir, 'README.md');
      await fs.writeFile(readmePath, `# ${name}\n\n${options.description}`, 'utf-8');
    }

    spinner.succeed(`Created change '${name}' successfully`);

  } catch (error) {
    spinner.fail(`Failed to create change '${name}'`);
    throw error;
  }
}

/**
 * Create artifacts for a specific schema
 */
async function createArtifactsForSchema(
  changeId: string,
  schema: string
): Promise<any[]> {
  const timestamp = new Date();
  const artifacts: any[] = [];

  // Base artifacts for all schemas
  artifacts.push(
    {
      id: `${changeId}-proposal`,
      type: 'DesignDoc',
      name: 'Proposal',
      status: 'active' as const,
      filePath: `synergyspec/changes/${changeId}/proposal.md`,
      changeId,
      createdAt: timestamp,
      decisionsCount: 0,
      hasMigrationPlan: false
    },
    {
      id: `${changeId}-tasks`,
      type: 'Artifact',
      name: 'Tasks',
      status: 'active' as const,
      filePath: `synergyspec/changes/${changeId}/tasks.md`,
      changeId,
      createdAt: timestamp
    }
  );

  // Schema-specific artifacts
  switch (schema) {
    case 'spec-driven':
      artifacts.push(
        {
          id: `${changeId}-usecases`,
          type: 'Artifact',
          name: 'Use Cases',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/usecases.md`,
          changeId,
          createdAt: timestamp
        },
        {
          id: `${changeId}-specs`,
          type: 'Spec',
          name: 'Specifications',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/specs/`,
          changeId,
          createdAt: timestamp,
          capability: 'change-specs',
          specType: 'new',
          requirementsCount: 0
        },
        {
          id: `${changeId}-design`,
          type: 'DesignDoc',
          name: 'Design',
          status: 'active' as const,
          filePath: `synergyspec/changes/${changeId}/design.md`,
          changeId,
          createdAt: timestamp,
          decisionsCount: 0,
          hasMigrationPlan: false
        }
      );
      break;
  }

  return artifacts;
}