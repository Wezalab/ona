import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CreditCard, ArrowRight, Minus, Plus, Ruler } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import { CARD_HEIGHT_MM, CARD_WIDTH_MM, DISTANCE_OPTIONS_M, type TestDistanceMeters } from '@/constants/visualAcuity';
import { Button, ScreenHeader, SelectableCard, StepProgress } from '@/components/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MIN_CARD_WIDTH_PT = 140;
const MAX_CARD_WIDTH_PT = Math.min(SCREEN_WIDTH - 48, 420);
const STEP_PT = 4;

export default function VACalibrationScreen() {
  const router = useRouter();
  const { t, setCalibration } = useApp();
  const [step, setStep] = useState<'card' | 'distance'>('card');
  const [cardWidthPt, setCardWidthPt] = useState(SCREEN_WIDTH * 0.6);
  const [pixelsPerMM, setPixelsPerMM] = useState<number | null>(null);

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  const cardHeightPt = (cardWidthPt * CARD_HEIGHT_MM) / CARD_WIDTH_MM;

  const adjustCard = (deltaPt: number) => {
    setCardWidthPt((prev) => Math.max(MIN_CARD_WIDTH_PT, Math.min(MAX_CARD_WIDTH_PT, prev + deltaPt)));
  };

  const handleCardConfirmed = () => {
    setPixelsPerMM(cardWidthPt / CARD_WIDTH_MM);
    setStep('distance');
  };

  const handleDistanceSelected = (distanceMeters: TestDistanceMeters) => {
    if (!pixelsPerMM) return;
    setCalibration({ pixelsPerMM, testDistanceMeters: distanceMeters });
    router.push('/va-test');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={1} />
      </View>

      {step === 'card' ? (
        <View style={styles.container}>
          <ScreenHeader icon={CreditCard} title={t.visualAcuity.calibrationTitle} subtitle={t.visualAcuity.calibrationInstructions} compact />

          <View style={styles.content}>
            <Text style={styles.instruction}>{t.visualAcuity.placeCardInstruction}</Text>

            <View style={styles.calibrationContainer}>
              <View
                style={[
                  styles.cardOutline,
                  {
                    width: cardWidthPt,
                    height: cardHeightPt,
                  },
                ]}
              >
                <CreditCard size={Math.min(cardWidthPt * 0.3, 96)} color={Colors.textLight} strokeWidth={1} />
              </View>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperButton} onPress={() => adjustCard(-STEP_PT)} activeOpacity={0.7}>
                <Minus size={24} color={Colors.primary} />
              </TouchableOpacity>
              <View style={styles.stepperLabel}>
                <Ruler size={16} color={Colors.textSecondary} />
                <Text style={styles.stepperText}>{t.visualAcuity.adjustCardInstruction}</Text>
              </View>
              <TouchableOpacity style={styles.stepperButton} onPress={() => adjustCard(STEP_PT)} activeOpacity={0.7}>
                <Plus size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Button title={t.visualAcuity.cardPlaced} onPress={handleCardConfirmed} icon={ArrowRight} iconPosition="right" />
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <ScreenHeader icon={Ruler} title={t.visualAcuity.distanceTitle} subtitle={t.visualAcuity.distanceInstructions} compact />

          <View style={styles.distanceContent}>
            <View style={styles.distanceOptions}>
              {DISTANCE_OPTIONS_M.map((distance) => (
                <SelectableCard
                  key={distance}
                  title={distance === 3 ? t.visualAcuity.distance3m : t.visualAcuity.distance6m}
                  onPress={() => handleDistanceSelected(distance)}
                  size="lg"
                />
              ))}
            </View>
            <Text style={styles.distanceHelp}>{t.visualAcuity.distanceHelp}</Text>
          </View>
        </View>
      )}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  instruction: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  calibrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOutline: {
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.infoLight,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  distanceContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  distanceOptions: {
    gap: Spacing.lg,
  },
  distanceHelp: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
