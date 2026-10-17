import { Box, alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  accentColor?: string;
  disableHover?: boolean;
  onClick?: () => void;
}

/**
 * Reusable enterprise card with:
 * - Subtle 1px border that brightens on hover
 * - 2px translateY lift on hover
 * - Optional left accent stripe
 * - No loud neon drop shadows — just a gentle box-shadow
 */
const GlowCard = ({
  children,
  sx,
  accentColor,
  disableHover = false,
  onClick,
}: GlowCardProps) => (
  <Box
    component={motion.div}
    whileHover={disableHover ? undefined : { y: -2 }}
    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    onClick={onClick}
    sx={{
      position: 'relative',
      bgcolor: 'background.paper',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      ...(onClick && { cursor: 'pointer' }),
      ...(!disableHover && {
        '&:hover': {
          borderColor: 'rgba(255,255,255,0.14)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        },
      }),
      ...sx,
    }}
  >
    {/* Optional left accent stripe */}
    {accentColor && (
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${accentColor} 0%, ${alpha(accentColor, 0.2)} 100%)`,
          borderRadius: '12px 0 0 12px',
        }}
      />
    )}
    {children}
  </Box>
);

export default GlowCard;
