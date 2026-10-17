import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export const SIDEBAR_WIDTH = 248;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 60;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        // Subtle dot-matrix background applied at root level
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        // Very soft top-center radial spotlight
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '35vh',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        sidebarWidth={sidebarWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          transition: 'margin-left 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TopBar
          sidebarWidth={sidebarWidth}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <Box
          id="main-scroll-container"
          sx={{
            flexGrow: 1,
            pt: `${TOPBAR_HEIGHT + 24}px`,
            pb: 4,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 'none', minWidth: 0, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
            <Outlet />
          </Box>
        </Box>

        {/* Footer is strictly pinned to the bottom of the viewport */}
        <Footer />
      </Box>
    </Box>
  );
};

export default AppLayout;
