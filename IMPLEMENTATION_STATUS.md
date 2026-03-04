# Implementation Status: Separate Use Cases Artifact

## Summary

The implementation to add a separate use cases artifact to OpenSpec-HW has been **SUCCESSFULLY COMPLETED** in the development version. However, demo projects created before this update will show the old workflow sequence.

## What Was Implemented

1. **Updated Schema Configuration** (`/Users/khaledea/data/claude-research/OpenSpec-HW/schemas/spec-driven/schema.yaml`)
   - Added `usecases` artifact between `proposal` and `specs`
   - Updated workflow sequence: proposal → usecases → specs → design → tasks

2. **Created Use Cases Template** (`/Users/khaledea/data/claude-research/OpenSpec-HW/schemas/spec-driven/templates/usecases.md`)
   - Following Cockburn's methodology
   - Includes actor-goal list, use case structure, and notes

3. **Updated Workflow Instructions**
   - Modified `continue-change.ts` to handle use cases as separate artifact
   - Updated `gen-tests.ts` to read from usecases.md
   - Updated `apply-change.ts` to reference new workflow

## Verification

Using the development version shows the correct workflow:
```bash
/Users/khaledea/data/claude-research/OpenSpec-HW/bin/openspec.js status --change <name>
# Shows: 1/5 artifacts complete
# [ ] proposal
# [ ] design
# [ ] usecases (blocked by: proposal)
# [ ] specs (blocked by: usecases)
# [ ] tasks (blocked by: design, specs)
```

## Issue Found

Demo projects show the old workflow because they use the **globally installed** version:
```bash
openspec-hw status --change <name>
# Shows: 1/4 artifacts complete
# [ ] proposal
# [ ] design
# [ ] specs (blocked by: proposal)  ← Missing usecases!
# [ ] tasks (blocked by: design, specs)
```

## Root Cause

The demo project at `/Users/khaledea/data/claude-research/OpenSpec-HW/demos/demo-widget-2026-03-02` was created using the globally installed `openspec-hw` (version 1.1.1) which doesn't include our schema updates.

## Solution

To use the updated workflow with use cases:

1. **Use the development binary**:
   ```bash
   /Users/khaledea/data/claude-research/OpenSpec-HW/bin/openspec.js <command>
   ```

2. **Or rebuild and reinstall globally**:
   ```bash
   cd /Users/khaledea/data/claude-research/OpenSpec-HW
   npm run build
   npm install -g .
   ```

3. **Or create new projects** using the development version

## Conclusion

The implementation is complete and working correctly. The schema-driven workflow now creates use cases as a separate artifact, providing better separation of concerns and following industry best practices, just like OpenSpec-HW2.

---

# Implementation Status: Spec-to-UseCase Mapping

## Summary
This implementation adds structured traceability from use cases to specifications, ensuring that every requirement in a spec maps back to specific use case steps. This closes the gap between user goals (use cases) and system requirements (specs).

## Changes Made

### 1. Updated Spec Template (`/schemas/spec-driven/templates/spec.md`)
- Added "Use Case Traceability" section at the top of specs
- Template now includes placeholders for mapping use case steps

### 2. Updated Schema Instructions (`/schemas/spec-driven/schema.yaml`)
- Added detailed mapping requirements to specs instruction
- Specified the "**Implements**: UC1-S1 - [description]" format
- Added step-by-step process for mapping use cases to requirements

### 3. Updated Continue-Change Workflow (`/src/core/templates/workflows/continue-change.ts`)
- Replaced vague "reference use cases" instruction with specific mapping requirements
- Added examples showing how to map use case steps to requirements
- Emphasized that every main scenario step should become a requirement

### 4. Created UseCase-Spec Mapper (`/src/core/parsers/usecase-spec-mapper.ts`)
New utility that provides:
- Parsing use cases to extract all steps (main scenario + extensions)
- Extracting spec-to-usecase mappings from spec files
- Validating that all use case steps are covered by requirements
- Generating mapping suggestions for unmapped steps

### 5. Updated Validator (`/src/core/validation/validator.ts`)
- Added validation for "Use Case Traceability" section presence
- Added validation that each requirement has an "**Implements**" reference
- Extended delta spec validation to check for traceability

### 6. Updated Gen-Tests Workflow (`/src/core/templates/workflows/gen-tests.ts`)
- Simplified test generation to extract existing mapping from specs
- Removed redundant parsing since mapping is now created during spec generation

## How It Works

1. **During Spec Creation**:
   - Read usecases.md to identify all use case steps
   - Create "Use Case Traceability" section listing all steps
   - For each requirement, add "**Implements**: UC1-S2 - [step description]"
   - Ensure every main scenario step has at least one requirement

2. **Validation**:
   - Checks for presence of traceability section
   - Validates each requirement has implements reference
   - Warns about unmapped use case steps

3. **Test Generation**:
   - Extracts existing mapping from specs
   - Uses mapping to generate appropriate test coverage

## Example Mapping

```markdown
## Use Case Traceability
This spec implements the following use case steps:
- UC1-S2: System displays drag preview and highlights valid drop zones
- UC1-E3a: User moves widget to invalid position

## ADDED Requirements

### Requirement: Show Drag Preview
**Implements**: UC1-S2 - System displays drag preview and highlights valid drop zones
The system SHALL display a visual preview of the widget being dragged.

#### Scenario: Drag preview visible
- **WHEN** user starts dragging an item
- **THEN** system shows a semi-transparent copy of the item under cursor
```

## Benefits

1. **Traceability**: Clear linkage from user goals to system requirements
2. **Completeness**: Ensures all use case steps are implemented
3. **Testability**: Each mapped requirement can be traced back to user value
4. **Maintainability**: Changes to use cases automatically highlight affected requirements

## Next Steps

1. Update existing specs to include traceability mapping
2. Train team on the new mapping process
3. Consider adding automation to suggest mappings during spec creation