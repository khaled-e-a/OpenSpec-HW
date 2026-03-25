import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ClockWidget } from './ClockWidget';

// ---------------------------------------------------------------------------
// Task 2.1 — Clock displays current time in HH:MM:SS (UC1-S2)
// Task 2.2 — Clock updates every second, clears on unmount (UC1-S3)
// ---------------------------------------------------------------------------

describe('ClockWidget (UC1-S2, UC1-S3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix "now" to 2026-01-15 10:30:45 UTC (en-GB locale → "10:30:45")
    vi.setSystemTime(new Date('2026-01-15T10:30:45Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('UC1-S2: renders current local time in HH:MM:SS format', () => {
    render(<ClockWidget />);
    const display = screen.getByTestId('clock-display');
    // en-GB 24h format for 10:30:45 UTC
    expect(display.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('UC1-S3: updates time after one second', () => {
    render(<ClockWidget />);
    const before = screen.getByTestId('clock-display').textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const after = screen.getByTestId('clock-display').textContent;
    expect(after).not.toBe(before);
  });

  it('UC1-S3: clears interval on unmount (no further updates after unmount)', () => {
    const { unmount } = render(<ClockWidget />);
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
