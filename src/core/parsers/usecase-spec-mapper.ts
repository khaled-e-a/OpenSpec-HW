/**
 * UseCase to Spec Mapper
 *
 * Utility for parsing use cases and mapping them to spec requirements
 * Provides functionality to extract use case steps and validate spec coverage
 */

import { readFileSync } from 'fs';
import { MarkdownParser } from './markdown-parser.js';

export interface UseCaseStep {
  id: string;
  description: string;
  type: 'main' | 'extension';
  useCaseId: string;
  useCaseName: string;
}

export interface UseCaseSpecMapping {
  useCaseSteps: UseCaseStep[];
  mappedRequirements: Map<string, string[]>; // requirement ID -> use case step IDs
  unmappedSteps: UseCaseStep[];
}

export class UseCaseSpecMapper {
  private parser: MarkdownParser;

  constructor() {
    this.parser = new MarkdownParser('');
  }

  /**
   * Parse usecases.md file and extract all use case steps
   */
  parseUseCaseSteps(content: string): UseCaseStep[] {
    const steps: UseCaseStep[] = [];
    const lines = content.split('\n');

    let currentUseCase: { id: string; name: string } | null = null;
    let stepCounter = 1;
    let extensionCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect use case header
      const useCaseMatch = line.match(/^### Use Case:\s*(.+)/);
      if (useCaseMatch) {
        const useCaseName = useCaseMatch[1].trim();
        const useCaseId = this.generateUseCaseId(useCaseName);
        currentUseCase = { id: useCaseId, name: useCaseName };
        stepCounter = 1;
        extensionCounter = 1;
        continue;
      }

      if (!currentUseCase) continue;

      // Detect main scenario steps
      const mainStepMatch = line.match(/^\d+\.\s*(.+)/);
      if (mainStepMatch) {
        const description = mainStepMatch[1].trim();
        steps.push({
          id: `${currentUseCase.id}-S${stepCounter}`,
          description,
          type: 'main',
          useCaseId: currentUseCase.id,
          useCaseName: currentUseCase.name
        });
        stepCounter++;
        continue;
      }

      // Detect extensions
      const extensionMatch = line.match(/^\d+([a-z])\.\s*(.+)/);
      if (extensionMatch) {
        const extensionId = extensionMatch[1];
        const description = extensionMatch[2].trim();
        steps.push({
          id: `${currentUseCase.id}-E${extensionId}`,
          description,
          type: 'extension',
          useCaseId: currentUseCase.id,
          useCaseName: currentUseCase.name
        });
        extensionCounter++;
        continue;
      }
    }

    return steps;
  }

  /**
   * Extract spec-to-usecase mapping from spec content
   */
  extractSpecMapping(content: string): Map<string, string[]> {
    const mapping = new Map<string, string[]>();
    const lines = content.split('\n');

    let currentRequirement: string | null = null;
    let inRequirement = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect requirement header
      const reqMatch = trimmed.match(/^### Requirement:\s*(.+)/);
      if (reqMatch) {
        currentRequirement = reqMatch[1].trim();
        inRequirement = true;
        mapping.set(currentRequirement, []);
        continue;
      }

      if (!inRequirement || !currentRequirement) continue;

      // Detect implements reference
      const implementsMatch = trimmed.match(/\*\*Implements\*\*:\s*(UC\d+-[SE]\w+)/);
      if (implementsMatch) {
        const useCaseStep = implementsMatch[1];
        const existing = mapping.get(currentRequirement) || [];
        existing.push(useCaseStep);
        mapping.set(currentRequirement, existing);
      }

      // Stop at next requirement or section
      if (trimmed.match(/^### /) && !trimmed.match(/^### Requirement:/)) {
        inRequirement = false;
      }
      if (trimmed.match(/^## /)) {
        inRequirement = false;
      }
    }

    return mapping;
  }

  /**
   * Validate that all use case steps are covered by requirements
   */
  validateMapping(useCaseSteps: UseCaseStep[], specMapping: Map<string, string[]>): UseCaseSpecMapping {
    const mappedSteps = new Set<string>();
    const mappedRequirements = new Map<string, string[]>();

    // Build reverse mapping
    for (const [reqId, stepIds] of specMapping.entries()) {
      mappedRequirements.set(reqId, stepIds);
      stepIds.forEach(stepId => mappedSteps.add(stepId));
    }

    // Find unmapped steps
    const unmappedSteps = useCaseSteps.filter(step => !mappedSteps.has(step.id));

    return {
      useCaseSteps,
      mappedRequirements,
      unmappedSteps
    };
  }

  /**
   * Generate mapping suggestions for missing use case steps
   */
  generateMappingSuggestions(unmappedSteps: UseCaseStep[]): string[] {
    const suggestions: string[] = [];

    for (const step of unmappedSteps) {
      const requirementName = this.generateRequirementName(step);
      suggestions.push(`### Requirement: ${requirementName}
**Implements**: ${step.id} - ${step.description}
The system SHALL ${this.generateShallStatement(step.description)}

#### Scenario: ${requirementName}
- **WHEN** [condition]
- **THEN** [expected outcome]`);
    }

    return suggestions;
  }

  /**
   * Generate a use case ID from the use case name
   */
  private generateUseCaseId(name: string): string {
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Simple counter-based ID generation - in real implementation,
    // this would need to track existing IDs
    return 'UC1';
  }

  /**
   * Generate a requirement name from a use case step
   */
  private generateRequirementName(step: UseCaseStep): string {
    const actor = step.description.match(/^(.+?)\s+(?:verifies|validates|ensures|does|provides|selects|clicks)/i);
    if (actor) {
      const action = step.description.replace(/^(.+?)\s+/, '');
      return `${actor[1]} ${action}`;
    }

    // Fallback: use the use case name and step type
    const cleanUseCaseName = step.useCaseName
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return `${cleanUseCaseName} ${step.type === 'extension' ? 'Error' : 'Step'} ${step.id.split('-').pop()}`;
  }

  /**
   * Generate a SHALL statement from a use case step description
   */
  private generateShallStatement(description: string): string {
    // Remove actor prefix
    let statement = description.replace(/^(.+?)\s+(verifies|validates|ensures|does|provides|selects|clicks)/i, '$2');

    // Convert to passive voice for system requirements
    statement = statement
      .replace(/verifies/i, 'verify')
      .replace(/validates/i, 'validate')
      .replace(/ensures/i, 'ensure')
      .replace(/does/i, 'perform')
      .replace(/provides/i, 'provide')
      .replace(/selects/i, 'allow selection of')
      .replace(/clicks/i, 'allow clicking of');

    return statement.charAt(0).toLowerCase() + statement.slice(1);
  }

  /**
   * Load and parse usecases.md file
   */
  loadUseCases(filePath: string): UseCaseStep[] {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseUseCaseSteps(content);
    } catch (error) {
      throw new Error(`Failed to load use cases from ${filePath}: ${error}`);
    }
  }
}