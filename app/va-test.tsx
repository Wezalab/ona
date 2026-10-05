import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import type { VisualAcuityResult } from '@/contexts/AppContext';
import {
  SNELLEN_DENOMINATORS,
  TRIALS_PER_LEVEL,
  CORRECT_TO_PASS,
  INCORRECT_TO_FAIL,
  computeOptotypeHeightMm,
  buildEyeResult,
  snellenLabel,
  type EyeVisualAcuity,
} from '@/constants/visualAcuity';
import { Badge, StepProgress } from '@/components/ui';

type Direction = 'up' | 'down' | 'left' | 'right';
type Answer = Direction | 'cantSee';
type TrialOutcome = 'correct' | 'incorrect' | null;

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function VATestScreen() {
  const router = useRouter();
  const { t, updateVisualAcuity, calibration } = useApp();

  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [levelIndex, setLevelIndex] = useState(0);
  const [lastPassedIndex, setLastPassedIndex] = useState(-1);
  const [trialOutcomes, setTrialOutcomes] = useState<TrialOutcome[]>(Array(TRIALS_PER_LEVEL).fill(null));
  const [currentDirection, setCurrentDirection] = useState<Direction>('up');
  const rightEyeResultRef = useRef<EyeVisualAcuity | null>(null);

  const [rotateAnim] = useState(new Animated.Value(0));

  // Redirect back if this screen was reached without completing calibration.
  useEffect(() => {
    if (!calibration) {
      router.replace('/va-calibration');
    }
  }, [calibration, router]);

  const getRotationValue = (direction: Direction): number => {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 1;
      case 'down': return 2;
      case 'left': return 3;
      default: return 0;
    }
  };

  const generateNewDirection = useCallback(() => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);

    Animated.timing(rotateAnim, {
      toValue: getRotationValue(randomDirection),
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [rotateAnim]);

  useEffect(() => {
    generateNewDirection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetLevelState = () => {
    setTrialOutcomes(Array(TRIALS_PER_LEVEL).fill(null));
  };

  const finishEye = useCallback((denominator: number, belowChart: boolean) => {
    const result = buildEyeResult(denominator, belowChart);

    if (currentEye === 'right') {
      rightEyeResultRef.current = result;
      setCurrentEye('left');
      setLevelIndex(0);
      setLastPassedIndex(-1);
      resetLevelState();
      generateNewDirection();
    } else if (calibration) {
      const finalResult: VisualAcuityResult = {
        distanceMeters: calibration.testDistanceMeters,
        rightEye: rightEyeResultRef.current ?? result,
        leftEye: result,
      };
      updateVisualAcuity(finalResult);
      router.push('/va-result');
    }
  }, [currentEye, calibration, generateNewDirection, router, updateVisualAcuity]);

  const handleAnswer = (answer: Answer) => {
    const isCorrect = answer !== 'cantSee' && answer === currentDirection;
    const filledCount = trialOutcomes.filter((o) => o !== null).length;
    const nextOutcomes = [...trialOutcomes];
    if (filledCount < TRIALS_PER_LEVEL) {
      nextOutcomes[filledCount] = isCorrect ? 'correct' : 'incorrect';
    }
    setTrialOutcomes(nextOutcomes);

    const correctCount = nextOutcomes.filter((o) => o === 'correct').length;
    const incorrectCount = nextOutcomes.filter((o) => o === 'incorrect').length;

    if (correctCount >= CORRECT_TO_PASS) {
      // Line passed — advance to the next (smaller) line, or finish if this was the last.
      if (levelIndex >= SNELLEN_DENOMINATORS.length - 1) {
        finishEye(SNELLEN_DENOMINATORS[levelIndex], false);
      } else {
        setLastPassedIndex(levelIndex);
        setLevelIndex((prev) => prev + 1);
        resetLevelState();
        generateNewDirection();
      }
    } else if (incorrectCount >= INCORRECT_TO_FAIL) {
      // Line failed — acuity is the last line passed (or below-chart if none).
      if (lastPassedIndex === -1) {
        finishEye(SNELLEN_DENOMINATORS[0], true);
      } else {
        finishEye(SNELLEN_DENOMINATORS[lastPassedIndex], false);
      }
    } else {
      generateNewDirection();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0deg', '90deg', '180deg', '270deg'],
  });

  if (!calibration) {
    return null;
  }

  const currentDenominator = SNELLEN_DENOMINATORS[levelIndex];
  const optotypeHeightMm = computeOptotypeHeightMm(currentDenominator, calibration.testDistanceMeters);
  const optotypeSizePt = Math.max(14, Math.min(optotypeHeightMm * calibration.pixelsPerMM, SCREEN_WIDTH * 0.55));

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.stepBar}>
          <StepProgress steps={steps} currentStepIndex={2} />
        </View>

        <View style={styles.header}>
          <View style={styles.eyeIndicator}>
            <Eye size={28} color={currentEye === 'right' ? Colors.info : Colors.warning} />
            <Text style={styles.eyeText}>
              {currentEye === 'right' ? t.visualAcuity.coverEye + ' ' + t.results.leftEye : t.visualAcuity.coverEye + ' ' + t.results.rightEye}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Badge label={`${t.visualAcuity.lineLabel} ${snellenLabel(currentDenominator)}`} tone="primary" />
            <View style={styles.trialDots}>
              {trialOutcomes.map((outcome, index) => (
                <View
                  key={index}
                  style={[
                    styles.trialDot,
                    outcome === 'correct' && styles.trialDotCorrect,
                    outcome === 'incorrect' && styles.trialDotIncorrect,
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.instructions}>{t.visualAcuity.testInstructions}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>{t.visualAcuity.whichWayPoints}</Text>

          <View style={styles.optotypeContainer}>
            <Animated.Text
              style={[
                styles.optotype,
                {
                  fontSize: optotypeSizePt,
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              E
            </Animated.Text>
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.directionsRow}>
            <TouchableOpacity style={styles.directionButton} onPress={() => handleAnswer('up')} activeOpacity={0.7}>
              <Text style={styles.directionText}>↑</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.up}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.directionsRow}>
            <TouchableOpacity style={styles.directionButton} onPress={() => handleAnswer('left')} activeOpacity={0.7}>
              <Text style={styles.directionText}>←</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.left}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.directionButton} onPress={() => handleAnswer('right')} activeOpacity={0.7}>
              <Text style={styles.directionText}>→</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.right}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.directionsRow}>
            <TouchableOpacity style={styles.directionButton} onPress={() => handleAnswer('down')} activeOpacity={0.7}>
              <Text style={styles.directionText}>↓</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.down}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cantSeeButton} onPress={() => handleAnswer('cantSee')} activeOpacity={0.7}>
            <Text style={styles.cantSeeText}>{t.visualAcuity.cantSee}</Text>
            {currentEye === 'right' ? <ArrowRight size={20} color={Colors.surface} /> : null}
          </TouchableOpacity>
        </View>
      </View>
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
  stepBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  eyeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'center',
  },
  eyeText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  trialDots: {
    flexDirection: 'row',
    gap: 6,
  },
  trialDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  trialDotCorrect: {
    backgroundColor: Colors.success,
  },
  trialDotIncorrect: {
    backgroundColor: Colors.danger,
  },
  instructions: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xxxl,
  },
  question: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  optotypeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  optotype: {
    fontWeight: '900',
    color: Colors.text,
  },
  controls: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  directionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  directionButton: {
    width: 100,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionText: {
    fontSize: 40,
    color: Colors.surface,
  },
  directionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.surface,
  },
  cantSeeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.textSecondary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cantSeeText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.surface,
  },
});
