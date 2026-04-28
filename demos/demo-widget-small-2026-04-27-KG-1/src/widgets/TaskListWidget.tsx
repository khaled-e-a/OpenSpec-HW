import './widget.css'

const TASKS = [
  { label: 'Design review', done: true },
  { label: 'Write specs', done: true },
  { label: 'Implement dashboard', done: false },
  { label: 'Write tests', done: false },
  { label: 'Deploy to staging', done: false },
]

export default function TaskListWidget() {
  return (
    <div className="widget-content task-list-widget">
      <ul className="task-list-widget__list">
        {TASKS.map((t) => (
          <li key={t.label} className={`task-list-widget__item${t.done ? ' done' : ''}`}>
            <span className="task-list-widget__check">{t.done ? '✓' : '○'}</span>
            {t.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
