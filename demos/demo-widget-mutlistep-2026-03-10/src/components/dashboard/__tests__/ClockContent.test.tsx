/**
 * Unit tests for ClockContent.
 *
 * Covers:
 *   UC2-S2 — System displays the current local time in a readable format
 *   UC2-S3 — System refreshes the displayed time every second
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { ClockContent } from '../content/ClockContent';

describe('ClockContent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('UC2-S2 — time display format', () => {
    it('renders current time in HH:MM:SS format', () => {
      const mockDate = new Date('2024-01-01T14:30:45');
      vi.setSystemTime(mockDate);

      render(<ClockContent />);

      expect(screen.getByText(mockDate.toLocaleTimeString())).toBeTruthy();
    });

    it('uses toLocaleTimeString for locale-specific formatting', () => {
      const mockDate = new Date('2024-01-01T09:15:30');
      vi.setSystemTime(mockDate);

      render(<ClockContent />);

      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timeElement).toBeTruthy();
    });

    it('displays time in a large, centered container', () => {
      render(<ClockContent />);

      const container = screen.getByText(/\d{1,2}:\d{2}:\d{2}/).closest('div');
      expect(container?.style.height).toBe('100%');
      expect(container?.style.display).toBe('flex');
      expect(container?.style.alignItems).toBe('center');
      expect(container?.style.justifyContent).toBe('center');
      expect(container?.style.fontSize).toBe('24px');
      expect(container?.style.fontWeight).toBe('500');
    });
  });

  describe('UC2-S3 — automatic refresh', () => {
    it('updates time display every second', () => {
      const startTime = new Date('2024-01-01T12:00:00');
      vi.setSystemTime(startTime);

      render(<ClockContent />);

      expect(screen.getByText(startTime.toLocaleTimeString())).toBeTruthy();

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText(new Date(startTime.getTime() + 1000).toLocaleTimeString())).toBeTruthy();
    });

    it('continues updating while component is mounted', () => {
      const startTime = new Date('2024-01-01T12:00:00');
      vi.setSystemTime(startTime);

      render(<ClockContent />);

      // Advance time multiple times
      for (let i = 1; i <= 5; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        expect(screen.getByText(new Date(startTime.getTime() + i * 1000).toLocaleTimeString())).toBeTruthy();
      }
    });

    it('clears interval on unmount', () => {
      const { unmount } = render(<ClockContent />);
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('does not update after unmount', () => {
      const startTime = new Date('2024-01-01T12:00:00');
      vi.setSystemTime(startTime);

      const { unmount } = render(<ClockContent />);

      unmount();

      // Advance time after unmount
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Component should not be in the DOM anymore
      expect(screen.queryByText(new Date(startTime.getTime() + 1000).toLocaleTimeString())).toBeFalsy();
    });
  });

  describe('component lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => render(<ClockContent />)).not.toThrow();
    });

    it('renders immediately on mount', () => {
      const mockDate = new Date('2024-01-01T15:45:30');
      vi.setSystemTime(mockDate);

      render(<ClockContent />);

      // Should render immediately without waiting for first interval
      expect(screen.getByText(mockDate.toLocaleTimeString())).toBeTruthy();
    });
  });
});