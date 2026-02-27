import { describe, it, expect } from 'vitest';
import { computeContainerHeight, itemToPixelRect } from '../geometry';
import type { LayoutItem } from '../../types';

function item(x: number, y: number, w: number, h: number): LayoutItem {
  return { id: 'x', type: 't', x, y, w, h };
}

// GL-R3-S2 / GL-R3-S1
describe('computeContainerHeight', () => {
  it('returns 1 * rowHeight for empty layout (GL-R3-S2)', () => {
    expect(computeContainerHeight([], 80)).toBe(80);
  });

  it('returns max occupied row * rowHeight (GL-R3-S1)', () => {
    // widget at y=3, h=2 → maxRow = 3+2 = 5
    expect(computeContainerHeight([item(0, 3, 2, 2)], 80)).toBe(5 * 80);
  });

  it('uses the tallest widget when multiple items exist', () => {
    const layout = [item(0, 0, 2, 2), item(4, 3, 2, 3)];
    // tallest: y=3+h=3 → row 6
    expect(computeContainerHeight(layout, 100)).toBe(6 * 100);
  });
});

// GL-R2-S1
describe('itemToPixelRect', () => {
  it('converts grid coordinates to absolute pixel rect (GL-R2-S1)', () => {
    // item { x:2, y:1, w:3, h:2 }, colWidth=100, rowHeight=80
    expect(itemToPixelRect(item(2, 1, 3, 2), 100, 80)).toEqual({
      left: 200,
      top: 80,
      width: 300,
      height: 160,
    });
  });

  it('handles origin item at x=0, y=0', () => {
    expect(itemToPixelRect(item(0, 0, 4, 2), 120, 60)).toEqual({
      left: 0,
      top: 0,
      width: 480,
      height: 120,
    });
  });
});
