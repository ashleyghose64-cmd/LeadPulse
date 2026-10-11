import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
  target_audience?: string;
  niche?: string;
  goals?: string;
  profile_picture?: string;
}

export interface WorkspaceIntegration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  logo: string;
  description: string;
  config: Record<string, string>;
  configFields?: any[];
  lastSync?: string | null;
}

export interface IntegrationLogEntry {
  id: string;
  appId: string;
  appName: string;
  eventType: 'sync' | 'enrich' | 'notify' | 'auth' | 'webhook';
  summary: string;
  status: string;
  latency: string;
  timestamp: string;
  payload?: any;
}

const INITIAL_WORKSPACE_INTEGRATIONS: WorkspaceIntegration[] = [];

interface AppState {
  user: User | null;
  token: string | null;
  activeFilter: string;
  isTopUpOpen: boolean;
  isUpgradeModalOpen: boolean;
  upgradeTab: 'plans' | 'topup';
  integrations: WorkspaceIntegration[];
  integrationLogs: IntegrationLogEntry[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveFilter: (filter: string) => void;
  updateCredits: (credits: number) => void;
  setTopUpOpen: (isOpen: boolean) => void;
  setUpgradeModalOpen: (isOpen: boolean) => void;
  setUpgradeTab: (tab: 'plans' | 'topup') => void;
  setIntegrations: (integrations: WorkspaceIntegration[]) => void;
  setIntegrationLogs: (logs: IntegrationLogEntry[]) => void;
  fetchWorkspaceIntegrations: (userId?: string) => Promise<void>;
  syncLeadsToIntegration: (appId: string, leadIds: string[]) => Promise<{ syncedCount: number; appName: string } | null>;
  enrichLeadViaIntegration: (leadId: string, appId?: string) => Promise<any>;
  notifyIntegration: (appId: string, summary: string, payload?: any) => Promise<any>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeFilter: 'All',
      isTopUpOpen: false,
      isUpgradeModalOpen: false,
      upgradeTab: 'plans',
      integrations: INITIAL_WORKSPACE_INTEGRATIONS,
      integrationLogs: [],
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      updateCredits: (credits) => set((state) => ({ 
        user: state.user ? { ...state.user, lead_credits: credits } : null 
      })),
      setTopUpOpen: (isOpen) => set({ isTopUpOpen: isOpen, isUpgradeModalOpen: isOpen, upgradeTab: 'topup' }),
      setUpgradeModalOpen: (isOpen) => set({ isUpgradeModalOpen: isOpen, isTopUpOpen: isOpen }),
      setUpgradeTab: (tab) => set({ upgradeTab: tab }),
      setIntegrations: (integrations) => set({ integrations }),
      setIntegrationLogs: (integrationLogs) => set({ integrationLogs }),
      fetchWorkspaceIntegrations: async (overrideUserId?: string) => {
        const uid = overrideUserId || get().user?._id;
        if (!uid) return;
        try {
          const res = await axios.get('http://localhost:3001/api/integrations', {
            headers: { userid: uid }
          });
          if (res.data?.integrations) {
            set({ integrations: res.data.integrations });
          }
          if (res.data?.logs) {
            set({ integrationLogs: res.data.logs });
          }
        } catch (err) {
          console.error('Failed to sync workspace integrations:', err);
        }
      },
      syncLeadsToIntegration: async (appId: string, leadIds: string[]) => {
        const uid = get().user?._id;
        if (!uid) return null;
        try {
          const res = await axios.post(
            'http://localhost:3001/api/integrations/sync-leads',
            { appId, leadIds },
            { headers: { userid: uid } }
          );
          if (res.data?.integrations) set({ integrations: res.data.integrations });
          if (res.data?.logs) set({ integrationLogs: res.data.logs });
          return { syncedCount: res.data.syncedCount, appName: res.data.appName };
        } catch (err) {
          console.error('Sync leads failed:', err);
          return null;
        }
      },
      enrichLeadViaIntegration: async (leadId: string, appId = 'apollo') => {
        const uid = get().user?._id;
        if (!uid) return null;
        try {
          const res = await axios.post(
            'http://localhost:3001/api/integrations/enrich-lead',
            { appId, leadId },
            { headers: { userid: uid } }
          );
          if (res.data?.logs) set({ integrationLogs: res.data.logs });
          return res.data?.lead || null;
        } catch (err) {
          console.error('Enrich lead failed:', err);
          return null;
        }
      },
      notifyIntegration: async (appId: string, summary: string, payload: any = {}) => {
        const uid = get().user?._id;
        if (!uid) return null;
        try {
          const res = await axios.post(
            'http://localhost:3001/api/integrations/notify',
            { appId, eventType: 'notify', summary, payload },
            { headers: { userid: uid } }
          );
          if (res.data?.integrations) set({ integrations: res.data.integrations });
          if (res.data?.logs) set({ integrationLogs: res.data.logs });
          return res.data?.log || null;
        } catch (err) {
          console.error('Notify integration failed:', err);
          return null;
        }
      }
    }),
    {
      name: 'leadpulse-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeFilter: state.activeFilter,
        integrations: state.integrations,
        integrationLogs: state.integrationLogs,
      }),
    }
  )
);

