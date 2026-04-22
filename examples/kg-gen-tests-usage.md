# KG-Integrated Gen Tests Usage

This demonstrates how the enhanced `synspec:gen-tests-kg` command works with the Knowledge Graph to intelligently generate tests and maintain complete test traceability.

## Overview

The KG-integrated gen-tests command provides:
- Intelligent test generation based on KG relationships
- Automatic tracking of all tests as KG entities
- Complete test-to-specification traceability
- Smart test discovery using KG relationships

## Example Workflow

### 1. Initial State After Implementation

After running implementation commands:

```bash
$ synspec:tdd-kg add-user-auth
$ synspec:apply-kg add-user-auth

📊 KG: 45 entities, 78 relationships, 100% coverage
```

### 2. Start Test Generation with KG

```bash
$ synspec:gen-tests-kg add-user-auth

📊 KG: 45 entities, 78 relationships, 100% coverage

## Gen Tests: add-user-auth (schema: spec-driven)

KG Coverage: 75% (6/8 requirements tested)
Existing tests: 12 KG entities found

Querying KG for test generation...
```

### 3. KG Queries for Test Discovery

The command queries KG to understand the testing landscape:

```typescript
// Query existing tests from KG
const existingTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { changeId: 'add-user-auth' }
  }
});

console.log(`Found ${existingTests.entities.length} test entities in KG`);

// Query code entities to understand what needs testing
const codeFiles = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'CodeFile',
    properties: { changeId: 'add-user-auth' }
  }
});

console.log(`Found ${codeFiles.entities.length} code entities to test`);
```

### 4. Intelligent Test Generation Based on KG

For each uncovered requirement, the command creates KG entities:

```typescript
// For requirement UC1-S1: "User navigates to login page"
const testEntity = {
  id: 'add-user-auth-test-uc1-s1-123456789',
  type: 'TestCase',
  name: 'Test: User navigates to login page',
  framework: 'vitest',
  testType: 'unit',
  isFailing: true,
  filePath: 'src/__tests__/auth/login-navigation.test.ts',
  changeId: 'add-user-auth',
  createdAt: new Date(),
  status: 'active'
};

const testResult = await kgInterface.execute('kg:create-entity', {
  entity: testEntity
});

// Link test to requirement
await kgInterface.execute('kg:create-relationship', {
  sourceId: testResult.entityId,
  relationshipType: 'tests',
  targetId: 'add-user-auth-uc1-s1',
  properties: {
    testType: 'unit',
    coversRequirement: true,
    createdAt: new Date()
  }
});

// Create test generation event
const testEvent: types.Event = {
  id: 'test-gen-add-user-auth-uc1-s1-123456789',
  type: 'TestGenerationEvent',
  timestamp: new Date(),
  type: 'test_generation',
  outcome: 'success',
  metadata: {
    requirementId: 'uc1-s1',
    testType: 'unit',
    framework: 'vitest',
    generatedAt: new Date()
  }
};

await kgInterface.execute('kg:create-entity', {
  entity: testEvent
});
```

### 5. KG-Enhanced Test Mapping

The spec-tests.md file includes KG information:

```markdown
# Spec-Test Mapping: add-user-auth
Generated: 2024-01-20

## KG Test Entities
| Test ID | Name | Type | Status | KG Entity ID |
|---------|------|------|--------|--------------|
| add-user-auth-test-uc1-s1-123456789 | Test: User navigates to login page | unit | active | add-user-auth-test-uc1-s1-123456789 |
| add-user-auth-test-uc1-s2-123456790 | Test: System displays login form | unit | active | add-user-auth-test-uc1-s2-123456790 |

## Requirement Traceability Matrix
| ID | Requirement | Type | Test Type | Test Case | Status | KG Entity ID |
|----|-------------|------|-----------|-----------|--------|--------------|
| UC1-S1 | User navigates to login page | Step | unit | src/__tests__/auth/login-navigation.test.ts:10 | ✅ | add-user-auth-test-uc1-s1-123456789 |
| UC1-S2 | System displays login form | Step | unit | src/__tests__/auth/login-form.test.ts:15 | ✅ | add-user-auth-test-uc1-s2-123456790 |

## KG Test Coverage
| Requirement | Test Entities | Coverage |
|-------------|---------------|----------|
| User navigates to login page | 1 | ✅ |
| System displays login form | 1 | ✅ |
```

### 6. Test Generation with KG Tracking

For each test, the command:

1. **Creates KG test entity** with full metadata
2. **Links to requirements** via KG relationships
3. **Records generation event** for audit trail
4. **Updates KG with final metrics**

```typescript
// After test implementation
await kgInterface.execute('kg:update', {
  id: testEntity.id,
  updates: {
    status: 'active',
    isFailing: false,
    assertionsCount: 5,
    filePath: 'src/__tests__/auth/login-navigation.test.ts'
  }
});

// Update requirement coverage
await kgInterface.execute('kg:update', {
  id: 'add-user-auth-uc1-s1',
  updates: {
    testCoverage: 100,
    testedBy: testEntity.id
  }
});
```

### 7. Property-Based Test Generation with KG

```typescript
// For PBT scenarios
const pbtEntity = {
  id: 'add-user-auth-pbt-uc1-s1-123456790',
  type: 'TestCase',
  name: 'PBT: Login form always shows valid widgets',
  framework: 'fast-check',
  testType: 'pbt',
  isFailing: false,
  filePath: 'test/auth/login-form.property.test.ts',
  changeId: 'add-user-auth',
  createdAt: new Date(),
  status: 'active'
};

await kgInterface.execute('kg:create-entity', {
  entity: pbtEntity
});

// Create PBT generation event
const pbtEvent: types.Event = {
  id: 'pbt-gen-add-user-auth-uc1-s1-123456790',
  type: 'PBTGenerationEvent',
  timestamp: new Date(),
  type: 'pbt_generation',
  outcome: 'success',
  metadata: {
    scenarioId: 'uc1-s1',
    framework: 'fast-check',
    generatedAt: new Date()
  }
};

await kgInterface.execute('kg:create-entity', {
  entity: pbtEvent
});
```

### 8. Final KG Updates and Summary

```typescript
// Persist all changes
await kgInterface.execute('kg:persist', {});

// Generate summary with KG metrics
const summary = {
  totalTests: 18,
  kgEntitiesCreated: 18,
  kgRelationshipsCreated: 36,
  pbtTestsGenerated: 6,
  coverage: 100
};

return summary;
```

## KG Query Examples After Generation

### Find Untested Requirements

```typescript
// Find requirements without test coverage
const untested = await verifyTestKGConnectivity(projectRoot, 'add-user-auth');

for (const req of untested.untestedRequirements) {
  console.log(`Consider adding tests for: ${req.reqName}`);
}
```

### Get All Tests for a Requirement

```typescript
// Get all tests that test a specific requirement
const reqTests = await kgInterface.execute('kg:get-relationships', {
  entityId: 'add-user-auth-req-1',
  direction: 'in',
  relationshipTypes: ['tests']
});

console.log(`Requirement has ${reqTests.length} tests`);
for (const test of reqTests) {
  console.log(`- ${test.target.name} (${test.target.testType})`);
}
```

### Analyze Test Generation Patterns

```typescript
// Get all test generation events
const genEvents = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestGenerationEvent',
    properties: { changeId: 'add-user-auth' }
  }
});

let totalTests = 0;
for (const event of genEvents.entities) {
  totalTests += event.metadata.testCount || 0;
}

console.log(`Generated ${totalTests} tests via KG events`);
```

### Find PBT Tests

```typescript
// Find all property-based tests
const pbtTests = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'TestCase',
    properties: { testType: 'pbt' }
  }
});

console.log(`Found ${pbtTests.entities.length} PBT tests`);
for (const test of pbtTests.entities) {
  console.log(`- ${test.name} (${test.framework})`);
}
```

## Benefits of KG Integration

1. **Intelligent Test Generation** - Uses KG to understand what needs testing
2. **Complete Traceability** - All tests tracked as KG entities with relationships
3. **Automatic Discovery** - Finds existing tests via KG relationships
4. **Enhanced Mapping** - KG provides structured test-to-spec mapping
5. **Implementation-Aware** - Considers actual code entities when generating tests
6. **Audit Trail** - Complete record of test generation process

## Error Handling

If KG operations fail:
- Falls back to standard test generation
- Provides clear error messages
- Suggests KG re-initialization if needed
- Continues with available data

## Performance Optimization

- Batch KG operations when possible
- Cache frequently accessed entities
- Limit queries to relevant entities
- Provide progress indicators for large test suites

This comprehensive KG integration ensures that test generation is intelligent, traceable, and fully integrated with the Knowledge Graph, providing valuable insights into test coverage and test-to-specification relationships.