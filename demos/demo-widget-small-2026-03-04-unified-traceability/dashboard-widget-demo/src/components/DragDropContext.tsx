import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import DashboardGrid from './DashboardGrid';

interface WidgetData {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  content: React.ReactNode;
}

interface DragDropProviderProps {
  initialWidgets: WidgetData[];
  children: React.ReactNode;
}

const DragDropProvider: React.FC<DragDropProviderProps> = ({ initialWidgets, children }) => {
  const [widgets, setWidgets] = useState(initialWidgets);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};

export default DragDropProvider;