import React from 'react';
import { DashboardGrid } from './components/DashboardGrid';

/**
 * Root application component.
 * UC3-S3, UC3-S4: mounts DashboardGrid with layout from hook
 */
export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        padding: 32,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
          Drag widgets to rearrange · Drag the corner handle to resize
        </p>
      </div>

      {/* UC3-S3: DashboardGrid manages layout state internally */}
      <DashboardGrid />
    </div>
  );
}
