import './widget.css'

const ROWS = [
  { name: 'Alice', status: 'Active', score: 98 },
  { name: 'Bob', status: 'Inactive', score: 74 },
  { name: 'Carol', status: 'Active', score: 85 },
  { name: 'Dave', status: 'Pending', score: 61 },
]

export default function TableWidget() {
  return (
    <div className="widget-content table-widget">
      <table className="table-widget__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>
                <span className={`status-badge status-badge--${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </td>
              <td>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
