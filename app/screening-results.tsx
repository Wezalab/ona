import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { t, type TranslationKey } from '@/constants/translations';
import { useAppContext } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import { useRequireConsent } from '@/hooks/useRequireConsent';
import type { RiskLevel } from '@/services/starknet';

const RISK_LABEL: Record<RiskLevel, TranslationKey> = {
  low: 'resultRiskLow',
  medium: 'resultRiskMedium',
  high: 'resultRiskHigh',
};

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

export default function ScreeningResultsScreen() {
  useRequireConsent();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, screeningDraft, updateDraft, resetDraft } = useAppContext();
  const { isAuthenticated, selectedClinic, submitScreening } = useApi();

  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const ai = screeningDraft.ai;
  const canSubmit = isAuthenticated && !!selectedClinic && !!ai && state !== 'submitting';

  const setRisk = (riskLevel: RiskLevel) => {
    if (ai) updateDraft({ ai: { ...ai, riskLevel } });
  };

  const onSubmit = async () => {
    if (!ai) return;
    setState('submitting');
    setMessage(null);
    try {
      await submitScreening({
        ai,
        isReferral: screeningDraft.isReferral,
        patientAge: screeningDraft.patientAge,
        patientSex: screeningDraft.patientSex,
        device: { platform: Platform.OS, appVersion: '1.0.0' },
      });
      setState('done');
      setMessage(t(language, 'resultSubmitted'));
    } catch {
      // Item is persisted in the queue regardless — surface a soft error.
      setState('error');
      setMessage(t(language, 'resultSubmitError'));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title}>{t(language, 'screeningResults')}</Text>
      <Text style={styles.subtitle}>{t(language, 'screeningResultsSubtitle')}</Text>

      {ai ? (
        <View style={styles.card}>
          <Text style={styles.prediction}>{ai.prediction}</Text>
          <Text style={styles.confidence}>{Math.round(ai.confidence * 100)}%</Text>
          <View style={styles.riskRow}>
            {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => (
              <Pressable
                key={level}
                style={[styles.riskChip, ai.riskLevel === level && styles.riskChipActive]}
                onPress={() => setRisk(level)}
              >
                <Text
                  style={[styles.riskChipText, ai.riskLevel === level && styles.riskChipTextActive]}
                >
                  {t(language, RISK_LABEL[level])}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.referralRow}
            onPress={() => updateDraft({ isReferral: !screeningDraft.isReferral })}
          >
            <View style={[styles.checkbox, screeningDraft.isReferral && styles.checkboxOn]}>
              {screeningDraft.isReferral ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
            <Text style={styles.referralLabel}>{t(language, 'resultMarkReferral')}</Text>
          </Pressable>
        </View>
      ) : null}

      {!isAuthenticated || !selectedClinic ? (
        <Text style={styles.hint}>{t(language, 'apiLoginRequired')}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.buttonPrimary, !canSubmit && styles.buttonDisabled]}
          disabled={!canSubmit}
          onPress={onSubmit}
        >
          <Text style={styles.buttonTextPrimary}>
            {state === 'submitting' ? t(language, 'resultSubmitting') : t(language, 'resultSubmit')}
          </Text>
        </Pressable>

        {state === 'submitting' ? <ActivityIndicator color={colors.primary} /> : null}
        {message ? (
          <Text style={[styles.message, state === 'error' && styles.messageError]}>{message}</Text>
        ) : null}

        <Pressable style={styles.button} onPress={() => router.push('/screening-detail')}>
          <Text style={styles.buttonText}>{t(language, 'viewDetails')}</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            resetDraft();
            router.push('/home');
          }}
        >
          <Text style={styles.buttonText}>{t(language, 'backHome')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.text, opacity: 0.7, marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '22',
  },
  prediction: { fontSize: 20, fontWeight: '700', color: colors.text },
  confidence: { fontSize: 40, fontWeight: '800', color: colors.primary, marginVertical: 8 },
  riskRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  riskChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  riskChipActive: { backgroundColor: colors.primary },
  riskChipText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  riskChipTextActive: { color: colors.background },
  referralRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary },
  checkboxMark: { color: colors.background, fontWeight: '800' },
  referralLabel: { fontSize: 15, color: colors.text },
  hint: { fontSize: 14, color: '#b8860b', marginBottom: 12 },
  actions: { gap: 12 },
  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  buttonTextPrimary: { fontSize: 16, fontWeight: '600', color: colors.background },
  message: { fontSize: 14, color: colors.text, textAlign: 'center' },
  messageError: { color: '#c0392b' },
});
