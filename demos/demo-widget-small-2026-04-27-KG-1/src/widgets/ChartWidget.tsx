import './widget.css'

export default function ChartWidget() {
  const bars = [40, 65, 50, 80, 55, 70, 90, 45, 60, 75]
  const max = Math.max(...bars)
  return (
    <div className="widget-content chart-widget">
      <div className="chart-widget__bars">
        {bars.map((h, i) => (
          <div
            key={i}
            className="chart-widget__bar"
            style={{ height: `${(h / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="chart-widget__label">Revenue (last 10 days)</div>
    </div>
  )
}
