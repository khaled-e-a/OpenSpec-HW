import { describe, it, expectTypeOf } from 'vitest';
import type { WidgetLayout, WidgetDefinition } from './widgetTypes';

// UC1-S8, UC2-S1: WidgetLayout holds position + size for persistence
describe('WidgetLayout type', () => {
  it('UC1-S8/UC2-S1: has widgetId, col, row, w, h fields', () => {
    const layout: WidgetLayout = { widgetId: 'a', col: 0, row: 0, w: 1, h: 1 };
    expectTypeOf(layout.widgetId).toBeString();
    expectTypeOf(layout.col).toBeNumber();
    expectTypeOf(layout.row).toBeNumber();
    expectTypeOf(layout.w).toBeNumber();
    expectTypeOf(layout.h).toBeNumber();
  });
});

// UC2-S2, UC2-E2a: WidgetDefinition describes static widget metadata
describe('WidgetDefinition type', () => {
  it('UC2-S2/UC2-E2a: has id, w, h, defaultCol, defaultRow fields', () => {
    const def: WidgetDefinition = { id: 'clock', w: 1, h: 1, defaultCol: 0, defaultRow: 0 };
    expectTypeOf(def.id).toBeString();
    expectTypeOf(def.w).toBeNumber();
    expectTypeOf(def.h).toBeNumber();
    expectTypeOf(def.defaultCol).toBeNumber();
    expectTypeOf(def.defaultRow).toBeNumber();
  });
});
