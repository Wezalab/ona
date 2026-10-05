import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { buildEyeResult } from '@/constants/visualAcuity';
import Colors, { Spacing } from '@/constants/colors';
import { StepProgress } from '@/components/ui';
import TumblingETest from '@/components/va/TumblingETest';

export default function VATestScreen() {
  const router = useRouter();
  const { eye } = useLocalSearchParams<{ eye?: string }>();
  const side: 'right' | 'left' = eye === 'left' ? 'left' : 'right';
  const { t, setEyeAcuity, calibration } = useApp();

  // Redirect back if this screen was reached without completing calibration.
  useEffect(() => {
    if (!calibration) router.replace('/va-calibration');
  }, [calibration, router]);

  if (!calibration) return null;

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];
  // Testing the right eye means covering the left, and vice versa.
  const coverLabel = side === 'right' ? t.eyeSelect.coverLeft : t.eyeSelect.coverRight;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={2} />
      </View>
      <TumblingETest
        key={side}
        calibration={calibration}
        coverLabel={coverLabel}
        onComplete={({ denominator, belowChart }) => {
          setEyeAcuity(side, buildEyeResult(denominator, belowChart), calibration.testDistanceMeters);
          router.replace('/va-eye-select');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  stepBar: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
});
