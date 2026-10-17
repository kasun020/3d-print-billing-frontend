import { motion } from 'framer-motion';
import { pageTransition } from '../../theme/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a subtle fade-in-up entrance animation.
 * Applied to every feature page for consistent feel.
 */
const AnimatedPage = ({ children, className }: AnimatedPageProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={pageTransition}
    className={className}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

export default AnimatedPage;
