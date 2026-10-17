import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch, Controller } from 'react-hook-form';
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
  Chip,
  Skeleton,
  Alert,
  InputAdornment,
  Tooltip,
  MenuItem,
  Autocomplete,
  alpha,
  Menu,
  InputBase,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import dayjs from 'dayjs';
import reactCountUpModule from 'react-countup';
const CountUp = (reactCountUpModule as any).default || reactCountUpModule;
import { motion, AnimatePresence } from 'framer-motion';

import { getPrintJobs, createPrintJob, updatePrintJobStatus, updatePrintJob } from '../../api/printJobApi';
import { getCustomers } from '../../api/customerApi';
import type { PrintJob, PrintJobStatus, CreatePrintJobRequest } from '../../types';
import AnimatedPage from '../../components/ui/AnimatedPage';
import PageHeader from '../../components/ui/PageHeader';
import GlowCard from '../../components/ui/GlowCard';
import { staggerContainer, staggerItem } from '../../theme/animations';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const printJobSchema = z.object({
  customerId: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  material: z.enum(['PLA', 'ABS', 'PETG', 'Resin']),
  weightInGrams: z.coerce.number().min(0.1, 'Weight must be > 0'),
  printTimeHours: z.coerce.number().min(0.1, 'Time must be > 0'),
  materialRatePerGram: z.coerce.number().min(0.1, 'Rate must be > 0'),
  timeRatePerHour: z.coerce.number().min(0, 'Rate cannot be negative'),
  status: z.string().optional(),
});
type PrintJobFormData = z.infer<typeof printJobSchema>;

// ─── Status Colors ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<PrintJobStatus, string> = {
  Pending:   '#F59E0B',
  Printing:  '#38BDF8',
  Completed: '#10B981',
  Billed:    '#C5A059',
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, subtitle, icon, color, prefix = '' }: { label: string; value: number | string; subtitle: string; icon: React.ReactNode; color: string; prefix?: string }) => (
  <GlowCard accentColor={color} sx={{ flex: 1, height: '100%' }}>
    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1, mt: 0.25, color: '#F8FAFC', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {prefix}{typeof value === 'number' ? <CountUp end={value} duration={1.2} separator="," decimals={prefix ? 2 : 0} preserveValue /> : value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </GlowCard>
);

// ─── Status Update Menu Cell ──────────────────────────────────────────────────
const StatusCell = ({
  job,
  onStatusUpdate,
}: {
  job: PrintJob;
  onStatusUpdate: (id: string, status: 'Pending' | 'Printing' | 'Completed') => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (job.status !== 'Billed') setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (status: 'Pending' | 'Printing' | 'Completed') => {
    onStatusUpdate(job._id, status);
    handleClose();
  };

  const getStatusChip = () => {
    const color = STATUS_COLORS[job.status as PrintJobStatus];
    if (job.status === 'Billed') {
      return <Chip icon={<LockRoundedIcon sx={{ fontSize: '13px !important', color: `${color} !important` }} />} label="Billed" size="small" sx={{ bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.3)}`, fontWeight: 600 }} />;
    }
    if (job.status === 'Printing') {
      return (
        <Chip
          icon={
            <Box sx={{ ml: 1, width: 6, height: 6, borderRadius: '50%', bgcolor: color, animation: 'pulse 1.5s infinite' }}>
              <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 ${alpha(color, 0.7)}; } 70% { box-shadow: 0 0 0 6px rgba(0,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); } }`}</style>
            </Box>
          }
          label="Printing"
          size="small"
          sx={{ bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.3)}`, fontWeight: 600, pl: 0.5 }}
        />
      );
    }
    return <Chip label={job.status} size="small" sx={{ bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.3)}`, fontWeight: 600 }} />;
  };

  return (
    <>
      <Box onClick={handleClick} sx={{ display: 'flex', alignItems: 'center', cursor: job.status !== 'Billed' ? 'pointer' : 'default', height: '100%' }}>
        {getStatusChip()}
        {job.status !== 'Billed' && <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', ml: 0.5 }} />}
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} elevation={3}>
        {(['Pending', 'Printing', 'Completed'] as const).map((s) => (
          <MenuItem key={s} onClick={() => handleSelect(s)} selected={job.status === s} sx={{ gap: 1.5, fontSize: '0.85rem' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[s], flexShrink: 0 }} />
            {s}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// ─── Print Job Form ───────────────────────────────────────────────────────────
const PrintJobForm = ({ editingJob, onSuccess, onClose }: { editingJob: PrintJob | null; onSuccess: () => void; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<PrintJobFormData>({
    resolver: zodResolver(printJobSchema),
    defaultValues: {
      customerId: editingJob?.customer?._id || '',
      fileName: editingJob?.fileName || '',
      material: (editingJob?.material as any) || 'PLA',
      weightInGrams: editingJob?.weightInGrams || 0,
      printTimeHours: editingJob?.printTimeHours || 0,
      materialRatePerGram: editingJob?.materialRatePerGram || 15,
      timeRatePerHour: editingJob?.timeRatePerHour || 200,
      status: editingJob?.status || 'Pending',
    },
  });

  // Re-sync defaultValues if editingJob changes
  useEffect(() => {
    if (editingJob) {
      reset({
        customerId: editingJob.customer?._id || '',
        fileName: editingJob.fileName || '',
        material: (editingJob.material as any) || 'PLA',
        weightInGrams: editingJob.weightInGrams || 0,
        printTimeHours: editingJob.printTimeHours || 0,
        materialRatePerGram: editingJob.materialRatePerGram || 15,
        timeRatePerHour: editingJob.timeRatePerHour || 200,
        status: editingJob.status || 'Pending',
      });
    } else {
      reset({
        customerId: '',
        fileName: '',
        material: 'PLA',
        weightInGrams: 0,
        printTimeHours: 0,
        materialRatePerGram: 15,
        timeRatePerHour: 200,
        status: 'Pending',
      });
    }
  }, [editingJob, reset]);

  const weight = useWatch({ control, name: 'weightInGrams' }) || 0;
  const printTime = useWatch({ control, name: 'printTimeHours' }) || 0;
  const matRate = useWatch({ control, name: 'materialRatePerGram' }) || 0;
  const timeRate = useWatch({ control, name: 'timeRatePerHour' }) || 0;
  
  const materialCost = weight * matRate;
  const timeCost = printTime * timeRate;
  const estimatedCost = materialCost + timeCost;

  const selectedMaterial = watch('material');
  const selectedStatus = watch('status');

  const { mutate: doCreate, isPending: isCreating } = useMutation({
    mutationFn: createPrintJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      enqueueSnackbar('Print job created successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message ?? 'Failed to create print job.', { variant: 'error' });
    },
  });

  const { mutate: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: updatePrintJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      enqueueSnackbar('Print job updated successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message ?? 'Failed to update print job.', { variant: 'error' });
    },
  });

  const isLoading = isSubmitting || isCreating || isUpdating;
  const onSubmit = (data: PrintJobFormData) => {
      const payload = {
          ...data,
          customerId: data.customerId === '' ? undefined : data.customerId
      };
      if (editingJob) {
          doUpdate({ id: editingJob._id, payload });
      } else {
          doCreate(payload as any);
      }
  };

  const fieldLabel = (text: string, required = false) => (
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
      {text} {required && <span style={{ color: '#C5A059' }}>*</span>}
    </Typography>
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Live Preview Card */}
        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#11141F', border: '1px solid rgba(197, 160, 89, 0.2)', display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'linear-gradient(90deg, #C5A059 0%, #E6C687 100%)' }} />
          <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Estimator</Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Material Cost</Typography>
            <Typography variant="caption" sx={{ color: '#F8FAFC', fontFamily: "'JetBrains Mono', monospace" }}>Rs. {materialCost.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Machine Time Cost</Typography>
            <Typography variant="caption" sx={{ color: '#F8FAFC', fontFamily: "'JetBrains Mono', monospace" }}>Rs. {timeCost.toFixed(2)}</Typography>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 0.5 }} />
          
          {editingJob && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Previous Cost</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontFamily: "'JetBrains Mono', monospace" }}>
                Rs. {editingJob.cost.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 600 }}>Estimated Total Cost</Typography>
            <Typography variant="h6" sx={{ color: '#E6C687', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              Rs. {estimatedCost.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>

        {editingJob && (
          <Box>
            {fieldLabel('Status', true)}
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              {['Pending', 'Printing', 'Completed', 'Billed'].map((s) => (
                <Box
                  key={s}
                  onClick={() => setValue('status', s as any)}
                  sx={{
                    flex: 1,
                    py: 1,
                    textAlign: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedStatus === s ? '#C5A059' : 'rgba(255,255,255,0.1)',
                    bgcolor: selectedStatus === s ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedStatus === s ? '#E6C687' : 'text.secondary',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: selectedStatus === s ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.05)' }
                  }}
                >
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{s}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          {fieldLabel('Customer')}
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
                  disabled={isLoading || isLoadingCustomers}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select a customer (Optional)" error={!!errors.customerId} helperText={errors.customerId?.message}
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

        <Box>
          {fieldLabel('File Name', true)}
          <TextField
            fullWidth placeholder="e.g. Batman_Bust.stl" error={!!errors.fileName} helperText={errors.fileName?.message} disabled={isLoading} {...register('fileName')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' } } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PrintRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
          />
        </Box>

        <Box>
          {fieldLabel('Material', true)}
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            {['PLA', 'PETG', 'ABS', 'Resin'].map((mat) => (
              <Box
                key={mat}
                onClick={() => setValue('material', mat as any)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  textAlign: 'center',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedMaterial === mat ? '#C5A059' : 'rgba(255,255,255,0.1)',
                  bgcolor: selectedMaterial === mat ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255,255,255,0.02)',
                  color: selectedMaterial === mat ? '#E6C687' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: selectedMaterial === mat ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.05)' }
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{mat}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {fieldLabel('Weight', true)}
            <TextField
              fullWidth type="number" inputProps={{ step: '0.1' }} error={!!errors.weightInGrams} helperText={errors.weightInGrams?.message} disabled={isLoading} {...register('weightInGrams')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' }, '& input': { fontFamily: "'JetBrains Mono', monospace" } } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: 'text.disabled' }}>g</Typography></InputAdornment> }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            {fieldLabel('Mat. Rate', true)}
            <TextField
              fullWidth type="number" error={!!errors.materialRatePerGram} helperText={errors.materialRatePerGram?.message} disabled={isLoading} {...register('materialRatePerGram')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' }, '& input': { fontFamily: "'JetBrains Mono', monospace" } } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: 'text.disabled' }}>Rs/g</Typography></InputAdornment> }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {fieldLabel('Print Time', true)}
            <TextField
              fullWidth type="number" inputProps={{ step: '0.1' }} error={!!errors.printTimeHours} helperText={errors.printTimeHours?.message} disabled={isLoading} {...register('printTimeHours')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' }, '& input': { fontFamily: "'JetBrains Mono', monospace" } } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: 'text.disabled' }}>hrs</Typography></InputAdornment> }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            {fieldLabel('Time Rate', true)}
            <TextField
              fullWidth type="number" error={!!errors.timeRatePerHour} helperText={errors.timeRatePerHour?.message} disabled={isLoading} {...register('timeRatePerHour')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', '&.Mui-focused fieldset': { borderColor: '#C5A059' }, '& input': { fontFamily: "'JetBrains Mono', monospace" } } }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: 'text.disabled' }}>Rs/hr</Typography></InputAdornment> }}
            />
          </Box>
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(197, 160, 89, 0.15)', display: 'flex', gap: 1.5, bgcolor: '#0D1017', width: '100%' }}>
        <Button 
          variant="outlined" 
          sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8', whiteSpace: 'nowrap', height: 44, py: 1, px: 2.5, fontSize: '0.85rem', fontWeight: 600, borderRadius: '10px', '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.05)' } }} 
          onClick={onClose} 
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ flex: 1, background: 'linear-gradient(135deg, #E6C687 0%, #C5A059 100%)', color: '#090B10', whiteSpace: 'nowrap', height: 44, py: 1, px: 2.5, fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #FDF0D5 0%, #E6C687 100%)', boxShadow: 'none' } }} 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Print Job'}
        </Button>
      </Box>
    </Box>
  );
};


// ─── Main Page ────────────────────────────────────────────────────────────────
const PrintJobsPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<PrintJob | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all jobs
  const { data: printJobs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['print-jobs'],
    queryFn: () => getPrintJobs(),
    staleTime: 1000 * 30,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: updatePrintJobStatus,
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      enqueueSnackbar(`Status updated to ${updatedJob.status}`, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message ?? 'Failed to update status', { variant: 'error' });
    },
  });

  const handleOpenCreate = () => {
    setEditingJob(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (job: PrintJob) => {
    setEditingJob(job);
    setDrawerOpen(true);
  };

  // Calculate KPIs
  const totalJobsCount = printJobs.length;
  const activeJobsCount = printJobs.filter(j => j.status === 'Pending' || j.status === 'Printing').length;
  const totalFilamentUsed = printJobs.reduce((sum, j) => sum + j.weightInGrams, 0);
  const totalPrintTime = printJobs.reduce((sum, j) => sum + j.printTimeHours, 0);
  const totalJobValue = printJobs.reduce((sum, j) => sum + j.cost, 0);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    return printJobs.filter(job => {
      const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        job.fileName.toLowerCase().includes(term) ||
        (job.customer?.name || '').toLowerCase().includes(term) ||
        job.material.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [printJobs, filterStatus, searchQuery]);

  // ── Grid columns ────────────────────────────────────────────────────────
  const columns: GridColDef<PrintJob>[] = [
    {
      field: 'fileName',
      headerName: 'FILE NAME',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', py: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(197, 160, 89, 0.12)', border: '1px solid rgba(197, 160, 89, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6C687', flexShrink: 0 }}>
            <LayersRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem', color: '#F8FAFC', lineHeight: 1.25 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>
              #{params.row._id.slice(-6).toUpperCase()}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'CUSTOMER',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<PrintJob>) => {
        const cName = params.row.customer?.name;
        if (cName) {
            const initials = cName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(197,160,89,0.25), rgba(197,160,89,0.08))', border: '1px solid rgba(197,160,89,0.4)', color: '#E6C687' }}>
                        {initials}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.825rem', color: '#F8FAFC' }}>
                        {cName}
                    </Typography>
                </Box>
            )
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip label="Unassigned / Walk-in" size="small" icon={<HelpOutlineRoundedIcon sx={{ fontSize: '13px !important' }}/>} sx={{ bgcolor: 'transparent', color: '#64748B', border: '1px dashed rgba(255,255,255,0.15)', fontSize: '0.7rem' }} />
          </Box>
        );
      },
    },
    {
      field: 'material',
      headerName: 'MATERIAL',
      width: 100,
      renderCell: (params: GridRenderCellParams<PrintJob>) => {
        let color = '#E2E8F0';
        let bgcolor = 'rgba(255,255,255,0.1)';
        if (params.value === 'PLA') { color = '#E6C687'; bgcolor = 'rgba(197, 160, 89, 0.1)'; }
        if (params.value === 'PETG') { color = '#38BDF8'; bgcolor = 'rgba(56, 189, 248, 0.1)'; }
        if (params.value === 'ABS') { color = '#F59E0B'; bgcolor = 'rgba(245, 158, 11, 0.1)'; }
        if (params.value === 'Resin') { color = '#10B981'; bgcolor = 'rgba(16, 185, 129, 0.1)'; }
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Chip label={params.value} size="small" sx={{ color, bgcolor, border: `1px solid ${alpha(color, 0.2)}`, fontWeight: 600, fontSize: '0.72rem' }} />
            </Box>
        )
      },
    },
    {
      field: 'weightInGrams',
      headerName: 'WEIGHT',
      width: 100,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontSize: '0.8rem' }}>
            {params.value} g
          </Typography>
        </Box>
      ),
    },
    {
      field: 'printTimeHours',
      headerName: 'TIME',
      width: 90,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontSize: '0.8rem' }}>
            {params.value} hrs
          </Typography>
        </Box>
      ),
    },
    {
      field: 'cost',
      headerName: 'COST',
      width: 130,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.825rem', color: '#E6C687' }}>
            Rs. {params.value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 140,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <StatusCell job={params.row} onStatusUpdate={(id, status) => updateStatus({ id, payload: { status } })} />
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'DATE',
      width: 120,
      renderCell: (params: GridRenderCellParams<PrintJob>) => (
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
      width: 180,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<PrintJob>) => {
        const isBilled = params.row.status === 'Billed';
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
            {params.row.status === 'Pending' && (
              <Button size="small" variant="outlined" onClick={() => updateStatus({ id: params.row._id, payload: { status: 'Printing' } })} sx={{ fontSize: '0.65rem', py: 0.25, color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#38BDF8' } }}>
                Start Printing
              </Button>
            )}
            {params.row.status === 'Printing' && (
              <Button size="small" variant="outlined" onClick={() => updateStatus({ id: params.row._id, payload: { status: 'Completed' } })} sx={{ fontSize: '0.65rem', py: 0.25, color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' } }}>
                Mark Completed
              </Button>
            )}
            <Tooltip title={isBilled ? "Billed Job - Edit Details" : "Edit Print Job"}>
              <Button size="small" variant="outlined" onClick={() => handleOpenEdit(params.row)} startIcon={isBilled ? <LockRoundedIcon sx={{ fontSize: '13px !important' }} /> : <EditOutlinedIcon sx={{ fontSize: '13px !important' }} />} sx={{ minWidth: 0, px: 1.5, py: 0.4, borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, color: '#C5A059', borderColor: 'rgba(197, 160, 89, 0.3)', '&:hover': { bgcolor: 'rgba(197, 160, 89, 0.1)', borderColor: '#C5A059' } }}>
                Edit
              </Button>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <AnimatedPage>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Print Jobs"
        subtitle="Manage your 3D printing queue and job costs"
        actions={
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh list">
              <IconButton onClick={() => refetch()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#C5A059', color: '#050A10', fontWeight: 600, '&:hover': { bgcolor: '#E6C687' } }}>
              Add Job
            </Button>
          </Stack>
        }
      />

      {/* ── Stat Cards (4 Grid) ─────────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3, width: '100%' }}>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Total Print Jobs" value={totalJobsCount} subtitle={`${activeJobsCount} jobs active or queued`} icon={<PrintRoundedIcon sx={{ fontSize: 20 }} />} color="#C5A059" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="In Progress / Queued" value={activeJobsCount} subtitle="Currently working" icon={<TimerRoundedIcon sx={{ fontSize: 20 }} />} color="#38BDF8" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Total Filament Used" value={`${totalFilamentUsed.toLocaleString()} g`} subtitle={`${totalPrintTime} hrs total machine time`} icon={<ScaleRoundedIcon sx={{ fontSize: 20 }} />} color="#10B981" />
          </motion.div>
          <motion.div variants={staggerItem} style={{ minWidth: 0, height: '100%' }}>
            <StatCard label="Total Job Value" value={totalJobValue} subtitle="Estimated gross value" prefix="Rs. " icon={<AttachMoneyRoundedIcon sx={{ fontSize: 20 }} />} color="#D97706" />
          </motion.div>
        </Box>
      </motion.div>

      {/* ── Error State ──────────────────────────────────────────────────── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
          Failed to load print jobs.
        </Alert>
      )}

      {/* ── Modern Table Toolbar ───────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ position: 'relative', width: { xs: '100%', md: 360 } }}>
          <Box sx={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
            <SearchRoundedIcon fontSize="small" />
          </Box>
          <InputBase
            placeholder="Search by STL file, customer, or material..."
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Printing', 'Completed', 'Billed'].map(status => (
            <Chip 
              key={status}
              label={status}
              onClick={() => setFilterStatus(status)}
              size="small"
              sx={{ 
                  bgcolor: filterStatus === status ? (status === 'Billed' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.02)', 
                  color: filterStatus === status ? (status === 'Billed' ? '#E6C687' : '#F8FAFC') : 'text.secondary', 
                  border: '1px solid',
                  borderColor: filterStatus === status ? (status === 'Billed' ? 'rgba(197, 160, 89, 0.4)' : 'rgba(255,255,255,0.2)') : 'transparent',
                  fontWeight: filterStatus === status ? 600 : 500,
                  transition: 'all 0.2s'
              }} 
            />
          ))}
          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.1)', height: 20, alignSelf: 'center' }} />
          <Chip label={`Showing ${filteredJobs.length} jobs`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontWeight: 500 }} />
        </Box>
      </Box>


      {/* ── Data Grid ────────────────────────────────────────────────────── */}
      <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', bgcolor: '#0D1017' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={420} sx={{ borderRadius: '12px' }} /></Box>
        ) : (
          <DataGrid
            rows={filteredJobs}
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
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', lineHeight: 'normal', py: 1 },
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
                  <PrintRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">No print jobs found</Typography>
                  {searchQuery === '' && filterStatus === 'All' && (
                    <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#C5A059', color: '#050A10' }}>
                      Add your first job
                    </Button>
                  )}
                </Box>
              ),
            }}
          />
        )}
      </Box>

      {/* ── Add/Edit Print Job Drawer ─────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 460 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0D1017',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(197, 160, 89, 0.2)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: 2,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(197, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A059' }}>
              <PrintRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em', color: '#F8FAFC' }}>
                {editingJob ? 'Edit Print Job' : 'New Print Job'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                {editingJob ? 'Update STL specifications, customer assignment, or rates' : 'Calculate cost and add to queue'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <PrintJobForm editingJob={editingJob} onSuccess={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </AnimatedPage>
  );
};

export default PrintJobsPage;
