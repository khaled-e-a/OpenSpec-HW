# Using the SynergySpec Knowledge Graph Ontology

This document explains how synspec commands can interact with the knowledge graph ontology to store, query, and validate artifacts with full traceability.

## Overview

The SynergySpec KG ontology provides:

- **Abstract base types**: `Artifact`, `Entity`, `Event` that concrete types extend
- **Traceability**: Automatic linking between use cases → requirements → tests → code
- **Validation**: Built-in rules to ensure completeness and consistency
- **Query capabilities**: Find paths, gaps, impacts, and coverage

## Quick Start

```typescript
import { KG } from '../core/kg/index.js';

// Create a KG client
const kg = KG.createKGClient({ type: 'memory' });

// Create a requirement with traceability
const requirement = await kg.create({
  id: 'req-001',
  type: 'Requirement',
  name: 'User authentication',
  requirementType: 'added',
  shallStatement: 'The system SHALL authenticate users',
  implements: ['uc-001-s1'] // Links to use case step
});

// Create a test that covers the requirement
const testCase = await kg.create({
  id: 'test-001',
  type: 'TestCase',
  name: 'User login test',
  framework: 'vitest',
  testType: 'unit',
  isFailing: false,
  tests: ['req-001'] // Links to requirement
});

// Query traceability
const traceability = await kg.getChangeTraceability('change-123');
console.log(`Coverage: ${traceability.coverage}%`);
```

## Entity Types

### Abstract Base Types

#### `Artifact`
Base for all file-based artifacts (specs, tests, code files).
```yaml
properties:
  id: string (required)
  name: string (required)
  status: active|archived|deprecated
  filePath: string (required)
  changeId: string (required)
```

#### `Entity`
Base for all conceptual entities (requirements, use cases, etc.).
```yaml
properties:
  id: string (required)
  type: string (required)
  name: string (required)
  description: string (optional)
  metadata: object (optional)
```

#### `Event`
Base for all events (test runs, CI executions, etc.).
```yaml
properties:
  id: string (required)
  timestamp: datetime (required)
  type: string (required)
  outcome: success|failure|warning|pending
  duration: integer (milliseconds, optional)
```

### Concrete Types

#### `Spec` (extends Artifact)
Specification documents with requirements.
```yaml
additionalProperties:
  capability: string (required)
  specType: new|modified|delta
  requirementsCount: integer
relationships:
  hasRequirement → Requirement
  modifies → Spec (for delta specs)
```

#### `TestCase` (extends Artifact)
Test files with framework info and coverage.
```yaml
additionalProperties:
  framework: string (required)
  testType: unit|component|integration|e2e
  isFailing: boolean (required)
  implementsTDD: boolean
relationships:
  tests → Requirement
  covers → UseCaseStep
```

#### `Requirement` (extends Entity)
Individual requirements with traceability.
```yaml
additionalProperties:
  requirementType: added|modified|removed|renamed
  shallStatement: string (required)
  priority: high|medium|low
relationships:
  implements → UseCaseStep
  hasScenario → Scenario
```

## Common Operations

### 1. Creating Traceability Links

```typescript
// Link use case step to requirement
await kg.createRelationship(
  'uc-001-s1',           // use case step ID
  'implementedBy',       // relationship type
  'req-001'              // requirement ID
);

// Link requirement to test
await kg.createRelationship(
  'req-001',
  'tests',
  'test-001'
);
```

### 2. Querying Traceability

```typescript
// Find all requirements for a use case step
const requirements = await kg.getRelationships('uc-001-s1', 'out', ['implementedBy']);

// Find tests covering a requirement
const tests = await kg.getRelationships('req-001', 'in', ['tests']);

// Get full traceability for a change
const trace = await kg.getChangeTraceability('change-123');
```

### 3. Validation Examples

```typescript
// Validate entity before saving
const validation = await kg.validateEntity(requirement, 'Requirement');
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Run schema validation rules
const issues = await validator.runValidationRules(kg);
```

### 4. Finding Coverage Gaps

```typescript
// Find untested requirements
const untested = await kg.find({
  entityType: 'Requirement',
  query: `
    MATCH (r:Requirement)
    WHERE NOT (r)-[:tests]-(:TestCase)
    RETURN r
  `
});

// Find untraced use case steps
const untraced = await kg.find({
  entityType: 'UseCaseStep',
  query: `
    MATCH (step:UseCaseStep)
    WHERE NOT (step)-[:implementedBy]-(:Requirement)
    RETURN step
  `
});
```

## Integration with Synspec Commands

### `/synspec:new`
Creates KG entities for the new change:
```typescript
const change = await kg.create({
  id: changeName,
  type: 'Change',
  name: changeName,
  schema: schemaName,
  status: 'proposed'
});
```

### `/synspec:gen-tests`
Analyzes specs and creates test coverage:
```typescript
// Get requirements without tests
const requirements = await kg.find({
  entityType: 'Requirement',
  query: `
    MATCH (r:Requirement)
    WHERE NOT (r)-[:tests]-(:TestCase)
    RETURN r
  `
});

// Create test cases for uncovered requirements
for (const req of requirements) {
  await kg.create({
    type: 'TestCase',
    name: `Test for ${req.name}`,
    tests: [req.id]
  });
}
```

### `/synspec:run-tests`
Updates test results and coverage:
```typescript
// Create test run event
const testRun = await kg.create({
  type: 'TestRun',
  testFramework: 'vitest',
  totalTests: results.total,
  passed: results.passed,
  failed: results.failed
});

// Update test case statuses
for (const test of testResults) {
  await kg.update(test.id, { isFailing: test.status === 'failed' });
}
```

### `/synspec:verify`
Validates implementation against specs:
```typescript
// Check if all requirements are implemented
const unimplemented = await kg.find({
  query: `
    MATCH (r:Requirement)
    WHERE NOT (r)-[:implements]-(:UseCaseStep)
    RETURN r
  `
});

// Check if all tasks are completed
const incomplete = await kg.find({
  query: `
    MATCH (t:Task)
    WHERE t.status <> 'completed'
    RETURN t
  `
});
```

## Schema Extensions

Commands can extend the schema by:

1. **Adding new concrete types** that extend abstract base types
2. **Adding properties** to existing types via metadata
3. **Creating new relationships** between types
4. **Adding validation rules** specific to their domain

Example extension for a new command:
```typescript
// Extend schema for new artifact type
const customSpec = {
  extends: 'Artifact',
  properties: {
    customField: { type: 'string', required: true }
  },
  relationships: {
    customRel: {
      target: 'Requirement',
      cardinality: 'one-to-many'
    }
  }
};
```

## Performance Considerations

- Use indexes on frequently queried properties (`id`, `changeId`, `type`)
- Batch operations when possible (`createMany`, `updateMany`)
- Use specific relationship types in queries
- Limit query depth for path operations
- Cache validation results when appropriate

## Error Handling

```typescript
try {
  await kg.create(entity);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error('Entity validation failed:', error.details);
  } else if (error.code === 'RELATIONSHIP_ERROR') {
    // Handle relationship constraint violations
    console.error('Invalid relationship:', error.details);
  } else {
    // Handle other errors
    console.error('KG operation failed:', error);
  }
}
```

## Best Practices

1. **Always validate** before creating entities
2. **Create relationships** immediately when creating related entities
3. **Use transactions** for multi-step operations
4. **Keep IDs consistent** across the system (use UUIDs or deterministic IDs)
5. **Update timestamps** when entities change
6. **Set proper status** values for lifecycle tracking
7. **Use metadata** for command-specific data that doesn't need querying
8. **Run validation rules** before archiving changes

## Debugging

Enable KG debugging to see queries and operations:
```bash
export SYNERGYSPEC_KG_DEBUG=1
synergyspec-hw apply my-change
```

This will log:
- All KG operations
- Query execution plans
- Validation results
- Relationship creation/deletion