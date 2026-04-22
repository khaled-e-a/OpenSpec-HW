# Knowledge Graph Tool Integration

This document explains how synspec commands use tool calls to interact with the Knowledge Graph, ensuring deterministic behavior and proper tool usage patterns.

## Overview

All KG interactions in synspec commands go through a standardized tool interface that provides:

- **Deterministic behavior**: Each tool call has clear inputs and outputs
- **Error handling**: Consistent error reporting and recovery
- **Validation**: Automatic validation against the KG schema
- **Traceability**: All operations are logged and traceable
- **Persistence**: Automatic state management

## Tool Interface

### Creating a Tool Interface

```typescript
import { createKGToolInterface } from '../core/kg/tool-interface.js';

// Create interface for current project
const kgInterface = createKGToolInterface(projectRoot);
```

### Available Tools

#### `kg:init`
Initialize KG for a project.
```typescript
const result = await kgInterface.execute('kg:init', {
  type: 'file',
  schema: 'spec-driven',
  forceRecreate: false
});
// Returns: { success, clientId, kgPath, message }
```

#### `kg:create-entity`
Create a single entity.
```typescript
const result = await kgInterface.execute('kg:create-entity', {
  entity: {
    id: 'req-001',
    type: 'Requirement',
    name: 'User login',
    requirementType: 'added',
    shallStatement: 'The system SHALL authenticate users'
  }
});
// Returns: { success, entityId, entity, error }
```

#### `kg:create-entities`
Create multiple entities.
```typescript
const result = await kgInterface.execute('kg:create-entities', {
  entities: [entity1, entity2, entity3]
});
// Returns: { success, created, errors, entityIds }
```

#### `kg:create-relationship`
Create a relationship between entities.
```typescript
const result = await kgInterface.execute('kg:create-relationship', {
  sourceId: 'change-123',
  relationshipType: 'hasArtifact',
  targetId: 'spec-001',
  properties: { role: 'primary' }
});
// Returns: { success, error }
```

#### `kg:query`
Query entities with filters.
```typescript
const result = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Requirement',
    properties: { changeId: 'change-123' }
  },
  limit: 50
});
// Returns: { success, entities, count, error }
```

#### `kg:get-entity`
Get a single entity by ID.
```typescript
const result = await kgInterface.execute('kg:get-entity', {
  entityId: 'req-001',
  entityType: 'Requirement'
});
// Returns: { success, entity, error }
```

#### `kg:get-change-traceability`
Get complete traceability for a change.
```typescript
const result = await kgInterface.execute('kg:get-change-traceability', {
  changeId: 'change-123'
});
// Returns: { success, traceability, error }
// traceability includes: useCaseSteps, requirements, testCases, codeFiles, coverage
```

#### `kg:persist`
Save KG state to disk.
```typescript
const result = await kgInterface.execute('kg:persist', {});
// Returns: { success, kgPath, error }
```

#### `kg:validate-entity`
Validate an entity against schema.
```typescript
const result = await kgInterface.execute('kg:validate-entity', {
  entity: entityData,
  entityType: 'Requirement'
});
// Returns: { success, isValid, errors, warnings }
```

## High-Level Operations

### Creating a Change with KG

The tool interface provides a high-level method for creating a complete change:

```typescript
const result = await kgInterface.createChange({
  id: 'add-auth',
  name: 'Add user authentication',
  schema: 'spec-driven',
  description: 'Add login functionality to the app'
});

// This creates:
// - Change entity
// - All schema-specific artifacts
// - All relationships
// - Persists to disk
```

### Example: Command Implementation

Here's how the `synspec:new` command uses the tool interface:

```typescript
export async function newChangeCommand(name: string, options: NewChangeOptions): Promise<void> {
  // 1. Create KG interface
  const kgInterface = createKGToolInterface(projectRoot);
  
  // 2. Initialize KG
  await kgInterface.execute('kg:init', {
    type: 'file',
    schema: options.schema
  });
  
  // 3. Create change with all artifacts
  const result = await kgInterface.createChange({
    id: name,
    name: name,
    schema: result.schema,
    description: options.description
  });
  
  // 4. Persist changes
  await kgInterface.execute('kg:persist', {});
}
```

## Error Handling

All tools return consistent error handling:

```typescript
const result = await kgInterface.execute('kg:create-entity', {
  entity: invalidEntity
});

if (!result.success) {
  console.error('KG operation failed:', result.error);
  // Handle error appropriately
  // Could retry, fallback, or abort
}
```

## Best Practices

### 1. Always Check Success
```typescript
const result = await kgInterface.execute('kg:some-tool', params);
if (!result.success) {
  // Handle error
}
```

### 2. Use Bulk Operations When Possible
```typescript
// Good: Single bulk operation
await kgInterface.execute('kg:create-entities', {
  entities: [entity1, entity2, entity3]
});

// Avoid: Multiple individual operations
await kgInterface.execute('kg:create-entity', { entity: entity1 });
await kgInterface.execute('kg:create-entity', { entity: entity2 });
await kgInterface.execute('kg:create-entity', { entity: entity3 });
```

### 3. Validate Before Creating
```typescript
const validation = await kgInterface.execute('kg:validate-entity', {
  entity: entityData,
  entityType: 'Requirement'
});

if (validation.isValid) {
  await kgInterface.execute('kg:create-entity', { entity: entityData });
}
```

### 4. Handle KG Not Available Gracefully
```typescript
const kgInterface = createKGToolInterface(projectRoot);
const kgSummary = await kgInterface.execute('kg:get-summary', {});

if (!kgSummary.summary?.enabled) {
  console.log('KG not available, continuing without traceability...');
  // Continue with non-KG implementation
  return;
}
```

### 5. Persist After Batch Operations
```typescript
// Create multiple entities
await kgInterface.execute('kg:create-entities', { entities: entities });

// Create relationships
for (const rel of relationships) {
  await kgInterface.execute('kg:create-relationship', rel);
}

// Persist all changes
await kgInterface.execute('kg:persist', {});
```

## Deterministic Behavior

The tool interface ensures deterministic behavior by:

1. **Immutable Operations**: Each tool call is independent
2. **Clear Inputs/Outputs**: No hidden state or side effects
3. **Validation**: All inputs are validated before processing
4. **Error Recovery**: Clear error messages for troubleshooting
5. **Idempotency**: Safe to retry failed operations

## Testing with Tools

When testing commands that use KG:

```typescript
// Mock the tool interface
const mockKGInterface = {
  execute: jest.fn(),
  createChange: jest.fn()
};

// Test command behavior
mockKGInterface.execute.mockResolvedValue({
  success: true,
  entities: [mockEntity]
});

// Verify tool calls
expect(mockKGInterface.execute).toHaveBeenCalledWith('kg:create-entity', {
  entity: expect.objectContaining({
    id: 'test-entity',
    type: 'TestCase'
  })
});
```

## Migration Guide

To migrate existing commands to use tool calls:

1. Replace direct KG client usage with tool interface
2. Wrap operations in tool calls
3. Add proper error handling
4. Test with both KG enabled and disabled
5. Update documentation

Example migration:
```typescript
// Before: Direct client usage
const kg = await getKGClient(projectRoot);
await kg.create(entity);

// After: Tool interface
const kgInterface = createKGToolInterface(projectRoot);
await kgInterface.execute('kg:create-entity', { entity });
```