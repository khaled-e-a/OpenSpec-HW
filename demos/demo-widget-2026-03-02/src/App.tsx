import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { DashboardProvider, DashboardGrid, useDashboard } from './';
import { WidgetRegistryProvider, useWidgetRegistry } from './context';
import { WidgetConfig } from './types/widget';
import { WeatherWidget } from './examples/WeatherWidget';
import { ChartWidget } from './examples/ChartWidget';
import './App.css';

const EXAMPLE_WIDGETS: WidgetConfig[] = [
  {
    component: WeatherWidget,
    metadata: {
      type: 'weather',
      name: 'Weather Widget',
      description: 'Display current weather information',
      version: '1.0.0',
      category: 'utilities',
      tags: ['weather', 'forecast'],
      minSize: { width: 2, height: 2 },
      defaultSize: { width: 3, height: 2 },
      lifecycle: 'active',
    },
  },
  {
    component: ChartWidget,
    metadata: {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Display data in various chart formats',
      version: '1.0.0',
      category: 'analytics',
      tags: ['chart', 'data', 'visualization'],
      minSize: { width: 3, height: 2 },
      defaultSize: { width: 4, height: 3 },
      lifecycle: 'active',
    },
  },
];

const INITIAL_WIDGETS = [
  {
    id: 'widget-1',
    type: 'weather',
    position: { x: 0, y: 0 },
    size: { width: 3, height: 2 },
    config: { location: 'San Francisco', unit: 'F' },
  },
  {
    id: 'widget-2',
    type: 'chart',
    position: { x: 3, y: 0 },
    size: { width: 4, height: 3 },
    config: { type: 'line' },
  },
  {
    id: 'widget-3',
    type: 'weather',
    position: { x: 7, y: 0 },
    size: { width: 3, height: 2 },
    config: { location: 'London', unit: 'C' },
  },
];

const DashboardApp: React.FC = () => {
  const { widgets, moveWidget, resizeWidget, setEditMode, isEditMode } = useDashboard();
  const { getAllWidgets, getWidget } = useWidgetRegistry();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'widget' && overData?.x !== undefined && overData?.y !== undefined) {
      const widget = activeData.widget;
      const newX = overData.x;
      const newY = overData.y;

      // Check if the new position is different
      if (widget.position.x !== newX || widget.position.y !== newY) {
        // Validate bounds
        const maxX = 12 - widget.size.width;
        const maxY = 8 - widget.size.height;

        if (newX >= 0 && newX <= maxX && newY >= 0 && newY <= maxY) {
          moveWidget(widget.id, { x: newX, y: newY });
        }
      }
    }
  };

  const handleAddWidget = (type: string) => {
    const widgetType = getAllWidgets().find(w => w.metadata.type === type);
    if (!widgetType) return;

    const newWidget = {
      id: `widget-${Date.now()}`,
      type,
      position: { x: 0, y: 0 },
      size: widgetType.metadata.defaultSize || { width: 2, height: 2 },
      config: {},
    };

    // Find first available position
    let placed = false;
    for (let y = 0; y < 6 && !placed; y++) {
      for (let x = 0; x < 10 && !placed; x++) {
        const maxX = x + newWidget.size.width;
        const maxY = y + newWidget.size.height;

        if (maxX <= 12 && maxY <= 8) {
          const occupied = widgets.some(w => {
            return !(maxX <= w.position.x || x >= w.position.x + w.size.width ||
                     maxY <= w.position.y || y >= w.position.y + w.size.height);
          });

          if (!occupied) {
            newWidget.position = { x, y };
            placed = true;
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <h1>Drag & Drop Dashboard</h1>
        <div className="dashboard-controls">
          <button
            className={`edit-toggle ${isEditMode ? 'active' : ''}`}
            onClick={() => setEditMode(!isEditMode)}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
        </div>
      </header>

      {isEditMode && (
        <div className="widget-palette">
          <h3>Add Widgets</h3>
          <div className="widget-options">
            {getAllWidgets().map(widget => (
              <button
                key={widget.metadata.type}
                className="widget-option"
                onClick={() => handleAddWidget(widget.metadata.type)}
              >
                {widget.metadata.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <DashboardGrid
          widgets={widgets}
          isEditMode={isEditMode}
          onWidgetMove={moveWidget}
          onWidgetResize={resizeWidget}
        />
        <DragOverlay>
          {activeId ? (
            <div className="widget-drag-overlay">
              Widget {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { getWidget } = useWidgetRegistry();

  const getWidgetComponent = (type: string) => {
    const widgetConfig = getWidget(type);
    return widgetConfig?.component || null;
  };

  return (
    <DashboardProvider
      initialWidgets={INITIAL_WIDGETS}
      getWidgetComponent={getWidgetComponent}
    >
      <DashboardApp />
    </DashboardProvider>
  );
};

const App: React.FC = () => {
  return (
    <WidgetRegistryProvider initialWidgets={EXAMPLE_WIDGETS}>
      <AppContent />
    </WidgetRegistryProvider>
  );
};

export default App;