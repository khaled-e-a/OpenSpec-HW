# KG-Integrated Verify Spec Usage

This demonstrates how the enhanced `synspec:verify-spec-kg` command works with the Knowledge Graph to verify traceability connectivity.

## Overview

The KG-integrated verify-spec command:
- Checks that all documents are properly connected in the KG
- Verifies relationships between entities
- Automatically fixes missing connections
- Provides comprehensive KG audit reports

## Example Workflow

### 1. Initial State After Creating Artifacts

After running `synspec:new` and `synspec:ff`, you have:
- All artifacts created with KG entities
- Some relationships established
- Full traceability in the KG

### 2. Run KG Verification

```bash
$ synspec:verify-spec-kg add-user-auth

📊 KG: 26 entities, 45 relationships, 100% coverage

Verifying KG connectivity for change: add-user-auth

### Parsing Content
- usecases.md: 3 use cases, 12 steps parsed
- specs/auth/spec.md: 8 requirements parsed
- design.md: 3 design decisions parsed
- tasks.md: 12 tasks parsed

### Verifying KG Connectivity
✓ All use cases found in KG
✓ All use case steps linked to use cases
✓ All requirements implement correct use case steps
✓ All design decisions address use case steps
✓ All tasks implement requirements
✓ All artifacts linked to change

### KG Verification Report: add-user-auth

### Knowledge Graph State
- Use cases: 3 entities, 12 relationships
- Requirements: 8 entities, 12 relationships
- Design decisions: 3 entities, 6 relationships
- Tasks: 12 entities, 15 relationships
- Overall coverage: 100%

### Verification Results
- Missing entities: 0
- Missing relationships: 0
- Unlinked artifacts: 0
- Phantom references: 0
- Inaccurate descriptions: 0

### Result
All KG traceability is consistent. ✓

KG is ready for implementation phase.
Run /synspec:apply to implement tasks with KG tracking.
```

### 3. Example with Issues Found

Let's say someone manually edited files and broke some KG relationships:

```bash
$ synspec:verify-spec-kg add-user-auth

📊 KG: 24 entities, 40 relationships, 92% coverage

Verifying KG connectivity for change: add-user-auth

### Parsing Content
- usecases.md: 3 use cases, 12 steps parsed
- specs/auth/spec.md: 8 requirements parsed
- design.md: 3 design decisions parsed
- tasks.md: 12 tasks parsed

### Verifying KG Connectivity
✓ All use cases found in KG
⚠️  Use case step UC2-S3 not linked to any use case
✓ All requirements implement correct use case steps
⚠️  Design decision design-2 does not address UC1-E2a
⚠️  Task task-5 does not implement req-3
✓ All artifacts linked to change

### Auto-fixing Issues
✓ Fixed: Created missing relationship for UC2-S3
✓ Fixed: Created missing relationship for design-2 → UC1-E2a
✓ Fixed: Created missing relationship for task-5 → req-3

### KG Verification Report: add-user-auth

### Knowledge Graph State
- Use cases: 3 entities, 13 relationships (+1)
- Requirements: 8 entities, 13 relationships (+1)
- Design decisions: 3 entities, 7 relationships (+1)
- Tasks: 12 entities, 16 relationships (+1)
- Overall coverage: 100% (+8%)

### Verification Results
- Missing entities: 0
- Missing relationships: 3 (auto-fixed)
- Unlinked artifacts: 0
- Phantom references: 0
- Inaccurate descriptions: 0

### Result
All KG traceability is now consistent. ✓

Auto-fixed 3 connectivity issues.
KG traceability is ready for implementation.
```

## Detailed KG Verification Checks

The command performs these specific checks:

### 1. Use Case Connectivity
```typescript
// Verify each use case exists in KG
for (const uc of useCases) {
  const ucEntity = await kgInterface.execute('kg:get-entity', {
    entityId: `${changeId}-${uc.id}`
  });
  
  if (!ucEntity.success) {
    reportIssue(`Use case ${uc.id} not found in KG`);
  }
}

// Verify each use case step is linked to its use case
for (const step of useCaseSteps) {
  const stepRelationships = await kgInterface.execute('kg:get-relationships', {
    entityId: `${changeId}-${step.id}`,
    direction: 'in',
    relationshipTypes: ['hasStep']
  });
  
  if (stepRelationships.length === 0) {
    reportIssue(`Use case step ${step.id} not linked to any use case`);
  }
}
```

### 2. Requirement Traceability
```typescript
// Verify requirements implement correct use case steps
for (const req of requirements) {
  const implementsRel = await kgInterface.execute('kg:get-relationships', {
    entityId: `${changeId}-${req.id}`,
    direction: 'out',
    relationshipTypes: ['implements']
  });
  
  const implementedSteps = implementsRel.map(r => r.target.id);
  const expectedSteps = req.implements || [];
  
  for (const expectedStep of expectedSteps) {
    const stepId = `${changeId}-${expectedStep.split(' ')[0]}`;
    if (!implementedSteps.includes(stepId)) {
      reportIssue(`Requirement ${req.id} does not implement ${expectedStep}`);
    }
  }
}
```

### 3. Task Implementation
```typescript
// Verify tasks implement requirements
for (const task of tasks) {
  const implementsRel = await kgInterface.execute('kg:get-relationships', {
    entityId: `${changeId}-${task.id}`,
    direction: 'out',
    relationshipTypes: ['implements']
  });
  
  const implementedReqs = implementsRel.map(r => r.target.id);
  const expectedReqs = task.addresses || [];
  
  for (const expectedReq of expectedReqs) {
    const reqId = `${changeId}-${expectedReq}`;
    if (!implementedReqs.includes(reqId)) {
      reportIssue(`Task ${task.id} does not implement ${expectedReq}`);
    }
  }
}
```

### 4. Artifact Connectivity
```typescript
// Verify all artifacts are linked to the change
const artifactTypes = ['usecases', 'specs', 'design', 'tasks'];

for (const artifactType of artifactTypes) {
  const artifactId = `${changeId}-${artifactType}`;
  
  const changeRelationships = await kgInterface.execute('kg:get-relationships', {
    entityId: changeId,
    direction: 'out',
    relationshipTypes: ['hasArtifact']
  });
  
  const hasArtifact = changeRelationships.some(r => r.target.id === artifactId);
  if (!hasArtifact) {
    reportIssue(`${artifactType} artifact not linked to change`);
  }
}
```

## Querying Verification Results

After verification, you can query the KG:

### Find All Issues
```typescript
const issues = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Issue',
    properties: { changeId: 'add-user-auth', type: 'verification' }
  }
});
```

### Get Coverage Metrics
```typescript
const coverage = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Coverage',
    properties: { changeId: 'add-user-auth' }
  }
});
```

### Check Specific Entity
```typescript
const entity = await kgInterface.execute('kg:get-entity', {
  entityId: 'add-user-auth-req-1',
  entityType: 'Requirement'
});

const relationships = await kgInterface.execute('kg:get-relationships', {
  entityId: 'add-user-auth-req-1',
  direction: 'both'
});
```

## Benefits of KG Verification

1. **Automated**: No manual checking of traceability tables
2. **Comprehensive**: Checks all relationships in the graph
3. **Fixable**: Automatically repairs missing connections
4. **Queryable**: Easy to find specific issues
5. **Consistent**: Same verification logic across all artifacts
6. **Extensible**: Easy to add new relationship types

## Error Handling

If KG operations fail:
- Falls back to manual verification
- Reports KG issues separately
- Continues with available data
- Provides clear error messages

## Performance

- Batches queries when possible
- Caches frequently accessed data
- Minimizes individual tool calls
- Provides progress updates