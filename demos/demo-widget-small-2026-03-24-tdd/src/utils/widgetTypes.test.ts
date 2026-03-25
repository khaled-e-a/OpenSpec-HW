import { describe, it, expect } from 'vitest';
import { WIDGET_TYPES } from './gridGeometry';
import type { WidgetType, WidgetConfig, WidgetLayout } from './gridGeometry';

// ---------------------------------------------------------------------------
// Task 1.1 — WidgetType union and WidgetConfig interface (UC1-S2, UC2-S1, UC3-S1, UC4-S1)
// Task 1.2 — WidgetLayout optional type+config fields (UC5-S5)
// ---------------------------------------------------------------------------

describe('WidgetType union (UC1-S2, UC2-S1, UC3-S1, UC4-S1)', () => {
  it('exports WIDGET_TYPES constant with all four type strings', () => {
    expect(WIDGET_TYPES).toEqual(['clock', 'image', 'file', 'webpage']);
  });
});

describe('WidgetLayout with optional type and config (UC5-S5)', () => {
  it('accepts WidgetLayout without type — backward compatible', () => {
    const w: WidgetLayout = { id: 'a', x: 0, y: 0, w: 1, h: 1 };
    expect(w.type).toBeUndefined();
    expect(w.config).toBeUndefined();
  });

  it('accepts WidgetLayout with type: clock', () => {
    const w: WidgetLayout = { id: 'a', x: 0, y: 0, w: 1, h: 1, type: 'clock' };
    expect(w.type).toBe('clock');
  });

  it('accepts WidgetLayout with type: image and imageUrl config', () => {
    const w: WidgetLayout = {
      id: 'b', x: 0, y: 0, w: 1, h: 1,
      type: 'image',
      config: { imageUrl: 'blob:http://localhost/abc' },
    };
    expect(w.type).toBe('image');
    expect(w.config?.imageUrl).toBe('blob:http://localhost/abc');
  });

  it('accepts WidgetLayout with type: file and fileText config', () => {
    const w: WidgetLayout = {
      id: 'c', x: 0, y: 0, w: 1, h: 1,
      type: 'file',
      config: { fileText: 'hello world', fileName: 'readme.txt' },
    };
    expect(w.config?.fileText).toBe('hello world');
    expect(w.config?.fileName).toBe('readme.txt');
  });

  it('accepts WidgetLayout with type: webpage and webpageUrl config', () => {
    const w: WidgetLayout = {
      id: 'd', x: 0, y: 0, w: 1, h: 1,
      type: 'webpage',
      config: { webpageUrl: 'https://example.com' },
    };
    expect(w.config?.webpageUrl).toBe('https://example.com');
  });
});
