// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: AdminUser;
}

// ─── Customer ────────────────────────────────────────────────────────────────
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
}

// ─── Print Job ───────────────────────────────────────────────────────────────
export type PrintJobStatus = 'Pending' | 'Printing' | 'Completed' | 'Billed';
export type Material = 'PLA' | 'ABS' | 'PETG' | 'Resin';

export interface PrintJob {
  _id: string;
  customer?: Pick<Customer, '_id' | 'name' | 'phone'>;
  fileName: string;
  material: Material;
  printingCost: number;
  designCost: number;
  cost: number;           // always = printingCost + designCost
  status: PrintJobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrintJobRequest {
  customerId?: string;
  fileName: string;
  material: Material;
  printingCost: number;
  designCost: number;
}

export interface UpdatePrintJobStatusRequest {
  status: 'Pending' | 'Printing' | 'Completed';
}

// ─── Invoice ─────────────────────────────────────────────────────────────────
export type PaymentStatus = 'Pending' | 'Paid';

export interface Invoice {
  _id: string;
  customer: Customer;   // populated by backend
  printJobs: PrintJob[]; // populated by backend
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  customerId: string;
  printJobIds: string[];
}

export interface UpdateInvoiceRequest {
  customerId: string;
  printJobIds: string[];
}

export interface PaginatedInvoicesResponse {
  invoices: Invoice[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface PrintJobsByStatus {
  Pending: number;
  Printing: number;
  Completed: number;
  Billed: number;
}

export interface StatsResponse {
  totalRevenue: number;
  pendingInvoiceValue: number;
  printJobsByStatus: PrintJobsByStatus;
  totalCustomers: number;
  recentInvoices: Invoice[];
  productionVolume: {
    weight: number;
    time: number;
  };
  materialBreakdown: Array<{
    material: string;
    weight: number;
    cost: number;
    count: number;
  }>;
}
