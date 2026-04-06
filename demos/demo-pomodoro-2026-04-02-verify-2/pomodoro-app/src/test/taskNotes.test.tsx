/**
 * Unit and component tests for the task-notes capability.
 * Framework: vitest + @testing-library/react
 * Covers: UC3-S1, UC3-S2, UC3-S3, UC3-S4, UC3-S5, UC3-E2a, UC3-E4a,
 *         UC4-S1, UC4-S2, UC4-S3, UC4-E1a
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskNotes } from '../components/TaskNotes';

// ─── UC3-S1: Panel renders during work session ────────────────────────────────

describe('TaskNotes — visibility (UC3-S1)', () => {
  it('UC3-S1: renders the panel when mounted', () => {
    render(<TaskNotes note="" onChange={() => {}} />);
    expect(screen.getByRole('region', { name: /task notes/i })).toBeTruthy();
  });

  it('UC3-S1: panel is not present when not mounted (shortRest/longRest)', () => {
    // Caller is responsible for not mounting during rest; verify unmount removes it
    const { unmount } = render(<TaskNotes note="" onChange={() => {}} />);
    unmount();
    expect(screen.queryByRole('region', { name: /task notes/i })).toBeNull();
  });
});

// ─── UC3-S2 / UC3-S3 / UC3-E2a: Accept and reflect user input ────────────────

describe('TaskNotes — textarea input (UC3-S2, UC3-S3, UC3-E2a)', () => {
  it('UC3-S2: textarea is present and focusable', () => {
    render(<TaskNotes note="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeTruthy();
  });

  it('UC3-S3: calls onChange with new value on each keystroke', () => {
    const calls: string[] = [];
    render(<TaskNotes note="" onChange={(v) => calls.push(v)} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(calls).toContain('hello');
  });

  it('UC3-E2a: onChange reflects the modified content after each change', () => {
    let current = 'initial';
    const { rerender } = render(
      <TaskNotes note={current} onChange={(v) => { current = v; }} />
    );
    const textarea = screen.getByRole('textbox');
    // Simulate edit: append text
    fireEvent.change(textarea, { target: { value: 'initial edited' } });
    rerender(<TaskNotes note={current} onChange={(v) => { current = v; }} />);
    expect(screen.getByRole('textbox')).toHaveValue('initial edited');
  });

  it('UC3-S3: textarea value always reflects the note prop', () => {
    const { rerender } = render(<TaskNotes note="first" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('first');

    rerender(<TaskNotes note="updated" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('updated');
  });
});

// ─── UC3-S4 / UC3-S5: Note persists in panel (state held by parent) ──────────

describe('TaskNotes — note persistence (UC3-S4, UC3-S5)', () => {
  it('UC3-S4/S5: note content remains visible after focus leaves textarea', () => {
    render(<TaskNotes note="my note" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    textarea.blur();
    expect(screen.getByRole('textbox')).toHaveValue('my note');
  });

  it('UC3-S5: note content remains intact when re-rendered with same prop', () => {
    const { rerender } = render(<TaskNotes note="keep this" onChange={() => {}} />);
    // Simulate parent re-rendering for other reasons (timer tick, etc.)
    rerender(<TaskNotes note="keep this" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('keep this');
  });
});

// ─── UC3-E4a: Manual clear empties content, panel stays visible ───────────────

describe('TaskNotes — clear button (UC3-E4a)', () => {
  it('UC3-E4a: Clear button is present', () => {
    render(<TaskNotes note="some text" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy();
  });

  it('UC3-E4a: clicking Clear calls onChange with empty string', () => {
    let captured = 'has content';
    render(<TaskNotes note="has content" onChange={(v) => { captured = v; }} />);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(captured).toBe('');
  });

  it('UC3-E4a: panel remains mounted after Clear is clicked', () => {
    const { rerender } = render(
      <TaskNotes note="has content" onChange={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    // Simulate parent updating note to '' after onChange('')
    rerender(<TaskNotes note="" onChange={() => {}} />);
    // Panel is still in the DOM
    expect(screen.getByRole('region', { name: /task notes/i })).toBeTruthy();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});

// ─── UC4-S1 / UC4-S2 / UC4-S3: Note cleared at session boundary ──────────────

describe('TaskNotes — session boundary clearing (UC4-S1, UC4-S2, UC4-S3)', () => {
  it('UC4-S2/S3: after parent sets note to "", textarea shows empty', () => {
    const { rerender } = render(<TaskNotes note="old session note" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('old session note');

    // Parent cleared note at session boundary
    rerender(<TaskNotes note="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});

// ─── UC4-E1a: Note cleared immediately on reset ───────────────────────────────

describe('TaskNotes — cleared on reset (UC4-E1a)', () => {
  it('UC4-E1a: after reset, note prop is "" and textarea shows empty', () => {
    // When resetTimer fires → App.useEffect clears note → parent passes "" prop
    const { rerender } = render(<TaskNotes note="mid-session note" onChange={() => {}} />);
    rerender(<TaskNotes note="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
