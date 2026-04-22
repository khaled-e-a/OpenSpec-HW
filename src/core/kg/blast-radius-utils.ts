/**
 * Knowledge Graph Blast Radius Analysis Utilities
 *
 * Helper functions for analyzing blast radius using KG relationships
 * to find specs affected by code changes
 */

import { createKGToolInterface } from './tool-interface.js';

/**
 * Analyze blast radius using KG relationships
 *
 * Finds specs affected by code changes through KG relationships
 */
export async function analyzeBlastRadiusViaKG(
  projectRoot: string,
  changeId: string,
  changedFiles: string[]
): Promise<{
  success: boolean;
  impactedSpecs: Array<{
    specId: string;
    specName: string;
    specPath: string;
    impactPath: string[];
    impactType: 'direct' | 'indirect' | 'relationship';
    confidence: number;
  }>;
  impactGraph: Array<{
    from: string;
    to: string;
    relationship: string;
    confidence: number;
  }>;
  analysis: {
    totalSpecsFound: number;
    directImpacts: number;
    indirectImpacts: number;
    confidenceScore: number;
  };
  issues: Array<{
    type: 'warning' | 'info';
    message: string;
    files?: string[];
  }>;
}> {
  const kgInterface = createKGToolInterface(projectRoot);
  const impactedSpecs: Array<any> = [];
  const impactGraph: Array<any> = [];
  const issues: Array<any> = [];

  try {
    // 1. Find code entities that correspond to changed files
    const codeEntities = await findCodeEntitiesForFiles(kgInterface, changedFiles);

    if (codeEntities.length === 0) {
      issues.push({
        type: 'info',
        message: 'No code entities found in KG for changed files - blast radius limited to git-based analysis'
      });
    }

    // 2. Traverse KG relationships from code entities to find specs
    const specImpacts = await traverseKGToSpecs(kgInterface, codeEntities, changeId);

    // 3. Build impact graph showing the path from code to specs
    for (const impact of specImpacts) {
      impactedSpecs.push(impact);

      // Build impact graph edges
      for (const step of impact.impactPath) {
        if (step.from && step.to && step.relationship) {
          impactGraph.push({
            from: step.from,
            to: step.to,
            relationship: step.relationship,
            confidence: step.confidence || 0.8
          });
        }
      }
    }

    // 4. Calculate analysis metrics
    const analysis = {
      totalSpecsFound: impactedSpecs.length,
      directImpacts: impactedSpecs.filter(s => s.impactType === 'direct').length,
      indirectImpacts: impactedSpecs.filter(s => s.impactType === 'indirect').length,
      confidenceScore: calculateConfidenceScore(impactedSpecs)
    };

    return {
      success: true,
      impactedSpecs,
      impactGraph,
      analysis,
      issues
    };

  } catch (error) {
    return {
      success: false,
      impactedSpecs: [],
      impactGraph: [],
      analysis: {
        totalSpecsFound: 0,
        directImpacts: 0,
        indirectImpacts: 0,
        confidenceScore: 0
      },
      issues: [{
        type: 'warning',
        message: `KG blast radius analysis failed: ${error.message}`
      }]
    };
  }
}

/**
 * Find code entities in KG that correspond to changed files
 */
async function findCodeEntitiesForFiles(
  kgInterface: any,
  changedFiles: string[]
): Promise<Array<{
  entityId: string;
  filePath: string;
  entityType: string;
  confidence: number;
}>> {
  const entities: Array<any> = [];

  for (const file of changedFiles) {
    try {
      // Query for code entities with matching file paths
      const result = await kgInterface.execute('kg:query', {
        query: {
          entityType: 'CodeFile',
          properties: { filePath: file }
        }
      });

      if (result.success && result.entities.length > 0) {
        // Direct match found
        for (const entity of result.entities) {
          entities.push({
            entityId: entity.id,
            filePath: entity.filePath,
            entityType: entity.type,
            confidence: 1.0
          });
        }
      } else {
        // Try fuzzy matching on file path
        const fuzzyResult = await kgInterface.execute('kg:query', {
          query: {
            entityType: 'CodeFile',
            properties: { filePath: { $regex: file.replace(/\.(ts|js|py|java|go)$/, '') } }
          }
        });

        if (fuzzyResult.success && fuzzyResult.entities.length > 0) {
          for (const entity of fuzzyResult.entities) {
            entities.push({
              entityId: entity.id,
              filePath: entity.filePath,
              entityType: entity.type,
              confidence: 0.8
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to find KG entity for file ${file}:`, error.message);
    }
  }

  return entities;
}

/**
 * Traverse KG from code entities to find specs
 */
async function traverseKGToSpecs(
  kgInterface: any,
  codeEntities: Array<any>,
  changeId: string
): Promise<Array<{
  specId: string;
  specName: string;
  specPath: string;
  impactPath: Array<{
    from: string;
    to: string;
    relationship: string;
    confidence: number;
  }>;
  impactType: 'direct' | 'indirect' | 'relationship';
  confidence: number;
}>> {
  const impacts: Array<any> = [];
  const visited = new Set<string>();

  for (const codeEntity of codeEntities) {
    // BFS traversal from code entity to find specs
    const queue = [{
      entityId: codeEntity.entityId,
      entityType: codeEntity.entityType,
      path: [{
        from: codeEntity.filePath,
        to: codeEntity.entityId,
        relationship: 'implements',
        confidence: codeEntity.confidence
      }],
      depth: 0
    }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current.entityId)) continue;
      visited.add(current.entityId);

      // Get relationships from current entity
      const relationships = await kgInterface.execute('kg:get-relationships', {
        entityId: current.entityId,
        direction: 'out'
      });

      for (const rel of relationships) {
        const targetEntity = rel.target;

        // Check if target is a spec entity
        if (targetEntity.type === 'Spec' || targetEntity.type === 'Requirement') {
          // Found a spec!
          const impactType = current.depth === 0 ? 'direct' : 'indirect';
          const newPath = [...current.path, {
            from: current.entityId,
            to: targetEntity.id,
            relationship: rel.type,
            confidence: rel.confidence || 0.8
          }];

          impacts.push({
            specId: targetEntity.id,
            specName: targetEntity.name,
            specPath: targetEntity.filePath || 'unknown',
            impactPath: newPath,
            impactType: impactType,
            confidence: calculatePathConfidence(newPath)
          });

          // Continue traversal to find more specs
          if (current.depth < 3) { // Limit traversal depth
            queue.push({
              entityId: targetEntity.id,
              entityType: targetEntity.type,
              path: newPath,
              depth: current.depth + 1
            });
          }
        }

        // Continue traversal through intermediate entities
        if (current.depth < 2) {
          queue.push({
            entityId: targetEntity.id,
            entityType: targetEntity.type,
            path: [...current.path, {
              from: current.entityId,
              to: targetEntity.id,
              relationship: rel.type,
              confidence: rel.confidence || 0.7
            }],
            depth: current.depth + 1
          });
        }
      }
    }
  }

  return impacts;
}

/**
 * Calculate confidence score for a path
 */
function calculatePathConfidence(path: Array<{ confidence?: number }>): number {
  if (path.length === 0) return 0;

  const confidences = path.map(step => step.confidence || 0.7);
  return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
}

/**
 * Calculate overall confidence score
 */
function calculateConfidenceScore(impacts: Array<{ confidence: number }>): number {
  if (impacts.length === 0) return 0;

  return impacts.reduce((sum, impact) => sum + impact.confidence, 0) / impacts.length;
}

/**
 * Generate KG-enhanced blast radius report
 */
export function generateKGBlastRadiusReport(
  results: {
    impactedSpecs: Array<any>;
    impactGraph: Array<any>;
    analysis: any;
    issues: Array<any>;
  }
): string {
  let report = '# KG Blast Radius Analysis Report\n\n';

  // Summary
  report += '## Summary\n';
  report += `- Total specs found: ${results.analysis.totalSpecsFound}\n`;
  report += `- Direct impacts: ${results.analysis.directImpacts}\n`;
  report += `- Indirect impacts: ${results.analysis.indirectImpacts}\n`;
  report += `- Overall confidence: ${(results.analysis.confidenceScore * 100).toFixed(1)}%\n\n`;

  // Impacted specs
  if (results.impactedSpecs.length > 0) {
    report += '## Impacted Specifications\n\n';

    // Group by impact type
    const direct = results.impactedSpecs.filter(s => s.impactType === 'direct');
    const indirect = results.impactedSpecs.filter(s => s.impactType === 'indirect');

    if (direct.length > 0) {
      report += '### Direct Impacts (High Confidence)\n';
      for (const spec of direct) {
        report += `- **${spec.specName}** (${spec.specPath})\n`;
        report += `  - Confidence: ${(spec.confidence * 100).toFixed(0)}%\n`;
        report += `  - Impact path: ${spec.impactPath.map(p => p.relationship).join(' → ')}\n`;
      }
      report += '\n';
    }

    if (indirect.length > 0) {
      report += '### Indirect Impacts (Medium Confidence)\n';
      for (const spec of indirect) {
        report += `- **${spec.specName}** (${spec.specPath})\n`;
        report += `  - Confidence: ${(spec.confidence * 100).toFixed(0)}%\n`;
        report += `  - Impact path: ${spec.impactPath.map(p => p.relationship).join(' → ')}\n`;
      }
      report += '\n';
    }
  }

  // Impact graph
  if (results.impactGraph.length > 0) {
    report += '## Impact Graph\n\n';
    report += '| From | To | Relationship | Confidence |\n';
    report += '|------|----|--------------|------------|\n';

    for (const edge of results.impactGraph) {
      report += `| ${edge.from} | ${edge.to} | ${edge.relationship} | ${(edge.confidence * 100).toFixed(0)}% |\n`;
    }
    report += '\n';
  }

  // Analysis
  report += '## Analysis\n';
  report += `- KG traversal confidence: ${(results.analysis.confidenceScore * 100).toFixed(1)}%\n`;
  report += `- Total impact paths found: ${results.impactGraph.length}\n`;
  report += `- Average path confidence: ${(results.impactedSpecs.reduce((sum, s) => sum + s.confidence, 0) / results.impactedSpecs.length * 100).toFixed(1)}%\n\n`;

  // Issues
  if (results.issues.length > 0) {
    report += '## Issues\n';
    for (const issue of results.issues) {
      report += `- ${issue.type}: ${issue.message}\n`;
    }
    report += '\n';
  }

  return report;
}