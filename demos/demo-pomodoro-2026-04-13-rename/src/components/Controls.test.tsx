import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from './Controls';

describe('<Controls />', () => {
  test('shows Start button when idle and triggers onStart (UC1-S1)', async () => {
    const onStart = vi.fn();
    render(
      <Controls
        status="idle"
        onStart={onStart}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    const btn = screen.getByRole('button', { name: /start/i });
    await userEvent.click(btn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('shows Pause button when running and triggers onPause (UC1-E2a)', async () => {
    const onPause = vi.fn();
    render(
      <Controls
        status="running"
        onStart={vi.fn()}
        onPause={onPause}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    const btn = screen.getByRole('button', { name: /pause/i });
    await userEvent.click(btn);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  test('shows Resume button when paused and triggers onResume (UC1-E2a2)', async () => {
    const onResume = vi.fn();
    render(
      <Controls
        status="paused"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={onResume}
        onReset={vi.fn()}
      />,
    );
    const btn = screen.getByRole('button', { name: /resume/i });
    await userEvent.click(btn);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  test('Reset button is always present and triggers onReset (UC2-S1)', async () => {
    const onReset = vi.fn();
    render(
      <Controls
        status="running"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={onReset}
      />,
    );
    const btn = screen.getByRole('button', { name: /reset/i });
    await userEvent.click(btn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
