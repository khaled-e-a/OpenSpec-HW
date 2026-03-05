# Drag and Drop Dashboard

This dashboard implements a drag-and-drop grid system that allows users to customize their widget layout.

## Features

### Core Functionality
- **Drag and Drop**: Click and drag any widget to reposition it on the dashboard
- **Grid Snapping**: Widgets automatically snap to a 12-column grid for perfect alignment
- **Collision Detection**: Prevents widgets from overlapping
- **Visual Feedback**:
  - Semi-transparent drag preview
  - Collision warnings
  - Smooth animations
  - Shake effect for invalid drops

### Persistence
- **Auto-save**: Layout changes are automatically saved to IndexedDB
- **Offline Support**: Changes are queued and saved when connection is restored
- **Error Handling**: Graceful handling of save failures with retry logic

### Widget Sizes
- **Small**: 3 columns × 2 rows
- **Medium**: 6 columns × 3 rows
- **Large**: 9 columns × 4 rows

## Usage

### Basic Usage
```tsx
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DraggableWidget from './components/DraggableWidget';

function Dashboard() {
  const [widgets, setWidgets] = useState(widgetData);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="dashboard">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {widgets.map((widget, index) => (
              <DraggableWidget
                key={widget.id}
                index={index}
                id={widget.id}
                title={widget.title}
                size={widget.size}
              >
                {widget.content}
              </DraggableWidget>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

### Saving Layout
```tsx
import LayoutPersistence from './services/LayoutPersistence';

const saveLayout = async (widgets) => {
  const layout = {
    id: 'user-123',
    widgetPositions: widgets.map((w, index) => ({
      id: w.id,
      x: index * 3,
      y: 0,
      width: w.size === 'small' ? 3 : w.size === 'medium' ? 6 : 9,
      height: w.size === 'small' ? 2 : w.size === 'medium' ? 3 : 4,
    })),
    timestamp: Date.now(),
  };

  await LayoutPersistence.saveLayout(layout);
};
```

## Components

### DraggableWidget
Wraps a widget to make it draggable:
```tsx
<DraggableWidget
  id="widget-1"
  index={0}
  title="Sales Overview"
  size="medium"
  hasCollision={false}
>
  <SalesChart />
</DraggableWidget>
```

### AnimatedWidget
Adds smooth animations to widget transitions:
```tsx
<AnimatedWidget
  title="Sales Overview"
  size="medium"
  isDragging={true}
  isDropping={false}
>
  <SalesChart />
</AnimatedWidget>
```

### CollisionDetector
Monitors for widget collisions during drag:
```tsx
<CollisionDetector
  draggedWidgetId="widget-1"
  draggedPosition={{ x: 0, y: 0, width: 3, height: 2 }}
  allWidgets={widgets}
  onCollisionChange={setHasCollision}
/>
```

## Architecture

### State Management
- Uses React Context for layout state
- Optimistic updates for responsive UI
- Automatic conflict resolution

### Storage
- IndexedDB for offline persistence
- Automatic retry on failure
- Queue-based save mechanism

### Performance
- Virtualization ready for large dashboards
- Efficient collision detection
- Minimal re-renders during drag operations

## Browser Support
- Modern browsers with HTML5 drag-and-drop API
- Touch device support (basic)
- Graceful degradation for older browsers

## Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support

## Troubleshooting

### Widget not dragging?
- Ensure widget has a unique ID
- Check that DragDropContext wraps the component
- Verify react-beautiful-dnd is installed

### Layout not saving?
- Check browser IndexedDB support
- Verify LayoutStorage initialization
- Check console for error messages

### Animations not working?
- Ensure Framer Motion is installed
- Check for CSS conflicts
- Verify animation props are passed correctly