# KG-Integrated Workflow Demo

This demonstrates the complete flow of using KG-integrated synspec commands to create a change with full traceability.

## Demo Scenario: Adding User Authentication

### Step 1: Create the Change

```bash
$ synspec:new add-user-auth

Created change 'add-user-auth' at synergyspec/changes/add-user-auth/ (schema: spec-driven)

📊 Knowledge Graph initialized with:
   - 5 entities
   - 5 relationships
   - KG stored at: .synergyspec/kg
```

KG entities created:
- Change: `add-user-auth`
- Artifacts: Proposal, Use Cases, Specs, Design, Tasks
- Relationships linking them

### Step 2: Continue to Create First Artifact

```bash
$ synspec:continue add-user-auth

📊 KG: 0 use case steps, 0 requirements, 0% coverage

Creating artifact: usecases.md
✓ Created usecases.md (KG updated)

📊 KG updated: 3 use cases, 12 use case steps, 0% coverage

Next: Create specifications with `synspec:continue`
```

The KG updates include:
```typescript
// Use case entities created
{
  id: 'add-user-auth-uc1',
  type: 'UseCase',
  name: 'User logs in',
  primaryActor: 'User',
  goal: 'Access the application',
  level: 'user'
},
{
  id: 'add-user-auth-uc2',
  type: 'UseCase',
  name: 'User registers',
  primaryActor: 'User',
  goal: 'Create a new account',
  level: 'user'
},
{
  id: 'add-user-auth-uc3',
  type: 'UseCase',
  name: 'User resets password',
  primaryActor: 'User',
  goal: 'Regain access to account',
  level: 'user'
}

// Use case step entities created
{
  id: 'add-user-auth-uc1-s1',
  type: 'UseCaseStep',
  name: 'User navigates to login page',
  stepNumber: 'S1',
  stepType: 'main',
  action: 'User navigates to login page'
},
// ... 11 more steps
```

### Step 3: Continue to Create Specifications

```bash
$ synspec:continue add-user-auth

📊 KG: 3 use cases, 12 use case steps, 0% coverage

Creating artifact: specs/auth/spec.md
✓ Created specs/auth/spec.md (KG updated)

📊 KG updated: 3 use cases, 12 use case steps, 8 requirements, 100% coverage

Next: Create design document with `synspec:continue`
```

The KG now includes:
```typescript
// Spec artifact entity
{
  id: 'add-user-auth-specs',
  type: 'Spec',
  name: 'Specifications',
  status: 'active',
  capability: 'user-authentication',
  specType: 'new',
  requirementsCount: 8
}

// Requirement entities created
{
  id: 'add-user-auth-req1',
  type: 'Requirement',
  name: 'Validate user credentials',
  requirementType: 'added',
  shallStatement: 'The system SHALL validate user credentials',
  priority: 'high',
  implements: ['UC1-S3', 'UC1-E1a']
},
// ... 7 more requirements

// Traceability relationships
{
  sourceId: 'add-user-auth-req1',
  type: 'implements',
  targetId: 'add-user-auth-uc1-s3'
},
{
  sourceId: 'add-user-auth-req1',
  type: 'implements',
  targetId: 'add-user-auth-uc1-e1a'
}
```

### Step 4: Use Fast-Forward for Remaining Artifacts

```bash
$ synspec:ff add-user-auth

📊 KG: 3 use cases, 12 steps, 8 requirements, 100% coverage

Fast-forwarding through remaining artifacts...

✓ Created design.md (KG updated)
   - 3 design decisions added to KG
   - Architecture patterns documented

✓ Created tasks.md (KG updated)
   - 12 tasks extracted and linked to requirements
   - Task traceability: 100% coverage

📊 Final KG state:
   - 26 entities total
   - 45 relationships
   - 100% traceability coverage

All artifacts created! Ready for implementation with full KG tracking.
```

## Querying the Knowledge Graph

After artifacts are created, you can query the KG:

### Check Traceability Matrix

```typescript
const traceResult = await kgInterface.execute('kg:get-change-traceability', {
  changeId: 'add-user-auth'
});

console.log('Traceability Report:');
console.log(`- Use Cases: ${traceResult.traceability.useCaseSteps.length}`);
console.log(`- Requirements: ${traceResult.traceability.requirements.length}`);
console.log(`- Test Coverage: ${traceResult.traceability.coverage}%`);
console.log(`- Code Files: ${traceResult.traceability.codeFiles.length}`);
```

Output:
```
Traceability Report:
- Use Cases: 12
- Requirements: 8
- Test Coverage: 0%
- Code Files: 0
```

### Find Requirements Without Tests

```typescript
const requirements = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Requirement',
    properties: { changeId: 'add-user-auth' }
  }
});

let untestedCount = 0;
for (const req of requirements.entities) {
  const tests = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'in',
    relationshipTypes: ['tests']
  });
  
  if (tests.length === 0) {
    untestedCount++;
    console.log(`❌ ${req.name} has no tests`);
  }
}

console.log(`\n${untestedCount}/${requirements.entities.length} requirements need tests`);
```

### Find Implementation Gaps

```typescript
const steps = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'UseCaseStep',
    properties: { changeId: 'add-user-auth' }
  }
});

let unimplementedSteps = 0;
for (const step of steps.entities) {
  const implementations = await kgInterface.execute('kg:get-relationships', {
    entityId: step.id,
    direction: 'in',
    relationshipTypes: ['implements']
  });
  
  if (implementations.length === 0) {
    unimplementedSteps++;
    console.log(`⚠️  ${step.name} has no implementing requirements`);
  }
}

console.log(`\n${unimplementedSteps}/${steps.entities.length} steps lack implementation`);
```

### Get Coverage by Requirement

```typescript
for (const req of requirements.entities) {
  const implementations = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'out',
    relationshipTypes: ['implements']
  });
  
  const tests = await kgInterface.execute('kg:get-relationships', {
    entityId: req.id,
    direction: 'in',
    relationshipTypes: ['tests']
  });
  
  const coverage = tests.length > 0 ? '✅' : '❌';
  const implCount = implementations.length;
  
  console.log(`${coverage} ${req.name} - ${implCount} use case steps, ${tests.length} tests`);
}
```

## Benefits Demonstrated

1. **Automatic Entity Creation**: No manual KG updates needed
2. **Content Extraction**: Structured data automatically parsed
3. **Traceability**: Complete links between artifacts
4. **Real-time Updates**: KG updates as work progresses
5. **Queryable**: Easy to find gaps and issues
6. **Persistent**: Survives restarts and can be queried later

## Next Steps

After creating all artifacts:

1. **Implement with TDD**:
   ```bash
   synspec:tdd add-user-auth
   ```

2. **Generate Tests**:
   ```bash
   synspec:gen-tests add-user-auth
   ```

3. **Verify Implementation**:
   ```bash
   synspec:verify add-user-auth
   ```

4. **Archive When Complete**:
   ```bash
   synspec:archive add-user-auth
   ```

The KG provides continuous traceability throughout the entire workflow, making it easy to ensure completeness and identify gaps at any stage.