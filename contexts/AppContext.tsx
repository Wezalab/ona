import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AiResultInput, Sex } from '@/types/api';

export type Language = 'en' | 'fr';

/** Draft screening data collected across the capture → results flow. */
export type ScreeningDraft = {
  patientAge?: number;
  patientSex?: Sex;
  ai?: AiResultInput;
  isReferral: boolean;
};

const EMPTY_DRAFT: ScreeningDraft = { isReferral: false };

export type AppContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  consentGiven: boolean;
  setConsentGiven: (value: boolean) => void;
  patientName: string;
  setPatientName: (name: string) => void;
  screeningDraft: ScreeningDraft;
  updateDraft: (patch: Partial<ScreeningDraft>) => void;
  resetDraft: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [consentGiven, setConsentGiven] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [screeningDraft, setScreeningDraft] = useState<ScreeningDraft>(EMPTY_DRAFT);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      consentGiven,
      setConsentGiven,
      patientName,
      setPatientName,
      screeningDraft,
      updateDraft: (patch: Partial<ScreeningDraft>) =>
        setScreeningDraft((prev) => ({ ...prev, ...patch })),
      resetDraft: () => setScreeningDraft(EMPTY_DRAFT),
    }),
    [language, consentGiven, patientName, screeningDraft],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
