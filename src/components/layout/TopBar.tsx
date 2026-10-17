import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  alpha,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// ─── Route → label map ───────────────────────────────────────────────────────
const BREADCRUMB_MAP: Record<string, string> = {
  '/':           'Dashboard',
  '/customers':  'Customers',
  '/print-jobs': 'Print Jobs',
  '/invoices':   'Invoices',
};

// ─── Live Clock ───────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '7px',
        px: 1.5,
        py: 0.5,
      }}
    >
      <Typography
        className="font-mono"
        variant="caption"
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
          fontSize: '0.78rem',
          letterSpacing: '0.04em',
        }}
      >
        {hh}:{mm}:{ss}
      </Typography>
    </Box>
  );
};

// ─── Online Status Dot ────────────────────────────────────────────────────────
const OnlineDot = () => (
  <Box
    sx={{
      display: { xs: 'none', sm: 'flex' },
      alignItems: 'center',
      gap: 0.75,
      bgcolor: alpha('#10B981', 0.1),
      border: `1px solid ${alpha('#10B981', 0.25)}`,
      borderRadius: '6px',
      px: 1.25,
      py: 0.5,
    }}
  >
    <Box className="status-dot" sx={{ width: 6, height: 6 }} />
    <Typography
      variant="caption"
      sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.7rem' }}
    >
      Online
    </Typography>
  </Box>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface TopBarProps {
  sidebarWidth: number;
  onMobileMenuOpen: () => void;
}

const TopBar = ({ sidebarWidth, onMobileMenuOpen }: TopBarProps) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { adminUser, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Determine current page label for breadcrumb
  const currentLabel =
    Object.entries(BREADCRUMB_MAP).find(
      ([path]) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    )?.[1] ?? 'Admin Panel';

  // Avatar initials
  const initials = adminUser?.name
    ? adminUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        transition: 'width 0.22s cubic-bezier(0.22, 1, 0.36, 1), margin-left 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: (t) => t.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: '60px !important', px: { xs: 2, md: 3 } }}>
        {/* Mobile hamburger */}
        <IconButton
          edge="start"
          onClick={onMobileMenuOpen}
          sx={{ display: { md: 'none' }, color: 'text.secondary' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Breadcrumb — page title */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              WARLOCK GROUPS
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              /
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
            }}
          >
            {currentLabel}
          </Typography>
        </Box>

        {/* Right section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LiveClock />
          <OnlineDot />

          {/* User info + avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                lineHeight={1.2}
                sx={{ fontSize: '0.825rem', letterSpacing: '-0.01em' }}
              >
                {adminUser?.name ?? 'Admin'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.68rem' }}
              >
                Administrator
              </Typography>
            </Box>

            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ p: 0.25 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#C5A059',
                  color: '#090B10',
                  cursor: 'pointer',
                  border: '1.5px solid rgba(197, 160, 89, 0.35)',
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Box>
        </Box>

        {/* Dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 8,
                  height: 8,
                  bgcolor: '#181C28',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                },
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.825rem' }}>
              {adminUser?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              {adminUser?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleMenuClose}
            sx={{ gap: 1.5, mt: 0.5, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <PersonRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, color: 'error.main', py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: 'error.main' }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" color="error.main">
              Sign Out
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
