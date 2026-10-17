import axiosInstance from './axiosInstance';
import type { PrintJob, CreatePrintJobRequest, UpdatePrintJobStatusRequest } from '../types';

// GET /api/print-jobs
export const getPrintJobs = async (status?: string): Promise<PrintJob[]> => {
  const url = status ? `/api/print-jobs?status=${status}` : '/api/print-jobs';
  const { data } = await axiosInstance.get<PrintJob[]>(url);
  return data;
};

// POST /api/print-jobs
export const createPrintJob = async (payload: CreatePrintJobRequest): Promise<PrintJob> => {
  const { data } = await axiosInstance.post<PrintJob>('/api/print-jobs', payload);
  return data;
};

// PATCH /api/print-jobs/:id/status
export const updatePrintJobStatus = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePrintJobStatusRequest;
}): Promise<PrintJob> => {
  const { data } = await axiosInstance.patch<PrintJob>(`/api/print-jobs/${id}/status`, payload);
  return data;
};

// PUT /api/print-jobs/:id
export const updatePrintJob = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreatePrintJobRequest> & { status?: string };
}): Promise<PrintJob> => {
  const { data } = await axiosInstance.put<PrintJob>(`/api/print-jobs/${id}`, payload);
  return data;
};
