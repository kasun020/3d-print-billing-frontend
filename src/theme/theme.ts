import { createTheme, alpha } from '@mui/material/styles';

// ─── Colour Tokens — Clean Minimalist Enterprise Dark SaaS ──────────────────
const PRIMARY   = '#D49B6A'; // Copper-Gold
const SECONDARY = '#C8824B'; // Deep Copper
const SUCCESS   = '#10B981'; // emerald green
const WARNING   = '#F59E0B'; // amber
const ERROR     = '#F43F5E'; // rose

const BG_BASE    = '#050A10'; // Deepest Navy
const BG_DEFAULT = '#081018'; // Deep Navy Obsidian
const BG_PAPER   = '#0C1722'; // Elevated Navy Surface
const BG_SURFACE = '#121F2E'; // elevated elements
const BG_GLASS   = 'rgba(255, 255, 255, 0.03)';

// ─── Theme ──────────────────────────────────────────────────────────────────
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: PRIMARY,
      light: '#E6C687', // Lighter Gold
      dark: '#B07B4F', // Deep Bronze
      contrastText: '#050A10', // Dark text on gold buttons
    },
    secondary: {
      main: SECONDARY,
      light: '#7DD3FC',
      dark: '#0284C7',
      contrastText: '#0C0E14',
    },
    success:  { main: SUCCESS, light: '#34D399', dark: '#059669' },
    warning:  { main: WARNING, light: '#FCD34D', dark: '#D97706' },
    error:    { main: ERROR,   light: '#FB7185', dark: '#E11D48' },
    background: {
      default: BG_DEFAULT,
      paper:   BG_PAPER,
    },
    divider: 'rgba(255, 255, 255, 0.07)',
    text: {
      primary:   '#F8FAFC',
      secondary: '#94A3B8',
      disabled:  'rgba(241, 245, 249, 0.3)',
    },
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", "Helvetica Neue", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
    subtitle2: { fontWeight: 500 },
    body1: { letterSpacing: '-0.01em' },
    body2: { letterSpacing: '-0.005em' },
    caption: { letterSpacing: '0.01em' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '-0.01em' },
    overline: { fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.68rem' },
  },

  // ─── Shape ─────────────────────────────────────────────────────────────────
  shape: { borderRadius: 10 },

  // ─── Component Overrides ───────────────────────────────────────────────────
  components: {
    // Global baseline
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        html, body { background-color: ${BG_DEFAULT}; }

        /* Tabular numerals for monospaced contexts */
        .font-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
          font-variant-numeric: tabular-nums;
          font-feature-settings: 'tnum';
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.18); }

        /* Subtle dot matrix background for pages */
        .dot-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Fade-in keyframe */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Soft pulse for status indicators */
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }

        /* Shimmer for loading states */
        @keyframes shimmer {
          from { background-position: -400px 0; }
          to   { background-position:  400px 0; }
        }
      `,
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BG_PAPER,
          border: `1px solid rgba(212, 155, 106, 0.15)`,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BG_PAPER,
          border: `1px solid rgba(212, 155, 106, 0.15)`,
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(212, 155, 106, 0.4)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '7px 16px',
          fontSize: '0.875rem',
          transition: 'all 0.18s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #4F46E5 100%)`,
          boxShadow: `0 1px 3px ${alpha(PRIMARY, 0.25)}`,
          '&:hover': {
            background: `linear-gradient(135deg, #818CF8 0%, ${PRIMARY} 100%)`,
            boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.35)}`,
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        outlinedPrimary: {
          borderColor: alpha(PRIMARY, 0.4),
          '&:hover': {
            borderColor: PRIMARY,
            background: alpha(PRIMARY, 0.07),
          },
        },
        outlinedSecondary: {
          borderColor: alpha(SECONDARY, 0.4),
          '&:hover': {
            borderColor: SECONDARY,
            background: alpha(SECONDARY, 0.07),
          },
        },
        text: {
          '&:hover': { background: 'rgba(255,255,255,0.05)' },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: BG_GLASS,
            fontSize: '0.875rem',
            transition: 'background-color 0.18s',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
            '&.Mui-focused': {
              backgroundColor: alpha(PRIMARY, 0.04),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: PRIMARY,
                borderWidth: 1.5,
              },
            },
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
          },
        },
      },
    },

    MuiSelect: {
      defaultProps: { size: 'small' },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: BG_SURFACE,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
        option: {
          fontSize: '0.875rem',
          '&.Mui-focused': { backgroundColor: alpha(PRIMARY, 0.08) },
          '&[aria-selected="true"]': { backgroundColor: alpha(PRIMARY, 0.12) },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.72rem',
          letterSpacing: '0.02em',
          border: '1px solid transparent',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: BG_SURFACE,
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#64748B',
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' },
          '& .MuiTableCell-body': {
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
          },
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: BG_PAPER,
          fontFamily: '"Inter", sans-serif',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: BG_SURFACE,
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
            minHeight: '44px !important',
            maxHeight: '44px !important',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#64748B',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.15s',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255,255,255,0.025)',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid rgba(255,255,255,0.04)`,
            outline: 'none !important',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            backgroundColor: BG_SURFACE,
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: BG_PAPER,
          },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_DEFAULT,
          borderRight: `1px solid rgba(255, 255, 255, 0.07)`,
          backdropFilter: 'blur(12px)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BG_DEFAULT, 0.8),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid rgba(255, 255, 255, 0.07)`,
          boxShadow: 'none',
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255, 255, 255, 0.07)' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '1px 8px',
          padding: '7px 10px',
          transition: 'all 0.18s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(212, 155, 106, 0.12)',
            color: '#D49B6A',
            '& .MuiListItemIcon-root': { color: '#D49B6A' },
            '&:hover': { backgroundColor: 'rgba(212, 155, 106, 0.16)' },
          },
          '&:hover:not(.Mui-selected)': {
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: BG_SURFACE,
          border: `1px solid rgba(255,255,255,0.1)`,
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        arrow: {
          color: BG_SURFACE,
          '&::before': { border: `1px solid rgba(255,255,255,0.1)` },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: BG_PAPER,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          '&.Mui-expanded': { margin: 0 },
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_SURFACE,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
          '&.Mui-selected': { backgroundColor: alpha(PRIMARY, 0.1) },
          '&.Mui-selected:hover': { backgroundColor: alpha(PRIMARY, 0.14) },
        },
      },
    },

    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.05)',
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
        bar: { borderRadius: 4 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        standardError: {
          backgroundColor: alpha(ERROR, 0.08),
          borderColor: alpha(ERROR, 0.2),
          color: '#FB7185',
        },
        standardWarning: {
          backgroundColor: alpha(WARNING, 0.08),
          borderColor: alpha(WARNING, 0.2),
          color: '#FCD34D',
        },
        standardInfo: {
          backgroundColor: alpha(SECONDARY, 0.08),
          borderColor: alpha(SECONDARY, 0.2),
          color: '#7DD3FC',
        },
        standardSuccess: {
          backgroundColor: alpha(SUCCESS, 0.08),
          borderColor: alpha(SUCCESS, 0.2),
          color: '#34D399',
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.3)',
          '&.Mui-checked': { color: PRIMARY },
        },
      },
    },
  },
});

export default theme;
