# KG Verification Integration Example

This example shows how to integrate KG verification into synspec commands and workflows.

## Basic Usage

```typescript
import { verifyKGConnectivity } from '../core/kg/verify-utils.js';
import { createKGToolInterface } from '../core/kg/tool-interface.js';

// Verify KG connectivity for a change
const result = await verifyKGConnectivity(projectRoot, 'add-user-auth', {
  autoFix: true,
  verbose: true
});

console.log('Verification complete:', result.success);
console.log('Issues found:', result.issues.length);
console.log('Issues fixed:', result.fixed);
console.log('Coverage:', result.report.finalState?.coverage);
```

## Integration in Commands

### Example: Enhancing synspec:apply

```typescript
async function applyCommandWithKGVerification(changeName: string): Promise<void> {
  const kgInterface = createKGToolInterface(projectRoot);
  
  // 1. Run KG verification before implementation
  console.log('Verifying KG connectivity before implementation...');
  const verifyResult = await verifyKGConnectivity(projectRoot, changeName, {
    autoFix: true
  });
  
  if (!verifyResult.success) {
    console.error('KG verification failed:', verifyResult.issues[0]?.message);
    return;
  }
  
  if (verifyResult.issues.length > 0) {
    console.log(`Found ${verifyResult.issues.length} KG issues, ${verifyResult.fixed} auto-fixed`);
  }
  
  // 2. Proceed with implementation
  console.log('KG verification passed, proceeding with implementation...');
  // ... rest of apply logic
}
```

### Example: Pre-commit Hook

```typescript
// .synergyspec/pre-apply.js
export async function preApply(changeName: string): Promise<boolean> {
  const kgInterface = createKGToolInterface(projectRoot);
  
  // Verify KG before allowing implementation
  const result = await verifyKGConnectivity(projectRoot, changeName, {
    autoFix: true
  });
  
  if (!result.success) {
    console.error('❌ KG verification failed');
    return false;
  }
  
  if (result.issues.length > 0) {
    console.log(`⚠️  KG has ${result.issues.length} issues, ${result.fixed} fixed`);
  }
  
  console.log('✅ KG verification passed');
  return true;
}
```

## Custom Verification Rules

### Adding Custom Checks

```typescript
async function customKGVerification(
  projectRoot: string,
  changeId: string
): Promise<KGVerificationIssue[]> {
  const kgInterface = createKGToolInterface(projectRoot);
  const issues: KGVerificationIssue[] = [];
  
  // Custom check: Ensure all requirements have at least one test
  const requirements = await kgInterface.execute('kg:query', {
    query: {
      entityType: 'Requirement',
      properties: { changeId }
    }
  });
  
  for (const req of requirements.entities) {
    const tests = await kgInterface.execute('kg:get-relationships', {
      entityId: req.id,
      direction: 'in',
      relationshipTypes: ['tests']
    });
    
    if (tests.length === 0) {
      issues.push({
        type: 'missing-relationship',
        severity: 'warning',
        message: `Requirement ${req.name} has no tests`,
        entityId: req.id,
        autoFixable: false
      });
    }
  }
  
  // Custom check: Ensure design decisions have rationale
  const designDecisions = await kgInterface.execute('kg:query', {
    query: {
      entityType: 'DesignDecision',
      properties: { changeId }
    }
  });
  
  for (const decision of designDecisions.entities) {
    if (!decision.rationale || decision.rationale.length < 50) {
      issues.push({
        type: 'incomplete-entity',
        severity: 'info',
        message: `Design decision ${decision.name} lacks detailed rationale`,
        entityId: decision.id,
        autoFixable: false
      });
    }
  }
  
  return issues;
}
```

### Integration with Verification

```typescript
async function enhancedKGVerification(
  projectRoot: string,
  changeId: string
): Promise<KGVerificationReport> {
  // Run standard verification
  const standardResult = await verifyKGConnectivity(projectRoot, changeId, {
    autoFix: true
  });
  
  // Run custom checks
  const customIssues = await customKGVerification(projectRoot, changeId);
  
  // Combine results
  const allIssues = [...standardResult.issues, ...customIssues];
  
  return {
    ...standardResult,
    issues: allIssues,
    report: {
      ...standardResult.report,
      custom: {
        untestedRequirements: customIssues.filter(i => i.message.includes('no tests')).length,
        incompleteDecisions: customIssues.filter(i => i.message.includes('lacks rationale')).length
      }
    }
  };
}
```

## Reporting and Analytics

### Generate Verification Report

```typescript
async function generateVerificationReport(
  projectRoot: string,
  changeId: string
): Promise<string> {
  const result = await verifyKGConnectivity(projectRoot, changeId, {
    autoFix: true,
    verbose: false
  });
  
  let report = `# KG Verification Report: ${changeId}\n\n`;
  report += `Date: ${result.report.timestamp.toISOString()}\n\n`;
  
  report += `## Summary\n`;
  report += `- Total entities: ${result.report.finalState?.totalEntities || 0}\n`;
  report += `- Total relationships: ${result.report.finalState?.totalRelationships || 0}\n`;
  report += `- Coverage: ${result.report.finalState?.coverage || 0}%\n`;
  report += `- Issues found: ${result.issues.length}\n`;
  report += `- Issues fixed: ${result.fixed}\n\n`;
  
  if (result.issues.length > 0) {
    report += `## Issues\n`;
    for (const issue of result.issues) {
      report += `- ${issue.severity}: ${issue.message}\n`;
    }
  }
  
  return report;
}
```

### Trend Analysis

```typescript
async function analyzeVerificationTrends(
  projectRoot: string,
  changeIds: string[]
): Promise<{
  trends: VerificationTrend[];
  summary: VerificationSummary;
}> {
  const trends: VerificationTrend[] = [];
  
  for (const changeId of changeIds) {
    const result = await verifyKGConnectivity(projectRoot, changeId);
    trends.push({
      changeId,
      date: result.report.timestamp,
      coverage: result.report.finalState?.coverage || 0,
      entities: result.report.finalState?.totalEntities || 0,
      relationships: result.report.finalState?.totalRelationships || 0,
      issues: result.issues.length,
      fixed: result.fixed
    });
  }
  
  const summary: VerificationSummary = {
    averageCoverage: trends.reduce((sum, t) => sum + t.coverage, 0) / trends.length,
    averageIssues: trends.reduce((sum, t) => sum + t.issues, 0) / trends.length,
    trend: trends[trends.length - 1].coverage - trends[0].coverage,
    recommendations: generateRecommendations(trends)
  };
  
  return { trends, summary };
}
```

## Error Handling and Recovery

### Graceful Degradation

```typescript
async function robustKGVerification(
  projectRoot: string,
  changeId: string
): Promise<KGVerificationReport> {
  try {
    // Try full KG verification
    return await verifyKGConnectivity(projectRoot, changeId, {
      autoFix: true
    });
  } catch (error) {
    console.warn('KG verification failed, falling back to basic check:', error.message);
    
    // Fall back to basic existence check
    const kgInterface = createKGToolInterface(projectRoot);
    const summary = await kgInterface.execute('kg:get-summary', {});
    
    if (!summary.success || !summary.summary?.enabled) {
      return createFallbackReport(changeId, 'KG not available');
    }
    
    return createFallbackReport(changeId, 'KG verification failed');
  }
}
```

### Retry Logic

```typescript
async function verifyWithRetry(
  projectRoot: string,
  changeId: string,
  maxRetries = 3
): Promise<KGVerificationReport> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await verifyKGConnectivity(projectRoot, changeId, {
        autoFix: attempt === maxRetries // Only auto-fix on final attempt
      });
      
      if (result.success) {
        return result;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      
    } catch (error) {
      lastError = error;
      console.warn(`Verification attempt ${attempt} failed:`, error.message);
    }
  }
  
  throw lastError || new Error('Verification failed after all retries');
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: KG Verification

on:
  pull_request:
    paths:
      - 'synergyspec/changes/**'

jobs:
  verify-kg:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Verify KG for changed changes
        run: |
          # Get list of changed changes
          CHANGES=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} | \
                   grep -o 'synergyspec/changes/[^/]*' | \
                   sed 's|synergyspec/changes/||' | \
                   sort -u)
          
          for change in $CHANGES; do
            echo "Verifying KG for change: $change"
            npx ts-node scripts/verify-kg.ts "$change"
          done
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Verify KG for any staged changes
STAGED_CHANGES=$(git diff --cached --name-only | grep -o 'synergyspec/changes/[^/]*' | sed 's|synergyspec/changes/||' | sort -u)

for change in $STAGED_CHANGES; do
  echo "Verifying KG for change: $change"
  if ! node scripts/verify-kg.js "$change"; then
    echo "❌ KG verification failed for $change"
    exit 1
  fi
done
```

This comprehensive approach ensures KG verification is integrated throughout the development workflow, providing continuous validation of traceability and connectivity.