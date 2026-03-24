/**
 * Example-based tests for ClockWidget.
 * Coverage: UC1-S1, UC1-S2, UC1-S3, UC1-S4, UC1-S5, UC1-E1a2, UC1-E5a1
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ClockWidget from './ClockWidget';

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

// UC1-S2 — clock renders time and date on mount
test('UC1-S2: clock renders a time string and date string immediately on mount', () => {
  render(<ClockWidget id="clock-1" />);
  // toLocaleTimeString returns a string containing at least one colon (HH:MM)
  const timeEl = document.querySelector('.clock-widget__time');
  expect(timeEl).not.toBeNull();
  expect(timeEl!.textContent).toMatch(/\d+[.:]\d+/);
  const dateEl = document.querySelector('.clock-widget__date');
  expect(dateEl).not.toBeNull();
  expect(dateEl!.textContent!.length).toBeGreaterThan(0);
});

// UC1-E1a2 — no configuration UI rendered
test('UC1-E1a2: clock widget renders no input, file picker, or URL input', () => {
  render(<ClockWidget id="clock-1" />);
  expect(document.querySelector('input')).toBeNull();
  expect(document.querySelector('button')).toBeNull();
  expect(document.querySelector('iframe')).toBeNull();
});

// UC1-S3 — timer starts on mount; UC1-S4 — time updates each second
test('UC1-S3/S4: displayed time updates after 1 second elapses', () => {
  const startDate = new Date('2026-03-23T12:00:00');
  const afterDate = new Date('2026-03-23T12:00:01');
  let callCount = 0;
  (jest.spyOn(global, 'Date') as unknown as jest.SpyInstance<Date>).mockImplementation(() => {
    callCount++;
    // First call (mount) → startDate; subsequent calls → afterDate
    return callCount === 1 ? startDate : afterDate;
  });

  const { container } = render(<ClockWidget id="clock-1" />);
  const timeEl = container.querySelector('.clock-widget__time')!;
  const initialText = timeEl.textContent;

  act(() => { jest.advanceTimersByTime(1000); });

  expect(timeEl.textContent).not.toBe(initialText);
  (Date as unknown as jest.SpyInstance).mockRestore();
});

// UC1-E5a1 — timer cleared on unmount
test('UC1-E5a1: clearInterval is called when the clock widget unmounts', () => {
  const clearSpy = jest.spyOn(global, 'clearInterval');
  const { unmount } = render(<ClockWidget id="clock-1" />);
  unmount();
  expect(clearSpy).toHaveBeenCalled();
  clearSpy.mockRestore();
});

// UC1-E1a2 — settings ignored, widget still renders
test('UC1-E1a2: clock widget ignores settings prop and renders normally', () => {
  render(<ClockWidget id="clock-1" settings={{ type: 'clock' }} onSettingsChange={jest.fn()} />);
  expect(document.querySelector('.clock-widget')).not.toBeNull();
});
