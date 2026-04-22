# Using KG-Integrated Continue and Fast-Forward Commands

This example demonstrates how the KG-integrated `synspec:continue` and `synspec:ff` commands work with the Knowledge Graph.

## Overview

The KG-integrated commands provide:
- Automatic KG entity creation for artifacts
- Extraction of structured data from artifacts
- Full traceability between artifacts
- Real-time KG updates as artifacts are created

## Example Workflow

### 1. Create a New Change with KG

```bash
synspec:new add-user-auth
```

This creates:
- Directory structure: `synergyspec/changes/add-user-auth/`
- KG entities: Change, Proposal, Tasks (based on schema)
- Relationships linking them together

### 2. Use synspec:continue to Build Artifacts

```bash
synspec:continue add-user-auth
```

The command will:
1. Check KG to see current state
2. Find the next ready artifact
3. Get instructions for that artifact
4. Create the artifact file
5. **Update KG with the new artifact**
6. **Extract entities from the artifact content**
7. **Create relationships for traceability**
8. Persist KG changes

#### Example: Creating usecases.md

```typescript
// KG updates when creating usecases.md:

// 1. Create usecases artifact entity
const usecasesEntity = {
  id: 'add-user-auth-usecases',
  type: 'Artifact',
  name: 'Use Cases',
  status: 'active',
  filePath: 'synergyspec/changes/add-user-auth/usecases.md',
  changeId: 'add-user-auth'
};

await kgInterface.execute('kg:create-entity', { entity: usecasesEntity });

// 2. Link to change
await kgInterface.execute('kg:create-relationship', {
  sourceId: 'add-user-auth',
  relationshipType: 'hasArtifact',
  targetId: 'add-user-auth-usecases'
});

// 3. Extract use cases from content
const useCases = parseUseCases(content);
for (const uc of useCases) {
  const ucEntity = {
    id: `add-user-auth-${uc.id}`,
    type: 'UseCase',
    name: uc.title,
    primaryActor: uc.actor,
    goal: uc.goal,
    level: 'user'
  };
  
  const result = await kgInterface.execute('kg:create-entity', { entity: ucEntity });
  
  // Link use case to artifact
  await kgInterface.execute('kg:create-relationship', {
    sourceId: 'add-user-auth-usecases',
    relationshipType: 'documents',
    targetId: result.entityId
  });
}

// 4. Extract use case steps
const steps = parseUseCaseSteps(content);
for (const step of steps) {
  const stepEntity = {
    id: `add-user-auth-${step.id}`,
    type: 'UseCaseStep',
    name: step.description,
    stepNumber: step.number,
    stepType: step.type
  };
  
  const result = await kgInterface.execute('kg:create-entity', { entity: stepEntity });
  
  // Link step to use case
  await kgInterface.execute('kg:create-relationship', {
    sourceId: `add-user-auth-${step.useCaseId}`,
    relationshipType: 'hasStep',
    targetId: result.entityId
  });
}

// 5. Persist changes
await kgInterface.execute('kg:persist', {});
```

### 3. Continue to Next Artifact

```bash
synspec:continue add-user-auth
```

Now it will create specs/ directory with KG tracking:

#### Example: Creating specs/auth/spec.md

```typescript
// KG updates when creating specs:

// 1. Create spec artifact entity
const specEntity = {
  id: 'add-user-auth-specs',
  type: 'Spec',
  name: 'Specifications',
  status: 'active',
  filePath: 'synergyspec/changes/add-user-auth/specs/',
  changeId: 'add-user-auth',
  capability: 'user-authentication',
  specType: 'new'
};

await kgInterface.execute('kg:create-entity', { entity: specEntity });

// 2. Link to change
await kgInterface.execute('kg:create-relationship', {
  sourceId: 'add-user-auth',
  relationshipType: 'hasArtifact',
  targetId: 'add-user-auth-specs'
});

// 3. Extract requirements from spec content
const requirements = parseRequirements(content);
for (const req of requirements) {
  const reqEntity = {
    id: `add-user-auth-${req.id}`,
    type: 'Requirement',
    name: req.name,
    requirementType: 'added',
    shallStatement: req.shallStatement,
    priority: req.priority
  };
  
  const result = await kgInterface.execute('kg:create-entity', { entity: reqEntity });
  
  // Link requirement to spec
  await kgInterface.execute('kg:create-relationship', {
    sourceId: 'add-user-auth-specs',
    relationshipType: 'hasRequirement',
    targetId: result.entityId
  });
  
  // Link requirement to use case steps it implements
  for (const stepId of req.implements) {
    await kgInterface.execute('kg:create-relationship', {
      sourceId: result.entityId,
      relationshipType: 'implements',
      targetId: `add-user-auth-${stepId}`
    });
  }
}

// 4. Persist changes
await kgInterface.execute('kg:persist', {});
```

### 4. Use Fast-Forward to Create All Remaining Artifacts

```bash
synspec:ff add-user-auth
```

This will create all remaining artifacts (design.md, tasks.md) with KG tracking in one go.

## KG Query Examples After Artifacts Are Created

### Check Traceability

```typescript
const traceResult = await kgInterface.execute('kg:get-change-traceability', {
  changeId: 'add-user-auth'
});

console.log('Use Case Steps:', traceResult.traceability.useCaseSteps.length);
console.log('Requirements:', traceResult.traceability.requirements.length);
console.log('Test Coverage:', traceResult.traceability.coverage + '%');
```

### Find Requirements Without Tests

```typescript
const untestedReqs = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Requirement',
    properties: { changeId: 'add-user-auth' }
  }
});

for (const req of untestedReqs.entities) {
  const tests = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'in',
    relationshipTypes: ['tests']
  });
  
  if (tests.length === 0) {
    console.log(`Requirement ${req.name} has no tests`);
  }
}
```

### Find Implementation Gaps

```typescript
// Find use case steps not implemented by requirements
const steps = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'UseCaseStep',
    properties: { changeId: 'add-user-auth' }
  }
});

for (const step of steps.entities) {
  const implementations = await kgInterface.execute('kg:get-relationships', {
    entityId: step.id,
    direction: 'in',
    relationshipTypes: ['implements']
  });
  
  if (implementations.length === 0) {
    console.log(`Use case step ${step.name} has no implementing requirements`);
  }
}
```

## Benefits of KG Integration

1. **Automatic Traceability**: No manual linking required
2. **Real-time Updates**: KG updates as artifacts are created
3. **Validation**: Automatic validation of completeness
4. **Queryable**: Easy to find gaps and issues
5. **Persistent**: Changes survive restarts
6. **Extensible**: Easy to add new analysis tools

## Error Handling

If KG operations fail:
- Commands continue with artifact creation
- Warnings are logged but don't block
- Fallback to non-KG behavior
- Clear error messages provided

## Performance Considerations

- Batch entity creation when possible
- Persist after major operations
- Cache KG client instances
- Minimize individual tool calls