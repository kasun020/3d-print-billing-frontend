import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUser } from '../types';

interface AuthState {
  token: string | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, adminUser: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      adminUser: null,
      isAuthenticated: false,

      login: (token, adminUser) =>
        set({ token, adminUser, isAuthenticated: true }),

      logout: () =>
        set({ token: null, adminUser: null, isAuthenticated: false }),
    }),
    {
      name: '3dprint-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the token and adminUser; isAuthenticated is derived
      partialize: (state) => ({ token: state.token, adminUser: state.adminUser }),
      // Re-derive isAuthenticated when state is rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    },
  ),
);
