interface TaskNotesProps {
  note: string;
  onChange: (value: string) => void;
}

/**
 * Presentational task-notes panel.
 * Renders a controlled textarea and a Clear button.
 * Owns no state — all note content is managed by the parent.
 * Visible only during work sessions (caller is responsible for conditional render).
 */
export function TaskNotes({ note, onChange }: TaskNotesProps) {
  return (
    <section className="task-notes" aria-label="Task notes">
      <h2 className="task-notes__heading">Session Notes</h2>
      <textarea
        className="task-notes__textarea"
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Capture thoughts, ideas, or distractions here…"
        rows={5}
      />
      <button
        className="task-notes__clear-btn"
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear note"
      >
        Clear
      </button>
    </section>
  );
}
