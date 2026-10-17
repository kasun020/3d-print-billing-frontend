import { Box, Typography, alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Standardized page header used on all feature pages.
 * Consistent title + subtitle layout with a right-side actions slot.
 */
const PageHeader = ({ title, subtitle, actions, sx }: PageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      mb: 3,
      ...sx,
    }}
  >
    <Box>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ lineHeight: 1.2, mb: 0.25, letterSpacing: '-0.02em' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>

    {actions && (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        {actions}
      </Box>
    )}
  </Box>
);

export default PageHeader;
