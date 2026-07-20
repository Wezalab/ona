// Auth + API session state for the mobile app.
//
// Holds the authenticated user, the selected clinic (persisted), the pending
// offline-queue count, and exposes actions to log in/out, load clinics, submit
// a screening (enqueue + best-effort flush), and manually retry syncing.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { STORAGE_KEYS } from '@/constants/config';
import { api } from '@/services/api';
import { getJSON, removeItem, setJSON } from '@/services/storage';
import {
  enqueueScreening,
  flushQueue,
  getPendingCount,
  type EnqueueInput,
  type FlushResult,
} from '@/services/screeningQueue';
import type { AuthUser, Clinic } from '@/types/api';

type ApiContextValue = {
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  baseUrl: string;
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  pendingCount: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setBaseUrl: (url: string) => Promise<void>;
  loadClinics: () => Promise<Clinic[]>;
  selectClinic: (clinic: Clinic) => Promise<void>;
  submitScreening: (input: Omit<EnqueueInput, 'clinicId' | 'clinicCode'>) => Promise<void>;
  syncNow: () => Promise<FlushResult>;
};

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [baseUrl, setBaseUrlState] = useState(api.getBaseUrl());
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingCount());
  }, []);

  // Hydrate persisted session on mount
  useEffect(() => {
    (async () => {
      await api.init();
      setBaseUrlState(api.getBaseUrl());
      setUser(await api.getCurrentUser());
      setSelectedClinic(await getJSON<Clinic>(STORAGE_KEYS.selectedClinic));
      await refreshPending();
      setReady(true);
      // Opportunistic sync on startup
      flushQueue().then(refreshPending).catch(() => undefined);
    })();
  }, [refreshPending]);

  // Flush the queue whenever the app returns to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && api.isAuthenticated()) {
        flushQueue().then(refreshPending).catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, [refreshPending]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    flushQueue().then(refreshPending).catch(() => undefined);
  }, [refreshPending]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const setBaseUrl = useCallback(async (url: string) => {
    await api.setBaseUrl(url);
    setBaseUrlState(api.getBaseUrl());
  }, []);

  const loadClinics = useCallback(async () => {
    const list = await api.getActiveClinics();
    setClinics(list);
    return list;
  }, []);

  const selectClinic = useCallback(async (clinic: Clinic) => {
    setSelectedClinic(clinic);
    await setJSON(STORAGE_KEYS.selectedClinic, clinic);
  }, []);

  const submitScreening = useCallback(
    async (input: Omit<EnqueueInput, 'clinicId' | 'clinicCode'>) => {
      if (!selectedClinic) throw new Error('No clinic selected');
      await enqueueScreening({
        ...input,
        clinicId: selectedClinic._id,
        clinicCode: selectedClinic.code,
      });
      await refreshPending();
      // Best-effort immediate sync; failures stay queued for later.
      await flushQueue();
      await refreshPending();
    },
    [selectedClinic, refreshPending],
  );

  const syncNow = useCallback(async () => {
    const result = await flushQueue();
    await refreshPending();
    return result;
  }, [refreshPending]);

  // Keep selectedClinic in sync if clinics reload and the selection disappears
  useEffect(() => {
    if (selectedClinic && clinics.length > 0) {
      const stillThere = clinics.some((c) => c._id === selectedClinic._id);
      if (!stillThere) {
        setSelectedClinic(null);
        removeItem(STORAGE_KEYS.selectedClinic).catch(() => undefined);
      }
    }
  }, [clinics, selectedClinic]);

  const value = useMemo<ApiContextValue>(
    () => ({
      ready,
      user,
      isAuthenticated: Boolean(user),
      baseUrl,
      clinics,
      selectedClinic,
      pendingCount,
      login,
      logout,
      setBaseUrl,
      loadClinics,
      selectClinic,
      submitScreening,
      syncNow,
    }),
    [
      ready,
      user,
      baseUrl,
      clinics,
      selectedClinic,
      pendingCount,
      login,
      logout,
      setBaseUrl,
      loadClinics,
      selectClinic,
      submitScreening,
      syncNow,
    ],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
