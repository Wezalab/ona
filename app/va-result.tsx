import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { CheckCircle2, AlertCircle, Eye, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import type { RiskLevel } from '@/constants/visualAcuity';
import { Badge, Button, Card, ScreenHeader, StepProgress } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

export default function VAResultScreen() {
  const router = useRouter();
  const { t, currentScreening } = useApp();

  const visualAcuity = currentScreening.visualAcuity;

  useEffect(() => {
    if (!visualAcuity) {
      router.replace('/home');
    }
  }, [visualAcuity, router]);

  if (!visualAcuity) {
    return null;
  }

  const getRiskIcon = (risk: RiskLevel) => (risk === 'low' ? CheckCircle2 : AlertCircle);
  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };
  const getRiskTone = (risk: RiskLevel): BadgeTone => risk;
  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  const handleContinue = () => {
    router.push('/eye-capture');
  };

  const eyes = [
    { label: t.results.rightEye, result: visualAcuity.rightEye },
    { label: t.results.leftEye, result: visualAcuity.leftEye },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={2} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ScreenHeader
          icon={Eye}
          title={t.results.visualAcuityResults}
          subtitle={`${t.visualAcuity.complete} · ${visualAcuity.distanceMeters}m`}
          compact
        />

        <View style={styles.content}>
          {eyes.map(({ label, result }) => {
            const RiskIcon = getRiskIcon(result.risk);
            return (
              <Card key={label} elevated>
                <View style={styles.resultHeader}>
                  <Text style={styles.eyeLabel}>{label}</Text>
                  <RiskIcon size={22} color={getRiskColor(result.risk)} />
                </View>
                <Badge label={getRiskText(result.risk)} tone={getRiskTone(result.risk)} />
                <View style={styles.notationRow}>
                  <View style={styles.notationItem}>
                    <Text style={styles.notationLabel}>{t.visualAcuity.snellenNotation}</Text>
                    <Text style={styles.notationValue}>{result.belowChart ? `< ${result.snellen}` : result.snellen}</Text>
                  </View>
                  <View style={styles.notationItem}>
                    <Text style={styles.notationLabel}>{t.visualAcuity.decimalNotation}</Text>
                    <Text style={styles.notationValue}>{result.belowChart ? `< ${result.decimal}` : result.decimal}</Text>
                  </View>
                </View>
                {result.belowChart && (
                  <Text style={styles.belowChartWarning}>{t.visualAcuity.belowChartWarning}</Text>
                )}
              </Card>
            );
          })}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Ces résultats sont indicatifs uniquement. Ils ne constituent pas un diagnostic médical.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.nextStep}>{t.eyeImage.nextStepHint}</Text>
          <Button title={t.continue} onPress={handleContinue} icon={ArrowRight} iconPosition="right" />
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
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eyeLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  notationRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  notationItem: {
    gap: 2,
  },
  notationLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notationValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  belowChartWarning: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.base,
    lineHeight: 20,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  nextStep: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
