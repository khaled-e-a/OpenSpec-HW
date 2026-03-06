import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

interface VirtualizedWidgets<T> {
  visibleWidgets: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

export const useWidgetVirtualization = <T>(
  widgets: T[],
  config: VirtualizationConfig
): VirtualizedWidgets<T> => {
  const { itemHeight, containerHeight, overscan = 3 } = config;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    widgets.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Get visible widgets
  const visibleWidgets = widgets.slice(startIndex, endIndex + 1);

  // Calculate virtualization metrics
  const totalHeight = widgets.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    visibleWidgets,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
};

// Performance optimization hook for drag operations
export const useDragPerformance = () => {
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);

  const optimizeForDrag = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      callback();
    });
  }, []);

  const startDrag = useCallback(() => {
    setIsDragging(true);
    // Disable expensive operations during drag
    document.body.style.willChange = 'transform';
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.body.style.willChange = 'auto';
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    isDragging,
    startDrag,
    endDrag,
    optimizeForDrag,
  };
};

// Memoization helper for expensive calculations
export const useMemoizedGrid = (widgets: any[], gridSize: number) => {
  return React.useMemo(() => {
    // Expensive grid calculation
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

    widgets.forEach(widget => {
      const { position } = widget;
      for (let x = position.x; x < position.x + position.width; x++) {
        for (let y = position.y; y < position.y + position.height; y++) {
          if (grid[x] && grid[x][y] !== undefined) {
            grid[x][y] = true;
          }
        }
      }
    });

    return grid;
  }, [widgets, gridSize]);
};