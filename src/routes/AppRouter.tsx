import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';

// Lazy-loaded pages for code splitting
const LoginPage      = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage  = lazy(() => import('../features/dashboard/DashboardPage'));
const CustomersPage  = lazy(() => import('../features/customers/CustomersPage'));
const PrintJobsPage  = lazy(() => import('../features/printJobs/PrintJobsPage'));
const InvoicesPage   = lazy(() => import('../features/invoices/InvoicesPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <CircularProgress size={48} thickness={3} />
  </Box>
);

const AppRouter = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — redirect to / if already logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected routes — wrapped in AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/"            element={<DashboardPage />} />
            <Route path="/customers"   element={<CustomersPage />} />
            <Route path="/print-jobs"  element={<PrintJobsPage />} />
            <Route path="/invoices"    element={<InvoicesPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
