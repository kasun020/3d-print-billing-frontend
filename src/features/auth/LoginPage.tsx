import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  alpha,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';
import { loginAdmin } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

// ─── Feature Bullet ───────────────────────────────────────────────────────────
const Feature = ({ text }: { text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.5 }}>
    <CheckCircleRoundedIcon
      sx={{ fontSize: 15, color: '#10B981', mt: 0.25, flexShrink: 0 }}
    />
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.825rem' }}>
      {text}
    </Typography>
  </Box>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: doLogin, isPending } = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      login(data.token, data.admin);
      enqueueSnackbar(`Welcome back, ${data.admin.name}!`, { variant: 'success' });
      navigate('/', { replace: true });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        'Login failed. Please check your credentials and try again.';
      setServerError(msg);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    doLogin(data);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#090A0F',
        // Subtle dot matrix
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        position: 'relative',
        p: 2,
        overflow: 'hidden',
      }}
    >
      {/* Top-center radial spotlight */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '45vh',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Main card ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 920, position: 'relative', zIndex: 1 }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* ── Left branding panel ─────────────────────────────────────── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 360,
              flexShrink: 0,
              p: 5,
              bgcolor: '#0E1018',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative rings — soft, not neon */}
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 280,
                height: 280,
                borderRadius: '50%',
                border: '1px solid rgba(99,102,241,0.1)',
              }}
            />
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: '1px solid rgba(99,102,241,0.08)',
              }}
            />
            {/* Subtle indigo orb bottom-left */}
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              }}
            />

            {/* Logo + brand */}
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src="/warlock-logo.jpg"
                alt="Warlock Group Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  mb: 3,
                }}
              />

              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  lineHeight: 1.2,
                  mb: 1,
                  letterSpacing: '0.12em',
                  color: '#D49B6A',
                }}
              >
                WARLOCK GROUPS
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7, mb: 4, fontSize: '0.9rem', fontStyle: 'italic' }}
              >
                Make the idea a reality
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="overline"
                color="text.disabled"
                sx={{ mb: 2, display: 'block', fontSize: '0.65rem' }}
              >
                What's included
              </Typography>

              <Feature text="Customer management & job history" />
              <Feature text="Print job tracking with live cost preview" />
              <Feature text="Automated invoice generation & PDF export" />
              <Feature text="Payment status tracking & reporting" />
              <Feature text="Real-time dashboard analytics" />
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
              © 2026 3D Print Billing · Admin Panel
            </Typography>
          </Box>

          {/* ── Right login form ─────────────────────────────────────────── */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: '#12151E',
              p: { xs: 3, sm: 5 },
            }}
          >
            {/* Mobile-only logo */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/warlock-logo.jpg"
                alt="Warlock Group Logo"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '9px',
                  objectFit: 'cover',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                }}
              />
              <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '0.12em', color: '#D49B6A' }}>
                WARLOCK GROUPS
              </Typography>
            </Box>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{ letterSpacing: '-0.025em', lineHeight: 1.2 }}
              >
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Enter your admin credentials to continue
              </Typography>
            </Box>

            {/* Error alert */}
            {serverError && (
              <Alert
                severity="error"
                onClose={() => setServerError(null)}
                sx={{ mb: 3, borderRadius: '8px' }}
              >
                {serverError}
              </Alert>
            )}

            {/* Form */}
            <Box
              component="form"
              id="login-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              {/* Email */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ mb: 0.75, display: 'block', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Email Address
                </Typography>
                <TextField
                  id="login-email"
                  fullWidth
                  placeholder="admin@example.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  {...register('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon
                          fontSize="small"
                          sx={{ color: errors.email ? 'error.main' : 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ mb: 0.75, display: 'block', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Password
                </Typography>
                <TextField
                  id="login-password"
                  fullWidth
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  {...register('password')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon
                          fontSize="small"
                          sx={{ color: errors.password ? 'error.main' : 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          id="toggle-password-visibility"
                          edge="end"
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                          sx={{ color: 'text.disabled' }}
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Submit button */}
              <Button
                id="login-submit-btn"
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{
                  mt: 0.5,
                  py: 1.4,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.55s ease',
                  },
                  '&:not(:disabled):hover::after': {
                    transform: 'translateX(100%)',
                  },
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={16} thickness={4} color="inherit" />
                    <span>Signing in...</span>
                  </Box>
                ) : (
                  'Sign in to Dashboard'
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                Protected system · Authorised access only
              </Typography>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
