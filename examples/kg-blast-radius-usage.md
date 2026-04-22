# KG-Enhanced Blast Radius Analysis Usage

This demonstrates how the enhanced `synspec:verify-kg` blast radius analysis works with KG traversal to find specs affected by code changes.

## Overview

The enhanced blast radius analysis provides:
- Git-based change detection (original approach)
- KG relationship traversal to find affected specs
- Comprehensive impact analysis with confidence scores
- Complete traceability from code to specs via KG

## Example Workflow

### 1. Initial State

After implementation with KG tracking:

```bash
$ synspec:verify-kg add-user-auth

📊 KG: 63 entities, 102 relationships, 100% coverage

## Verify: add-user-auth (schema: spec-driven)

KG Coverage: 100% (8/8 requirements tested)
KG Test entities: 18
KG Code entities: 12

Starting verification with KG integration...
```

### 2. KG Blast Radius Analysis

The command performs enhanced analysis:

```typescript
// Get changed files via git diff
const changedFiles = ['src/auth/login.ts', 'src/auth/jwt.ts', 'src/auth/validate-credentials.ts'];

// Run KG blast radius analysis
const blastRadiusResult = await analyzeBlastRadiusViaKG(
  projectRoot,
  'add-user-auth',
  changedFiles
);
```

### 3. KG Traversal Process

The analysis performs:

1. **Find code entities for changed files**:
```typescript
const codeEntities = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'CodeFile',
    properties: { filePath: 'src/auth/login.ts' }
  }
});
// Returns: { id: 'add-user-auth-code-login', filePath: 'src/auth/login.ts', ... }
```

2. **Traverse KG relationships to find specs**:
```typescript
// Traverse from code entities to find specs
const impacts = await traverseKGToSpecs(kgInterface, codeEntities, 'add-user-auth');

// Returns impacts like:
{
  specId: 'add-user-auth-specs',
  specName: 'User Authentication',
  specPath: 'synergyspec/specs/user-auth/spec.md',
  impactPath: [
    { from: 'src/auth/login.ts', to: 'add-user-auth-code-login', relationship: 'implements', confidence: 1.0 },
    { from: 'add-user-auth-code-login', to: 'add-user-auth-req-1', relationship: 'implements', confidence: 0.9 },
    { from: 'add-user-auth-req-1', to: 'add-user-auth-specs', relationship: 'hasRequirement', confidence: 0.8 }
  ],
  impactType: 'direct',
  confidence: 0.9
}
```

### 4. Comprehensive Impact Analysis

The analysis provides detailed insights:

```
### KG Blast Radius Analysis

### Summary
- Total specs found: 3
- Direct impacts: 2
- Indirect impacts: 1
- Overall confidence: 87.5%

### Impacted Specifications

### Direct Impacts (High Confidence)
- **User Authentication** (synergyspec/specs/user-auth/spec.md)
  - Confidence: 90%
  - Impact path: implements → implements → hasRequirement
- **Session Management** (synergyspec/specs/session/spec.md)
  - Confidence: 85%
  - Impact path: implements → tests → hasRequirement

### Indirect Impacts (Medium Confidence)
- **Error Handling** (synergyspec/specs/error-handling/spec.md)
  - Confidence: 75%
  - Impact path: implements → implements → hasRequirement

### Impact Graph
| From | To | Relationship | Confidence |
|------|----|--------------|------------|
| src/auth/login.ts | add-user-auth-code-login | implements | 100% |
| add-user-auth-code-login | add-user-auth-req-1 | implements | 90% |
| add-user-auth-req-1 | add-user-auth-specs | hasRequirement | 80% |

### Analysis
- KG traversal confidence: 87.5%
- Total impact paths found: 6
- Average path confidence: 85.0%

### Issues
- info: Some relationships have medium confidence
```

## KG Query Examples

### Find Impacted Specs via KG

```typescript
// Find all specs affected by a specific code change
const impacts = await analyzeBlastRadiusViaKG(
  projectRoot,
  'add-user-auth',
  ['src/auth/login.ts']
);

for (const impact of impacts.impactedSpecs) {
  console.log(`Spec affected: ${impact.specName} (${impact.impactType})`);
}
```

### Analyze Impact Paths

```typescript
// Get detailed impact paths
const result = await analyzeBlastRadiusViaKG(
  projectRoot,
  'add-user-auth',
  changedFiles
);

for (const edge of result.impactGraph) {
  console.log(`${edge.from} → ${edge.to} via ${edge.relationship}`);
}
```

### Find Specs Without KG Coverage

```typescript
// Find specs that might be affected but aren't in KG
const specs = await kgInterface.execute('kg:query', {
  query: {
    entityType: 'Spec',
    properties: { changeId: 'add-user-auth' }
  }
});

const specsWithoutCode = specs.entities.filter(spec => {
  const implementations = await kgInterface.execute('kg:get-relationships', {
    entityId: spec.id,
    direction: 'in',
    relationshipTypes: ['implements', 'tests']
  });
  return implementations.length === 0;
});
```

## Benefits of KG-Enhanced Blast Radius

1. **Relationship-Based Discovery** - Finds specs through KG relationships, not just file paths
2. **Complete Traceability** - Shows full path from code to specs via KG
3. **Confidence Scoring** - Provides confidence levels for each impact
4. **Impact Graph Visualization** - Shows how changes propagate through the system
5. **Intelligent Analysis** - Considers both direct and indirect impacts
6. **KG-Aware Recommendations** - Provides KG-specific suggestions for investigation

## Integration with Verification

The KG blast radius analysis is seamlessly integrated into the `synspec:verify-kg` command:

1. **Automatic Execution** - Runs automatically during verification
2. **Enhanced Reporting** - Provides KG-specific insights in the final report
3. **Fallback Support** - Falls back to standard analysis if KG is unavailable
4. **Complete Integration** - Works seamlessly with all other KG features

This comprehensive enhancement ensures that blast radius analysis is both accurate and intelligent, leveraging the full power of the Knowledge Graph relationship graph.