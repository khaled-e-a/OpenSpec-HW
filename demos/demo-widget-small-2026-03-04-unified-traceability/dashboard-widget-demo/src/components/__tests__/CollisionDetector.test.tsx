import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollisionDetector from '../CollisionDetector';

describe('CollisionDetector Component', () => {
  it('Should detect collision with overlapping widgets', async () => {
    const onCollisionChange = jest.fn();
    const draggedPosition = { x: 0, y: 0, width: 3, height: 2 };
    const allWidgets = [
      { id: 'widget-2', position: { x: 2, y: 0, width: 3, height: 2 } },
    ];

    render(
      <CollisionDetector
        draggedWidgetId="widget-1"
        draggedPosition={draggedPosition}
        allWidgets={allWidgets}
        onCollisionChange={onCollisionChange}
      />
    );

    await waitFor(() => {
      expect(onCollisionChange).toHaveBeenCalledWith(true);
    });
  });

  it('Should prevent drop on collision', async () => {
    const onCollisionChange = jest.fn();
    const draggedPosition = { x: 0, y: 0, width: 3, height: 2 };
    const allWidgets = [
      { id: 'widget-2', position: { x: 0, y: 0, width: 3, height: 2 } },
    ];

    render(
      <CollisionDetector
        draggedWidgetId="widget-1"
        draggedPosition={draggedPosition}
        allWidgets={allWidgets}
        onCollisionChange={onCollisionChange}
      />
    );

    await waitFor(() => {
      expect(onCollisionChange).toHaveBeenCalledWith(true);
    });
  });

  it('Should not detect collision for non-overlapping widgets', async () => {
    const onCollisionChange = jest.fn();
    const draggedPosition = { x: 0, y: 0, width: 3, height: 2 };
    const allWidgets = [
      { id: 'widget-2', position: { x: 6, y: 0, width: 3, height: 2 } },
    ];

    render(
      <CollisionDetector
        draggedWidgetId="widget-1"
        draggedPosition={draggedPosition}
        allWidgets={allWidgets}
        onCollisionChange={onCollisionChange}
      />
    );

    await waitFor(() => {
      expect(onCollisionChange).toHaveBeenCalledWith(false);
    });
  });
});