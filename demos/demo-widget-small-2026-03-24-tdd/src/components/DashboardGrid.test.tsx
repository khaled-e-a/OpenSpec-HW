import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardGrid } from './DashboardGrid';
import type { WidgetLayout } from '../utils/gridGeometry';

// ---------------------------------------------------------------------------
// UC2-S2: System renders DashboardGrid canvas divided into equal-sized cells
// ---------------------------------------------------------------------------
describe('DashboardGrid — grid rendering', () => {
  it('UC2-S2: renders a grid container with correct CSS variables for cols, rows, cellSize', () => {
    const { container } = render(
      <DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={[]} />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid.style.getPropertyValue('--cols')).toBe('6');
    expect(grid.style.getPropertyValue('--rows')).toBe('4');
    expect(grid.style.getPropertyValue('--cell-size')).toBe('100px');
  });

  it('UC2-S2: renders with display grid', () => {
    const { container } = render(
      <DashboardGrid cols={4} rows={3} cellSize={80} initialLayout={[]} />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.display).toBe('grid');
  });
});

// ---------------------------------------------------------------------------
// UC2-S1: System receives initial layout configuration
// ---------------------------------------------------------------------------
describe('DashboardGrid — initial layout', () => {
  it('UC2-S1: renders nothing when initialLayout is empty', () => {
    const { container } = render(
      <DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={[]} />
    );
    // Should render grid wrapper but no widget children
    expect(container.querySelectorAll('[data-widget-id]').length).toBe(0);
  });

  it('UC2-S1: renders one widget per entry in initialLayout', () => {
    const layout: WidgetLayout[] = [
      { id: 'w1', x: 0, y: 0, w: 1, h: 1 },
      { id: 'w2', x: 2, y: 1, w: 2, h: 2 },
    ];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    expect(screen.getByTestId('widget-w1')).toBeInTheDocument();
    expect(screen.getByTestId('widget-w2')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// UC2-S3 / UC2-S4: Widgets rendered at correct size & position
// ---------------------------------------------------------------------------
describe('DashboardGrid — widget positioning', () => {
  it('UC2-S3: widget has correct grid-column and grid-row CSS', () => {
    const layout: WidgetLayout[] = [{ id: 'w1', x: 1, y: 2, w: 2, h: 1 }];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    const widget = screen.getByTestId('widget-w1');
    expect(widget.style.gridColumn).toBe('2 / span 2');
    expect(widget.style.gridRow).toBe('3 / span 1');
  });

  it('UC2-S4: multiple widgets do not overlap (have distinct CSS grid positions)', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
      { id: 'b', x: 2, y: 0, w: 1, h: 1 },
    ];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    const a = screen.getByTestId('widget-a');
    const b = screen.getByTestId('widget-b');
    expect(a.style.gridColumn).toBe('1 / span 1');
    expect(b.style.gridColumn).toBe('3 / span 1');
  });
});

// ---------------------------------------------------------------------------
// UC2-E3a: Overlapping initial config — first wins, second relocated, warning logged
// ---------------------------------------------------------------------------
describe('DashboardGrid — overlap resolution', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('UC2-E3a: emits console.warn when initial layout has overlapping widgets', () => {
    const layout: WidgetLayout[] = [
      { id: 'first', x: 0, y: 0, w: 2, h: 2 },
      { id: 'second', x: 0, y: 0, w: 2, h: 2 },
    ];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    expect(console.warn).toHaveBeenCalled();
  });

  it('UC2-E3a: first widget retains its declared position after conflict resolution', () => {
    const layout: WidgetLayout[] = [
      { id: 'first', x: 0, y: 0, w: 2, h: 2 },
      { id: 'second', x: 0, y: 0, w: 2, h: 2 },
    ];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    const first = screen.getByTestId('widget-first');
    expect(first.style.gridColumn).toBe('1 / span 2');
    expect(first.style.gridRow).toBe('1 / span 2');
  });
});

// ---------------------------------------------------------------------------
// UC2-E3b: Out-of-bounds initial widget clamped to boundary
// ---------------------------------------------------------------------------
describe('DashboardGrid — out-of-bounds clamping', () => {
  it('UC2-E3b: widget declared beyond grid boundary is clamped within bounds', () => {
    const layout: WidgetLayout[] = [
      { id: 'over', x: 5, y: 3, w: 2, h: 2 }, // extends beyond 6-col/4-row grid
    ];
    render(<DashboardGrid cols={6} rows={4} cellSize={100} initialLayout={layout} />);
    const widget = screen.getByTestId('widget-over');
    // gridColumn start should be ≤ 6 - 2 + 1 = 5 (1-indexed CSS)
    const colStart = parseInt(widget.style.gridColumn.split(' ')[0], 10);
    const rowStart = parseInt(widget.style.gridRow.split(' ')[0], 10);
    expect(colStart + 2 - 1).toBeLessThanOrEqual(6); // colStart + w - 1 ≤ cols
    expect(rowStart + 2 - 1).toBeLessThanOrEqual(4); // rowStart + h - 1 ≤ rows
  });
});
