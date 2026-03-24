import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { WIDGET_REGISTRY } from '../../widgets/registry';
import { WidgetSettings } from '../../widgets/types';
import WidgetToolbar from './WidgetToolbar';
import ResizeHandle from './ResizeHandle';
import { useResizeDrag } from '../../hooks/useResizeDrag';

// Task 9.1 — accept and forward settings + onSettingsChange (UC2-S7, UC3-S8, UC4-S7, UC5-S5)
interface WidgetProps {
  id: string;
  type: string;
  w: number;
  h: number;
  cellSize: number;
  gridCols: number;
  gridRows: number;
  onRemove: (id: string) => void;
  onResize: (id: string, w: number, h: number) => boolean;
  isOverlay?: boolean;
  settings?: WidgetSettings;
  onSettingsChange?: (settings: WidgetSettings) => void;
}

const Widget: React.FC<WidgetProps> = ({
  id, type, w, h, cellSize, gridCols, gridRows, onRemove, onResize, isOverlay,
  settings, onSettingsChange,
}) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id,
    disabled: isOverlay,
  });

  const { previewW, previewH, onHandlePointerDown, noSpaceFeedback } = useResizeDrag({
    widgetId: id,
    initialW: w,
    initialH: h,
    cellSize,
    gridCols,
    gridRows,
    onCommit: (newW, newH) => onResize(id, newW, newH),
  });

  const displayW = previewW ?? w;
  const displayH = previewH ?? h;

  // Task 9.2 — WidgetDefinition.component typing accepts settings + onSettingsChange as optional
  const ContentComponent = WIDGET_REGISTRY[type]?.component;

  const style: React.CSSProperties = isOverlay
    ? {
        width: displayW * cellSize,
        height: displayH * cellSize,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: 0.9,
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
      }
    : {
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity: isDragging ? 0.35 : 1,
        transition: 'opacity 150ms',
        cursor: 'default',
      };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      className="widget"
      style={style}
    >
      {!isOverlay && (
        <WidgetToolbar
          dragHandleProps={{ ...listeners, ...attributes, style: { cursor: 'grab' } }}
          onRemove={() => onRemove(id)}
        />
      )}
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        {ContentComponent
          ? (
            // Task 7.2 — forward settings + onSettingsChange through Widget → content component
            <ContentComponent
              id={id}
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          )
          : <div style={{ padding: 8, color: '#999', fontSize: 12 }}>Unknown widget type: {type}</div>
        }
      </div>
      {!isOverlay && (
        <ResizeHandle onPointerDown={onHandlePointerDown} />
      )}
      {noSpaceFeedback && (
        <div style={{
          position: 'absolute', bottom: 24, right: 4, background: 'rgba(239,68,68,0.9)',
          color: '#fff', fontSize: '11px', padding: '3px 7px', borderRadius: 4, pointerEvents: 'none', zIndex: 30,
        }}>
          Not enough space
        </div>
      )}
    </div>
  );
};

export default Widget;
