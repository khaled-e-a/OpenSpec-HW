import { renderHook, act } from '@testing-library/react';
import { useDragRevert } from '../useDragRevert';

describe('useDragRevert Hook', () => {
  it('Should save original positions', () => {
    const { result } = renderHook(() => useDragRevert());

    const widgets = [
      { id: 'widget-1', title: 'Widget 1' },
      { id: 'widget-2', title: 'Widget 2' },
      { id: 'widget-3', title: 'Widget 3' },
    ];

    act(() => {
      result.current.saveOriginalPositions(widgets);
    });

    expect(result.current.originalPositions).toEqual([
      { id: 'widget-1', index: 0 },
      { id: 'widget-2', index: 1 },
      { id: 'widget-3', index: 2 },
    ]);
  });

  it('Should revert to original positions on cancel', () => {
    const { result } = renderHook(() => useDragRevert());

    const widgets = [
      { id: 'widget-1', title: 'Widget 1' },
      { id: 'widget-2', title: 'Widget 2' },
      { id: 'widget-3', title: 'Widget 3' },
    ];

    act(() => {
      result.current.saveOriginalPositions(widgets);
    });

    const revertedPositions = result.current.revertToOriginal();
    expect(revertedPositions).toEqual([
      { id: 'widget-1', index: 0 },
      { id: 'widget-2', index: 1 },
      { id: 'widget-3', index: 2 },
    ]);
  });

  it('Should handle revert state transitions', () => {
    const { result } = renderHook(() => useDragRevert());

    expect(result.current.isReverting).toBe(false);

    act(() => {
      result.current.startRevert();
    });

    expect(result.current.isReverting).toBe(true);

    // Fast-forward time to complete revert animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(result.current.isReverting).toBe(false);
  });
});

// Enable fake timers for animation tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});