import axiosInstance from './axiosInstance';
import type { StatsResponse } from '../types';

// GET /api/stats
export const getDashboardStats = async (): Promise<StatsResponse> => {
  const { data } = await axiosInstance.get<StatsResponse>('/api/stats');
  return data;
};
