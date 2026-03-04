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

export interface UseCaseDesignMapping {
  useCaseSteps: UseCaseStep[];
  mappedDecisions: Map<string, string[]>; // decision section -> use case step IDs
  unmappedSteps: UseCaseStep[];
  coverageMap: Map<string, string[]>; // use case step ID -> design sections
}

export interface UseCaseTaskMapping {
  useCaseSteps: UseCaseStep[];
  mappedTasks: Map<string, string[]>; // task ID -> use case step IDs
  unmappedSteps: UseCaseStep[];
  coverageMap: Map<string, string[]>; // use case step ID -> task IDs
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
      const useCaseMatch = line.match(/^## Use Case:\s*(.+)/);
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
   * Extract design-to-usecase mapping from design content
   */
  extractDesignMapping(content: string): Map<string, string[]> {
    const mapping = new Map<string, string[]>();
    const lines = content.split('\n');

    let currentSection: string | null = null;
    let inDecision = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headers
      const sectionMatch = trimmed.match(/^## (.+)/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        inDecision = false;
        continue;
      }

      // Detect decision headers
      const decisionMatch = trimmed.match(/^### Decision \d+:\s*(.+)/);
      if (decisionMatch && currentSection === 'Decisions') {
        const decisionName = decisionMatch[1].trim();
        currentSection = `Decision: ${decisionName}`;
        inDecision = true;
        mapping.set(currentSection, []);
        continue;
      }

      if (!inDecision) continue;

      // Detect addresses reference
      const addressesMatch = trimmed.match(/\*\*Addresses\*\*:\s*(UC\d+-[SE]\w+)/);
      if (addressesMatch) {
        const useCaseStep = addressesMatch[1];
        const existing = mapping.get(currentSection!) || [];
        existing.push(useCaseStep);
        mapping.set(currentSection!, existing);
      }

      // Stop at next section or decision
      if (trimmed.match(/^## /)) {
        inDecision = false;
      }
      if (trimmed.match(/^### Decision \d+:/)) {
        inDecision = false;
      }
    }

    return mapping;
  }

  /**
   * Validate that all use case steps are addressed in design
   */
  validateDesignMapping(useCaseSteps: UseCaseStep[], designMapping: Map<string, string[]>): UseCaseDesignMapping {
    const mappedSteps = new Set<string>();
    const mappedDecisions = new Map<string, string[]>();
    const coverageMap = new Map<string, string[]>();

    // Build mappings
    for (const [decision, stepIds] of designMapping.entries()) {
      mappedDecisions.set(decision, stepIds);
      stepIds.forEach(stepId => {
        mappedSteps.add(stepId);
        const existing = coverageMap.get(stepId) || [];
        existing.push(decision);
        coverageMap.set(stepId, existing);
      });
    }

    // Find unmapped steps
    const unmappedSteps = useCaseSteps.filter(step => !mappedSteps.has(step.id));

    return {
      useCaseSteps,
      mappedDecisions,
      unmappedSteps,
      coverageMap
    };
  }

  /**
   * Extract task-to-usecase mapping from tasks content
   */
  extractTaskMapping(content: string): Map<string, string[]> {
    const mapping = new Map<string, string[]>();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Match task lines: - [ ] X.Y Task description (Addresses: UC1-S1, UC1-S2)
      const taskMatch = trimmed.match(/^-\s*\[\s*\]\s+(\d+\.\d+)\s+(.+?)\s+\(Addresses:\s*([^)]+)\)/);
      if (taskMatch) {
        const taskId = taskMatch[1];
        const addresses = taskMatch[3].split(',').map(s => s.trim());
        mapping.set(taskId, addresses);
      }
    }

    return mapping;
  }

  /**
   * Validate that all use case steps are covered by tasks
   */
  validateTaskMapping(useCaseSteps: UseCaseStep[], taskMapping: Map<string, string[]>): UseCaseTaskMapping {
    const mappedSteps = new Set<string>();
    const mappedTasks = new Map<string, string[]>();
    const coverageMap = new Map<string, string[]>();

    // Build mappings
    for (const [taskId, stepIds] of taskMapping.entries()) {
      mappedTasks.set(taskId, stepIds);
      stepIds.forEach(stepId => {
        mappedSteps.add(stepId);
        const existing = coverageMap.get(stepId) || [];
        existing.push(taskId);
        coverageMap.set(stepId, existing);
      });
    }

    // Find unmapped steps
    const unmappedSteps = useCaseSteps.filter(step => !mappedSteps.has(step.id));

    return {
      useCaseSteps,
      mappedTasks,
      unmappedSteps,
      coverageMap
    };
  }

  /**
   * Generate task suggestions for unmapped use case steps
   */
  generateTaskSuggestions(unmappedSteps: UseCaseStep[]): string[] {
    const suggestions: string[] = [];

    for (const step of unmappedSteps) {
      const taskName = this.generateTaskName(step);
      suggestions.push(`- [ ] X.Y ${taskName} (Addresses: ${step.id})`);
    }

    return suggestions;
  }

  /**
   * Generate a task name from a use case step
   */
  private generateTaskName(step: UseCaseStep): string {
    // Convert step description to a task name
    let taskName = step.description
      .replace(/^(.+?)\s+(verifies|validates|ensures|does|provides|selects|clicks|navigates|enters|displays|creates|sends|grants)/i, '$2')
      .replace(/^System\s+/i, '')
      .replace(/^User\s+/i, 'Implement ');

    // Capitalize first letter
    taskName = taskName.charAt(0).toUpperCase() + taskName.slice(1);

    return taskName;
  }

  /**
   * Generate use case traceability section for tasks
   */
  generateTaskTraceabilitySection(useCaseSteps: UseCaseStep[]): string {
    const lines = [
      '## Use Case Traceability',
      'This implementation addresses the following use case steps:'
    ];

    for (const step of useCaseSteps) {
      lines.push(`- ${step.id}: ${step.description}`);
    }

    lines.push('');
    lines.push('Each task below indicates which use case step(s) it implements.');

    return lines.join('\n');
  }

  /**
   * Generate design section suggestions for unmapped use case steps
   */
  generateDesignSuggestions(unmappedSteps: UseCaseStep[]): string[] {
    const suggestions: string[] = [];

    for (const step of unmappedSteps) {
      const section = this.suggestDesignSection(step);
      suggestions.push(`- ${step.id}: ${step.description} → Address in ${section} section`);
    }

    return suggestions;
  }

  /**
   * Generate use case coverage section for design document
   */
  generateDesignCoverageSection(useCaseSteps: UseCaseStep[]): string {
    const lines = ['## Use Case Coverage', 'This design addresses the following use case steps:'];

    for (const step of useCaseSteps) {
      const section = this.suggestDesignSection(step);
      lines.push(`- ${step.id}: ${step.description} → [${section} section]`);
    }

    lines.push('', '### Unaddressed Use Case Steps', '<!-- List any use case steps not covered in this design and why -->');

    return lines.join('\n');
  }

  /**
   * Suggest which design section should address a use case step
   */
  suggestDesignSection(step: UseCaseStep): string {
    const description = step.description.toLowerCase();

    // Context section for user-facing interactions
    if (description.includes('actor') || description.includes('user') || description.includes('customer')) {
      return 'Context';
    }

    // Decisions for technical implementations
    if (description.includes('system') || description.includes('validate') || description.includes('verify')) {
      return 'Decisions';
    }

    // Risks for error conditions
    if (step.type === 'extension' || description.includes('error') || description.includes('fail')) {
      return 'Risks';
    }

    // Default to Decisions
    return 'Decisions';
  }
}