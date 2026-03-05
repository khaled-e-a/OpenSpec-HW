import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ShakeAnimationProps {
  isShaking: boolean;
  children: React.ReactNode;
}

const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  stop: {
    x: 0,
    transition: {
      duration: 0.1,
    },
  },
};

const ShakeAnimation: React.FC<ShakeAnimationProps> = ({ isShaking, children }) => {
  return (
    <motion.div
      variants={shakeVariants}
      animate={isShaking ? "shake" : "stop"}
    >
      {children}
    </motion.div>
  );
};

export default ShakeAnimation;