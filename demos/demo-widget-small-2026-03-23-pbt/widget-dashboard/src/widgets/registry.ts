import React from 'react';
import { WidgetDefinition, LayoutMap } from './types';
import ClockWidget from './ClockWidget';
import ImageViewerWidget from './ImageViewerWidget';
import FileViewerWidget from './FileViewerWidget';
import WebpageViewerWidget from './WebpageViewerWidget';

// Tasks 1.3–1.7 — remove stubs, register four new widget types
export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // Task 1.4 — clock (2×1)
  'clock': {
    type: 'clock',
    displayName: 'Clock',
    defaultSize: { w: 2, h: 1 },
    component: ClockWidget,
  },
  // Task 1.5 — image viewer (3×2)
  'image-viewer': {
    type: 'image-viewer',
    displayName: 'Image Viewer',
    defaultSize: { w: 3, h: 2 },
    component: ImageViewerWidget,
  },
  // Task 1.6 — file viewer (3×2)
  'file-viewer': {
    type: 'file-viewer',
    displayName: 'File Viewer',
    defaultSize: { w: 3, h: 2 },
    component: FileViewerWidget,
  },
  // Task 1.7 — webpage viewer (4×3)
  'webpage-viewer': {
    type: 'webpage-viewer',
    displayName: 'Webpage Viewer',
    defaultSize: { w: 4, h: 3 },
    component: WebpageViewerWidget,
  },
};

// Task 1.8 — default layout: one of each widget at non-overlapping positions
//   clock:    cols 0-1, rows 0   (2×1)
//   image:    cols 2-4, rows 0-1 (3×2)
//   file:     cols 5-7, rows 0-1 (3×2)
//   webpage:  cols 0-3, rows 2-4 (4×3)
export const DEFAULT_LAYOUT: LayoutMap = {
  'default-clock':    { id: 'default-clock',    col: 0, row: 0, w: 2, h: 1 },
  'default-image':    { id: 'default-image',    col: 2, row: 0, w: 3, h: 2 },
  'default-file':     { id: 'default-file',     col: 5, row: 0, w: 3, h: 2 },
  'default-webpage':  { id: 'default-webpage',  col: 0, row: 2, w: 4, h: 3 },
};

// Map widget instance id → widget type
export type WidgetTypeMap = Record<string, string>;

// Task 1.9 — DEFAULT_TYPE_MAP uses new type keys
export const DEFAULT_TYPE_MAP: WidgetTypeMap = {
  'default-clock':   'clock',
  'default-image':   'image-viewer',
  'default-file':    'file-viewer',
  'default-webpage': 'webpage-viewer',
};
