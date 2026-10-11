import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  lead_credits: number;
  onboarding_complete: boolean;
  company_name?: string;
  field_of_work?: string;
  plan?: 'free' | 'basic' | 'pro';
  pool_refreshed_at?: string;
  daily_leads_limit?: number;
  daily_leads_used?: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  activeFilter: string;
  isTopUpOpen: boolean;
  isUpgradeModalOpen: boolean;
  upgradeTab: 'plans' | 'topup';
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveFilter: (filter: string) => void;
  updateCredits: (credits: number) => void;
  setTopUpOpen: (isOpen: boolean) => void;
  setUpgradeModalOpen: (isOpen: boolean) => void;
  setUpgradeTab: (tab: 'plans' | 'topup') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeFilter: 'All',
      isTopUpOpen: false,
      isUpgradeModalOpen: false,
      upgradeTab: 'plans',
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      updateCredits: (credits) => set((state) => ({ 
        user: state.user ? { ...state.user, lead_credits: credits } : null 
      })),
      setTopUpOpen: (isOpen) => set({ isTopUpOpen: isOpen, isUpgradeModalOpen: isOpen, upgradeTab: 'topup' }),
      setUpgradeModalOpen: (isOpen) => set({ isUpgradeModalOpen: isOpen, isTopUpOpen: isOpen }),
      setUpgradeTab: (tab) => set({ upgradeTab: tab }),
    }),
    {
      name: 'leadpulse-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeFilter: state.activeFilter,
      }),
    }
  )
);
