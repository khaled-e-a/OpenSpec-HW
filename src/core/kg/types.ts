/**
 * SynergySpec Knowledge Graph Types
 *
 * TypeScript definitions for the KG ontology schema.
 * This provides type safety when working with the knowledge graph.
 */

// Base abstract types
export interface Artifact {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'active' | 'archived' | 'deprecated';
  filePath: string;
  changeId: string;
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Event {
  id: string;
  timestamp: Date;
  type: string;
  outcome: 'success' | 'failure' | 'warning' | 'pending';
  duration?: number; // milliseconds
  metadata?: Record<string, any>;
}

// Artifact types extending Artifact
export interface Spec extends Artifact {
  capability: string;
  specType: 'new' | 'modified' | 'delta';
  requirementsCount?: number;
  requirements?: Requirement[];
  modifies?: Spec;
}

export interface TestCase extends Artifact {
  framework: string;
  testType: 'unit' | 'component' | 'integration' | 'e2e';
  assertionsCount?: number;
  isFailing: boolean;
  implementsTDD?: boolean;
  tests?: Requirement[];
  covers?: UseCaseStep[];
  usesMock?: MockObject[];
}

export interface CodeFile extends Artifact {
  language: string;
  complexity?: number;
  linesOfCode?: number;
  testCoverage?: number;
  implements?: Requirement[];
  testedBy?: TestCase[];
  functions?: Function[];
}

export interface DesignDoc extends Artifact {
  decisionsCount?: number;
  hasMigrationPlan?: boolean;
  documents?: DesignDecision[];
}

// Entity types extending Entity
export interface Requirement extends Entity {
  requirementType: 'added' | 'modified' | 'removed' | 'renamed';
  shallStatement: string;
  priority?: 'high' | 'medium' | 'low';
  isTestable?: boolean;
  implements?: UseCaseStep[];
  hasScenario?: Scenario[];
}

export interface UseCase extends Entity {
  primaryActor: string;
  goal: string;
  level: 'summary' | 'user' | 'subfunction';
  hasStep?: UseCaseStep[];
  hasPrecondition?: Precondition[];
}

export interface UseCaseStep extends Entity {
  stepNumber: string; // e.g., "S1", "E2a"
  stepType: 'main' | 'extension';
  actor?: string;
  action: string;
  partOf?: UseCase;
  implementedBy?: Requirement[];
}

export interface DesignDecision extends Entity {
  rationale: string;
  riskLevel?: 'high' | 'medium' | 'low';
  isArchitecture?: boolean;
  addresses?: UseCaseStep[];
  influences?: CodeFile[];
}

export interface Task extends Entity {
  taskNumber: string; // e.g., "1.2"
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority?: 'high' | 'medium' | 'low';
  estimatedEffort?: number; // hours
  isTestDriven?: boolean;
  implements?: UseCaseStep[];
  dependsOn?: Task[];
  creates?: CodeFile[];
}

// Event types extending Event
export interface TestRun extends Event {
  testFramework: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coveragePercentage?: number;
  executes?: TestCase[];
  produces?: CoverageReport;
}

export interface ScreenshotCapture extends Event {
  viewport?: string;
  isBaseline: boolean;
  diffPercentage?: number;
  capturedBy?: E2ETest;
  comparesTo?: ScreenshotCapture;
}

// Supporting entities
export interface MockObject extends Entity {
  mockType: 'stub' | 'spy' | 'fake' | 'mock';
  targetType: string;
  validationRules?: Record<string, any>;
  usedBy?: TestCase[];
  mocks?: Dependency;
}

export interface CoverageGap extends Entity {
  gapType: 'line' | 'branch' | 'function';
  severity: 'high' | 'medium' | 'low';
  filePath: string;
  lineRange?: string;
  inFile?: CodeFile;
  suggestsTest?: TestCase;
}

export interface Scenario extends Entity {
  scenarioType: 'main' | 'alternative' | 'exception';
  steps: string[];
  requirement?: Requirement;
}

export interface Precondition extends Entity {
  condition: string;
  useCase?: UseCase;
}

export interface Function extends Entity {
  signature: string;
  complexity?: number;
  linesOfCode?: number;
  partOf?: CodeFile;
  implements?: Requirement[];
  testedBy?: TestCase[];
}

export interface Dependency extends Entity {
  packageName: string;
  version: string;
  type: 'npm' | 'maven' | 'pip' | 'cargo';
  mockedBy?: MockObject;
}

export interface E2ETest extends Entity {
  tool: 'playwright' | 'cypress' | 'webdriverio';
  status: 'pass' | 'fail' | 'pending';
  tests?: UseCase[];
  hasStep?: E2EStep[];
  produces?: ScreenshotCapture[];
}

export interface E2EStep extends Entity {
  action: string;
  selector?: string;
  data?: Record<string, any>;
  expectedResult: string;
  partOf?: E2ETest;
  correspondsTo?: UseCaseStep;
}

export interface CoverageReport extends Event {
  type: 'line' | 'branch' | 'function';
  linesCovered?: number;
  totalLines?: number;
  branchesCovered?: number;
  totalBranches?: number;
  percentage: number;
  covers?: Requirement[];
  coversSteps?: UseCaseStep[];
  generatedBy?: TestRun;
  hasGap?: CoverageGap[];
}

export interface CIReport extends Event {
  summary: string;
  metrics: Record<string, any>;
  hasTestRun?: TestRun[];
  hasE2EResult?: E2EResult[];
  hasVisualRegression?: VisualRegression[];
  hasSpecImpact?: SpecImpact[];
  generatedBy?: CIPipeline;
}

export interface E2EResult extends Event {
  tool: string;
  testCount: number;
  passed: number;
  failed: number;
  resultsFile: string;
  partOf?: CIReport;
}

export interface VisualRegression extends Event {
  status: 'match' | 'mismatch' | 'new';
  diffPercentage: number;
  threshold: number;
  hasBaseline?: ScreenshotCapture;
  hasCurrent?: ScreenshotCapture;
  detectedIn?: CIReport;
}

export interface SpecImpact extends Entity {
  specPath: string;
  impactLevel: 'high' | 'medium' | 'low';
  requirementsAffected: string[];
  partOf?: CIReport;
  affects?: Spec[];
  testedBy?: TestCase[];
}

export interface CIPipeline extends Entity {
  pipelineId: string;
  stage: string;
  config: Record<string, any>;
  generates?: CIReport[];
}

// Change entity for context
export interface Change extends Entity {
  schema: string;
  status: 'proposed' | 'in_progress' | 'completed' | 'archived';
  createdDate: Date;
  hasArtifact?: Artifact[];
  implementsCapability?: Capability[];
  affectsSpec?: Spec[];
}

export interface Capability extends Entity {
  capabilityType: 'new' | 'modified';
  hasSpec?: Spec[];
  requires?: Capability[];
}

// Relationship types
export interface Relationship {
  id: string;
  type: string;
  strength: 'strong' | 'medium' | 'weak';
  validFrom?: Date;
  validTo?: Date;
  connects: [Entity, Entity];
  validatedBy?: Artifact;
}

// Validation result types
export interface ValidationResult {
  ruleName: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  violations: Array<{
    id: string;
    type: string;
    message: string;
  }>;
}

// Query types
export interface KGQuery {
  entityType?: string;
  properties?: Record<string, any>;
  relationships?: Array<{
    type: string;
    target?: string;
    direction: 'in' | 'out';
  }>;
  limit?: number;
  offset?: number;
}

export interface KGPathQuery {
  startNode: { id: string; type?: string };
  endNode: { id: string; type?: string };
  maxDepth?: number;
  relationshipTypes?: string[];
}

// Export all types
export type KGEntity = Artifact | Entity | Event |
  Spec | TestCase | CodeFile | DesignDoc |
  Requirement | UseCase | UseCaseStep | DesignDecision | Task |
  TestRun | ScreenshotCapture | MockObject | CoverageGap |
  Scenario | Precondition | Function | Dependency |
  E2ETest | E2EStep | CoverageReport | CIReport |
  E2EResult | VisualRegression | SpecImpact | CIPipeline |
  Change | Capability;

export type KGArtifact = Spec | TestCase | CodeFile | DesignDoc;
export type KGEntityType = Requirement | UseCase | UseCaseStep | DesignDecision | Task;
export type KGEventType = TestRun | ScreenshotCapture | CoverageReport | CIReport;