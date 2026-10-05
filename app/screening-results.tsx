import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, AlertTriangle, AlertCircle, Save, CloudUpload, Camera } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import { useStarknet } from '@/hooks/useStarknet';
import type { Sex } from '@/types/api';
import type { RiskLevel } from '@/constants/visualAcuity';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import React, { useState } from 'react';
import { Badge, Button, Card, StepProgress } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

export default function ScreeningResultsScreen() {
  const router = useRouter();
  const { t, currentScreening, saveScreening } = useApp();
  const { isAuthenticated, selectedClinic, submitScreening } = useApi();
  const { enqueueProof } = useStarknet();

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const visualAcuity = currentScreening.visualAcuity;
  const eyeImages = currentScreening.eyeImages;
  const patientInfo = currentScreening.patientInfo;
  const canSubmit = isAuthenticated && !!selectedClinic;

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    if (risk === 'low') return CheckCircle2;
    if (risk === 'medium') return AlertTriangle;
    return AlertCircle;
  };

  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  // The real risk/referral decision comes solely from the measured Visual
  // Acuity result — eye photos (if captured) are unscored and pending
  // specialist review only, never a fabricated "AI" verdict.
  const getOverallRisk = (): RiskLevel => {
    if (!visualAcuity) return 'low';
    const risks: RiskLevel[] = [visualAcuity.rightEye.risk, visualAcuity.leftEye.risk];
    if (risks.includes('high')) return 'high';
    if (risks.includes('medium')) return 'medium';
    return 'low';
  };

  const getReferralAdvice = () => {
    const risk = getOverallRisk();
    switch (risk) {
      case 'low': return t.results.lowRiskAdvice;
      case 'medium': return t.results.mediumRiskAdvice;
      case 'high': return t.results.highRiskAdvice;
    }
  };

  const overallRisk = getOverallRisk();
  const capturedImageUris = [eyeImages?.rightEye?.imageUri, eyeImages?.leftEye?.imageUri].filter(
    (uri): uri is string => !!uri,
  );

  // Map the local screening into the anonymized API payload. No patient
  // identifiers are sent — only pseudonymized reference, coarse demographics
  // and the real VA-derived risk summary (deterministic measured test, not a
  // probabilistic ML model — hence confidence: 1.0).
  const buildApiPayload = () => {
    const ageNum = patientInfo?.age ? Number(patientInfo.age) : undefined;
    const rawScores: Record<string, number> = {};
    if (visualAcuity) {
      rawScores.rightEyeSnellenDenominator = visualAcuity.rightEye.denominator;
      rawScores.leftEyeSnellenDenominator = visualAcuity.leftEye.denominator;
    }
    return {
      patientReference: patientInfo?.patientId?.trim() || undefined,
      patientAge: Number.isFinite(ageNum) ? (ageNum as number) : undefined,
      patientSex: patientInfo?.gender as Sex | undefined,
      ai: {
        prediction: `Eye screening (${overallRisk} risk)`,
        riskLevel: overallRisk,
        confidence: 1.0,
        modelVersion: 'va-staircase-v1',
        rawScores,
      },
      images: capturedImageUris.length ? capturedImageUris : undefined,
      isReferral: overallRisk !== 'low',
      device: { platform: Platform.OS, appVersion: '1.0.0' },
    };
  };

  const handleSaveAndFinish = async () => {
    try {
      await saveScreening();
    } catch (error) {
      console.error('Error saving screening:', error);
    }

    // Queue the anonymized proof in the Blockchain screen so the operator can
    // track it and optionally anchor directly. This is fire-and-forget; the
    // backend will also anchor automatically when the screening syncs.
    if (selectedClinic) {
      const isReferral = overallRisk !== 'low';
      enqueueProof({
        id: `scr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Math.floor(Date.now() / 1000),
        riskLevel: overallRisk,
        facilityCode: selectedClinic.code,
        isReferral,
      });
    }

    // Best-effort offline-first submit to the ONA backend when connected.
    if (canSubmit) {
      setSubmitState('submitting');
      setMessage(null);
      try {
        await submitScreening(buildApiPayload());
        setSubmitState('done');
        router.replace('/home');
        return;
      } catch {
        // Item is persisted in the offline queue regardless — surface a soft note.
        setSubmitState('error');
        setMessage(t.error);
        return;
      }
    }

    router.replace('/home');
  };

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={4} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={[styles.riskBadgeLarge, { backgroundColor: `${getRiskColor(overallRisk)}20` }]}>
            {React.createElement(getRiskIcon(overallRisk), {
              size: 48,
              color: getRiskColor(overallRisk),
            })}
          </View>
          <Text style={styles.title}>{t.results.title}</Text>
          <Badge label={getRiskText(overallRisk)} tone={overallRisk as BadgeTone} size="md" />
        </View>

        <View style={styles.content}>
          {visualAcuity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.results.visualAcuityResults}</Text>

              <View style={styles.resultRow}>
                {[
                  { label: t.results.rightEye, result: visualAcuity.rightEye },
                  { label: t.results.leftEye, result: visualAcuity.leftEye },
                ].map(({ label, result }) => (
                  <Card key={label} style={styles.resultCard}>
                    <Text style={styles.eyeLabel}>{label}</Text>
                    <Badge label={getRiskText(result.risk)} tone={result.risk as BadgeTone} size="sm" />
                    <Text style={styles.scoreText}>{result.belowChart ? `< ${result.snellen}` : result.snellen}</Text>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {capturedImageUris.length > 0 && (
            <View style={styles.section}>
              <View style={styles.photosNoteRow}>
                <Camera size={18} color={Colors.info} />
                <Text style={styles.photosNoteText}>{t.eyePhotoReview.savedMessage}</Text>
              </View>
            </View>
          )}

          <View style={styles.referralSection}>
            <Text style={styles.referralTitle}>{t.results.referralAdvice}</Text>
            <View style={[styles.referralBox, {
              backgroundColor: overallRisk === 'high' ? Colors.dangerLight : overallRisk === 'medium' ? Colors.warningLight : Colors.successLight,
              borderLeftColor: getRiskColor(overallRisk),
            }]}>
              <Text style={styles.referralText}>{getReferralAdvice()}</Text>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <AlertTriangle size={20} color={Colors.warning} />
            <Text style={styles.disclaimerText}>
              Ces résultats sont indicatifs uniquement et ne constituent pas un diagnostic médical.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {canSubmit ? (
            <View style={styles.syncHint}>
              <CloudUpload size={18} color={Colors.primary} />
              <Text style={styles.syncHintText}>
                {selectedClinic?.name} · #{selectedClinic?.code}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginHint}
              activeOpacity={0.7}
              onPress={() => router.push('/api-settings')}
            >
              <Text style={styles.loginHintText}>{t.apiSettings.loginRequired}</Text>
            </TouchableOpacity>
          )}

          <Button
            title={t.results.saveAndFinish}
            onPress={handleSaveAndFinish}
            icon={Save}
            loading={submitState === 'submitting'}
          />

          {message ? <Text style={styles.submitError}>{message}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  riskBadgeLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  resultRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  resultCard: {
    flex: 1,
    gap: Spacing.sm,
  },
  eyeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  scoreText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  photosNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  photosNoteText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.text,
  },
  referralSection: {
    gap: Spacing.md,
  },
  referralTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  referralBox: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
  },
  referralText: {
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.warningLight,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  syncHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  syncHintText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  loginHint: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  loginHintText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  submitError: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
