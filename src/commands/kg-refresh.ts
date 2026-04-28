/**
 * `synergyspec-hw kg refresh` — re-parse change artifacts and rebuild the
 * fine-grained KG sub-entities (UseCases, UseCaseSteps, Requirements, Tasks,
 * DesignDecisions) and their relationships from current markdown content.
 *
 * Idempotent: existing sub-entities for the targeted change(s) are deleted
 * first, then recreated from disk. Document-level entities (Change, Spec,
 * DesignDoc, etc.) and their `hasArtifact` edges are preserved.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { getKGClient, persistKGState, isKGEnabled } from '../utils/kg-utils.js';
import {
  parseUseCases,
  parseUseCaseSteps,
  parseRequirements,
  parseTasks,
} from '../core/kg/content-parser.js';
import * as types from '../core/kg/types.js';

export interface KGRefreshOptions {
  change?: string;
  verbose?: boolean;
  /** Suppress console output. Useful when called programmatically. */
  silent?: boolean;
  /** Override cwd. Defaults to process.cwd(). */
  projectRoot?: string;
}

export interface KGRefreshResult {
  changes: RefreshSummary[];
}

// Sub-entity types we own — these get cleared and rebuilt on every refresh.
const SUB_ENTITY_TYPES = new Set([
  'UseCase',
  'UseCaseStep',
  'Requirement',
  'Task',
  'DesignDecision',
  'Scenario',
]);

// Document-level entity types refresh validates against the filesystem.
// If their filePath no longer points at a real file/dir, they get deleted
// (which also cascades their sub-entities). Missing entities get created
// when the corresponding file exists on disk.
const DOC_ENTITY_TYPES = new Set([
  'Artifact',
  'Spec',
  'DesignDoc',
  'TestCase',
  'CodeFile',
]);

// Maps the artifacts a spec-driven change can have to the entity type/id
// they should be registered as. The id is suffixed onto `${changeId}-`.
interface ArtifactSlot {
  suffix: string;       // e.g. 'proposal' → entity id 'auth-proposal'
  relPath: string;      // path relative to the change dir
  isDir?: boolean;      // true for slots where the "file" is a directory (specs/)
  type: string;         // KG entity type
  name: string;         // human label
}

const ARTIFACT_SLOTS: ArtifactSlot[] = [
  { suffix: 'proposal',  relPath: 'proposal.md',   type: 'DesignDoc', name: 'Proposal' },
  { suffix: 'usecases',  relPath: 'usecases.md',   type: 'Artifact',  name: 'Use Cases' },
  { suffix: 'specs',     relPath: 'specs',         isDir: true, type: 'Spec',      name: 'Specifications' },
  { suffix: 'design',    relPath: 'design.md',     type: 'DesignDoc', name: 'Design' },
  { suffix: 'tasks',     relPath: 'tasks.md',      type: 'Artifact',  name: 'Tasks' },
];

interface RefreshSummary {
  changeId: string;
  removed: number;
  prunedDocEntities: number;
  created: { docs: number; useCases: number; steps: number; requirements: number; tasks: number };
  edges: number;
  warnings: string[];
}

export async function kgRefreshCommand(options: KGRefreshOptions = {}): Promise<KGRefreshResult> {
  const projectRoot = options.projectRoot ?? process.cwd();
  const silent = !!options.silent;
  const log = (msg: string) => { if (!silent) console.log(msg); };
  const warn = (msg: string) => { if (!silent) console.warn(msg); };

  if (!isKGEnabled(projectRoot)) {
    if (silent) return { changes: [] }; // hook-friendly: exit clean on non-KG projects
    throw new Error(
      'KG is not initialized for this project. Run `synergyspec-hw new change <name>` first.'
    );
  }

  const changesRoot = path.join(projectRoot, 'synergyspec', 'changes');
  if (!existsSync(changesRoot)) {
    if (silent) return { changes: [] };
    throw new Error(`No changes directory at ${path.relative(projectRoot, changesRoot)}.`);
  }

  const changeIds = options.change
    ? [options.change]
    : readdirSync(changesRoot).filter(name => {
        if (name.startsWith('.') || name === 'archive') return false;
        return statSync(path.join(changesRoot, name)).isDirectory();
      });

  if (changeIds.length === 0) {
    log('No changes to refresh.');
    return { changes: [] };
  }

  const client = await getKGClient(projectRoot);
  if (!client) {
    throw new Error('Could not obtain KG client.');
  }

  const summaries: RefreshSummary[] = [];
  for (const changeId of changeIds) {
    const changeDir = path.join(changesRoot, changeId);
    if (!existsSync(changeDir)) {
      warn(`Change '${changeId}' not found at ${path.relative(projectRoot, changeDir)}; skipping.`);
      continue;
    }
    summaries.push(await refreshChange(client, projectRoot, changeId, changeDir, !!options.verbose));
  }

  await persistKGState(projectRoot);

  if (!silent) {
    console.log();
    console.log(`KG refresh complete (${summaries.length} change${summaries.length === 1 ? '' : 's'}):`);
    for (const s of summaries) {
      const parts = [
        `${s.created.docs} doc${s.created.docs === 1 ? '' : 's'}`,
        `${s.created.useCases} use case${s.created.useCases === 1 ? '' : 's'}`,
        `${s.created.steps} step${s.created.steps === 1 ? '' : 's'}`,
        `${s.created.requirements} requirement${s.created.requirements === 1 ? '' : 's'}`,
        `${s.created.tasks} task${s.created.tasks === 1 ? '' : 's'}`,
        `${s.edges} relationship${s.edges === 1 ? '' : 's'}`,
      ];
      const removed = s.removed + s.prunedDocEntities;
      console.log(`  ${s.changeId}: removed ${removed} stale (${s.prunedDocEntities} doc entities for missing files), created ${parts.join(', ')}`);
      for (const w of s.warnings) console.log(`    ⚠ ${w}`);
    }
  }

  return { changes: summaries };
}

async function refreshChange(
  client: any,
  projectRoot: string,
  changeId: string,
  changeDir: string,
  verbose: boolean,
): Promise<RefreshSummary> {
  const summary: RefreshSummary = {
    changeId,
    removed: 0,
    prunedDocEntities: 0,
    created: { docs: 0, useCases: 0, steps: 0, requirements: 0, tasks: 0 },
    edges: 0,
    warnings: [],
  };

  // 1. Clear existing sub-entities for this change.
  const existing = await client.find({ properties: { changeId } });
  for (const e of existing) {
    if (e.type && SUB_ENTITY_TYPES.has(e.type)) {
      const ok = await client.delete(e.id);
      if (ok) summary.removed++;
    }
  }

  // 1a. Reconcile document-level entities against the filesystem.
  // Any DOC_ENTITY_TYPES entity in this change with a missing filePath gets
  // deleted (cascades to its sub-entities through client.delete).
  for (const e of existing) {
    if (!e.type || !DOC_ENTITY_TYPES.has(e.type)) continue;
    const fp = (e as any).filePath;
    if (!fp) continue;
    const abs = path.isAbsolute(fp) ? fp : path.join(projectRoot, fp);
    if (!existsSync(abs)) {
      const ok = await client.delete(e.id);
      if (ok) summary.prunedDocEntities++;
    }
  }

  // 1b. Ensure document-level entities exist for every artifact file currently
  // present on disk. This makes refresh authoritative — running it after a new
  // file gets written registers it in the KG without any other action.
  const timestamp = new Date();
  for (const slot of ARTIFACT_SLOTS) {
    const relPath = path.join('synergyspec', 'changes', changeId, slot.relPath);
    const abs = path.join(projectRoot, relPath);
    if (!existsSync(abs)) continue;
    const entityId = `${changeId}-${slot.suffix}`;
    const docEntity: any = {
      id: entityId,
      type: slot.type,
      name: slot.name,
      status: 'active',
      filePath: relPath,
      changeId,
      createdAt: timestamp,
    };
    if (slot.type === 'Spec') {
      docEntity.capability = 'change-specs';
      docEntity.specType = 'new';
    }
    if (slot.type === 'DesignDoc') {
      docEntity.decisionsCount = 0;
      docEntity.hasMigrationPlan = false;
    }
    // create acts as upsert in InMemoryKGClient (Map.set), so this is safe
    // when the entity already exists.
    const before = await client.read(entityId);
    await client.create(docEntity);
    if (!before) summary.created.docs++;
    // Ensure hasArtifact edge exists (createRelationship is idempotent).
    await client.createRelationship(changeId, 'hasArtifact', entityId, { role: slot.suffix });
  }

  // 2. Build new sub-entities from disk.
  const usecasesPath = path.join(changeDir, 'usecases.md');
  const tasksPath = path.join(changeDir, 'tasks.md');
  const specsDir = path.join(changeDir, 'specs');

  const newEntities: any[] = [];
  const newEdges: Array<{ source: string; type: string; target: string; props?: any }> = [];

  // Use cases + steps
  if (existsSync(usecasesPath)) {
    const content = readFileSync(usecasesPath, 'utf-8');
    const ucArtifactId = `${changeId}-usecases`;
    const ucs = parseUseCases(content);
    const steps = parseUseCaseSteps(content);

    if (ucs.length === 0 && verbose) {
      summary.warnings.push(`usecases.md found but no use cases parsed (template still has placeholders?)`);
    }

    for (const uc of ucs) {
      const id = `${changeId}-${uc.id}`;
      newEntities.push({
        id,
        type: 'UseCase',
        name: uc.title,
        primaryActor: uc.actor || 'Unknown',
        goal: uc.goal || '',
        level: uc.level || 'user',
        changeId,
      } as types.UseCase);
      newEdges.push({ source: ucArtifactId, type: 'definesUseCase', target: id, props: { createdAt: timestamp } });
      summary.created.useCases++;
    }

    for (const s of steps) {
      const id = `${changeId}-${s.id}`;
      const parentUcId = `${changeId}-${s.useCaseId.toLowerCase()}`;
      newEntities.push({
        id,
        type: 'UseCaseStep',
        name: s.id,
        stepNumber: s.number,
        stepType: s.type,
        action: s.description,
        changeId,
      } as types.UseCaseStep);
      newEdges.push({ source: parentUcId, type: 'hasStep', target: id, props: { createdAt: timestamp } });
      summary.created.steps++;
    }
  }

  // Requirements (from specs/*.md). Each spec file contributes its own requirements.
  if (existsSync(specsDir) && statSync(specsDir).isDirectory()) {
    const specFiles = walkMarkdown(specsDir);
    for (const specFile of specFiles) {
      const content = readFileSync(specFile, 'utf-8');
      const reqs = parseRequirements(content);
      const specRelPath = path.relative(projectRoot, specFile);
      const specArtifactId = `${changeId}-specs`;

      for (const req of reqs) {
        const id = `${changeId}-${req.id}`;
        newEntities.push({
          id,
          type: 'Requirement',
          name: req.name,
          requirementType: req.requirementType,
          shallStatement: req.shallStatement,
          priority: req.priority,
          isTestable: true,
          changeId,
          metadata: { specFile: specRelPath },
        } as types.Requirement);
        newEdges.push({ source: specArtifactId, type: 'hasRequirement', target: id, props: { createdAt: timestamp } });

        // Implements relationships → use case steps (if mentioned in `**Implements**:`).
        if (req.implements && req.implements.length > 0) {
          for (const stepRef of req.implements) {
            const targetStepId = `${changeId}-${stepRef}`;
            newEdges.push({ source: id, type: 'implements', target: targetStepId, props: { reference: stepRef, createdAt: timestamp } });
          }
        }
        summary.created.requirements++;
      }
    }
  }

  // Tasks
  if (existsSync(tasksPath)) {
    const content = readFileSync(tasksPath, 'utf-8');
    const tasksArtifactId = `${changeId}-tasks`;
    const tasks = parseTasks(content);

    for (const t of tasks) {
      const id = `${changeId}-task${t.taskNumber.replace('.', '_')}`;
      newEntities.push({
        id,
        type: 'Task',
        name: t.description,
        taskNumber: t.taskNumber,
        status: t.status === 'completed' ? 'completed' : 'pending',
        priority: t.priority,
        changeId,
      } as types.Task);
      newEdges.push({ source: tasksArtifactId, type: 'hasTask', target: id, props: { createdAt: timestamp } });

      // Tasks address use case steps via `(Addresses: UC1-S1, UC1-S2)`.
      if (t.addresses && t.addresses.length > 0) {
        for (const stepRef of t.addresses) {
          const targetStepId = `${changeId}-${stepRef}`;
          newEdges.push({ source: id, type: 'addresses', target: targetStepId, props: { reference: stepRef, createdAt: timestamp } });
        }
      }
      summary.created.tasks++;
    }
  }

  // 3. Persist new entities and edges.
  if (newEntities.length > 0) {
    await client.createMany(newEntities);
  }
  for (const edge of newEdges) {
    // Only create edges if both endpoints exist — skip dangling refs but warn.
    const targetExists = await client.read(edge.target);
    if (!targetExists) {
      summary.warnings.push(`dangling edge: ${edge.source} -[${edge.type}]→ ${edge.target} (target not found)`);
      continue;
    }
    await client.createRelationship(edge.source, edge.type, edge.target, edge.props);
    summary.edges++;
  }

  return summary;
}

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkMarkdown(full));
    } else if (name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}
