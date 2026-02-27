import { useEffect, useCallback } from 'react';
import { useDashboard, CELL_SIZE, GAP, COLS, ROWS } from '../hooks/useDashboard';
import Widget from './Widget';
import GhostWidget from './GhostWidget';
import GridLines from './GridLines';

const INITIAL_WIDGETS = [
  {
    id: 'w1',
    title: 'Sales Overview',
    type: 'chart',
    x: 0, y: 0, w: 4, h: 2,
    content: <MiniChart color="#6366f1" />,
  },
  {
    id: 'w2',
    title: 'Active Users',
    type: 'stat',
    x: 4, y: 0, w: 2, h: 1,
    content: <StatBlock value="12,483" label="users online" color="#10b981" />,
  },
  {
    id: 'w3',
    title: 'Revenue',
    type: 'stat',
    x: 6, y: 0, w: 2, h: 1,
    content: <StatBlock value="$84.2k" label="this month" color="#f59e0b" />,
  },
  {
    id: 'w4',
    title: 'Conversion Rate',
    type: 'stat',
    x: 4, y: 1, w: 2, h: 1,
    content: <StatBlock value="3.24%" label="avg rate" color="#ef4444" />,
  },
  {
    id: 'w5',
    title: 'Bounce Rate',
    type: 'stat',
    x: 6, y: 1, w: 2, h: 1,
    content: <StatBlock value="41.8%" label="bounce" color="#8b5cf6" />,
  },
  {
    id: 'w6',
    title: 'Traffic Sources',
    type: 'donut',
    x: 8, y: 0, w: 4, h: 3,
    content: <DonutChart />,
  },
  {
    id: 'w7',
    title: 'Recent Activity',
    type: 'list',
    x: 0, y: 2, w: 3, h: 3,
    content: <ActivityList />,
  },
  {
    id: 'w8',
    title: 'Performance',
    type: 'chart',
    x: 3, y: 2, w: 5, h: 3,
    content: <MiniChart color="#f59e0b" bars />,
  },
  {
    id: 'w9',
    title: 'Notes',
    type: 'notes',
    x: 0, y: 5, w: 4, h: 2,
    content: <NotesBlock />,
  },
  {
    id: 'w10',
    title: 'Top Pages',
    type: 'table',
    x: 4, y: 5, w: 8, h: 2,
    content: <TableBlock />,
  },
];

export default function DashboardGrid() {
  const { widgets, dragging, ghost, gridRef, onDragStart, onDragMove, onDragEnd } =
    useDashboard(INITIAL_WIDGETS);

  const handleMouseMove = useCallback(
    (e) => onDragMove(e.clientX, e.clientY),
    [onDragMove]
  );

  const handleMouseUp = useCallback(() => onDragEnd(), [onDragEnd]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const gridWidth = COLS * CELL_SIZE + (COLS - 1) * GAP;
  const gridHeight = ROWS * CELL_SIZE + (ROWS - 1) * GAP;

  return (
    <div className={`dashboard${dragging ? ' dashboard--dragging' : ''}`}>
      <header className="dashboard__header">
        <h1>Dashboard</h1>
        <p className="dashboard__hint">Drag widgets to rearrange</p>
      </header>
      <div
        ref={gridRef}
        className="dashboard__grid"
        style={{ width: gridWidth, height: gridHeight }}
      >
        <GridLines active={!!dragging} />
        <GhostWidget ghost={ghost} />
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            widget={widget}
            isDragging={dragging?.id === widget.id}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}

// ── Inline widget content components ────────────────────────────────────────

function MiniChart({ color, bars }) {
  const points = bars
    ? [40, 65, 30, 80, 55, 90, 45, 70, 85, 60, 75, 50]
    : [20, 45, 30, 60, 40, 75, 55, 80, 65, 90, 70, 85];

  if (bars) {
    return (
      <div className="mini-chart mini-chart--bars">
        {points.map((h, i) => (
          <div key={i} className="bar" style={{ height: `${h}%`, background: color }} />
        ))}
      </div>
    );
  }

  const max = Math.max(...points);
  const w = 280;
  const h = 80;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => `${i * step},${h - (p / max) * h}`).join(' ');
  const fill = points.map((p, i) => `${i * step},${h - (p / max) * h}`).join(' ') +
    ` ${w},${h} 0,${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mini-chart mini-chart--line">
      <polygon points={fill} fill={color} opacity="0.15" />
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatBlock({ value, label, color }) {
  return (
    <div className="stat-block" style={{ '--accent': color }}>
      <div className="stat-block__value">{value}</div>
      <div className="stat-block__label">{label}</div>
      <div className="stat-block__bar">
        <div className="stat-block__fill" />
      </div>
    </div>
  );
}

function DonutChart() {
  const segments = [
    { label: 'Organic', value: 42, color: '#6366f1' },
    { label: 'Social', value: 28, color: '#10b981' },
    { label: 'Direct', value: 18, color: '#f59e0b' },
    { label: 'Referral', value: 12, color: '#ef4444' },
  ];

  let cumulative = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const cx = 70, cy = 70, r = 55, inner = 35;

  const paths = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    const angle = (seg.value / total) * 360;
    cumulative += seg.value;
    const end = start;
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((start + angle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const ix1 = cx + inner * Math.cos(startRad);
    const iy1 = cy + inner * Math.sin(startRad);
    const ix2 = cx + inner * Math.cos(endRad);
    const iy2 = cy + inner * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return (
      <path
        key={seg.label}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`}
        fill={seg.color}
        opacity="0.9"
      />
    );
  });

  return (
    <div className="donut-chart">
      <svg viewBox="0 0 140 140" width="140" height="140">{paths}</svg>
      <div className="donut-chart__legend">
        {segments.map((seg) => (
          <div key={seg.label} className="legend-item">
            <span className="legend-dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="legend-val">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityList() {
  const items = [
    { icon: '👤', text: 'New user signed up', time: '2m ago' },
    { icon: '💳', text: 'Payment received $240', time: '8m ago' },
    { icon: '🚀', text: 'Deploy to production', time: '15m ago' },
    { icon: '⚠️', text: 'Server alert resolved', time: '32m ago' },
    { icon: '📧', text: 'Newsletter sent 4.2k', time: '1h ago' },
    { icon: '🎯', text: 'Campaign hit target', time: '2h ago' },
  ];
  return (
    <ul className="activity-list">
      {items.map((item, i) => (
        <li key={i} className="activity-item">
          <span className="activity-icon">{item.icon}</span>
          <span className="activity-text">{item.text}</span>
          <span className="activity-time">{item.time}</span>
        </li>
      ))}
    </ul>
  );
}

function NotesBlock() {
  return (
    <div className="notes-block">
      <p>📌 Q1 targets: reach $100k MRR</p>
      <p>🔁 Sprint review every Friday 3pm</p>
      <p>✅ Launch v2.0 before Mar 15</p>
      <p>📊 Investor update due Feb 28</p>
    </div>
  );
}

function TableBlock() {
  const rows = [
    { page: '/home', views: '48,291', bounce: '32%', time: '2:14' },
    { page: '/pricing', views: '21,034', bounce: '41%', time: '3:07' },
    { page: '/docs', views: '18,822', bounce: '18%', time: '5:32' },
    { page: '/blog', views: '12,410', bounce: '55%', time: '1:48' },
  ];
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Page</th><th>Views</th><th>Bounce</th><th>Avg Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.page}>
            <td>{r.page}</td><td>{r.views}</td><td>{r.bounce}</td><td>{r.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
