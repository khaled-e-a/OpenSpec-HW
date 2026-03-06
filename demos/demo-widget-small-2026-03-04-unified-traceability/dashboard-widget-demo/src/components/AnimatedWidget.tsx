import React from 'react';
import { motion, Variants } from 'framer-motion';
import Widget, { WidgetProps } from './Widget';

interface AnimatedWidgetProps extends WidgetProps {
  isDragging?: boolean;
  isDropping?: boolean;
}

const AnimatedWidget: React.FC<AnimatedWidgetProps> = ({
  isDragging = false,
  isDropping = false,
  ...widgetProps
}) => {
  const variants: Variants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    dragging: {
      scale: 1.05,
      rotate: 2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    dropping: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="idle"
      animate={isDragging ? "dragging" : isDropping ? "dropping" : "idle"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Widget {...widgetProps} />
    </motion.div>
  );
};

export default AnimatedWidget;