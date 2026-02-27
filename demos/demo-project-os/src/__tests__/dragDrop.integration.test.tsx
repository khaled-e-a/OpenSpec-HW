import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';
import type { GridLayout } from '../components/dashboard/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePointerEvent(type: string, x: number, y: number): PointerEvent {
  return new PointerEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    pointerId: 1,
  });
}

// Grid: 400×400, starting at (0,0). 4 cols, 4 rows, 8px gap.
// cellWidth = (400-24)/4 = 94; stride = 102.
// Cell (1,1) center ≈ (47, 47). Cell (3,3) center ≈ (2*102+47, 2*102+47) = (251, 251).

function mockGridRect(el: HTMLElement) {
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, right: 400, bottom: 400,
    width: 400, height: 400, x: 0, y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

// ─── Controlled wrapper ────────────────────────────────────────────────────────

function ControlledGrid({
  initialLayout,
  onLayoutChange,
}: {
  initialLayout: GridLayout;
  onLayoutChange?: (l: GridLayout) => void;
}) {
  const [layout, setLayout] = useState(initialLayout);
  return (
    <DashboardGrid
      columns={4}
      rows={4}
      gap={8}
      initialLayout={layout}
      onLayoutChange={(l) => {
        setLayout(l);
        onLayoutChange?.(l);
      }}
    >
      {initialLayout.map(({ id, colSpan, rowSpan }) => (
        <Widget key={id} id={id} colSpan={colSpan} rowSpan={rowSpan}>
          {id}
        </Widget>
      ))}
    </DashboardGrid>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Integration: successful drop', () => {
  it('updates layout and calls onLayoutChange when dropped on empty cell', () => {
    const LAYOUT: GridLayout = [
      { id: 'a', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { id: 'b', col: 4, row: 4, colSpan: 1, rowSpan: 1 },
    ];
    const onLayoutChange = jest.fn();

    const { container } = render(
      <ControlledGrid initialLayout={LAYOUT} onLayoutChange={onLayoutChange} />
    );
    const grid = container.firstChild as HTMLElement;
    mockGridRect(grid);

    const widgetA = screen.getByText('a');

    // Pointer down on widget a
    act(() => { fireEvent.pointerDown(widgetA, { clientX: 47, clientY: 47, pointerId: 1 }); });
    // Move to cell (3,3) center: (251, 251)
    act(() => { document.dispatchEvent(makePointerEvent('pointermove', 251, 251)); });
    // Drop
    act(() => { document.dispatchEvent(makePointerEvent('pointerup', 251, 251)); });

    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    const updated: GridLayout = onLayoutChange.mock.calls[0][0];
    const movedWidget = updated.find((w) => w.id === 'a');
    expect(movedWidget?.col).toBe(3);
    expect(movedWidget?.row).toBe(3);
  });
});

describe('Integration: drop cancellation via Escape', () => {
  it('reverts widget to original position on Escape', () => {
    const LAYOUT: GridLayout = [
      { id: 'a', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
    ];
    const onLayoutChange = jest.fn();

    const { container } = render(
      <ControlledGrid initialLayout={LAYOUT} onLayoutChange={onLayoutChange} />
    );
    const grid = container.firstChild as HTMLElement;
    mockGridRect(grid);

    const widgetA = screen.getByText('a');

    act(() => { fireEvent.pointerDown(widgetA, { clientX: 47, clientY: 47, pointerId: 1 }); });
    act(() => { document.dispatchEvent(makePointerEvent('pointermove', 251, 251)); });
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }); });

    // onLayoutChange should NOT have been called — widget stays put
    expect(onLayoutChange).not.toHaveBeenCalled();
  });
});

describe('Integration: collision — drop onto occupied cell', () => {
  it('reverts widget when dropped on an occupied cell', () => {
    const LAYOUT: GridLayout = [
      { id: 'a', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
      { id: 'b', col: 3, row: 3, colSpan: 1, rowSpan: 1 },
    ];
    const onLayoutChange = jest.fn();

    const { container } = render(
      <ControlledGrid initialLayout={LAYOUT} onLayoutChange={onLayoutChange} />
    );
    const grid = container.firstChild as HTMLElement;
    mockGridRect(grid);

    const widgetA = screen.getByText('a');

    // Try to drop 'a' exactly onto 'b' at cell (3,3)
    act(() => { fireEvent.pointerDown(widgetA, { clientX: 47, clientY: 47, pointerId: 1 }); });
    act(() => { document.dispatchEvent(makePointerEvent('pointermove', 251, 251)); });
    act(() => { document.dispatchEvent(makePointerEvent('pointerup', 251, 251)); });

    // 'b' is at (3,3), so drop should be blocked and onLayoutChange not called
    expect(onLayoutChange).not.toHaveBeenCalled();
  });
});
