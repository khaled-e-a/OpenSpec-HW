# KG-Integrated Verify Implementation Usage

This demonstrates how the enhanced `synspec:verify-kg` command works with the Knowledge Graph to verify that implemented code correctly connects to specifications.

## Overview

The KG-integrated verify command provides:
- Verification that code entities are properly connected in the KG
- Cross-validation between KG relationships and actual code
- Comprehensive audit of implementation traceability
- Detection of KG vs code discrepancies

## Example Workflow

### 1. Initial State After Implementation

After running implementation commands:

```bash
$ synspec:tdd-kg add-user-auth
$ synspec:apply-kg add-user-auth

📊 KG: 45 entities, 78 relationships, 100% coverage
```

### 2. Run KG Verification

```bash
$ synspec:verify-kg add-user-auth

📊 KG: 45 entities, 78 relationships, 100% coverage

Verifying KG connectivity for change: add-user-auth

### Parsing Content
- usecases.md: 3 use cases, 12 steps parsed
- specs/auth/spec.md: 8 requirements parsed
- design.md: 3 design decisions parsed
- tasks.md: 12 tasks parsed

### Verifying KG Connectivity
✓ All 12 tasks have code entities
✓ All 8 requirements have implementing code
⚠️  2 requirements lack test coverage in KG
✓ All KG relationships verified against actual code

### KG Verification Report: add-user-auth

### Knowledge Graph State
- Code entities: 12
- Test entities: 15
- Implementation events: 12
- Overall KG coverage: 100%

### KG Connectivity Results
- Tasks with code entities: 12/12
- Requirements with code: 8/8
- Requirements with tests: 6/8
- KG relationship accuracy: 100%

### Verification Results
- KG connectivity: All good
- Implementation completeness: 100%
- KG relationship accuracy: 100%

Implementation is properly tracked in the knowledge graph.
Ready for archive with full KG traceability.
```

## Detailed Verification Checks

### 1. Task KG Connectivity

```typescript
const taskResult = await verifyTaskKGConnectivity(projectRoot, 'add-user-auth');

console.log(`Tasks with code: ${taskResult.tasksWithCode}/${taskResult.totalTasks}`);

for (const issue of taskResult.issues) {
  console.log(`${issue.severity}: ${issue.issue} (${issue.taskName})`);
}
```

Output:
```
Tasks with code: 12/12
info: Task in progress but no code entities found in KG (Generate JWT token)
info: Task in progress but no code entities found in KG (Validate JWT token)
```

### 2. Requirement KG Connectivity

```typescript
const reqResult = await verifyRequirementKGConnectivity(projectRoot, 'add-user-auth');

console.log(`Requirements with code: ${reqResult.requirementsWithCode}/${reqResult.totalRequirements}`);

for (const req of reqResult.uncoveredRequirements) {
  console.log(`${req.severity}: ${req.reqName} lacks implementing code`);
}
```

Output:
```
Requirements with code: 8/8
All requirements have implementing code entities
```

### 3. Test KG Connectivity

```typescript
const testResult = await verifyTestKGConnectivity(projectRoot, 'add-user-auth');

console.log(`Requirements with tests: ${testResult.requirementsWithTests}/${testResult.totalRequirements}`);

for (const req of testResult.untestedRequirements) {
  console.log(`${req.reqName} lacks test coverage`);
}
```

Output:
```
Requirements with tests: 6/8
- Validate user credentials lacks test coverage
- Generate JWT token lacks test coverage
```

### 4. Cross-Verification with Actual Code

```typescript
const codeFiles = ['src/auth/validate-credentials.ts', 'src/auth/jwt.ts'];
const crossResult = await crossVerifyKGWithCode(projectRoot, 'add-user-auth', codeFiles);

for (const disc of crossResult.discrepancies) {
  console.log(`Discrepancy: ${disc.issue} (${disc.entityName})`);
  console.log(`  KG: ${disc.kgRelationship}`);
  console.log(`  Code: ${disc.codeEvidence}`);
}
```

Output:
```
Discrepancy: KG line count significantly differs from actual file (validate-credentials.ts)
  KG: 50 lines
  Code: 65 lines
```

## KG Query Examples

### Find Implementation Gaps

```typescript
// Find requirements without implementing code
const uncovered = await verifyRequirementKGConnectivity(projectRoot, 'add-user-auth');

for (const req of uncovered.uncoveredRequirements) {
  console.log(`Requirement ${req.reqName} needs implementation`);
}
```

### Analyze Implementation Patterns

```typescript
// Get all implementation events
const events = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'ImplementationEvent',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalTime = 0;
let totalLines = 0;

for (const event of events.entities) {
  totalTime += event.duration || 0;
  totalLines += event.metadata.linesAdded || 0;
}

console.log(`Total implementation time: ${totalTime / 3600000} hours`);
console.log(`Average speed: ${totalLines / (totalTime / 3600000)} lines/hour`);
```

### Check Test Coverage via KG

```typescript
// Find requirements without test coverage
const untested = await verifyTestKGConnectivity(projectRoot, 'add-user-auth');

for (const req of untested.untestedRequirements) {
  console.log(`Consider adding tests for: ${req.reqName}`);
}
```

## Implementation Verification Patterns

### 1. TDD Pattern Verification

```typescript
// Verify TDD was properly tracked
const tddEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TDDEvent',
    properties: { changeId: 'add-user-auth' }
  }
});

console.log(`TDD cycles recorded: ${tddEvents.entities.length}`);
for (const event of tddEvents.entities) {
  console.log(`- ${event.metadata.cycle} cycle: ${event.duration}ms`);
}
```

### 2. Direct Implementation Pattern

```typescript
// Verify direct implementation tracking
const implEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'ImplementationEvent',
    properties: { 
      changeId: 'add-user-auth',
      'metadata.implementationMethod': 'direct'
    }
  }
});

console.log(`Direct implementations: ${implEvents.entities.length}`);
```

### 3. Code Complexity Tracking

```typescript
// Analyze code complexity trends
const codeEntities = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'CodeFile',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalComplexity = 0;
for (const code of codeEntities.entities) {
  totalComplexity += code.complexity || 0;
}

console.log(`Total code complexity: ${totalComplexity}`);
console.log(`Average complexity: ${totalComplexity / codeEntities.entities.length}`);
```

## Benefits of KG Verification

1. **Objective Metrics** - KG provides structured, queryable verification data
2. **Automatic Discovery** - KG reveals implementation patterns not visible in files
3. **Relationship Validation** - Ensures all traceability links are maintained
4. **Implementation Audit** - Complete record of what was implemented
5. **Gap Detection** - Easily find missing implementations or coverage
6. **Cross-Validation** - Ensures KG matches reality

## Error Handling

If KG operations fail:
- Falls back to standard verification
- Provides clear error messages
- Suggests KG re-initialization if needed
- Continues with available data

## Performance Optimization

- Batch KG queries when possible
- Cache frequently accessed entities
- Limit verification to changed files
- Provide progress indicators for large changes

The KG-integrated verify command ensures that your implementation is not only complete and correct but also properly tracked and connected in the Knowledge Graph, providing a complete audit trail of your development process.