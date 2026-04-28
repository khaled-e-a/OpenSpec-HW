# Spec: widget-registry

Generated: 2026-04-28

## Overview
This spec defines requirements for the registry of available widget types that can be instantiated and placed on the dashboard.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC2-S2: System displays available widget types with names and preview thumbnails
- UC2-S3: User selects a widget type

## ADDED Requirements

### Requirement: Maintain a static widget type registry
**Implements**: UC2-S2 - System displays available widget types with names and preview thumbnails
The system SHALL maintain a registry of available widget types, each entry containing at minimum: a unique identifier, a display name, a short description, a default grid size (w × h), and a reference to the React component that renders it.

#### Scenario: Registry contains at least one widget type
- **WHEN** the dashboard application loads
- **THEN** the widget registry contains one or more registered widget types

#### Scenario: Each registry entry has required metadata
- **WHEN** the registry is queried
- **THEN** every entry exposes: id (string), displayName (string), description (string), defaultSize ({w, h}), and component (React component)

---

### Requirement: Expose registry entries for display in the Add Widget panel
**Implements**: UC2-S2 - System displays available widget types with names and preview thumbnails
The system SHALL provide the full list of registered widget types to the Add Widget panel UI so they can be presented to the user.

#### Scenario: All registered types listed in panel
- **WHEN** the user opens the Add Widget panel
- **THEN** every widget type in the registry is shown with its displayName and description

---

### Requirement: Support instantiation of a registered widget type
**Implements**: UC2-S3 - User selects a widget type
The system SHALL be able to create a new widget instance from a registry entry, assigning it a unique instance ID and its default grid size.

#### Scenario: Widget instance created from registry entry
- **WHEN** the user selects a widget type from the panel
- **THEN** the system creates a new instance with a unique ID, the registered component, and the default (w, h)

#### Scenario: Multiple instances of same type allowed
- **WHEN** a widget type is selected and an instance of that type already exists on the dashboard
- **THEN** a second independent instance is created without error

---

### Requirement: Support extension with new widget types without grid changes
**Implements**: UC2-S2 - System displays available widget types with names and preview thumbnails
The system SHALL allow new widget types to be registered by adding an entry to the registry array without requiring changes to any grid or layout logic.

#### Scenario: New widget type available after registry entry added
- **WHEN** a new entry is added to the WIDGET_REGISTRY array
- **THEN** the new type appears in the Add Widget panel immediately on the next app load
