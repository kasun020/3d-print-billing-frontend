import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
} from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import dayjs from 'dayjs';
import type { Invoice } from '../../types';

interface Props {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

// â”€â”€â”€ Shared mono style â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const mono = { fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' };

const InvoicePrintDialog = ({ invoice, open, onClose }: Props) => {
  if (!invoice) return null;

  const handlePrint = () => window.print();
  const isPaid = invoice.paymentStatus === 'Paid';

  // Per-job cost breakdown totals
  const totalPrinting = invoice.printJobs.reduce((s, j) => s + ((j as any).printingCost || 0), 0);
  const totalDesign   = invoice.printJobs.reduce((s, j) => s + ((j as any).designCost   || 0), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#ffffff',
          color: '#0F172A',
          border: 'none',
          backdropFilter: 'none',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        },
        '@media print': {
          position: 'absolute',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          m: 0, p: 0,
          '& .MuiDialog-paper': {
            boxShadow: 'none', m: 0,
            maxWidth: '100%', width: '100%',
            height: '100%', borderRadius: 0,
          },
          '& .no-print': { display: 'none !important' },
        },
      }}
    >
      {/* â”€â”€ Toolbar (hidden on print) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <DialogActions
        className="no-print"
        sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', justifyContent: 'space-between' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPaid ? (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label="PAID" size="small"
              sx={{ bgcolor: alpha('#10B981', 0.12), color: '#10B981', fontWeight: 700, border: `1px solid ${alpha('#10B981', 0.25)}`, borderRadius: '6px', '& .MuiChip-icon': { color: '#10B981 !important' } }}
            />
          ) : (
            <Chip
              icon={<HourglassEmptyRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label="UNPAID" size="small"
              sx={{ bgcolor: alpha('#F59E0B', 0.12), color: '#D97706', fontWeight: 700, border: `1px solid ${alpha('#F59E0B', 0.25)}`, borderRadius: '6px', '& .MuiChip-icon': { color: '#D97706 !important' } }}
            />
          )}
          <Typography variant="caption" sx={{ color: '#64748B', ...mono }}>
            #{invoice._id.slice(-6).toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} color="inherit" startIcon={<CloseRoundedIcon />} size="small" sx={{ color: '#64748B' }}>
            Close
          </Button>
          <Button onClick={handlePrint} variant="contained" startIcon={<PrintRoundedIcon />} size="small">
            Print / Save PDF
          </Button>
        </Box>
      </DialogActions>

      {/* â”€â”€ Invoice Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <DialogContent sx={{ p: { xs: 4, md: 7 }, bgcolor: '#ffffff' }} id="invoice-print-content">

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
          {/* Business info */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img" src="/warlock-logo.jpg" alt="Warlock Groups Logo"
                sx={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.1, letterSpacing: '0.12em' }}>
                  WARLOCK GROUPS
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem', fontStyle: 'italic' }}>
                  Make the idea a reality
                </Typography>
              </Box>
            </Box>
            <Box sx={{ color: '#64748B', lineHeight: 1.9, fontSize: '0.8rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <WhatsAppIcon sx={{ fontSize: 15 }} /> +94 71 794 99 56
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailRoundedIcon sx={{ fontSize: 15 }} /> warlockgroups3d@gmail.com
              </Box>
            </Box>
          </Box>

          {/* Invoice meta */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '3rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.04em', lineHeight: 1, mb: 1 }}>
              INVOICE
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ color: '#0F172A', ...mono, letterSpacing: '0.04em' }}>
              #{invoice._id.slice(-6).toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontSize: '0.8rem' }}>
              Issued: {dayjs(invoice.createdAt).format('DD MMMM YYYY')}
            </Typography>
            <Box sx={{ mt: 1.5, display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: isPaid ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1), border: `1px solid ${isPaid ? alpha('#10B981', 0.3) : alpha('#F59E0B', 0.3)}` }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: isPaid ? '#059669' : '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {invoice.paymentStatus}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bill To */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="overline" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.65rem', display: 'block', mb: 1 }}>
            Bill To
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', mb: 0.25 }}>
            {invoice.customer?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', ...mono, fontSize: '0.8rem' }}>
            {invoice.customer?.phone}
          </Typography>
          {invoice.customer?.email && (
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              {invoice.customer.email}
            </Typography>
          )}
        </Box>

        {/* â”€â”€ Items Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TableContainer sx={{ mb: 5, borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1E293B' }}>
              <TableRow>
                {['Description', 'Material', 'Printing Cost', 'Design Cost', 'Total'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 0 ? 'left' : 'right'}
                    sx={{ fontWeight: 700, color: '#CBD5E1', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: 'none', py: 1.75, px: 2 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.printJobs.map((job, idx) => {
                const pCost = (job as any).printingCost ?? 0;
                const dCost = (job as any).designCost   ?? 0;
                const total = job.cost ?? (pCost + dCost);
                return (
                  <TableRow key={job._id} sx={{ bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem', py: 2, px: 2 }}>
                      {job.fileName}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.825rem', px: 2 }}>
                      {job.material || 'â€”'}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#334155', ...mono, fontSize: '0.8rem', px: 2 }}>
                      Rs. {pCost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#334155', ...mono, fontSize: '0.8rem', px: 2 }}>
                      Rs. {dCost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0F172A', ...mono, fontSize: '0.875rem', px: 2 }}>
                      Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* â”€â”€ Totals + Payment Details side by side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, mb: 6, flexWrap: 'wrap' }}>

          {/* Payment Details */}
          <Box
            sx={{
              flex: 1,
              minWidth: 240,
              p: 2.5,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Accent bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: '#1E293B', borderRadius: '12px 0 0 12px' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 0.5 }}>
              <AccountBalanceRoundedIcon sx={{ fontSize: 16, color: '#475569' }} />
              <Typography variant="overline" sx={{ color: '#475569', fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                Payment Details
              </Typography>
            </Box>

            {[
              { label: 'Bank',           value: "People's Bank" },
              { label: 'Branch',         value: 'Kurunegala' },
              { label: 'Account Name',   value: 'R.D Dasun Maduhansa Karunarathna' },
              { label: 'Account Number', value: '012200190064540', mono: true },
            ].map(({ label, value, mono: isMono }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 2, pl: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#1E293B', fontWeight: 700, textAlign: 'right', fontSize: '0.72rem', ...(isMono ? mono : {}) }}
                >
                  {value}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block', textAlign: 'center', pl: 0.5 }}>
              Please use Invoice #{invoice._id.slice(-6).toUpperCase()} as payment reference
            </Typography>
          </Box>

          {/* Cost Summary */}
          <Box sx={{ width: 290 }}>
            {/* Cost breakdown */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>Printing Cost</Typography>
              <Typography variant="body2" sx={{ ...mono }}>
                Rs. {totalPrinting.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>Design Cost</Typography>
              <Typography variant="body2" sx={{ ...mono }}>
                Rs. {totalDesign.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>Tax</Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>â€”</Typography>
            </Box>
            <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0F172A', letterSpacing: '-0.01em' }}>
                Total Due
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#C5820A', ...mono, letterSpacing: '-0.02em' }}>
                Rs. {invoice.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', pt: 4, borderTop: '1px solid #E2E8F0' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
            Thank you for choosing WARLOCK GROUPS!
          </Typography>
          <Typography variant="caption" sx={{ color: '#CBD5E1', mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
            Â© {new Date().getFullYear()} WARLOCK GROUPS Â· warlockgroups3d@gmail.com Â· +94 71 794 99 56
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePrintDialog;
