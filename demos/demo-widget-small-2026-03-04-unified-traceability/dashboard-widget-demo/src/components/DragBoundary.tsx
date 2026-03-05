import React, { useEffect, useState } from 'react';
import './DragBoundary.css';

interface DragBoundaryProps {
  isDragging: boolean;
  onBoundaryHit: (boundary: 'top' | 'bottom' | 'left' | 'right') => void;
}

const DragBoundary: React.FC<DragBoundaryProps> = ({ isDragging, onBoundaryHit }) => {
  const [showBoundaryWarning, setShowBoundaryWarning] = useState(false);
  const [boundaryType, setBoundaryType] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);

  useEffect(() => {
    if (!isDragging) {
      setShowBoundaryWarning(false);
      setBoundaryType(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      const margin = 50; // pixels from edge
      let hitBoundary: 'top' | 'bottom' | 'left' | 'right' | null = null;

      if (clientY < margin) {
        hitBoundary = 'top';
      } else if (clientY > innerHeight - margin) {
        hitBoundary = 'bottom';
      } else if (clientX < margin) {
        hitBoundary = 'left';
      } else if (clientX > innerWidth - margin) {
        hitBoundary = 'right';
      }

      if (hitBoundary) {
        setBoundaryType(hitBoundary);
        setShowBoundaryWarning(true);
        onBoundaryHit(hitBoundary);
      } else {
        setShowBoundaryWarning(false);
        setBoundaryType(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging, onBoundaryHit]);

  if (!showBoundaryWarning || !boundaryType) {
    return null;
  }

  const getBoundaryMessage = () => {
    switch (boundaryType) {
      case 'top':
        return '↑ Move back to dashboard area';
      case 'bottom':
        return '↓ Move back to dashboard area';
      case 'left':
        return '← Move back to dashboard area';
      case 'right':
        return '→ Move back to dashboard area';
      default:
        return '';
    }
  };

  return (
    <div className={`boundary-warning ${boundaryType}`}>
      <div className="boundary-message">
        <span className="boundary-icon">⚠️</span>
        {getBoundaryMessage()}
      </div>
    </div>
  );
};

export default DragBoundary;