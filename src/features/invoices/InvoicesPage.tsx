import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridPaginationModel } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Drawer,
  Typography,
  IconButton,
  Skeleton,
  Alert,
  Divider,
  Tooltip,
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  alpha,
  Stack,
  Chip,
  InputBase,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';

import dayjs from 'dayjs';
import reactCountUpModule from 'react-countup';
const CountUp = (reactCountUpModule as any).default || reactCountUpModule;
import { motion } from 'framer-motion';

import { getInvoices, createInvoice, updateInvoice, payInvoice } from '../../api/invoiceApi';
import { getCustomers } from '../../api/customerApi';
import { getPrintJobs } from '../../api/printJobApi';
import type { Invoice, Customer } from '../../types';
import InvoicePrintDialog from './InvoicePrintDialog';
import AnimatedPage from '../../components/ui/AnimatedPage';
import PageHeader from '../../components/ui/PageHeader';
import GlowCard from '../../components/ui/GlowCard';
import { staggerContainer, staggerItem } from '../../theme/animations';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  printJobIds: z.array(z.string()).min(1, 'Select at least one print job'),
});
type InvoiceFormData = z.infer<typeof invoiceSchema>;

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, subtitle, icon, color, prefix = '' }: { label: string; value: number | string; subtitle: string; icon: React.ReactNode; color: string; prefix?: string }) => (
  <GlowCard accentColor={color} sx={{ flex: 1, height: '100%' }}>
    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary"  sx={{ fontWeight: 600,  textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem'  }}>
          {label}
        </Typography>
        <Typography variant="h5"  sx={{ fontWeight: 700,  lineHeight: 1, mt: 0.25, color: '#F8FAFC', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'  }}>
          {prefix}{typeof value === 'number' ? <CountUp end={value} duration={1.2} separator="," decimals={prefix ? 2 : 0} preserveValue /> : value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </GlowCard>
);

// ─── Invoice Form (inside Drawer) ──────────────────────────────────────────
const InvoiceForm = ({
  invoiceToEdit,
  onSuccess,
  onClose,
}: {
  invoiceToEdit?: Invoice | null;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: allJobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['print-jobs'], // Ideally we fetch unbilled jobs here
    queryFn: () => getPrintJobs(),
  });

  const availableJobs = useMemo(
    () =>
      allJobs.filter(
        (job) =>
          job.status !== 'Billed' ||
          (invoiceToEdit && invoiceToEdit.printJobs.some((ij) => ij._id === job._id))
      ),
    [allJobs, invoiceToEdit]
  );

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: invoiceToEdit?.customer._id || '',
      printJobIds: invoiceToEdit?.printJobs.map((j) => j._id) || [],
    },
  });

  const selectedJobIds = watch('printJobIds');
  const selectedTotal = useMemo(
    () => availableJobs.filter((j) => selectedJobIds.includes(j._id)).reduce((sum, j) => sum + j.cost, 0),
    [availableJobs, selectedJobIds]
  );

  const { mutate: doCreate, isPending: isCreating } = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-all'] });
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      enqueueSnackbar('Invoice generated successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error: any) => enqueueSnackbar(error?.response?.data?.message || 'Failed to create invoice', { variant: 'error' }),
  });

  const { mutate: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-all'] });
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      enqueueSnackbar('Invoice updated successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error: any) => enqueueSnackbar(error?.response?.data?.message || 'Failed to update invoice', { variant: 'error' }),
  });

  const isLoading = isSubmitting || isCreating || isUpdating;
  const onSubmit = (data: any) => {
    if (invoiceToEdit) doUpdate({ id: invoiceToEdit._id, payload: data });
    else doCreate(data);
  };

  if (isLoadingCustomers || isLoadingJobs) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={56} sx={{ mb: 3, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Live Summary Card */}
        <Box sx={{ 
          p: 2.5, 
          borderRadius: '12px', 
          bgcolor: '#11141F', 
          border: '1px solid rgba(197, 160, 89, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'linear-gradient(90deg, #C5A059 0%, #E6C687 100%)' }} />
          <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Summary</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 600 }}>Total Amount</Typography>
            <Typography variant="h6" sx={{ color: '#E6C687', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              Rs. {selectedTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B' }}>{selectedJobIds.length} print jobs selected</Typography>
        </Box>

        <Box>
          <Typography variant="caption"  color="text.secondary" sx={{ fontWeight: 700,  mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem'  }}>
            Customer <span style={{ color: '#C5A059' }}>*</span>
          </Typography>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => {
              const selectedCustomer = customers.find((c) => c._id === field.value) || null;
              return (
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => `${option.name} (${option.phone})`}
                  value={selectedCustomer}
                  onChange={(_, newValue) => field.onChange(newValue?._id || '')}
                  disabled={isLoading || !!invoiceToEdit}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select a customer" error={!!errors.customerId} helperText={errors.customerId?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' } } }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} style={{ gap: 10 }}>
                       <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(197,160,89,0.25), rgba(197,160,89,0.08))', border: '1px solid rgba(197,160,89,0.4)', color: '#E6C687' }}>
                          {option.name.substring(0,2).toUpperCase()}
                       </Avatar>
                       <Box>
                         <Typography variant="body2" sx={{ color: '#F8FAFC' }}>{option.name}</Typography>
                         <Typography variant="caption" sx={{ color: '#64748B' }}>{option.phone}</Typography>
                       </Box>
                    </li>
                  )}
                />
              );
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        <Box>
          <Typography variant="caption"  color="text.secondary" sx={{ fontWeight: 700,  mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem'  }}>
            Select Print Jobs <span style={{ color: '#C5A059' }}>*</span>
          </Typography>
          {availableJobs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '8px', bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', '& .MuiAlert-icon': { color: '#38BDF8' } }}>No available print jobs to bill.</Alert>
          ) : (
            <Box sx={{ border: `1px solid ${errors.printJobIds ? '#F43F5E' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', maxHeight: 350, overflowY: 'auto', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Controller
                name="printJobIds"
                control={control}
                render={({ field }) => (
                  <List disablePadding>
                    {availableJobs.map((job) => {
                      const isChecked = field.value.includes(job._id);
                      return (
                        <ListItem key={job._id} dense  onClick={() => { field.onChange(isChecked ? field.value.filter(id => id !== job._id) : [...field.value, job._id]); }}
                          sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox edge="start" checked={isChecked} disableRipple size="small" sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: '#C5A059' } }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={job.fileName}
                            secondary={`${job.material} · ${job.weightInGrams}g · ${job.printTimeHours}hrs`}
                            
                            secondaryTypographyProps={{ variant: 'caption', sx: { color: '#64748B' } }}
                          />
                          <Typography variant="body2"  sx={{ fontWeight: 700,  color: '#E6C687', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem', ml: 1, whiteSpace: 'nowrap'  }}>
                            Rs. {job.cost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              />
            </Box>
          )}
          {errors.printJobIds && <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block', px: 1 }}>{errors.printJobIds.message}</Typography>}
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(197, 160, 89, 0.15)', display: 'flex', gap: 1.5, bgcolor: '#0D1017', width: '100%' }}>
        <Button 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            borderColor: 'rgba(255,255,255,0.12)', 
            color: '#94A3B8', 
            whiteSpace: 'nowrap', 
            height: 44, 
            py: 1, 
            px: 2.5, 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            borderRadius: '10px',
            '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.05)' }
          }} 
          onClick={onClose} 
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ 
            flex: 1, 
            background: 'linear-gradient(135deg, #E6C687 0%, #C5A059 100%)', 
            color: '#090B10', 
            whiteSpace: 'nowrap', 
            height: 44, 
            py: 1, 
            px: 2.5, 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            borderRadius: '10px',
            boxShadow: 'none',
            '&:hover': { background: 'linear-gradient(135deg, #FDF0D5 0%, #E6C687 100%)', boxShadow: 'none' }
          }} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : invoiceToEdit ? 'Update Invoice' : 'Generate Invoice'}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Customer Invoices Table ──────────────────────────────────────────────────
const CustomerInvoicesTable = ({
  customerId,
  onEdit,
  onPay,
  onPrint,
}: {
  customerId: string;
  onEdit: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', customerId, paginationModel.page, paginationModel.pageSize],
    queryFn: () => getInvoices(paginationModel.page + 1, paginationModel.pageSize, customerId),
  });

  const invoices = data?.invoices || [];
  const totalCount = data?.totalCount || 0;

  const columns: GridColDef<Invoice>[] = [
    {
      field: '_id',
      headerName: 'INVOICE ID',
      width: 130,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            <ReceiptRoundedIcon sx={{ fontSize: 16, color: '#C5A059' }} />
            <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#F8FAFC', letterSpacing: '0.04em' }}>
            #{params.value.slice(-6).toUpperCase()}
            </Typography>
        </Box>
      ),
    },
    {
      field: 'printJobs',
      headerName: 'PRINT JOBS',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Invoice>) => {
        const jobs = params.row.printJobs;
        if (jobs.length === 0) return <Typography variant="caption" sx={{ color: '#64748B' }}>No Jobs</Typography>;
        if (jobs.length === 1) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{jobs[0].fileName}</Typography>
                    <Chip label={jobs[0].material} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }} />
                </Box>
            )
        }
        return (
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              {jobs.length} Jobs · {jobs.reduce((s,j)=>s+j.weightInGrams,0)}g
            </Typography>
        )
      },
    },
    {
      field: 'totalAmount',
      headerName: 'TOTAL',
      width: 120,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2"  sx={{ fontWeight: 700,  color: '#E6C687', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.825rem'  }}>
            Rs. {params.value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'PAYMENT',
      width: 120,
      renderCell: (params: GridRenderCellParams<Invoice>) => {
          const isPaid = params.value === 'Paid';
          const color = isPaid ? '#10B981' : '#F59E0B';
          return (
             <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                 <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.2)}`, fontWeight: 600, fontSize: '0.72rem' }} />
             </Box>
          )
      },
    },
    {
      field: 'createdAt',
      headerName: 'DATE',
      width: 120,
      renderCell: (params: GridRenderCellParams<Invoice>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {dayjs(params.value).format('DD MMM YYYY')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 180,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<Invoice>) => {
        const isPaid = params.row.paymentStatus === 'Paid';
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
            <Tooltip title="View / Print">
              <IconButton size="small" onClick={() => onPrint(params.row)} sx={{ bgcolor: 'rgba(197, 160, 89, 0.1)', color: '#C5A059', '&:hover': { bgcolor: 'rgba(197, 160, 89, 0.2)' } }}>
                <PrintRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isPaid ? "Paid invoices can't be edited" : "Edit Invoice"}>
              <span>
                <IconButton size="small" onClick={() => onEdit(params.row)} disabled={isPaid} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' } }}>
                  <EditRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
            {!isPaid && (
              <Button variant="contained" size="small" onClick={() => onPay(params.row)} sx={{ minWidth: 0, px: 1.5, py: 0.4, borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, bgcolor: alpha('#10B981', 0.15), color: '#10B981', border: `1px solid ${alpha('#10B981', 0.3)}`, '&:hover': { bgcolor: alpha('#10B981', 0.25) }, boxShadow: 'none' }}>
                Pay
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <DataGrid
        rows={invoices}
        columns={columns}
        getRowId={(row) => row._id}
        autoHeight
        rowCount={totalCount}
        pageSizeOptions={[10, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
        disableRowSelectionOnClick
        disableColumnMenu
        rowHeight={64}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', py: 1, lineHeight: 'normal' },
          '& .MuiDataGrid-row': { cursor: 'default', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } },
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5, py: 4 }}>
              <ReceiptRoundedIcon sx={{ fontSize: 30, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>No invoices for this customer.</Typography>
            </Box>
          ),
        }}
      />
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const InvoicesPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [payDialogInvoice, setPayDialogInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | false>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All Invoices');

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  // Fetch all invoices for stats (in a real app this should be an aggregate endpoint)
  const { data: allData, refetch } = useQuery({
    queryKey: ['invoices-all'],
    queryFn: () => getInvoices(1, 1000, undefined),
    staleTime: 1000 * 30,
  });
  
  const allInvoices = allData?.invoices || [];

  const { mutate: markPaid, isPending: isPaying } = useMutation({
    mutationFn: payInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-all'] });
      enqueueSnackbar('Invoice marked as paid!', { variant: 'success' });
      setPayDialogInvoice(null);
    },
    onError: (error: any) => enqueueSnackbar(error?.response?.data?.message || 'Failed to update payment status', { variant: 'error' }),
  });

  const handleEdit = (invoice: Invoice) => {
    if (invoice.paymentStatus === 'Paid') {
      enqueueSnackbar('Cannot edit a paid invoice', { variant: 'warning' });
      return;
    }
    setInvoiceToEdit(invoice);
    setDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setInvoiceToEdit(null);
    setDrawerOpen(true);
  };

  // KPI Calculations
  const totalInvoices = allInvoices.length;
  const uniqueCustomers = new Set(allInvoices.map(i => i.customer._id)).size;
  const paidInvoices = allInvoices.filter(i => i.paymentStatus === 'Paid');
  const pendingInvoices = allInvoices.filter(i => i.paymentStatus === 'Unpaid' || i.paymentStatus === 'Pending');
  
  const collectedRevenue = paidInvoices.reduce((s,i)=>s+i.totalAmount,0);
  const outstandingRevenue = pendingInvoices.reduce((s,i)=>s+i.totalAmount,0);
  const collectionRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0;
  const avgInvoiceValue = totalInvoices > 0 ? (collectedRevenue + outstandingRevenue) / totalInvoices : 0;

  // Filter customers based on search and filter
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        const term = searchQuery.toLowerCase();
        const matchesSearch = customer.name.toLowerCase().includes(term) || customer.phone.includes(term);
        // We only filter customers by search. The status filter will be handled by the accordion's invoices if we wanted, 
        // but it's complex since we paginate per customer. For simplicity, we just filter customers by search term.
        return matchesSearch;
    });
  }, [customers, searchQuery]);

  return (
    <AnimatedPage>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Invoices"
        subtitle="Manage customer billing and payments"
        actions={
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh list">
              <IconButton onClick={() => refetch()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#C5A059', color: '#050A10', fontWeight: 600, '&:hover': { bgcolor: '#E6C687' } }}>
              Generate Invoice
            </Button>
          </Stack>
        }
      />

      {/* ── Stat Cards (4 Grid) ─────────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3, width: '100%' }}>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Total Invoices" value={totalInvoices} subtitle={`Across ${uniqueCustomers} customers`} icon={<ReceiptRoundedIcon sx={{ fontSize: 20 }} />} color="#C5A059" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Collected (Paid)" value={collectedRevenue} subtitle={`${paidInvoices.length} paid invoices`} prefix="Rs. " icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />} color="#10B981" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Outstanding" value={outstandingRevenue} subtitle={`${pendingInvoices.length} pending invoices`} prefix="Rs. " icon={<HourglassEmptyRoundedIcon sx={{ fontSize: 20 }} />} color="#F59E0B" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Collection Rate" value={`${collectionRate.toFixed(1)}%`} subtitle={`Avg Rs. ${avgInvoiceValue.toLocaleString('en-LK', {maximumFractionDigits:0})} / invoice`} icon={<PieChartRoundedIcon sx={{ fontSize: 20 }} />} color="#38BDF8" />
          </motion.div>
        </Box>
      </motion.div>

      {/* ── Modern Table Toolbar ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ position: 'relative', width: { xs: '100%', md: 400 } }}>
          <Box sx={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
            <SearchRoundedIcon fontSize="small" />
          </Box>
          <InputBase
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', pl: 4.5, pr: 2, py: 0.75, fontSize: '0.85rem', color: 'text.primary', transition: 'all 0.2s', '&.Mui-focused': { borderColor: '#C5A059', bgcolor: 'rgba(197, 160, 89, 0.02)' } }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
           <Button size="small" variant="text" sx={{ color: 'text.secondary', fontSize: '0.75rem', mr: 1 }} onClick={() => setExpandedCustomer(expandedCustomer ? false : customers[0]?._id)}>
              {expandedCustomer ? 'Collapse All' : 'Expand All'}
           </Button>
          {['All Invoices', 'Pending', 'Paid'].map(status => (
            <Chip 
              key={status}
              label={status}
              onClick={() => setFilterStatus(status)}
              size="small"
              sx={{ bgcolor: filterStatus === status ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.02)', color: filterStatus === status ? '#E6C687' : 'text.secondary', border: '1px solid', borderColor: filterStatus === status ? 'rgba(197, 160, 89, 0.4)' : 'transparent', fontWeight: filterStatus === status ? 600 : 500, transition: 'all 0.2s' }} 
            />
          ))}
        </Box>
      </Box>

      {/* ── Customer Accordions ───────────────────────────────────────────── */}
      {isLoadingCustomers ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)' }} />
          ))}
        </Box>
      ) : filteredCustomers.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '8px', bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', '& .MuiAlert-icon': { color: '#38BDF8' } }}>
          No customers found. Create a customer to manage their invoices.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredCustomers.map((customer) => {
            const customerInvoices = allInvoices.filter(i => i.customer._id === customer._id);
            const cPaid = customerInvoices.filter(i => i.paymentStatus === 'Paid').reduce((s,i)=>s+i.totalAmount,0);
            const cDue = customerInvoices.filter(i => i.paymentStatus !== 'Paid').reduce((s,i)=>s+i.totalAmount,0);

            // Skip customer if they don't match invoice filter (optional logic)
            if (filterStatus === 'Paid' && cPaid === 0 && customerInvoices.length > 0) return null;
            if (filterStatus === 'Pending' && cDue === 0 && customerInvoices.length > 0) return null;

            return (
            <Accordion
              key={customer._id}
              expanded={expandedCustomer === customer._id}
              onChange={(_, isExpanded) => setExpandedCustomer(isExpanded ? customer._id : false)}
              disableGutters
              elevation={0}
              sx={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px !important',
                bgcolor: '#0D1017',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { borderColor: '#C5A059' },
                transition: 'border-color 0.2s ease',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />} sx={{ px: 2.5, py: 1.5, minHeight: 72 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(197,160,89,0.25), rgba(197,160,89,0.08))', border: '1px solid rgba(197,160,89,0.4)', color: '#E6C687' }}>
                      {customer.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2"  sx={{ fontWeight: 600,  lineHeight: 1.25, fontSize: '0.9rem', color: '#F8FAFC', mb: 0.5  }}>
                        {customer.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Chip icon={<LocalPhoneRoundedIcon sx={{ fontSize: '11px !important' }}/>} label={customer.phone} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary' }} />
                         {customer.email && <Chip icon={<EmailRoundedIcon sx={{ fontSize: '11px !important' }}/>} label={customer.email} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary' }} />}
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Summary Badges */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, display: { xs: 'none', md: 'flex' } }}>
                     <Chip label={`${customerInvoices.length} Invoices`} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.03)', color: '#64748B' }} />
                     <Chip label={`Paid: Rs. ${cPaid.toLocaleString('en-LK')}`} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: alpha('#10B981', 0.1), color: '#10B981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, border: `1px solid ${alpha('#10B981', 0.2)}` }} />
                     <Chip label={`Due: Rs. ${cDue.toLocaleString('en-LK')}`} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, border: `1px solid ${alpha('#F59E0B', 0.2)}` }} />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                {expandedCustomer === customer._id && (
                  <Box sx={{ mt: 1, borderTop: '1px dashed rgba(255,255,255,0.05)', pt: 2 }}>
                    <CustomerInvoicesTable customerId={customer._id} onEdit={handleEdit} onPay={setPayDialogInvoice} onPrint={setPrintInvoice} />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
            );
          })}
        </Box>
      )}

      {/* ── Add/Edit Invoice Drawer ──────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 460 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0D1017',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(197, 160, 89, 0.2)',
          }, '& .MuiDialog-paper': {
            width: { xs: '100vw', sm: 460 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0D1017',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(197, 160, 89, 0.2)',
          } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' , cursor: 'pointer'}}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(197, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059' }}>
              <ReceiptRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1"  sx={{ fontWeight: 700,  letterSpacing: '-0.01em', color: '#F8FAFC'  }}>
                {invoiceToEdit ? 'Edit Invoice' : 'Generate Invoice'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                {invoiceToEdit ? `Updating invoice #${invoiceToEdit._id.slice(-6).toUpperCase()}` : 'Select a customer and jobs to bill'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {drawerOpen && <InvoiceForm invoiceToEdit={invoiceToEdit} onSuccess={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)} />}
      </Drawer>

      {/* ── Confirm Pay Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!payDialogInvoice} onClose={() => !isPaying && setPayDialogInvoice(null)} maxWidth="xs" fullWidth
        sx={{ '& .MuiDrawer-paper': { bgcolor: '#11141F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }, '& .MuiDialog-paper': { bgcolor: '#11141F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#F8FAFC' }}>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Mark invoice <strong style={{ color: '#E6C687' }}>#{payDialogInvoice?._id.slice(-6).toUpperCase()}</strong> as paid? This cannot be undone and the invoice will be locked from further edits.
          </Typography>
          <Box sx={{ mt: 2.5, p: 2, bgcolor: alpha('#10B981', 0.08), border: `1px solid ${alpha('#10B981', 0.2)}`, borderRadius: '8px', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#10B981', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Total Received
            </Typography>
            <Typography variant="h5"  sx={{ fontWeight: 700,  color: '#10B981', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums'  }}>
              Rs. {payDialogInvoice?.totalAmount.toLocaleString('en-LK', {minimumFractionDigits: 2})}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={() => setPayDialogInvoice(null)} disabled={isPaying} variant="outlined" sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button onClick={() => payDialogInvoice && markPaid(payDialogInvoice._id)} variant="contained" disabled={isPaying} sx={{ fontWeight: 700, flex: 1, bgcolor: '#10B981', color: '#050A10', '&:hover': { bgcolor: '#34D399' } }}>
            {isPaying ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Print / View Invoice Dialog ──────────────────────────────────── */}
      <InvoicePrintDialog invoice={printInvoice} open={!!printInvoice} onClose={() => setPrintInvoice(null)} />
    </AnimatedPage>
  );
};

export default InvoicesPage;
