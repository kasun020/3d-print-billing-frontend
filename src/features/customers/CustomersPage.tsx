import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Drawer,
  TextField,
  Typography,
  IconButton,
  Skeleton,
  Alert,
  InputAdornment,
  Tooltip,
  Avatar,
  alpha,
  Chip,
  Stack,
  InputBase
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import reactCountUpModule from 'react-countup';
const CountUp = (reactCountUpModule as any).default || reactCountUpModule;
import { Link } from 'react-router-dom';

import { getCustomers, createCustomer } from '../../api/customerApi';
import { getInvoices } from '../../api/invoiceApi';
import type { Customer } from '../../types';
import AnimatedPage from '../../components/ui/AnimatedPage';
import GlowCard from '../../components/ui/GlowCard';
import PageHeader from '../../components/ui/PageHeader';
import { staggerContainer, staggerItem } from '../../theme/animations';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(1, 'Phone number is required').min(7, 'Enter a valid phone number'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Enter a valid email address',
    }),
});
type CustomerFormData = z.infer<typeof customerSchema>;

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, prefix = '' }: { label: string; value: number; icon: React.ReactNode; color: string; prefix?: string }) => (
  <GlowCard accentColor={color} sx={{ flex: 1, height: '100%' }}>
    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          bgcolor: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700}
          sx={{
            lineHeight: 1,
            mt: 0.25,
            color: '#F8FAFC',
            fontFamily: "'JetBrains Mono', monospace",
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>
          {prefix}<CountUp end={value} duration={1.2} separator="," decimals={prefix ? 2 : 0} preserveValue />
        </Typography>
      </Box>
    </Box>
  </GlowCard>
);

// ─── Customer Form (inside Drawer) ────────────────────────────────────────────
const CustomerForm = ({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void; }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phone: '', email: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      enqueueSnackbar(`Customer "${newCustomer.name}" added successfully!`, { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Failed to create customer. Please try again.';
      enqueueSnackbar(msg, { variant: 'error' });
    },
  });

  const isLoading = isSubmitting || isPending;
  const onSubmit = (data: CustomerFormData) => mutate({ name: data.name, phone: data.phone, email: data.email || undefined });

  const watchName = watch('name');
  const watchPhone = watch('phone');
  const watchEmail = watch('email');

  const previewInitials = watchName ? watchName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Live Preview Card */}
        <Box sx={{ 
          p: 2.5, 
          borderRadius: '12px', 
          bgcolor: '#11141F', 
          border: '1px dashed rgba(197, 160, 89, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#C5A059' }} />
          <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, rgba(197,160,89,0.25), rgba(197,160,89,0.08))', border: '1px solid rgba(197,160,89,0.4)', color: '#E6C687', fontWeight: 700, fontSize: '1.1rem' }}>
            {previewInitials}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: watchName ? '#F8FAFC' : 'text.disabled' }}>
              {watchName || 'Customer Name'}
            </Typography>
            <Typography variant="caption" sx={{ color: watchPhone ? '#94A3B8' : 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, fontFamily: "'JetBrains Mono', monospace" }}>
              <PhoneOutlinedIcon sx={{ fontSize: 14 }} /> {watchPhone || '+94 XX XXX XXXX'}
            </Typography>
            {watchEmail && (
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <EmailOutlinedIcon sx={{ fontSize: 14 }} /> {watchEmail}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Inputs */}
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Full Name <span style={{ color: '#C5A059' }}>*</span>
          </Typography>
          <TextField
            fullWidth placeholder="e.g. Kasun Perera" error={!!errors.name} helperText={errors.name?.message} disabled={isLoading} {...register('name')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' } } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          />
        </Box>

        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Phone Number <span style={{ color: '#C5A059' }}>*</span>
          </Typography>
          <TextField
            fullWidth placeholder="e.g. +94 77 123 4567" error={!!errors.phone} helperText={errors.phone?.message} disabled={isLoading} {...register('phone')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' }, '& input': { fontFamily: "'JetBrains Mono', monospace" } } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          />
        </Box>

        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Email Address <Typography component="span" variant="caption" color="text.disabled">(OPTIONAL)</Typography>
          </Typography>
          <TextField
            fullWidth placeholder="e.g. kasun@example.com" type="email" error={!!errors.email} helperText={errors.email?.message} disabled={isLoading} {...register('email')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' } } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          />
        </Box>

        <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'rgba(197, 160, 89, 0.05)', border: '1px solid rgba(197, 160, 89, 0.1)', display: 'flex', gap: 1.5 }}>
          <InfoOutlinedIcon sx={{ color: '#C5A059', fontSize: 20, mt: 0.25 }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', lineHeight: 1.5 }}>
            Tip: Once created, you can immediately link print jobs and generate invoices for this client.
          </Typography>
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 1.5, bgcolor: '#0D1017' }}>
        <Button variant="outlined" sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" sx={{ flex: 1, bgcolor: '#C5A059', color: '#050A10', fontWeight: 600, '&:hover': { bgcolor: '#E6C687' } }} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Add Customer'}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CustomersPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const { data: customers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: 1000 * 60,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices-all-customers'],
    queryFn: () => getInvoices(1, 10000),
    staleTime: 1000 * 60,
  });
  
  const allInvoices = invoicesData?.invoices || [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Phone number copied!', { variant: 'success' });
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  // Calculations for KPI
  const totalCustomers = customers.length;
  const withEmailCount = customers.filter(c => c.email).length;
  const customersWithInvoices = new Set(allInvoices.map(inv => inv.customer?._id)).size;
  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const avgRevenue = customersWithInvoices > 0 ? totalRevenue / customersWithInvoices : 0;

  // ── Grid columns ─────────────────────────────────────────────────────────
  const columns: GridColDef<Customer>[] = [
    {
      field: 'name',
      headerName: 'CUSTOMER',
      flex: 1.5,
      minWidth: 240,
      renderCell: (params: GridRenderCellParams<Customer>) => {
        const initials = params.row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', py: 1 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(197,160,89,0.25), rgba(197,160,89,0.08))', border: '1px solid rgba(197,160,89,0.4)', color: '#E6C687' }}>
              {initials}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem', color: '#F8FAFC', lineHeight: 1.25 }}>
                {params.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>
                #{params.row._id.slice(-6).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'phone',
      headerName: 'PHONE',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Customer>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Chip 
            label={params.value} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }} 
          />
          <Tooltip title="Copy">
            <IconButton size="small" onClick={() => handleCopy(params.value)} sx={{ width: 24, height: 24, color: '#64748B', '&:hover': { color: '#F8FAFC' } }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="WhatsApp">
            <IconButton size="small" component="a" href={`https://wa.me/${params.value.replace(/\D/g,'')}`} target="_blank" sx={{ width: 24, height: 24, color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}>
              <WhatsAppIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Customer>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Chip 
              icon={<EmailRoundedIcon sx={{ fontSize: '14px !important', color: '#38BDF8 !important' }} />} 
              label={params.value} 
              size="small" 
              sx={{ bgcolor: 'rgba(56, 189, 248, 0.08)', color: '#E2E8F0', border: '1px solid rgba(56, 189, 248, 0.2)' }} 
            />
          ) : (
            <Chip label="No email" size="small" sx={{ bgcolor: 'transparent', color: '#64748B', border: '1px dashed rgba(255,255,255,0.1)' }} />
          )}
        </Box>
      ),
    },
    {
      field: 'orders',
      headerName: 'ORDERS & SPENT',
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<Customer>) => {
        const cInvoices = allInvoices.filter(i => i.customer?._id === params.row._id);
        const cSpent = cInvoices.reduce((s, i) => s + i.totalAmount, 0);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#E6C687', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.25 }}>
              Rs. {cSpent.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.25 }}>
              {cInvoices.length} invoices
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'JOINED',
      width: 140,
      renderCell: (params: GridRenderCellParams<Customer>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <DateRangeRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {dayjs(params.value).format('DD MMM YYYY')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<Customer>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
           <Button
             component={Link}
             to="/invoices"
             variant="outlined"
             size="small"
             startIcon={<ReceiptLongRoundedIcon />}
             sx={{ borderColor: 'rgba(197,160,89,0.3)', color: '#C5A059', fontSize: '0.7rem', py: 0.25, '&:hover': { borderColor: '#C5A059', bgcolor: 'rgba(197,160,89,0.08)' } }}
           >
             New Bill
           </Button>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box><Skeleton variant="text" width={140} height={32} /><Skeleton variant="text" width={220} height={20} /></Box>
          <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: '8px' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={84} sx={{ borderRadius: '12px' }} />)}
        </Box>
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: '12px' }} />
      </Box>
    );
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Customers"
        subtitle="Manage your 3D printing client accounts"
        actions={
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh list">
              <IconButton onClick={() => refetch()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={() => setDrawerOpen(true)} sx={{ bgcolor: '#C5A059', color: '#050A10', fontWeight: 600, '&:hover': { bgcolor: '#E6C687' } }}>
              Add Customer
            </Button>
          </Stack>
        }
      />

      {/* ── Stat Cards (4 Grid) ─────────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3, width: '100%' }}>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Total Customers" value={totalCustomers} icon={<PeopleRoundedIcon sx={{ fontSize: 20 }} />} color="#C5A059" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="With Email" value={withEmailCount} icon={<EmailRoundedIcon sx={{ fontSize: 20 }} />} color="#38BDF8" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Active Clients" value={customersWithInvoices} icon={<StorefrontRoundedIcon sx={{ fontSize: 20 }} />} color="#10B981" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Avg. Revenue / Client" value={avgRevenue} prefix="Rs. " icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 20 }} />} color="#D97706" />
          </motion.div>
        </Box>
      </motion.div>

      {isError && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>} sx={{ mb: 3, borderRadius: '8px' }}>
          Failed to load customers. Please check your connection.
        </Alert>
      )}

      {/* ── Modern Table Toolbar ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ position: 'relative', width: { xs: '100%', md: 360 } }}>
          <Box sx={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
            <SearchRoundedIcon fontSize="small" />
          </Box>
          <InputBase
            placeholder="Search by customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              pl: 4.5,
              pr: 2,
              py: 0.75,
              fontSize: '0.85rem',
              color: 'text.primary',
              transition: 'all 0.2s',
              '&.Mui-focused': { borderColor: '#C5A059', bgcolor: 'rgba(197, 160, 89, 0.02)' }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip label={`Showing ${filteredCustomers.length} customers`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontWeight: 500 }} />
          <Button startIcon={<FilterListRoundedIcon />} variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}>
            Filters
          </Button>
        </Box>
      </Box>

      {/* ── Rich Data Grid ─────────────────────────────────────────────── */}
      <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', bgcolor: '#0D1017' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          getRowId={(row) => row._id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={72}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { 
              display: 'flex', 
              alignItems: 'center',
              lineHeight: 'normal',
              py: 1,
            },
            '& .MuiDataGrid-row': { 
              cursor: 'default',
              transition: 'all 0.2s',
              borderLeft: '2px solid transparent',
              '&:hover': { 
                bgcolor: 'rgba(197, 160, 89, 0.05)',
                borderLeftColor: '#C5A059'
              } 
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5, py: 6 }}>
                <PeopleRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">No customers found</Typography>
                {searchQuery === '' && (
                  <Button variant="contained" size="small" startIcon={<PersonAddRoundedIcon />} onClick={() => setDrawerOpen(true)} sx={{ bgcolor: '#C5A059', color: '#050A10' }}>
                    Add your first customer
                  </Button>
                )}
              </Box>
            ),
          }}
        />
      </Box>

      {/* ── Add Customer Drawer ───────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0D1017',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(197, 160, 89, 0.2)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(197, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059' }}>
              <PersonAddRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em', color: '#F8FAFC' }}>
                Add New Customer
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Create a new 3D printing client profile
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <CustomerForm onSuccess={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </AnimatedPage>
  );
};

export default CustomersPage;
