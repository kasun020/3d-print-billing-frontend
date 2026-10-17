import axiosInstance from './axiosInstance';
import type { LoginRequest, LoginResponse } from '../types';

// POST /api/admin/login
export const loginAdmin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>('/api/admin/login', credentials);
  return data;
};

// POST /api/admin/register  (utility — used during initial setup)
export const registerAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post('/api/admin/register', payload);
  return data;
};
