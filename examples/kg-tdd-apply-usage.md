# KG-Integrated TDD and Apply Usage

This demonstrates how the enhanced `synspec:tdd-kg` and `synspec:apply-kg` commands work with the Knowledge Graph to track implementation progress and code artifacts.

## Overview

The KG-integrated commands provide:
- Automatic tracking of implementation progress
- Code and test entities in the KG
- Real-time coverage and complexity metrics
- Complete implementation audit trail

## Example Workflow: TDD Implementation

### 1. Initial State

After creating artifacts with `synspec:new` and `synspec:ff`:

```bash
$ synspec:new add-user-auth
$ synspec:ff add-user-auth

📊 KG: 26 entities, 45 relationships, 100% coverage
```

### 2. Start TDD Implementation

```bash
$ synspec:tdd-kg add-user-auth

📊 KG: 26 entities, 45 relationships, 100% coverage

## TDD: add-user-auth (schema: spec-driven)

KG Coverage: 0% (no tests yet)
Code entities: 0 (no implementation yet)

Starting TDD implementation...
```

### 3. First Task - Create Failing Test

The command creates a test entity in KG:

```typescript
// KG creates test entity
const testEntity = {
  id: 'add-user-auth-test-task-1-123456789',
  type: 'TestCase',
  name: 'Test: Validate user credentials',
  framework: 'vitest',
  testType: 'unit',
  isFailing: true,
  filePath: 'src/__tests__/auth/validate-credentials.test.ts',
  changeId: 'add-user-auth',
  createdAt: new Date(),
  status: 'active'
};

await kgInterface.execute('kg:create-entity', { entity: testEntity });

// Link test to requirements
for (const req of task.addresses) {
  await kgInterface.execute('kg:create-relationship', {
    sourceId: testEntity.id,
    relationshipType: 'tests',
    targetId: `add-user-auth-${req}`,
    properties: {
      testType: 'unit',
      coversTask: true,
      createdAt: new Date()
    }
  });
}
```

Output:
```
Task 1/7: Validate user credentials
"#ffcccc" RED   — wrote failing test \`test/auth/validate-credentials.test.ts:45\` (KG entity created)
✓ Test created and linked to 2 requirements
KG Coverage: 25% (2/8 requirements now tested)
```

### 4. Implement Code to Pass Test

KG tracks the implementation:

```typescript
// KG creates code entity
const codeEntity = {
  id: 'add-user-auth-code-task-1',
  type: 'CodeFile',
  name: 'Implementation for Validate user credentials',
  status: 'in_progress',
  filePath: 'src/auth/validate-credentials.ts',
  changeId: 'add-user-auth',
  createdAt: new Date(),
  language: 'typescript',
  complexity: 1,
  implementationMethod: 'tdd'
};

await kgInterface.execute('kg:create-entity', { entity: codeEntity });

// Link code to task
await kgInterface.execute('kg:create-relationship', {
  sourceId: 'task-1',
  relationshipType: 'implementedBy',
  targetId: codeEntity.id,
  properties: {
    implementationDate: new Date(),
    implementationType: 'tdd',
    startedAt: new Date()
  }
});
```

Output:
```
"#ccffcc" GREEN — implemented \`src/auth/validate-credentials.ts\` (KG entity created)
✓ Code entity created and linked to task
KG Complexity: 1 → 3
KG Coverage: 25% → 25% (test now passes)
```

### 5. Complete Task and Update KG

```typescript
// Update task status in KG
await kgInterface.execute('kg:update', {
  id: 'task-1',
  updates: {
    status: 'completed',
    completedAt: new Date(),
    implementationMethod: 'tdd'
  }
});

// Update code entity with final metrics
await kgInterface.execute('kg:update', {
  id: codeEntity.id,
  updates: {
    status: 'active',
    complexity: 3,
    linesOfCode: 45,
    testCoverage: 100
  }
});

// Create TDD cycle event
const tddEvent = {
  id: 'tdd-add-user-auth-task-1-red-green-123456789',
  type: 'TDDEvent',
  timestamp: new Date(),
  type: 'tdd_cycle',
  outcome: 'success',
  duration: 180000, // 3 minutes
  metadata: {
    cycle: 'red-green-refactor',
    taskId: 'task-1',
    testCount: 1,
    codeLines: 45,
    filesModified: 2
  }
};

await kgInterface.execute('kg:create-entity', { entity: tddEvent });
```

Output:
```
✓ Task 1 complete (KG status updated)
KG Coverage: 25% → 25% (task completed)
TDD cycle recorded in KG

Task 2/7: Generate JWT token
...
```

## Example Workflow: Direct Implementation

### Using synspec:apply-kg

```bash
$ synspec:apply-kg add-user-auth

📊 KG: 26 entities, 45 relationships, 100% coverage

## Apply: add-user-auth (schema: spec-driven)

KG Coverage: 25% (2/8 requirements implemented)
Code entities: 1 (from previous TDD)

Starting implementation with KG tracking...
```

### Implementation with KG Tracking

For each task:

```typescript
// Get task details from KG
const taskEntity = await kgInterface.execute('kg:get-entity', {
  entityId: 'task-2'
});

const taskReqs = await kgInterface.execute('kg:get-relationships', {
  entityId: 'task-2',
  direction: 'out',
  relationshipTypes: ['implements']
});

console.log(`Task: Generate JWT token`);
console.log(`Implements ${taskReqs.length} requirements`);
console.log(`Estimated effort: ${taskEntity.entity.estimatedEffort} hours`);

// Create code entity before implementation
const codeEntity = {
  id: 'add-user-auth-code-task-2',
  type: 'CodeFile',
  name: 'Implementation for Generate JWT token',
  status: 'in_progress',
  filePath: 'src/auth/jwt.ts',
  changeId: 'add-user-auth',
  createdAt: new Date(),
  language: 'typescript',
  complexity: 1,
  estimatedLines: 100,
  implementationMethod: 'direct'
};

await kgInterface.execute('kg:create-entity', { entity: codeEntity });

// Link code to task
await kgInterface.execute('kg:create-relationship', {
  sourceId: 'task-2',
  relationshipType: 'implementedBy',
  targetId: codeEntity.id,
  properties: {
    implementationDate: new Date(),
    implementationType: 'direct',
    startedAt: new Date()
  }
});
```

### Track Implementation Progress

```typescript
// After implementing code
const metadata = extractArtifactMetadata(codeContent, 'code');

await kgInterface.execute('kg:update', {
  id: codeEntity.id,
  updates: {
    status: 'active',
    complexity: 5,
    linesOfCode: 120,
    testCoverage: 80,
    metadata: metadata
  }
});

// Update task status
await kgInterface.execute('kg:update', {
  id: 'task-2',
  updates: {
    status: 'completed',
    completedAt: new Date(),
    actualEffort: 2.5, // hours
    implementationMethod: 'direct'
  }
});

// Create implementation event
const implEvent = {
  id: 'impl-add-user-auth-task-2-123456789',
  type: 'ImplementationEvent',
  timestamp: new Date(),
  outcome: 'success',
  duration: 9000000, // 2.5 hours
  metadata: {
    taskId: 'task-2',
    implementationMethod: 'direct',
    linesAdded: 120,
    filesModified: 1
  }
};

await kgInterface.execute('kg:create-entity', { entity: implEvent });
```

Output:
```
Task 2/7: Generate JWT token
✓ Created code entity in KG
✓ Implementation complete
✓ Updated task status in KG
✓ KG Complexity: 1 → 5
✓ KG Coverage: 25% → 35%

KG Progress: 2/7 tasks complete (29%)
```

## KG Query Examples

### Check Implementation Progress

```typescript
// Get current implementation status
const progress = await kgInterface.execute('kg:get-change-traceability', {
  changeId: 'add-user-auth'
});

console.log(`Tasks: ${progress.traceability.tasks.length}`);
console.log(`Code files: ${progress.traceability.codeFiles.length}`);
console.log(`Coverage: ${progress.traceability.coverage}%`);
```

### Find Unimplemented Requirements

```typescript
const requirements = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Requirement',
    properties: { changeId: 'add-user-auth' }
  }
});

for (const req of requirements.entities) {
  const tests = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'in',
    relationshipTypes: ['tests']
  });
  
  const implementations = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'in',
    relationshipTypes: ['implementedBy']
  });
  
  console.log(`${req.name}:`);
  console.log(`  Tests: ${tests.length}`);
  console.log(`  Implementations: ${implementations.length}`);
}
```

### Analyze Implementation Patterns

```typescript
// Get all implementation events
const implEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'ImplementationEvent',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalTime = 0;
let totalLines = 0;

for (const event of implEvents.entities) {
  totalTime += event.duration || 0;
  totalLines += event.metadata.linesAdded || 0;
}

console.log(`Total implementation time: ${totalTime / 3600000} hours`);
console.log(`Total lines added: ${totalLines}`);
console.log(`Average speed: ${totalLines / (totalTime / 3600000)} lines/hour`);
```

## Benefits of KG Integration

1. **Automatic Tracking** - No manual progress updates needed
2. **Complete Audit Trail** - Every implementation step recorded
3. **Real-time Metrics** - Coverage, complexity, progress visible
4. **Implementation Patterns** - TDD vs direct implementation tracked
5. **Performance Analysis** - Time tracking and effort analysis
6. **Traceability** - Full links between code, tests, and requirements

## Error Handling

If KG operations fail:
- Commands continue with implementation
- Warnings are logged but don't block progress
- Fallback to non-KG behavior is available
- Clear error messages help debugging

## Performance Optimization

- Batch KG operations when possible
- Update KG after major operations, not every line
- Cache frequently accessed entities
- Minimize tool calls during hot implementation paths

This comprehensive KG integration ensures that all implementation work is automatically tracked and traceable through the knowledge graph, providing valuable insights into the development process.