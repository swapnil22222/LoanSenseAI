import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`min-h-screen bg-black ${className}`}
    >
      {children}
    </motion.div>
  );
}
