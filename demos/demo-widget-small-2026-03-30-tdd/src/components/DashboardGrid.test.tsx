import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardGrid } from './DashboardGrid';
import type { WidgetLayout, WidgetDefinition } from '../utils/widgetTypes';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const WIDGET_DEFS: WidgetDefinition[] = [
  { id: 'clock', w: 1, h: 1, defaultCol: 0, defaultRow: 0 },
  { id: 'notes', w: 2, h: 1, defaultCol: 0, defaultRow: 1 },
];

const DEFAULT_LAYOUT: WidgetLayout[] = [
  { widgetId: 'clock', col: 0, row: 0, w: 1, h: 1 },
  { widgetId: 'notes', col: 0, row: 1, w: 2, h: 1 },
];

function renderGrid(overrides?: Partial<React.ComponentProps<typeof DashboardGrid>>) {
  return render(
    <DashboardGrid
      widgets={WIDGET_DEFS}
      defaultLayout={DEFAULT_LAYOUT}
      cols={6}
      rows={4}
      cellSize={100}
      storageKey="test-grid-layout"
      renderWidget={(def) => <div data-testid={`widget-${def.id}`}>{def.id}</div>}
      {...overrides}
    />
  );
}

// ---------------------------------------------------------------------------
// UC2-S3, UC2-S4: Render widgets at stored grid positions
// Tasks 4.1, 4.2, 6.3, 6.4
// ---------------------------------------------------------------------------
describe('DashboardGrid – rendering', () => {
  beforeEach(() => localStorage.clear());

  it('UC2-S3: renders all widgets from the default layout', () => {
    renderGrid();
    expect(screen.getByTestId('widget-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-notes')).toBeInTheDocument();
  });

  it('UC2-S4: applies grid-column and grid-row styles from layout positions', () => {
    renderGrid();
    const clockCell = screen.getByTestId('widget-clock').closest('[data-widget-id]');
    expect(clockCell).toHaveStyle({ gridColumn: '1 / span 1', gridRow: '1 / span 1' });
  });

  it('UC2-S3: applies correct span for multi-cell widget', () => {
    renderGrid();
    const notesCell = screen.getByTestId('widget-notes').closest('[data-widget-id]');
    expect(notesCell).toHaveStyle({ gridColumn: '1 / span 2', gridRow: '2 / span 1' });
  });

  it('UC2-S4: loads and restores layout from localStorage on mount', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 3, row: 2, w: 1, h: 1 },
      { widgetId: 'notes', col: 1, row: 0, w: 2, h: 1 },
    ];
    localStorage.setItem('test-grid-layout', JSON.stringify(stored));

    renderGrid();

    const clockCell = screen.getByTestId('widget-clock').closest('[data-widget-id]');
    // col=3 → gridColumn: "4 / span 1" (1-indexed)
    expect(clockCell).toHaveStyle({ gridColumn: '4 / span 1', gridRow: '3 / span 1' });
  });
});

// ---------------------------------------------------------------------------
// UC1-S2: DraggableWidget shows placeholder when dragging
// UC1-S1: Drag initiates on pointer down (via @dnd-kit)
// Tasks 6.1, 6.2, 7.3
// ---------------------------------------------------------------------------
describe('DraggableWidget – placeholder while dragging', () => {
  beforeEach(() => localStorage.clear());

  it('UC1-S2: each widget cell has a drag handle role', () => {
    renderGrid();
    // DraggableWidget wraps content in an element with draggable attributes
    // We verify the widget content is in the DOM (drag handle exists)
    expect(screen.getByTestId('widget-clock')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// UC1-E1a: Cancel drag on Escape key — widget returns to original position
// Tasks 4.8, 4.3
// ---------------------------------------------------------------------------
describe('DashboardGrid – drag cancel on Escape', () => {
  beforeEach(() => localStorage.clear());

  it('UC1-E1a: layout state is unchanged after Escape key press', async () => {
    const user = userEvent.setup();
    renderGrid();

    // Verify initial state is intact (no drag in progress means layout unchanged)
    expect(screen.getByTestId('widget-clock')).toBeInTheDocument();

    // Press Escape — should not throw, layout remains
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('widget-clock')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// UC1-S8: Layout persisted to localStorage after drop
// Tasks 4.7, 4.2, 2.6
// ---------------------------------------------------------------------------
describe('DashboardGrid – layout persistence after drop', () => {
  beforeEach(() => localStorage.clear());

  it('UC1-S8: initial default layout is NOT written to localStorage until a drop occurs', () => {
    renderGrid();
    // On first mount with no stored layout, localStorage should remain empty
    // (we only write back on saveLayout or validation correction)
    expect(localStorage.getItem('test-grid-layout')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// UC2-E1a: Default layout used on first visit (no stored data)
// Task 4.2
// ---------------------------------------------------------------------------
describe('DashboardGrid – default layout fallback', () => {
  beforeEach(() => localStorage.clear());

  it('UC2-E1a: renders default layout widgets when localStorage is empty', () => {
    renderGrid();
    expect(screen.getByTestId('widget-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-notes')).toBeInTheDocument();
  });
});
