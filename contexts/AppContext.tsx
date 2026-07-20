import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Language, getTranslation, Translations } from '@/constants/translations';

export interface PatientInfo {
  patientId?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
}

export interface VisualAcuityResult {
  rightEye: {
    score: number;
    risk: 'low' | 'medium' | 'high';
  };
  leftEye: {
    score: number;
    risk: 'low' | 'medium' | 'high';
  };
}

export interface EyeImageResult {
  rightEye: {
    imageUri?: string;
    quality: 'good' | 'poor';
    risk: 'low' | 'medium' | 'high';
    aiScore: number;
  };
  leftEye: {
    imageUri?: string;
    quality: 'good' | 'poor';
    risk: 'low' | 'medium' | 'high';
    aiScore: number;
  };
}

export interface ScreeningRecord {
  id: string;
  timestamp: number;
  patientInfo: PatientInfo;
  visualAcuity?: VisualAcuityResult;
  eyeImages?: EyeImageResult;
  overallRisk: 'low' | 'medium' | 'high';
  referralNeeded: boolean;
}

export interface CurrentScreening {
  patientInfo?: PatientInfo;
  visualAcuity?: VisualAcuityResult;
  eyeImages?: EyeImageResult;
}

const STORAGE_KEYS = {
  LANGUAGE: 'app_language',
  ONBOARDING_DONE: 'onboarding_done',
  SCREENINGS: 'screenings',
  LAST_SYNC: 'last_sync',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('en');
  const [t, setT] = useState<Translations>(getTranslation('en'));
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentScreening, setCurrentScreening] = useState<CurrentScreening>({});
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [savedLang, savedOnboarding, savedScreenings, savedLastSync] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
        AsyncStorage.getItem(STORAGE_KEYS.SCREENINGS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC),
      ]);

      if (savedLang) {
        const lang = savedLang as Language;
        setLanguageState(lang);
        setT(getTranslation(lang));
      }

      if (savedOnboarding === 'true') {
        setOnboardingDone(true);
      }

      if (savedScreenings) {
        setScreenings(JSON.parse(savedScreenings));
      }

      if (savedLastSync) {
        setLastSync(parseInt(savedLastSync, 10));
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      setLanguageState(lang);
      setT(getTranslation(lang));
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
      setOnboardingDone(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const startNewScreening = () => {
    setCurrentScreening({});
  };

  const updatePatientInfo = (info: PatientInfo) => {
    setCurrentScreening(prev => ({ ...prev, patientInfo: info }));
  };

  const updateVisualAcuity = (result: VisualAcuityResult) => {
    setCurrentScreening(prev => ({ ...prev, visualAcuity: result }));
  };

  const updateEyeImages = (result: EyeImageResult) => {
    setCurrentScreening(prev => ({ ...prev, eyeImages: result }));
  };

  const saveScreening = async (): Promise<ScreeningRecord> => {
    const screening: ScreeningRecord = {
      id: `screening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      patientInfo: currentScreening.patientInfo || {},
      visualAcuity: currentScreening.visualAcuity,
      eyeImages: currentScreening.eyeImages,
      overallRisk: calculateOverallRisk(),
      referralNeeded: calculateReferralNeeded(),
    };

    try {
      const updatedScreenings = [...screenings, screening];
      await AsyncStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(updatedScreenings));
      setScreenings(updatedScreenings);
      setCurrentScreening({});
      return screening;
    } catch (error) {
      console.error('Error saving screening:', error);
      throw error;
    }
  };

  const calculateOverallRisk = (): 'low' | 'medium' | 'high' => {
    const risks: ('low' | 'medium' | 'high')[] = [];

    if (currentScreening.visualAcuity) {
      risks.push(currentScreening.visualAcuity.rightEye.risk);
      risks.push(currentScreening.visualAcuity.leftEye.risk);
    }

    if (currentScreening.eyeImages) {
      risks.push(currentScreening.eyeImages.rightEye.risk);
      risks.push(currentScreening.eyeImages.leftEye.risk);
    }

    if (risks.includes('high')) return 'high';
    if (risks.includes('medium')) return 'medium';
    return 'low';
  };

  const calculateReferralNeeded = (): boolean => {
    return calculateOverallRisk() !== 'low';
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.SCREENINGS, STORAGE_KEYS.LAST_SYNC]);
      setScreenings([]);
      setLastSync(null);
      setCurrentScreening({});
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  const syncData = async () => {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
      setLastSync(now);
      console.log('Data sync completed (offline mode - local only)');
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  };

  return {
    language,
    t,
    setLanguage,
    onboardingDone,
    completeOnboarding,
    isLoading,
    currentScreening,
    startNewScreening,
    updatePatientInfo,
    updateVisualAcuity,
    updateEyeImages,
    saveScreening,
    screenings,
    clearAllData,
    syncData,
    lastSync,
  };
});
