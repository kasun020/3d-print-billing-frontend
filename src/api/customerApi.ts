import axiosInstance from './axiosInstance';
import type { Customer, CreateCustomerRequest } from '../types';

// GET /api/customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await axiosInstance.get<Customer[]>('/api/customers');
  return data;
};

// POST /api/customers
export const createCustomer = async (payload: CreateCustomerRequest): Promise<Customer> => {
  const { data } = await axiosInstance.post<Customer>('/api/customers', payload);
  return data;
};
