import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Divider,
  IconButton,
  alpha,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: <DashboardRoundedIcon />, path: '/' },
  { label: 'Customers',  icon: <PeopleRoundedIcon />,   path: '/customers' },
  { label: 'Print Jobs', icon: <PrintRoundedIcon />,    path: '/print-jobs' },
  { label: 'Invoices',   icon: <ReceiptRoundedIcon />,  path: '/invoices' },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  sidebarWidth: number;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

const SidebarContent = ({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 2,
          minHeight: 64,
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo mark */}
        <Box
          component="img"
          src="/warlock-logo.jpg"
          alt="Warlock Group Logo"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            objectFit: 'cover',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            flexShrink: 0,
          }}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  color: '#D49B6A',
                  letterSpacing: '0.12em',
                }}
              >
                WARLOCK GROUPS
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  whiteSpace: 'nowrap', 
                  fontSize: '0.72rem', 
                  color: '#94A3B8',
                  fontStyle: 'italic'
                }}
              >
                Make the idea a reality
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <List sx={{ flex: 1, px: 1, pt: 1.5, pb: 1 }}>
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
            >
              <Tooltip
                title={collapsed ? item.label : ''}
                placement="right"
              >
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1 : 1.5,
                    py: 1,
                    mb: 0.5,
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    // Active state — clean indigo tint
                    '&.Mui-selected': {
                      bgcolor: alpha('#6366F1', 0.1),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: 2.5,
                        borderRadius: '0 2px 2px 0',
                        bgcolor: '#6366F1',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 1.5,
                      color: isActive ? '#818CF8' : 'text.secondary',
                      transition: 'color 0.18s',
                      fontSize: 20,
                      '& svg': { fontSize: '1.15rem' },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.875rem',
                            color: isActive ? '#F1F5F9' : '#94A3B8',
                            noWrap: true,
                            letterSpacing: '-0.01em',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ListItemButton>
              </Tooltip>
            </motion.div>
          );
        })}
      </List>

      {/* ── Collapse toggle ───────────────────────────────────────────── */}
      <Box
        sx={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          px: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Tooltip
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          placement="right"
        >
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              color: 'text.secondary',
              width: 30,
              height: 30,
            }}
          >
            {collapsed ? (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const Sidebar = ({
  collapsed,
  mobileOpen,
  sidebarWidth,
  onMobileClose,
  onToggleCollapse,
}: SidebarProps) => {
  const drawerSx = {
    width: sidebarWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      overflowX: 'hidden',
      transition: 'width 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      bgcolor: '#0C0E14',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    },
  };

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{ ...drawerSx, display: { xs: 'none', md: 'block' } }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ ...drawerSx, display: { xs: 'block', md: 'none' } }}
      >
        <SidebarContent collapsed={false} onToggleCollapse={onMobileClose} />
      </Drawer>
    </>
  );
};

export default Sidebar;
