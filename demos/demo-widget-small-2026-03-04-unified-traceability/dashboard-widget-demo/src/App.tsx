import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DragStart, DragUpdate } from 'react-beautiful-dnd';
import DashboardGrid from './components/DashboardGrid';
import DraggableWidget from './components/DraggableWidget';
import CollisionDetector from './components/CollisionDetector';
import ErrorBoundary from './components/ErrorBoundary';
import SaveButton from './components/SaveButton';
import LayoutPersistence from './services/LayoutPersistence';
import { LayoutData } from './services/LayoutStorage';
import { useKeyboardNavigation, KeyboardInstructions } from './hooks/useKeyboardNavigation';
import { useDragRevert } from './hooks/useDragRevert';
import DragBoundary from './components/DragBoundary';
import { useDragAnalytics, trackWidgetInteraction, trackLayoutSave } from './hooks/useDragAnalytics';
import AnalyticsDisplay from './components/AnalyticsDisplay';
import './App.css';

interface WidgetData {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  content: React.ReactNode;
}

function App() {
  const [widgets, setWidgets] = React.useState<WidgetData[]>([]);
  const [hasCollision, setHasCollision] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeyboardInstructions, setShowKeyboardInstructions] = useState(false);

  // Analytics tracking
  const { trackDragStart, trackDragEnd, trackCollision, getAnalytics } = useDragAnalytics();

  // Drag revert functionality
  const {
    originalPositions,
    saveOriginalPositions,
    revertToOriginal,
    isReverting,
    startRevert,
    endRevert,
  } = useDragRevert();

  // Load saved layout on mount
  useEffect(() => {
    const loadSavedLayout = async () => {
      try {
        const savedLayout = await LayoutPersistence.loadLayout('user-1');
        if (savedLayout && savedLayout.widgetPositions) {
          // Restore widget order from saved positions
          const savedWidgets = [
            {
              id: 'widget-1',
              title: 'Sales Overview',
              size: 'medium' as const,
              content: <div>Sales chart will go here</div>
            },
            {
              id: 'widget-2',
              title: 'Recent Orders',
              size: 'small' as const,
              content: <div>Order list will go here</div>
            },
            {
              id: 'widget-3',
              title: 'Customer Analytics',
              size: 'large' as const,
              content: <div>Analytics dashboard will go here</div>
            },
            {
              id: 'widget-4',
              title: 'Inventory Status',
              size: 'small' as const,
              content: <div>Inventory metrics will go here</div>
            }
          ];
          setWidgets(savedWidgets);
        } else {
          // Use default layout
          setWidgets([
            {
              id: 'widget-1',
              title: 'Sales Overview',
              size: 'medium',
              content: <div>Sales chart will go here</div>
            },
            {
              id: 'widget-2',
              title: 'Recent Orders',
              size: 'small',
              content: <div>Order list will go here</div>
            },
            {
              id: 'widget-3',
              title: 'Customer Analytics',
              size: 'large',
              content: <div>Analytics dashboard will go here</div>
            },
            {
              id: 'widget-4',
              title: 'Inventory Status',
              size: 'small',
              content: <div>Inventory metrics will go here</div>
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLayout();
  }, []);

  // Save original positions when widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      saveOriginalPositions(widgets);
    }
  }, [widgets, saveOriginalPositions]);

  const handleSaveLayout = async () => {
    const startTime = Date.now();

    const layout: LayoutData = {
      id: 'user-1',
      widgetPositions: widgets.reduce((acc, widget, index) => {
        acc[widget.id] = {
          x: index * 3,
          y: 0,
          width: widget.size === 'small' ? 3 : widget.size === 'medium' ? 6 : 9,
          height: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
        };
        return acc;
      }, {} as Record<string, { x: number; y: number; width: number; height: number }>),
      timestamp: Date.now(),
    };

    const isValid = await LayoutPersistence.validateLayout(layout);
    if (!isValid) {
      trackLayoutSave('user-1', false, Date.now() - startTime);
      throw new Error('Invalid layout configuration');
    }

    try {
      await LayoutPersistence.saveLayout(layout);
      trackLayoutSave('user-1', true, Date.now() - startTime);
      setIsDirty(false);
    } catch (error) {
      trackLayoutSave('user-1', false, Date.now() - startTime);
      throw error;
    }
  };

  const handleDragStart = (start: DragStart) => {
    setDraggedWidgetId(start.draggableId);
    trackDragStart();
    trackWidgetInteraction(start.draggableId, 'drag_start');
  };

  const handleDragUpdate = (update: DragUpdate) => {
    if (update.destination) {
      setHasCollision(false);
    }
    // Track collision if source and destination are the same (blocked move)
    if (update.destination && update.source.index === update.destination.index) {
      trackCollision();
    }
  };

  const handleDragEnd = (result: any) => {
    const success = !!result.destination;

    trackDragEnd(success);
    if (result.draggableId) {
      trackWidgetInteraction(result.draggableId, success ? 'drag_success' : 'drag_cancel');
    }

    setDraggedWidgetId(null);
    setHasCollision(false);

    if (!result.destination) {
      // Drag was cancelled outside valid drop zone
      startRevert();
      return;
    }

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
    setIsDirty(true);
  };

  // Keyboard navigation
  const {
    handleWidgetFocus,
    handleWidgetBlur,
    focusedWidgetId,
  } = useKeyboardNavigation({
    onMove: (direction) => {
      // Handle keyboard-based widget movement
      console.log('Move widget:', direction);
    },
    onCancel: () => {
      // Handle drag cancellation - revert to original positions
      if (draggedWidgetId) {
        const originalOrder = revertToOriginal();
        const reorderedWidgets = originalOrder.map(pos =>
          widgets.find(w => w.id === pos.id)!
        ).filter(Boolean);
        setWidgets(reorderedWidgets);
        startRevert();
        setDraggedWidgetId(null);
        setHasCollision(false);
      }
    },
    onConfirm: () => {
      // Handle drop confirmation
      console.log('Confirm drop');
    },
    isDragging: !!draggedWidgetId,
  });

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Drag and Drop Dashboard</h1>
          <p>Drag widgets to rearrange your dashboard</p>
        </header>

        <SaveButton onSave={handleSaveLayout} isDirty={isDirty} />

        <button
          className="keyboard-help-button"
          onClick={() => setShowKeyboardInstructions(!showKeyboardInstructions)}
          aria-label="Toggle keyboard navigation help"
        >
          ⌨️ Keyboard Help
        </button>

        <AnalyticsDisplay analytics={getAnalytics()} />

        {showKeyboardInstructions && <KeyboardInstructions />}

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            Loading dashboard...
          </div>
        ) : (
          <>
            <DragBoundary
              isDragging={!!draggedWidgetId}
              onBoundaryHit={(boundary) => {
                console.log('Boundary hit:', boundary);
                // Could trigger additional UI feedback here
              }}
            />
            <DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
            {draggedWidgetId && (
              <CollisionDetector
                draggedWidgetId={draggedWidgetId}
                draggedPosition={{ x: 0, y: 0, width: 3, height: 2 }}
                allWidgets={widgets.map(w => ({ id: w.id, position: { x: 0, y: 0, width: 3, height: 2 } }))}
                onCollisionChange={setHasCollision}
              />
            )}
            <Droppable droppableId="dashboard">
              {(provided) => (
                <DashboardGrid>
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'contents' }}>
                    {widgets.map((widget, index) => (
                      <DraggableWidget
                        key={widget.id}
                        index={index}
                        id={widget.id}
                        title={widget.title}
                        size={widget.size}
                        hasCollision={hasCollision}
                        isFocused={focusedWidgetId === widget.id}
                        onFocus={() => handleWidgetFocus(widget.id)}
                        onBlur={handleWidgetBlur}
                      >
                        {widget.content}
                      </DraggableWidget>
                    ))}
                    {provided.placeholder}
                  </div>
                </DashboardGrid>
              )}
            </Droppable>
          </DragDropContext>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
