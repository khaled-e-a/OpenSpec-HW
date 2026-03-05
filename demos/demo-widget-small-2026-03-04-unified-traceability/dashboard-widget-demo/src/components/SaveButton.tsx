import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SaveButton.css';

interface SaveButtonProps {
  onSave: () => Promise<void>;
  isDirty: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave, isDirty }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const handleSaveFailed = () => {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    };

    window.addEventListener('layoutSaveFailed', handleSaveFailed);
    return () => window.removeEventListener('layoutSaveFailed', handleSaveFailed);
  }, []);

  const handleClick = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setShowError(false);

    try {
      await onSave();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="save-button-container">
      <motion.button
        className={`save-button ${isDirty ? 'dirty' : ''} ${showError ? 'error' : ''}`}
        onClick={handleClick}
        disabled={isSaving || !isDirty}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSaving ? (
          <span className="save-spinner">⟳</span>
        ) : (
          '💾 Save Layout'
        )}
      </motion.button>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="save-notification success"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ✓ Layout saved successfully!
          </motion.div>
        )}

        {showError && (
          <motion.div
            className="save-notification error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ✗ Failed to save layout
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaveButton;