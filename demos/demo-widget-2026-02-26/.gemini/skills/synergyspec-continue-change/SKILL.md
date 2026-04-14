---
name: openspec-continue-change
description: Continue working on an OpenSpec change by creating the next artifact. Use when the user wants to progress their change, create the next artifact, or continue their workflow.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

Continue working on a change by creating the next artifact.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes sorted by most recently modified. Then use the **AskUserQuestion tool** to let the user select which change to work on.

   Present the top 3-4 most recently modified changes as options, showing:
   - Change name
   - Schema (from `schema` field if present, otherwise "spec-driven")
   - Status (e.g., "0/5 tasks", "complete", "no tasks")
   - How recently it was modified (from `lastModified` field)

   Mark the most recently modified change as "(Recommended)" since it's likely what the user wants to continue.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check current status**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand current state. The response includes:
   - `schemaName`: The workflow schema being used (e.g., "spec-driven")
   - `artifacts`: Array of artifacts with their status ("done", "ready", "blocked")
   - `isComplete`: Boolean indicating if all artifacts are complete

3. **Act based on status**:

   ---

   **If all artifacts are complete (`isComplete: true`)**:
   - Congratulate the user
   - Show final status including the schema used
   - Suggest: "All artifacts created! You can now implement this change or archive it."
   - STOP

   ---

   **If artifacts are ready to create** (status shows artifacts with `status: "ready"`):
   - Pick the FIRST artifact with `status: "ready"` from the status output
   - Get its instructions:
     ```bash
     openspec instructions <artifact-id> --change "<name>" --json
     ```
   - Parse the JSON. The key fields are:
     - `context`: Project background (constraints for you - do NOT include in output)
     - `rules`: Artifact-specific rules (constraints for you - do NOT include in output)
     - `template`: The structure to use for your output file
     - `instruction`: Schema-specific guidance
     - `outputPath`: Where to write the artifact
     - `dependencies`: Completed artifacts to read for context
   - **Create the artifact file**:
     - Read any completed dependency files for context
     - Use `template` as the structure - fill in its sections
     - Apply `context` and `rules` as constraints when writing - but do NOT copy them into the file
     - Write to the output path specified in instructions
   - Show what was created and what's now unlocked
   - STOP after creating ONE artifact

   ---

   **If no artifacts are ready (all blocked)**:
   - This shouldn't happen with a valid schema
   - Show status and suggest checking for issues

4. **After creating an artifact, show progress**
   ```bash
   openspec status --change "<name>"
   ```

**Output**

After each invocation, show:
- Which artifact was created
- Schema workflow being used
- Current progress (N/M complete)
- What artifacts are now unlocked
- Prompt: "Want to continue? Just ask me to continue or tell me what to do next."

**Artifact Creation Guidelines**

The artifact types and their purpose depend on the schema. Use the `instruction` field from the instructions output to understand what to create.

Common artifact patterns:

**spec-driven schema** (proposal → specs → design → tasks):
- **proposal.md**: Ask user about the change if not clear. Fill in Why, What Changes, Capabilities, Impact, Use Case Requirements.
  - The Capabilities section is critical - each capability listed will need a spec file.
  - The Use Case Requirements section is critical. There must be a separate use case requirement section for each requirement in the proposal. Each use case must contain these subsections, written following Cockburn's guidelines:
    - **Name**: A short active verb phrase stating the goal (e.g., "Register new customer"). Write at user-goal level — something completable in a single sitting (2–20 min). Ask: "Can I go to lunch when this is done?"
    - **Primary Actor**: The role whose goal this use case satisfies (e.g., "Customer", "Clerk"). Use role names, not job titles.
    - **Stakeholders & Interests**: Everyone with a vested interest in the outcome, even if they don't directly interact with the system. For each, state what interest must be protected (e.g., "Auditor: all transactions must be logged").
    - **Preconditions**: Only facts the system can guarantee are true before this use case starts. Do NOT list things that are usually true but cannot be guaranteed by the system.
    - **Trigger**: The event or condition that initiates this use case (user action, time-based event, or state change).
    - **Main Scenario** (Happy Path): 3–9 numbered steps with no "if" statements. Rules:
      - Each step must distinctly move the goal forward — ask "Why is the actor doing this?" and write the answer, not the physical action
      - Write from a neutral bird's eye view: "Actor verbs [object] [with data]", "System verifies [condition]", "System updates [state]"
      - Use "verifies"/"validates"/"ensures" for validation steps — never "checks" (which implies an unresolved if-statement)
      - Show actor intent, not UI interactions: "Customer provides shipping address" not "Customer clicks Address field"
      - Always be clear who is acting at each step ("Who's got the ball?")
    - **Extensions** (Alternative & Exception Paths): All failure conditions and alternative paths, each referenced to the main scenario step where they arise. Format: "2a. <condition>: <action>". Brainstorm: bad/missing input, validation failures, service unavailability, timeouts, unexpected internal state.
    - **Postconditions**: State of the world after successful completion. Assert each stakeholder's interests are satisfied (e.g., "Order placed. Inventory reserved. Payment logged. Customer has confirmation.").
  - At the end of each propsal.md file, you must put this singature: "Created by Khaled@Huawei".
- **specs/<capability>/spec.md**: Create one spec per capability listed in the proposal's Capabilities section (use the capability name, not the change name).
  - The spec.md file must contain the Use Case Requirements from the proposal.
- **design.md**: Document technical decisions, architecture, and implementation approach.
- **tasks.md**: Break down implementation into checkboxed tasks.

For other schemas, follow the `instruction` field from the CLI output.

**Guardrails**
- Create ONE artifact per invocation
- Always read dependency artifacts before creating a new one
- Never skip artifacts or create out of order
- If context is unclear, ask the user before creating
- Verify the artifact file exists after writing before marking progress
- Use the schema's artifact sequence, don't assume specific artifact names
- **IMPORTANT**: `context` and `rules` are constraints for YOU, not content for the file
  - Do NOT copy `<context>`, `<rules>`, `<project_context>` blocks into the artifact
  - These guide what you write, but should never appear in the output
