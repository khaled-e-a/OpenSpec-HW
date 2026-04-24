/**
 * Knowledge Graph Schema Validator
 *
 * Validates entities and relationships against the KG ontology schema
 */

import * as types from './types.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface SchemaDefinition {
  abstractTypes: Record<string, AbstractTypeDefinition>;
  concreteTypes: Record<string, ConcreteTypeDefinition>;
  validationRules: ValidationRule[];
}

interface AbstractTypeDefinition {
  description: string;
  properties: Record<string, PropertyDefinition>;
  relationships: Record<string, RelationshipDefinition>;
}

interface ConcreteTypeDefinition {
  extends: string;
  description: string;
  properties?: Record<string, PropertyDefinition>;
  relationships?: Record<string, RelationshipDefinition>;
}

interface PropertyDefinition {
  type: string;
  required?: boolean;
  unique?: boolean;
  enum?: string[];
  default?: any;
}

interface RelationshipDefinition {
  target: string;
  cardinality: string;
  description: string;
}

interface ValidationRule {
  name: string;
  description: string;
  query: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ValidationError {
  rule?: string;
  field?: string;
  message: string;
  value?: any;
}

export class KGSchemaValidator {
  private schema!: SchemaDefinition;
  private typeHierarchy: Map<string, string[]> = new Map();

  constructor() {
    this.loadSchema();
    this.buildTypeHierarchy();
  }

  private loadSchema(): void {
    const schemaPath = join(__dirname, '../../../schemas/kg-ontology.yaml');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    this.schema = yaml.parse(schemaContent).schema;
  }

  private buildTypeHierarchy(): void {
    // Build inheritance chain for each concrete type
    for (const [typeName, typeDef] of Object.entries(this.schema.concreteTypes)) {
      const hierarchy = [typeName];
      let current = typeDef.extends;

      while (current) {
        hierarchy.push(current);
        const parentType = this.schema.concreteTypes[current] || this.schema.abstractTypes[current];
        if (parentType && 'extends' in parentType) {
          current = parentType.extends;
        } else {
          break;
        }
      }

      this.typeHierarchy.set(typeName, hierarchy);
    }
  }

  /**
   * Validate an entity against the schema
   */
  validateEntity(entity: any, entityType: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check if type exists
    if (!this.schema.concreteTypes[entityType] && !this.schema.abstractTypes[entityType]) {
      errors.push({
        message: `Unknown entity type: ${entityType}`
      });
      return { isValid: false, errors, warnings };
    }

    // Get full property definition including inherited ones
    const properties = this.getFullPropertyDefinition(entityType);

    // Validate required properties
    for (const [propName, propDef] of Object.entries(properties)) {
      if (propDef.required && !(propName in entity)) {
        errors.push({
          field: propName,
          message: `Required property '${propName}' is missing`
        });
      }
    }

    // Validate property types and values
    for (const [propName, value] of Object.entries(entity)) {
      const propDef = properties[propName];
      if (!propDef) {
        // Check if it's a valid relationship
        const relationships = this.getFullRelationshipDefinition(entityType);
        if (!relationships[propName]) {
          warnings.push({
            field: propName,
            message: `Unknown property '${propName}' for type ${entityType}`,
            value
          });
        }
        continue;
      }

      // Type validation
      const typeError = this.validatePropertyType(value, propDef, propName);
      if (typeError) {
        errors.push(typeError);
      }

      // Enum validation
      if (propDef.enum && !propDef.enum.includes(value as string)) {
        errors.push({
          field: propName,
          message: `Value must be one of: ${propDef.enum.join(', ')}`,
          value
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a relationship between entities
   */
  validateRelationship(
    sourceType: string,
    relationshipType: string,
    targetType: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const relationships = this.getFullRelationshipDefinition(sourceType);
    const relDef = relationships[relationshipType];

    if (!relDef) {
      errors.push({
        message: `Unknown relationship '${relationshipType}' for type ${sourceType}`
      });
      return { isValid: false, errors, warnings };
    }

    // Check if target type is valid
    const validTargets = this.expandTargetTypes(relDef.target);
    if (!validTargets.includes(targetType)) {
      errors.push({
        message: `Invalid target type '${targetType}' for relationship '${relationshipType}'. Expected one of: ${validTargets.join(', ')}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get the full property definition including inherited properties
   */
  private getFullPropertyDefinition(typeName: string): Record<string, PropertyDefinition> {
    const properties: Record<string, PropertyDefinition> = {};
    const hierarchy = this.typeHierarchy.get(typeName) || [typeName];

    // Start from base abstract types and work up
    for (const type of hierarchy.reverse()) {
      const typeDef = this.schema.concreteTypes[type] || this.schema.abstractTypes[type];
      if (typeDef?.properties) {
        Object.assign(properties, typeDef.properties);
      }
    }

    return properties;
  }

  /**
   * Get the full relationship definition including inherited relationships
   */
  private getFullRelationshipDefinition(typeName: string): Record<string, RelationshipDefinition> {
    const relationships: Record<string, RelationshipDefinition> = {};
    const hierarchy = this.typeHierarchy.get(typeName) || [typeName];

    // Start from base abstract types and work up
    for (const type of hierarchy.reverse()) {
      const typeDef = this.schema.concreteTypes[type] || this.schema.abstractTypes[type];
      if (typeDef?.relationships) {
        Object.assign(relationships, typeDef.relationships);
      }
    }

    return relationships;
  }

  /**
   * Expand target type patterns to concrete types
   */
  private expandTargetTypes(targetPattern: string): string[] {
    // Handle abstract type targets
    if (this.schema.abstractTypes[targetPattern]) {
      // Return all concrete types that extend this abstract type
      const concreteTypes: string[] = [];
      for (const [typeName, typeDef] of Object.entries(this.schema.concreteTypes)) {
        const hierarchy = this.typeHierarchy.get(typeName) || [];
        if (hierarchy.includes(targetPattern)) {
          concreteTypes.push(typeName);
        }
      }
      return concreteTypes;
    }

    // Handle concrete type targets
    return [targetPattern];
  }

  /**
   * Validate a property value against its type definition
   */
  private validatePropertyType(
    value: any,
    propDef: PropertyDefinition,
    propName: string
  ): ValidationError | null {
    const expectedType = propDef.type;
    const actualType = this.getValueType(value);

    if (actualType !== expectedType) {
      return {
        field: propName,
        message: `Expected type '${expectedType}' but got '${actualType}'`,
        value
      };
    }

    return null;
  }

  /**
   * Get the type of a value
   */
  private getValueType(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'float';
    }
    if (typeof value === 'string') {
      // Check if it's a date string
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'datetime';
      return 'string';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) return 'array';
      return 'json';
    }
    return 'unknown';
  }

  /**
   * Run validation rules on the knowledge graph
   */
  async runValidationRules(kgClient: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.schema.validationRules) {
      try {
        const violations = await kgClient.query(rule.query);

        if (violations.length > 0) {
          results.push({
            isValid: rule.severity !== 'error',
            errors: rule.severity === 'error' ? violations.map((v: any) => ({
              rule: rule.name,
              message: `${rule.description}: ${JSON.stringify(v)}`
            })) : [],
            warnings: rule.severity === 'warning' ? violations.map((v: any) => ({
              rule: rule.name,
              message: `${rule.description}: ${JSON.stringify(v)}`
            })) : []
          });
        }
      } catch (error: any) {
        results.push({
          isValid: false,
          errors: [{
            rule: rule.name,
            message: `Failed to run validation rule: ${error.message}`
          }],
          warnings: []
        });
      }
    }

    return results;
  }

  /**
   * Get schema information
   */
  getSchemaInfo(): any {
    return {
      abstractTypes: Object.keys(this.schema.abstractTypes),
      concreteTypes: Object.keys(this.schema.concreteTypes),
      validationRules: this.schema.validationRules.map((r: any) => ({
        name: r.name,
        description: r.description,
        severity: r.severity
      }))
    };
  }

  /**
   * Check if a type extends another type
   */
  isSubtype(subtype: string, supertype: string): boolean {
    const hierarchy = this.typeHierarchy.get(subtype);
    return hierarchy ? hierarchy.includes(supertype) : false;
  }
}