import { useEffect, useRef } from 'react';

interface DragAnalytics {
  dragStartTime: number | null;
  dragCount: number;
  successfulDrops: number;
  failedDrops: number;
  collisions: number;
  averageDragDuration: number;
  totalDragTime: number;
}

export const useDragAnalytics = () => {
  const analyticsRef = useRef<DragAnalytics>({
    dragStartTime: null,
    dragCount: 0,
    successfulDrops: 0,
    failedDrops: 0,
    collisions: 0,
    averageDragDuration: 0,
    totalDragTime: 0,
  });

  const trackDragStart = () => {
    analyticsRef.current.dragStartTime = Date.now();
    analyticsRef.current.dragCount++;
  };

  const trackDragEnd = (success: boolean) => {
    const { dragStartTime } = analyticsRef.current;
    if (!dragStartTime) return;

    const duration = Date.now() - dragStartTime;
    analyticsRef.current.totalDragTime += duration;
    analyticsRef.current.averageDragDuration =
      analyticsRef.current.totalDragTime / analyticsRef.current.dragCount;

    if (success) {
      analyticsRef.current.successfulDrops++;
    } else {
      analyticsRef.current.failedDrops++;
    }

    analyticsRef.current.dragStartTime = null;

    // Log analytics event
    console.log('Drag Analytics:', {
      event: 'drag_end',
      success,
      duration,
      averageDuration: analyticsRef.current.averageDragDuration,
    });
  };

  const trackCollision = () => {
    analyticsRef.current.collisions++;
    console.log('Drag Analytics:', {
      event: 'collision',
      totalCollisions: analyticsRef.current.collisions,
    });
  };

  const getAnalytics = () => {
    return { ...analyticsRef.current };
  };

  // Send periodic analytics reports
  useEffect(() => {
    const interval = setInterval(() => {
      const analytics = getAnalytics();
      if (analytics.dragCount > 0) {
        // In a real app, this would send to analytics service
        console.log('Analytics Report:', analytics);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    trackDragStart,
    trackDragEnd,
    trackCollision,
    getAnalytics,
  };
};

// Helper to track specific widget interactions
export const trackWidgetInteraction = (widgetId: string, action: string, metadata?: any) => {
  console.log('Widget Analytics:', {
    widgetId,
    action,
    timestamp: Date.now(),
    metadata,
  });
};

// Track layout save events
export const trackLayoutSave = (layoutId: string, success: boolean, duration: number) => {
  console.log('Layout Save Analytics:', {
    layoutId,
    success,
    duration,
    timestamp: Date.now(),
  });
};