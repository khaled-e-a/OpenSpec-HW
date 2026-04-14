# Spec: widget-add (delta)

Generated: 2026-03-10

## Overview

Delta spec for the existing `widget-add` capability. The only behaviour change is that newly created widgets are assigned `type: 'clock'` by default, satisfying the BREAKING `type` requirement introduced by this change. All other add-widget requirements are unchanged.

## MODIFIED Requirements

### Requirement: Create Default-Size Widget

**Implements**: UC1-E5a - Selected type requires a source but none is configured — system renders placeholder state
**Implements**: UC1-S4 - System updates the widget to the selected type and closes the settings panel

The system SHALL create a new `WidgetLayout` entry with `w: 1`, `h: 1`, a unique `id`, `col`/`row` set to the found cell coordinates, and **`type: 'clock'`** as the default content type. No other type-specific configuration fields are set; the new widget renders immediately without requiring further user input because the clock type needs no configuration.

#### Scenario: New widget has correct default properties including type

- **WHEN** a valid empty cell is found and a widget is created
- **THEN** the new widget entry has `w: 1`, `h: 1`, `col`/`row` matching the found cell, and `type: 'clock'`

#### Scenario: New widget renders immediately without configuration

- **WHEN** a new widget is added to the dashboard
- **THEN** it displays the clock content type without requiring the user to supply any configuration
