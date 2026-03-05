import { useState, useRef, useCallback } from 'react';

interface WidgetPosition {
  id: string;
  index: number;
}

interface UseDragRevertReturn {
  originalPositions: WidgetPosition[];
  saveOriginalPositions: (widgets: any[]) => void;
  revertToOriginal: () => WidgetPosition[];
  isReverting: boolean;
  startRevert: () => void;
  endRevert: () => void;
}

export const useDragRevert = (): UseDragRevertReturn => {
  const [originalPositions, setOriginalPositions] = useState<WidgetPosition[]>([]);
  const [isReverting, setIsReverting] = useState(false);
  const revertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveOriginalPositions = useCallback((widgets: any[]) => {
    const positions = widgets.map((widget, index) => ({
      id: widget.id,
      index,
    }));
    setOriginalPositions(positions);
  }, []);

  const revertToOriginal = useCallback((): WidgetPosition[] => {
    return [...originalPositions];
  }, [originalPositions]);

  const startRevert = useCallback(() => {
    setIsReverting(true);

    // Auto-end revert after animation completes
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
    }

    revertTimeoutRef.current = setTimeout(() => {
      setIsReverting(false);
    }, 500); // Match animation duration
  }, []);

  const endRevert = useCallback(() => {
    setIsReverting(false);
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = null;
    }
  }, []);

  return {
    originalPositions,
    saveOriginalPositions,
    revertToOriginal,
    isReverting,
    startRevert,
    endRevert,
  };
};