import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AnalyticsDisplay.css';

interface AnalyticsDisplayProps {
  analytics: {
    dragCount: number;
    successfulDrops: number;
    failedDrops: number;
    collisions: number;
    averageDragDuration: number;
  };
}

const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({ analytics }) => {
  const [isVisible, setIsVisible] = useState(false);

  const successRate = analytics.dragCount > 0
    ? Math.round((analytics.successfulDrops / analytics.dragCount) * 100)
    : 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="analytics-display">
      <button
        className="analytics-toggle"
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Toggle drag analytics"
      >
        📊
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="analytics-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Drag Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-item">
                <span className="analytics-label">Total Drags</span>
                <span className="analytics-value">{analytics.dragCount}</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Success Rate</span>
                <span className="analytics-value">{successRate}%</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Collisions</span>
                <span className="analytics-value">{analytics.collisions}</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Avg Duration</span>
                <span className="analytics-value">
                  {formatDuration(analytics.averageDragDuration)}
                </span>
              </div>
            </div>
            <div className="analytics-details">
              <div>Successful drops: {analytics.successfulDrops}</div>
              <div>Failed drops: {analytics.failedDrops}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDisplay;