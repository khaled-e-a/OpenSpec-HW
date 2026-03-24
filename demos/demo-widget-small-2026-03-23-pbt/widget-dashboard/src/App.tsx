import React from 'react';
import DashboardGrid from './components/dashboard/DashboardGrid';
import './components/dashboard/Dashboard.css';

function App() {
  return (
    <div style={{ padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <DashboardGrid columns={12} rows={8} cellSize={80} />
    </div>
  );
}

export default App;
