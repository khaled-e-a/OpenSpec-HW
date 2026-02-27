import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';
import type { GridLayout } from '../components/dashboard/types';

const LAYOUT: GridLayout = [
  { id: 'w1', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'w2', col: 3, row: 2, colSpan: 2, rowSpan: 2 },
];

function renderGrid(overrides: Partial<React.ComponentProps<typeof DashboardGrid>> = {}) {
  const props = {
    initialLayout: LAYOUT,
    ...overrides,
  };
  return render(
    <DashboardGrid {...props}>
      <Widget id="w1">Widget 1</Widget>
      <Widget id="w2" colSpan={2} rowSpan={2}>Widget 2</Widget>
    </DashboardGrid>
  );
}

describe('DashboardGrid', () => {
  it('renders with default grid styles (12 cols, 8 rows, 8px gap)', () => {
    const { container } = renderGrid();
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.display).toBe('grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(12, 1fr)');
    expect(grid.style.gridTemplateRows).toBe('repeat(8, 1fr)');
    expect(grid.style.gap).toBe('8px');
  });

  it('applies custom columns, rows, and gap', () => {
    const { container } = renderGrid({ columns: 4, rows: 3, gap: 16 });
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    expect(grid.style.gridTemplateRows).toBe('repeat(3, 1fr)');
    expect(grid.style.gap).toBe('16px');
  });

  it('renders children', () => {
    renderGrid();
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Widget 2')).toBeInTheDocument();
  });

  it('does not render a widget whose colSpan exceeds grid columns', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const oversizedLayout: GridLayout = [
      { id: 'too-wide', col: 1, row: 1, colSpan: 5, rowSpan: 1 },
    ];
    render(
      <DashboardGrid initialLayout={oversizedLayout} columns={4} rows={4}>
        <Widget id="too-wide" colSpan={5}>Should not render</Widget>
      </DashboardGrid>
    );
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('colSpan=5'));
    warnSpy.mockRestore();
  });
});

describe('Widget', () => {
  it('applies correct grid-column and grid-row for a 1x1 widget at col=1,row=1', () => {
    const { container } = renderGrid();
    const widgets = container.querySelectorAll('[style*="grid-column"]');
    const w1 = Array.from(widgets).find((el) =>
      (el as HTMLElement).style.gridColumn.includes('1')
    ) as HTMLElement;
    expect(w1).toBeDefined();
    expect(w1.style.gridColumn).toBe('1 / span 1');
    expect(w1.style.gridRow).toBe('1 / span 1');
  });

  it('applies correct grid-column and grid-row for a 2x2 widget at col=3,row=2', () => {
    const { container } = renderGrid();
    // w2 is at col=3, row=2 with colSpan=2, rowSpan=2
    const allDivs = container.querySelectorAll('div');
    const w2 = Array.from(allDivs).find(
      (el) =>
        (el as HTMLElement).style.gridColumn === '3 / span 2' &&
        (el as HTMLElement).style.gridRow === '2 / span 2'
    ) as HTMLElement;
    expect(w2).toBeDefined();
  });

  it('is non-draggable when draggable={false}', () => {
    const layout: GridLayout = [{ id: 'nd', col: 1, row: 1, colSpan: 1, rowSpan: 1 }];
    const { container } = render(
      <DashboardGrid initialLayout={layout}>
        <Widget id="nd" draggable={false}>No drag</Widget>
      </DashboardGrid>
    );
    const widgetEl = screen.getByText('No drag').parentElement as HTMLElement;
    expect(widgetEl.onpointerdown).toBeNull();
  });
});
