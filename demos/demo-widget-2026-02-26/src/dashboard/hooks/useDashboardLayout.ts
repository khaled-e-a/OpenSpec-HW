import { useState, useCallback } from 'react';
import type { LayoutItem } from '../types';
import { findFirstAvailablePosition } from '../utils/layout';
import { WidgetRegistry } from '../registry/WidgetRegistry';

interface UseDashboardLayoutReturn {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  addWidget: (type: string) => boolean;
  removeWidget: (id: string) => void;
}

export function useDashboardLayout(
  initialLayout: LayoutItem[] = [],
  columns = 12,
): UseDashboardLayoutReturn {
  const [layout, setLayout] = useState<LayoutItem[]>(initialLayout);

  const onLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  }, []);

  const addWidget = useCallback(
    (type: string): boolean => {
      const entry = WidgetRegistry.get(type);
      if (!entry) return false;
      const pos = findFirstAvailablePosition(layout, entry.defaultSize, columns);
      if (!pos) return false;
      const newItem: LayoutItem = {
        id: crypto.randomUUID(),
        type,
        x: pos.x,
        y: pos.y,
        w: entry.defaultSize.w,
        h: entry.defaultSize.h,
      };
      setLayout((prev) => [...prev, newItem]);
      return true;
    },
    [layout, columns],
  );

  const removeWidget = useCallback((id: string) => {
    setLayout((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { layout, onLayoutChange, addWidget, removeWidget };
}
