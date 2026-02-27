import { WidgetRegistry } from '../registry/WidgetRegistry';

interface WidgetPaletteProps {
  onAdd: (type: string) => void;
}

export function WidgetPalette({ onAdd }: WidgetPaletteProps) {
  const entries = WidgetRegistry.entries();

  if (entries.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 0' }} data-testid="widget-palette">
      {entries.map(({ key, entry }) => (
        <button
          key={key}
          onClick={() => onAdd(key)}
          style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc' }}
          data-testid={`palette-add-${key}`}
        >
          + {entry.displayName}
        </button>
      ))}
    </div>
  );
}
