/**
 * Tests for WIDGET_REGISTRY (delta spec: widget-drag-drop changes in widget-content-types).
 * Coverage: UC6-S3, UC6-E3a1 (registry shape), delta spec scenarios
 */
import { WIDGET_REGISTRY, DEFAULT_LAYOUT, DEFAULT_TYPE_MAP } from './registry';

// ─── Registry shape (delta spec: widget-drag-drop) ────────────────────────────

test('Registry contains exactly four new widget types', () => {
  const keys = Object.keys(WIDGET_REGISTRY);
  expect(keys).toHaveLength(4);
  expect(keys).toContain('clock');
  expect(keys).toContain('image-viewer');
  expect(keys).toContain('file-viewer');
  expect(keys).toContain('webpage-viewer');
});

test('Registry does NOT contain legacy stub types', () => {
  expect(WIDGET_REGISTRY['text-card']).toBeUndefined();
  expect(WIDGET_REGISTRY['metric-card']).toBeUndefined();
  expect(WIDGET_REGISTRY['chart-placeholder']).toBeUndefined();
});

test('clock entry has displayName Clock and defaultSize 2×1', () => {
  expect(WIDGET_REGISTRY['clock'].displayName).toBe('Clock');
  expect(WIDGET_REGISTRY['clock'].defaultSize).toEqual({ w: 2, h: 1 });
});

test('image-viewer entry has defaultSize 3×2', () => {
  expect(WIDGET_REGISTRY['image-viewer'].defaultSize).toEqual({ w: 3, h: 2 });
});

test('file-viewer entry has defaultSize 3×2', () => {
  expect(WIDGET_REGISTRY['file-viewer'].defaultSize).toEqual({ w: 3, h: 2 });
});

test('webpage-viewer entry has defaultSize 4×3', () => {
  expect(WIDGET_REGISTRY['webpage-viewer'].defaultSize).toEqual({ w: 4, h: 3 });
});

test('all registry entries have a component function', () => {
  for (const [key, def] of Object.entries(WIDGET_REGISTRY)) {
    expect(typeof def.component).toBe('function');
  }
});

// ─── Default layout shape ─────────────────────────────────────────────────────

test('DEFAULT_LAYOUT contains one entry per new widget type (four total)', () => {
  expect(Object.keys(DEFAULT_LAYOUT)).toHaveLength(4);
});

test('DEFAULT_TYPE_MAP maps all four default IDs to new type keys', () => {
  const types = Object.values(DEFAULT_TYPE_MAP);
  expect(types).toContain('clock');
  expect(types).toContain('image-viewer');
  expect(types).toContain('file-viewer');
  expect(types).toContain('webpage-viewer');
});

test('DEFAULT_TYPE_MAP does not map any ID to a stub type', () => {
  for (const type of Object.values(DEFAULT_TYPE_MAP)) {
    expect(['text-card', 'metric-card', 'chart-placeholder']).not.toContain(type);
  }
});

test('DEFAULT_LAYOUT positions do not overlap', () => {
  const entries = Object.values(DEFAULT_LAYOUT);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      const xOverlap = a.col < b.col + b.w && a.col + a.w > b.col;
      const yOverlap = a.row < b.row + b.h && a.row + a.h > b.row;
      expect(xOverlap && yOverlap).toBe(false);
    }
  }
});
