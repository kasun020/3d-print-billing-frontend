import axiosInstance from './axiosInstance';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  PaginatedInvoicesResponse,
} from '../types';

// GET /api/invoices?page=1&limit=10&customerId=...
export const getInvoices = async (page = 1, limit = 10, customerId?: string): Promise<PaginatedInvoicesResponse> => {
  const url = customerId 
    ? `/api/invoices?page=${page}&limit=${limit}&customerId=${customerId}`
    : `/api/invoices?page=${page}&limit=${limit}`;
  const { data } = await axiosInstance.get<PaginatedInvoicesResponse>(url);
  return data;
};

// POST /api/invoices
export const createInvoice = async (payload: CreateInvoiceRequest): Promise<Invoice> => {
  const { data } = await axiosInstance.post<Invoice>('/api/invoices', payload);
  return data;
};

// PUT /api/invoices/:id
export const updateInvoice = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateInvoiceRequest;
}): Promise<Invoice> => {
  const { data } = await axiosInstance.put<Invoice>(`/api/invoices/${id}`, payload);
  return data;
};

// PUT /api/invoices/:id/pay
export const payInvoice = async (id: string): Promise<Invoice> => {
  const { data } = await axiosInstance.put<Invoice>(`/api/invoices/${id}/pay`);
  return data;
};
