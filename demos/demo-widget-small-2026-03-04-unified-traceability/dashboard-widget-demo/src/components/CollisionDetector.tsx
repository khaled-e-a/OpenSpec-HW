import React from 'react';
import { useEffect, useState } from 'react';
import { GridPosition, isValidPosition } from '../utils/gridUtils';

interface CollisionDetectorProps {
  draggedWidgetId: string;
  draggedPosition: GridPosition;
  allWidgets: Array<{ id: string; position: GridPosition }>;
  onCollisionChange: (hasCollision: boolean) => void;
}

const CollisionDetector: React.FC<CollisionDetectorProps> = ({
  draggedWidgetId,
  draggedPosition,
  allWidgets,
  onCollisionChange,
}) => {
  const [hasCollision, setHasCollision] = useState(false);

  useEffect(() => {
    const occupiedPositions = allWidgets
      .filter(widget => widget.id !== draggedWidgetId)
      .map(widget => widget.position);

    const collision = !isValidPosition(draggedPosition, occupiedPositions);
    setHasCollision(collision);
    onCollisionChange(collision);
  }, [draggedWidgetId, draggedPosition, allWidgets, onCollisionChange]);

  return (
    <div className={`collision-indicator ${hasCollision ? 'collision-active' : ''}`}>
      {hasCollision && (
        <div className="collision-warning">
          <span>⚠️ Position occupied</span>
        </div>
      )}
    </div>
  );
};

export default CollisionDetector;