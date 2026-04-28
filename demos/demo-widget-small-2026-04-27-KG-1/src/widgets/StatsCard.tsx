import './widget.css'

export default function StatsCard() {
  return (
    <div className="widget-content stats-card">
      <div className="stats-card__value">1,234</div>
      <div className="stats-card__label">Total Users</div>
      <div className="stats-card__change positive">+12% this week</div>
    </div>
  )
}
