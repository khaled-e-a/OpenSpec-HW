import React from 'react';
import './DragPreview.css';

interface DragPreviewProps {
  children: React.ReactNode;
}

const DragPreview: React.FC<DragPreviewProps> = ({ children }) => {
  return (
    <div className="drag-preview">
      {children}
    </div>
  );
};

export default DragPreview;