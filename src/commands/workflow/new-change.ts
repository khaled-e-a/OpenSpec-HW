/**
 * New Change Command
 *
 * Creates a new change directory with optional description and schema.
 * Also initializes the knowledge graph for traceability.
 */

import ora from 'ora';
import path from 'path';
import { createChange, validateChangeName } from '../../utils/change-utils.js';
import { validateSchemaExists } from './shared.js';
import { createKGToolInterface, types } from '../../core/kg/index.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface NewChangeOptions {
  description?: string;
  schema?: string;
}

/**
 * Create KG artifact entities for a change based on schema
 */
async function createChangeArtifacts(
  changeId: string,
  schema: string
): Promise<any[]> {
  const timestamp = new Date();
  const artifacts: any[] = [];

  // Base artifacts for all schemas
  const baseArtifacts: any[] = [
    {
      id: `${changeId}-proposal`,
      type: 'DesignDoc',
      name: 'Proposal',
      status: 'active',
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
      status: 'active',
      filePath: `synergyspec/changes/${changeId}/tasks.md`,
      changeId,
      createdAt: timestamp
    }
  ];

  artifacts.push(...baseArtifacts);

  // Schema-specific artifacts
  switch (schema) {
    case 'spec-driven':
      artifacts.push(
        {
          id: `${changeId}-usecases`,
          type: 'Artifact',
          name: 'Use Cases',
          status: 'active',
          filePath: `synergyspec/changes/${changeId}/usecases.md`,
          changeId,
          createdAt: timestamp
        },
        {
          id: `${changeId}-specs`,
          type: 'Spec',
          name: 'Specifications',
          status: 'active',
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
          status: 'active',
          filePath: `synergyspec/changes/${changeId}/design.md`,
          changeId,
          createdAt: timestamp,
          decisionsCount: 0,
          hasMigrationPlan: false
        }
      );
      break;

    // Add other schema cases as needed
  }

  return artifacts;
}

// -----------------------------------------------------------------------------
// Command Implementation
// -----------------------------------------------------------------------------

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

    // Step 5: If description provided, create README.md with description
    if (options.description) {
      const { promises: fs } = await import('fs');
      const changeDir = path.join(projectRoot, 'synergyspec', 'changes', name);
      const readmePath = path.join(changeDir, 'README.md');
      const kgInfo = `\n\n## Knowledge Graph\n\nThis change is tracked in the SynergySpec Knowledge Graph with ID: \`${name}\`\n\nKG Entities created: ${kgResult.entities.length}\nKG Relationships created: ${kgResult.relationships.length}\n`;
      await fs.writeFile(readmePath, `# ${name}\n\n${options.description}${kgInfo}`, 'utf-8');
    }

    spinner.succeed(`Created change '${name}' at synergyspec/changes/${name}/ (schema: ${result.schema})`);

    // Log KG info
    console.log(`\n📊 Knowledge Graph initialized with:`);
    console.log(`   - ${kgResult.entities.length} entities`);
    console.log(`   - ${kgResult.relationships.length} relationships`);
    console.log(`   - KG stored at: ${kgInit.kgPath || '.synergyspec/kg'}`);

  } catch (error) {
    spinner.fail(`Failed to create change '${name}'`);
    throw error;
  }
}
