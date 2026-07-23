import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle, Save, CloudUpload } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import { useStarknet } from '@/hooks/useStarknet';
import type { Sex } from '@/types/api';
import Colors from '@/constants/colors';
import React, { useState } from "react";

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

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    if (risk === 'low') return CheckCircle2;
    if (risk === 'medium') return AlertTriangle;
    return AlertCircle;
  };

  const getRiskText = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  const getOverallRisk = (): 'low' | 'medium' | 'high' => {
    const risks: ('low' | 'medium' | 'high')[] = [];
    
    if (visualAcuity) {
      risks.push(visualAcuity.rightEye.risk, visualAcuity.leftEye.risk);
    }
    
    if (eyeImages) {
      risks.push(eyeImages.rightEye.risk, eyeImages.leftEye.risk);
    }
    
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

  // Map the local screening into the anonymized API payload. No patient
  // identifiers are sent — only pseudonymized reference, coarse demographics
  // and the AI risk summary.
  const buildApiPayload = () => {
    const scores = eyeImages
      ? [eyeImages.rightEye.aiScore, eyeImages.leftEye.aiScore]
      : [];
    const confidence = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0.5;
    const ageNum = patientInfo?.age ? Number(patientInfo.age) : undefined;
    return {
      patientReference: patientInfo?.patientId?.trim() || undefined,
      patientAge: Number.isFinite(ageNum) ? (ageNum as number) : undefined,
      patientSex: patientInfo?.gender as Sex | undefined,
      ai: {
        prediction: `Eye screening (${overallRisk} risk)`,
        riskLevel: overallRisk,
        confidence,
        modelVersion: 'mobile-sim-1',
      },
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={[styles.riskBadgeLarge, { backgroundColor: `${getRiskColor(overallRisk)}20` }]}>
            {React.createElement(getRiskIcon(overallRisk), {
              size: 48,
              color: getRiskColor(overallRisk),
            })}
          </View>
          <Text style={styles.title}>{t.results.title}</Text>
          <View style={[styles.overallRiskBadge, { backgroundColor: `${getRiskColor(overallRisk)}20` }]}>
            <Text style={[styles.overallRiskText, { color: getRiskColor(overallRisk) }]}>
              {getRiskText(overallRisk)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {visualAcuity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.results.visualAcuityResults}</Text>
              
              <View style={styles.resultRow}>
                <View style={styles.resultCard}>
                  <Text style={styles.eyeLabel}>{t.results.rightEye}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(visualAcuity.rightEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(visualAcuity.rightEye.risk) }]}>
                      {getRiskText(visualAcuity.rightEye.risk)}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.eyeLabel}>{t.results.leftEye}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(visualAcuity.leftEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(visualAcuity.leftEye.risk) }]}>
                      {getRiskText(visualAcuity.leftEye.risk)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {eyeImages && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.results.eyeImageResults}</Text>
              
              <View style={styles.resultRow}>
                <View style={styles.resultCard}>
                  <Text style={styles.eyeLabel}>{t.results.rightEye}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(eyeImages.rightEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(eyeImages.rightEye.risk) }]}>
                      {getRiskText(eyeImages.rightEye.risk)}
                    </Text>
                  </View>
                  <Text style={styles.scoreText}>Score IA: {Math.round(eyeImages.rightEye.aiScore * 100)}%</Text>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.eyeLabel}>{t.results.leftEye}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(eyeImages.leftEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(eyeImages.leftEye.risk) }]}>
                      {getRiskText(eyeImages.leftEye.risk)}
                    </Text>
                  </View>
                  <Text style={styles.scoreText}>Score IA: {Math.round(eyeImages.leftEye.aiScore * 100)}%</Text>
                </View>
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

          <TouchableOpacity
            style={[styles.button, submitState === 'submitting' && styles.buttonDisabled]}
            onPress={handleSaveAndFinish}
            disabled={submitState === 'submitting'}
            activeOpacity={0.8}
          >
            {submitState === 'submitting' ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Save size={20} color={Colors.surface} />
            )}
            <Text style={styles.buttonText}>{t.results.saveAndFinish}</Text>
          </TouchableOpacity>

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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  riskBadgeLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  overallRiskBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  overallRiskText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  eyeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  riskBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  referralSection: {
    gap: 12,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  referralBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  referralText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  syncHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  syncHintText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  loginHint: {
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  loginHintText: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
  },
  submitError: {
    fontSize: 13,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 12,
  },
});
