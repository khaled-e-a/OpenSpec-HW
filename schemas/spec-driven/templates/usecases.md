# Use Cases: {{changeName}}

Generated: {{date}}

## Overview

This document captures the use cases for the {{changeName}} change, following Cockburn's use case methodology.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| [Primary Actor] | [What they want to achieve] |

## Use Cases

### Use Case: [Name]
**Primary Actor**: [Actor]
**Goal**: [Goal statement]

#### Stakeholders & Interests
- [Actor]: [What they want]
- [System]: [What it needs to ensure]

#### Preconditions
- [What must be true before the use case starts]

#### Trigger
[What initiates this use case]

#### Main Success Scenario
1. [Actor does something]
2. [System responds]
3. [Continue for 3-9 steps]

#### Extensions
2a. [Alternative at step 2]
  2a1. [System handles alternative]

#### Postconditions
- [What's true after successful completion]

---

## Notes
- Each use case should focus on a single, coherent goal
- Keep UI details out of the steps - focus on intent
- Extensions should cover significant alternatives and failures
- Use cases should be testable - each scenario is a potential test case

## Use Case Traceability Mapping
This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | [Actor does something] |
| UC1-S2 | [System responds] |
| UC1-E2a | [Extension description] |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"