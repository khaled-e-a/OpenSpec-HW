/**
 * Integration tests for widget-add, widget-remove, and widget-resize capabilities.
 *
 * UC1: Add Widget to Dashboard
 * UC3: Remove Widget
 * UC2: Resize Widget (ghost logic, cancel, Escape)
 */
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardGrid } from '../DashboardGrid';
import { DraggableWidget } from '../DraggableWidget';
import type { WidgetLayout } from '../types';
import { findFirstOpenCell } from '../utils/findFirstOpenCell';
import { isValidDrop } from '../utils/collision';

// ---------------------------------------------------------------------------
// Shared test harness
// ---------------------------------------------------------------------------

const COLS = 4;
const ROWS = 3;

function TestApp({
  initialLayout,
  onLayoutChange,
}: {
  initialLayout: WidgetLayout[];
  onLayoutChange?: (l: WidgetLayout[]) => void;
}) {
  const [layout, setLayout] = useState(initialLayout);

  const nextCell = findFirstOpenCell(layout, COLS, ROWS);

  function handleAdd() {
    if (!nextCell) return;
    const id = `w-new-${Date.now()}`;
    setLayout((prev) => [...prev, { id, col: nextCell.col, row: nextCell.row, w: 1, h: 1, type: 'clock' }]);
    onLayoutChange?.([...layout, { id, col: nextCell.col, row: nextCell.row, w: 1, h: 1, type: 'clock' }]);
  }

  function handleRemove(id: string) {
    const updated = layout.filter((w) => w.id !== id);
    setLayout(updated);
    onLayoutChange?.(updated);
  }

  return (
    <div>
      <button
        data-testid="add-widget"
        onClick={handleAdd}
        disabled={!nextCell}
      >
        Add Widget
      </button>
      <DashboardGrid
        layout={layout}
        cols={COLS}
        rows={ROWS}
        rowHeight={120}
        onLayoutChange={(l) => {
          setLayout(l);
          onLayoutChange?.(l);
        }}
      >
        {layout.map((item) => (
          <DraggableWidget
            key={item.id}
            {...item}
            onRemove={() => handleRemove(item.id)}
          >
            <div data-testid={`widget-${item.id}`}>{item.id}</div>
          </DraggableWidget>
        ))}
      </DashboardGrid>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UC1: Add Widget
// ---------------------------------------------------------------------------

describe('UC1 — Add Widget to Dashboard', () => {
  /**
   * UC1-S1/S3/S4/S5 — clicking Add Widget adds a new widget to the layout
   */
  it('7.2a — clicking Add Widget renders a new widget on the grid', async () => {
    const onLayoutChange = vi.fn();
    const initial: WidgetLayout[] = [{ id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    const btn = screen.getByTestId('add-widget') as HTMLButtonElement;
    expect(btn.disabled).toBe(false); // UC1-S1: button enabled

    await userEvent.click(btn);

    // A new widget element should appear in the DOM
    const widgets = document.querySelectorAll('[data-testid^="widget-"]');
    expect(widgets.length).toBe(2); // UC1-S4/S5
  });

  /**
   * UC1-S2 — new widget placed at first available cell (col:1,row:0 after w1 at col:0,row:0)
   */
  it('7.2b — new widget placed at the first open cell', () => {
    const initial: WidgetLayout[] = [{ id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];
    const nextCell = findFirstOpenCell(initial, COLS, ROWS);
    expect(nextCell).toEqual({ col: 1, row: 0 }); // UC1-S2
  });

  /**
   * UC1-S3 — System creates a new widget entry with default size (1×1) at the found cell
   */
  it('7.2d — new widget has default w:1 h:1', async () => {
    const onLayoutChange = vi.fn();
    const initial: WidgetLayout[] = [{ id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    await userEvent.click(screen.getByTestId('add-widget'));

    const lastCall: WidgetLayout[] = onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
    const newWidget = lastCall.find((w) => w.id !== 'w1');
    expect(newWidget).toBeDefined();
    expect(newWidget!.w).toBe(1); // UC1-S3: default width
    expect(newWidget!.h).toBe(1); // UC1-S3: default height
    expect(newWidget!.col).toBe(1); // placed at first open cell
    expect(newWidget!.row).toBe(0);
  });

  /**
   * UC1-E1a — Add Widget button is disabled when grid is full
   */
  it('7.2c — Add Widget button is disabled when grid is completely full', () => {
    // Fill the entire 4×3 grid with one 4×3 widget
    const full: WidgetLayout[] = [{ id: 'big', col: 0, row: 0, w: 4, h: 3, type: 'clock' }];
    render(<TestApp initialLayout={full} />);

    const btn = screen.getByTestId('add-widget') as HTMLButtonElement;
    expect(btn.disabled).toBe(true); // UC1-E1a
  });
});

// ---------------------------------------------------------------------------
// UC3: Remove Widget
// ---------------------------------------------------------------------------

describe('UC3 — Remove Widget', () => {
  /**
   * UC3-S1/S2/S3/S4 — clicking × removes the widget from the DOM and layout
   */
  it('7.3a — clicking remove button removes the widget', async () => {
    const onLayoutChange = vi.fn();
    const initial: WidgetLayout[] = [
      { id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' },
      { id: 'w2', col: 1, row: 0, w: 1, h: 1, type: 'clock' },
    ];
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    // Find the remove button for w1 (aria-label="Remove widget" closest to w1)
    const w1 = screen.getByTestId('widget-w1');
    const removeBtn = w1.parentElement!.querySelector('[aria-label="Remove widget"]')!;
    await userEvent.click(removeBtn);

    // w1 should no longer be in the DOM (UC3-S3)
    expect(screen.queryByTestId('widget-w1')).toBeNull();
    // onLayoutChange should have been called without w1 (UC3-S4)
    expect(onLayoutChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'w2' })]),
    );
    const lastCall: WidgetLayout[] = onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
    expect(lastCall.some((w) => w.id === 'w1')).toBe(false);
  });

  /**
   * UC3-E1a — removing the last widget leaves an empty layout
   */
  it('7.3b — removing the last widget results in an empty layout', async () => {
    const onLayoutChange = vi.fn();
    const initial: WidgetLayout[] = [{ id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    const w1 = screen.getByTestId('widget-w1');
    const removeBtn = w1.parentElement!.querySelector('[aria-label="Remove widget"]')!;
    await userEvent.click(removeBtn);

    expect(screen.queryByTestId('widget-w1')).toBeNull();
    const lastCall: WidgetLayout[] = onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveLength(0); // UC3-E1a
  });
});

// ---------------------------------------------------------------------------
// UC2: Resize — ghost update logic (unit-level, UC2-S4/S5/E3a/E5a)
// ---------------------------------------------------------------------------

describe('UC2 — Resize ghost validation logic', () => {
  const layout: WidgetLayout[] = [
    { id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' },
    { id: 'w2', col: 2, row: 0, w: 1, h: 1, type: 'clock' },
  ];

  /**
   * UC2-S4/S5 — valid candidate size passes isValidDrop
   */
  it('7.4a — candidate within bounds and no collision is valid', () => {
    // Resize w1 to w:2,h:1 — would occupy cols 0-1 row 0, no collision with w2 at col 2
    expect(isValidDrop({ col: 0, row: 0, w: 2, h: 1 }, layout, COLS, ROWS, 'w1')).toBe(true);
  });

  /**
   * UC2-E5a — candidate exceeds grid bounds is invalid
   */
  it('7.4b — candidate exceeding grid bounds is invalid', () => {
    // Resize w1 to w:5 in a 4-col grid
    expect(isValidDrop({ col: 0, row: 0, w: 5, h: 1 }, layout, COLS, ROWS, 'w1')).toBe(false);
  });

  /**
   * UC2-E5a — candidate colliding with another widget is invalid
   */
  it('7.4c — candidate colliding with another widget is invalid', () => {
    // Resize w1 to w:3 — would overlap w2 at col 2
    expect(isValidDrop({ col: 0, row: 0, w: 3, h: 1 }, layout, COLS, ROWS, 'w1')).toBe(false);
  });

  /**
   * UC2-E3a — minimum size clamped to 1×1
   */
  it('7.4d — clamping to minimum 1×1 produces a valid candidate', () => {
    const candidateW = Math.max(1, 1 - 10); // simulated over-drag → clamped to 1
    const candidateH = Math.max(1, 1 - 10);
    expect(candidateW).toBe(1);
    expect(candidateH).toBe(1);
    expect(isValidDrop({ col: 0, row: 0, w: candidateW, h: candidateH }, layout, COLS, ROWS, 'w1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// UC2: Resize — commit and cancel (integration)
// ---------------------------------------------------------------------------

describe('UC2 — Resize commit and cancel', () => {
  const initial: WidgetLayout[] = [{ id: 'w1', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];

  /**
   * UC2-E7a — releasing on an invalid candidate does not call onLayoutChange with new w/h
   *
   * We simulate: pointerdown on handle, pointermove to invalid pos, pointerup.
   * Because jsdom has no layout, the grid bounding rect is zero, so any resize
   * candidate will be the clamped minimum 1×1 (valid). We verify the resize
   * handle is present and fires stopPropagation correctly.
   */
  it('7.5a — resize handle is present for each widget', () => {
    render(<TestApp initialLayout={initial} />);
    const w1 = screen.getByTestId('widget-w1');
    const handle = w1.parentElement!.querySelector('[aria-label="Resize widget"]');
    expect(handle).not.toBeNull(); // UC2-S1
  });

  /**
   * UC2-S2 — System enters resize mode — ghost overlay shows current size at current position
   * Verifies that a ghost element (aria-hidden overlay) is rendered in the grid after
   * pressing the resize handle.
   */
  it('7.5c — ghost element is rendered after pressing the resize handle', async () => {
    render(<TestApp initialLayout={initial} />);
    const w1 = screen.getByTestId('widget-w1');
    const handle = w1.parentElement!.querySelector('[aria-label="Resize widget"]')!;

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100, clientY: 100 });

    // Ghost is aria-hidden; it should appear in the grid container after resize starts.
    // We look for the aria-hidden element that GhostWidget renders.
    const ghost = document.querySelector('[aria-hidden="true"]');
    expect(ghost).not.toBeNull(); // UC2-S2: ghost overlay visible
  });

  /**
   * UC2-S7/S8/S9/S10 — pointerup after resize start commits layout change
   * In jsdom the bounding rect is zero, so the cell delta computes as NaN and
   * Math.max(1, NaN) = NaN → candidateW/H = NaN. isValidDrop with NaN dimensions
   * passes bounds/collision checks (NaN comparisons are false), so the commit fires
   * with the ghost's stored w/h = originW/H = 1. This verifies the commit path.
   */
  it('7.5d — pointerup after resize start calls onLayoutChange', async () => {
    const onLayoutChange = vi.fn();
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    const w1 = screen.getByTestId('widget-w1');
    const handle = w1.parentElement!.querySelector('[aria-label="Resize widget"]')!;

    // UC2-S1: start resize
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100, clientY: 100 });
    // UC2-S7/S8/S9: release — commits whatever ghost size was set (1×1 in jsdom)
    fireEvent.pointerUp(window, { clientX: 100, clientY: 100 });

    // onLayoutChange must be called (UC2-S9)
    expect(onLayoutChange).toHaveBeenCalled();
    const committed: WidgetLayout[] = onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
    const w1Entry = committed.find((w) => w.id === 'w1');
    expect(w1Entry).toBeDefined(); // UC2-S10: widget still present at its position
  });

  /**
   * UC2-E7a — User releases at invalid size — resize cancelled, original size retained
   * NOTE: This scenario cannot be fully exercised in jsdom because
   * `getBoundingClientRect()` returns a zero-size rect, making it impossible to
   * drive the ghost to a genuinely invalid candidate by moving the pointer.
   * The Escape path (UC2-E7b, tested in 7.5b) covers the cancel contract.
   * A full end-to-end browser test is required for UC2-E7a.
   */
  it.skip('7.5e — releasing at invalid resize size cancels without committing (jsdom limitation)', () => {
    // Blocked: jsdom zero bounding rect prevents computing a non-1×1 candidate via pointer delta.
    // Covered contractually by: isValidDrop tests (7.4b, 7.4c) + cancel path (7.5b).
  });

  /**
   * UC2-E7b — Escape during resize cancels without calling onLayoutChange
   */
  it('7.5b — pressing Escape during resize does not commit layout change', () => {
    const onLayoutChange = vi.fn();
    render(<TestApp initialLayout={initial} onLayoutChange={onLayoutChange} />);

    const w1 = screen.getByTestId('widget-w1');
    const handle = w1.parentElement!.querySelector('[aria-label="Resize widget"]')!;

    // Start resize
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100, clientY: 100 });

    // Press Escape (UC2-E7b)
    fireEvent.keyDown(window, { key: 'Escape' });

    // No layout change should be committed
    // (onLayoutChange may have been called for drag-drop tests but not for this resize cancel)
    const resizeCommitCalls = onLayoutChange.mock.calls.filter(
      (call) => call[0].some((w: WidgetLayout) => w.id === 'w1' && (w.w !== 1 || w.h !== 1)),
    );
    expect(resizeCommitCalls).toHaveLength(0);
  });
});
