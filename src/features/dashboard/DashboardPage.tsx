import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Skeleton,
  Alert,
  Divider,
  LinearProgress,
  alpha,
  Grid,
  Button,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import dayjs from 'dayjs';
import reactCountUpModule from 'react-countup';
const CountUp = (reactCountUpModule as any).default || reactCountUpModule;
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem, fadeInUp } from '../../theme/animations';

import { getDashboardStats } from '../../api/statsApi';
import { useAuthStore } from '../../store/authStore';
import AnimatedPage from '../../components/ui/AnimatedPage';
import GlowCard from '../../components/ui/GlowCard';
import StatusBadge from '../../components/ui/StatusBadge';

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  prefix = '',
  suffix = '',
  icon,
  color,
  isAmount = false,
  subtext,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  isAmount?: boolean;
  subtext?: React.ReactNode;
}) => (
  <GlowCard accentColor={color} sx={{ height: '100%' }}>
    <Box sx={{ p: 2, pl: 3, display: 'flex', alignItems: 'center', gap: 2.5, height: '100%' }}>
      <Box
        sx={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.07)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          bgcolor: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.68rem' }}
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
          {prefix && (
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
            >
              {prefix}
            </Typography>
          )}
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: "'JetBrains Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <CountUp
              end={value}
              duration={1.4}
              decimals={isAmount ? 2 : 0}
              separator=","
              preserveValue
            />
          </Typography>
          {suffix && (
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {suffix}
            </Typography>
          )}
        </Box>
        {subtext && (
          <Box sx={{ mt: 0.5 }}>
            {subtext}
          </Box>
        )}
      </Box>
    </Box>
  </GlowCard>
);

// ─── Job Status Progress Row ──────────────────────────────────────────────────
const JobStatusRow = ({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) => {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <Box sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.825rem' }}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.825rem' }}
          >
            {count}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', width: 36, textAlign: 'right' }}>
            {pct}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: alpha(color, 0.08),
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color, transition: 'width 0.8s' },
        }}
      />
    </Box>
  );
};

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: '#081018',
        border: '1px solid rgba(212,155,106,0.2)',
        borderRadius: '8px',
        px: 2,
        py: 1.5,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {label}
      </Typography>
      {payload.map((entry: any) => (
        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant="body2" sx={{ color: '#94A3B8', flex: 1, minWidth: 60 }}>
            {entry.name}
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: entry.color, fontFamily: "'JetBrains Mono', monospace" }}>
            Rs. {Number(entry.value).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { adminUser } = useAuthStore();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const columns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'Invoice ID',
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'text.secondary' }}>
          #{params.value.toString().slice(-6).toUpperCase()}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1.5,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.825rem' }}>
          {params.value?.name || 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
          {dayjs(params.value).format('DD MMM')}
        </Typography>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={700} sx={{ color: '#D49B6A', fontFamily: "'JetBrains Mono', monospace" }}>
          Rs. {Number(params.value).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      flex: 1,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <StatusBadge status={params.value as 'Paid' | 'Unpaid'} />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <Skeleton variant="text" width={280} height={36} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: '12px', width: '100%' }} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: '12px', width: '100%' }} />
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: '12px', width: '100%' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 2 }}>
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: '12px', width: '100%' }} />
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: '12px', width: '100%' }} />
        </Box>
      </Box>
    );
  }

  if (isError || !stats) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px' }}>
        Failed to load dashboard statistics.
      </Alert>
    );
  }

  const totalJobs =
    stats.printJobsByStatus.Pending +
    stats.printJobsByStatus.Printing +
    stats.printJobsByStatus.Completed +
    stats.printJobsByStatus.Billed;
  
  const completionRate = totalJobs > 0 
    ? Math.round(((stats.printJobsByStatus.Completed + stats.printJobsByStatus.Billed) / totalJobs) * 100) 
    : 0;

  // Chart Data
  const chartData = [...stats.recentInvoices].reverse().map((inv) => ({
    date: dayjs(inv.createdAt).format('DD MMM'),
    Paid: inv.paymentStatus === 'Paid' ? inv.totalAmount : 0,
    Pending: inv.paymentStatus === 'Pending' ? inv.totalAmount : 0,
  }));

  // Material Pie Chart Colors
  const MATERIAL_COLORS = ['#D49B6A', '#38BDF8', '#10B981', '#6366F1', '#F59E0B'];

  return (
    <AnimatedPage>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.25, letterSpacing: '-0.02em' }}>
              {greeting},{' '}
              <span style={{ 
                background: 'linear-gradient(135deg, #E6C687 0%, #D49B6A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {adminUser?.name?.split(' ')[0] || 'Admin'}
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's an overview of your business today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" component={Link} to="/invoices" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#D49B6A', color: '#050A10', fontWeight: 600, '&:hover': { bgcolor: '#E6C687' } }}>
              New Invoice
            </Button>
            <Button variant="outlined" component={Link} to="/print-jobs" startIcon={<AddRoundedIcon />} sx={{ borderColor: 'rgba(212, 155, 106, 0.4)', color: '#D49B6A', fontWeight: 600, '&:hover': { borderColor: '#D49B6A', bgcolor: 'rgba(212, 155, 106, 0.08)' } }}>
              Print Job
            </Button>
            <Button variant="contained" component={Link} to="/customers" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#121F2E', color: '#F8FAFC', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: '#1A2A3D' } }}>
              Customer
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* ── Dashboard Grid (12-column Native CSS Grid) ────────────────── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(12, 1fr)' },
            gap: 2,
            width: '100%',
          }}
        >
          {/* Row 1: KPI Cards */}
          <Box component={motion.div} variants={staggerItem} sx={{ gridColumn: { lg: 'span 3' }, minWidth: 0 }}>
            <StatCard
              label="Total Revenue"
              value={stats.totalRevenue}
              prefix="Rs."
              icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 20 }} />}
              color="#10B981"
              isAmount
            />
          </Box>
          <Box component={motion.div} variants={staggerItem} sx={{ gridColumn: { lg: 'span 3' }, minWidth: 0 }}>
            <StatCard
              label="Pending Payments"
              value={stats.pendingInvoiceValue}
              prefix="Rs."
              icon={<HourglassEmptyRoundedIcon sx={{ fontSize: 20 }} />}
              color="#D97706"
              isAmount
            />
          </Box>
          <Box component={motion.div} variants={staggerItem} sx={{ gridColumn: { lg: 'span 3' }, minWidth: 0 }}>
            <StatCard
              label="Total Customers"
              value={stats.totalCustomers}
              icon={<PeopleRoundedIcon sx={{ fontSize: 20 }} />}
              color="#38BDF8"
            />
          </Box>
          <Box component={motion.div} variants={staggerItem} sx={{ gridColumn: { lg: 'span 3' }, minWidth: 0 }}>
            <StatCard
              label="Production Volume"
              value={stats.productionVolume?.weight || 0}
              suffix="g"
              icon={<ScaleRoundedIcon sx={{ fontSize: 20 }} />}
              color="#D49B6A"
              subtext={
                <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
                  {stats.productionVolume?.time || 0}h total print time
                </Typography>
              }
            />
          </Box>

          {/* Row 2: Middle Row */}
          <Box component={motion.div} variants={fadeInUp} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', lg: 'span 8' }, minWidth: 0, height: '100%' }}>
            <GlowCard sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25, letterSpacing: '-0.01em' }}>
                  REVENUE & BILLING OVERVIEW
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Paid vs Pending revenue trend
                </Typography>
              </Box>
              <Box sx={{ px: 1, pb: 2, flex: 1, minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Paid" stroke="#10B981" strokeWidth={2} fill="url(#paidGrad)" dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Pending" stroke="#D97706" strokeWidth={2} fill="url(#pendingGrad)" dot={{ fill: '#D97706', r: 3, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </GlowCard>
          </Box>

          <Box component={motion.div} variants={fadeInUp} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', lg: 'span 4' }, minWidth: 0, height: '100%' }}>
            <GlowCard sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '9px', bgcolor: alpha('#D49B6A', 0.1), border: `1px solid ${alpha('#D49B6A', 0.18)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D49B6A' }}>
                    <PrintRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                      JOB PIPELINE
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                      {totalJobs} total jobs
                    </Typography>
                  </Box>
                </Box>

                <JobStatusRow label="Pending" count={stats.printJobsByStatus.Pending} total={totalJobs} color="#D97706" />
                <JobStatusRow label="Printing" count={stats.printJobsByStatus.Printing} total={totalJobs} color="#38BDF8" />
                <JobStatusRow label="Completed" count={stats.printJobsByStatus.Completed} total={totalJobs} color="#10B981" />
                <JobStatusRow label="Billed" count={stats.printJobsByStatus.Billed} total={totalJobs} color="#D49B6A" />
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>Completion Rate</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#10B981' }}>{completionRate}%</Typography>
              </Box>
            </GlowCard>
          </Box>

          {/* Row 3: Bottom Row */}
          <Box component={motion.div} variants={fadeInUp} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', lg: 'span 7' }, minWidth: 0, height: '100%' }}>
            <GlowCard sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                    RECENT INVOICES
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Latest 5 generated
                  </Typography>
                </Box>
                <Button component={Link} to="/invoices" size="small" endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: '10px !important' }} />} sx={{ color: '#D49B6A', fontSize: '0.75rem' }}>
                  View All
                </Button>
              </Box>

              <Box sx={{ flex: 1, minHeight: 250 }}>
                {stats.recentInvoices.length === 0 ? (
                  <Box sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No invoices generated yet.</Typography>
                  </Box>
                ) : (
                  <DataGrid
                    rows={stats.recentInvoices}
                    columns={columns}
                    getRowId={(row) => row._id}
                    hideFooter
                    disableRowSelectionOnClick
                    disableColumnMenu
                    rowHeight={46}
                    sx={{ border: 'none', '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' }, '& .MuiDataGrid-row': { cursor: 'default' } }}
                  />
                )}
              </Box>
            </GlowCard>
          </Box>

          <Box component={motion.div} variants={fadeInUp} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', lg: 'span 5' }, minWidth: 0, height: '100%' }}>
            <GlowCard sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                  MATERIAL BREAKDOWN
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  Volume by material type
                </Typography>
              </Box>
              <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {stats.materialBreakdown && stats.materialBreakdown.length > 0 ? (
                  <>
                    <Box sx={{ width: 150, height: 150, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.materialBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="weight"
                            stroke="none"
                          >
                            {stats.materialBreakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => [`${value}g`, 'Weight']}
                            contentStyle={{ backgroundColor: '#081018', border: '1px solid rgba(212,155,106,0.2)', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      {stats.materialBreakdown.map((item, index) => {
                        const color = MATERIAL_COLORS[index % MATERIAL_COLORS.length];
                        const pct = stats.productionVolume?.weight > 0 ? Math.round((item.weight / stats.productionVolume.weight) * 100) : 0;
                        return (
                          <Box key={item.material} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                                <Typography variant="body2" fontWeight={600} fontSize="0.8rem" sx={{ width: 45 }}>
                                  {item.material}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} fontFamily="'JetBrains Mono', monospace" fontSize="0.8rem">
                                  {item.weight}g
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 400, fontSize: '0.75rem' }}>
                                {pct}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: color } }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No material data available.</Typography>
                  </Box>
                )}
              </Box>
            </GlowCard>
          </Box>
        </Box>
      </motion.div>
    </AnimatedPage>
  );
};

export default DashboardPage;
