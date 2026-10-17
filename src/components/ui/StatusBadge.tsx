import { Chip, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

type StatusVariant =
  | 'Pending'
  | 'Printing'
  | 'Completed'
  | 'Billed'
  | 'Paid'
  | 'Unpaid';

interface StatusBadgeProps {
  status: StatusVariant;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<
  StatusVariant,
  { color: string; icon?: React.ReactElement }
> = {
  Pending:   { color: '#F59E0B', icon: <HourglassEmptyRoundedIcon sx={{ fontSize: '13px !important' }} /> },
  Printing:  { color: '#38BDF8', icon: <SyncRoundedIcon          sx={{ fontSize: '13px !important' }} /> },
  Completed: { color: '#10B981', icon: <CheckCircleRoundedIcon   sx={{ fontSize: '13px !important' }} /> },
  Billed:    { color: '#818CF8', icon: <ReceiptRoundedIcon       sx={{ fontSize: '13px !important' }} /> },
  Paid:      { color: '#10B981', icon: <CheckCircleRoundedIcon   sx={{ fontSize: '13px !important' }} /> },
  Unpaid:    { color: '#F59E0B', icon: <HourglassEmptyRoundedIcon sx={{ fontSize: '13px !important' }} /> },
};

/**
 * Consistent status chip used across PrintJobs and Invoices pages.
 * Color-coded without loud neon — uses subtle alpha backgrounds.
 */
const StatusBadge = ({ status, size = 'small' }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { color: '#94A3B8' };

  return (
    <Chip
      label={status}
      size={size}
      icon={config.icon}
      sx={{
        fontWeight: 600,
        fontSize: '0.72rem',
        letterSpacing: '0.01em',
        borderRadius: '6px',
        bgcolor: alpha(config.color, 0.12),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        '& .MuiChip-icon': { color: `${config.color} !important`, ml: '6px' },
        '& .MuiChip-label': { px: '8px' },
      }}
    />
  );
};

export default StatusBadge;
