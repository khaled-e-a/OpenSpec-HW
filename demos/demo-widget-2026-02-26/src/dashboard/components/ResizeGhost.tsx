interface ResizeGhostProps {
  width: number;
  height: number;
}

export function ResizeGhost({ width, height }: ResizeGhostProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        border: '2px dashed #0070f3',
        borderRadius: 4,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
      data-testid="resize-ghost"
    />
  );
}
