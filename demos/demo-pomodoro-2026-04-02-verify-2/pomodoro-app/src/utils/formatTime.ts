/**
 * Format seconds as MM:SS string.
 * E.g. 1500 → "25:00", 90 → "01:30"
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
