import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ 
        user, 
        accessToken: token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
