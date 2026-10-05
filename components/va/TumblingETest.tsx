import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Eye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { CalibrationState } from '@/contexts/AppContext';
import {
  CORRECT_TO_PASS,
  INCORRECT_TO_FAIL,
  SNELLEN_DENOMINATORS,
  TRIALS_PER_LEVEL,
  computeOptotypeHeightMm,
  snellenLabel,
} from '@/constants/visualAcuity';
import Colors, { FontSize, Gradients, Radius, Spacing } from '@/constants/colors';
import { Badge } from '@/components/ui';

type Direction = 'up' | 'down' | 'left' | 'right';
type Answer = Direction | 'cantSee';
type Outcome = 'correct' | 'incorrect' | null;

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];
// A standard tumbling E has its three arms pointing in the answer direction.
const ROTATION: Record<Direction, string> = { right: '0deg', down: '90deg', left: '180deg', up: '270deg' };

/** Standard optotype: a 5x5 grid E - spine plus three arms, every stroke = size / 5. */
export function OptotypeE({ size, direction }: { size: number; direction: Direction }) {
  const stroke = size / 5;
  const bar = { position: 'absolute' as const, backgroundColor: '#000000' };
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: ROTATION[direction] }] }}>
      <View style={[bar, { left: 0, top: 0, width: stroke, height: size }]} />
      <View style={[bar, { left: 0, top: 0, width: size, height: stroke }]} />
      <View style={[bar, { left: 0, top: stroke * 2, width: size, height: stroke }]} />
      <View style={[bar, { left: 0, top: stroke * 4, width: size, height: stroke }]} />
    </View>
  );
}

interface Props {
  calibration: CalibrationState;
  /** e.g. "Cover the left eye" */
  coverLabel: string;
  onComplete: (result: { denominator: number; belowChart: boolean }) => void;
}

/**
 * Real 2-of-3 staircase, starting at the 6/60 line and going down line by
 * line (6/36, 6/24, 6/18, 6/12, 6/9, 6/6). Each line uses a physically
 * correct E size for the calibrated screen and test distance.
 */
export default function TumblingETest({ calibration, coverLabel, onComplete }: Props) {
  const { t } = useApp();
  const { width } = useWindowDimensions();

  const randomDirection = () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  const [levelIndex, setLevelIndex] = useState(0);
  const [lastPassedIndex, setLastPassedIndex] = useState(-1);
  const [outcomes, setOutcomes] = useState<Outcome[]>(Array(TRIALS_PER_LEVEL).fill(null));
  const [direction, setDirection] = useState<Direction>(randomDirection);

  const handleAnswer = useCallback(
    (answer: Answer) => {
      const isCorrect = answer !== 'cantSee' && answer === direction;
      const filled = outcomes.filter((o) => o !== null).length;
      const next = [...outcomes];
      if (filled < TRIALS_PER_LEVEL) next[filled] = isCorrect ? 'correct' : 'incorrect';
      setOutcomes(next);

      const correct = next.filter((o) => o === 'correct').length;
      const incorrect = next.filter((o) => o === 'incorrect').length;

      if (correct >= CORRECT_TO_PASS) {
        if (levelIndex >= SNELLEN_DENOMINATORS.length - 1) {
          onComplete({ denominator: SNELLEN_DENOMINATORS[levelIndex], belowChart: false });
          return;
        }
        setLastPassedIndex(levelIndex);
        setLevelIndex(levelIndex + 1);
        setOutcomes(Array(TRIALS_PER_LEVEL).fill(null));
        setDirection(randomDirection());
      } else if (incorrect >= INCORRECT_TO_FAIL) {
        if (lastPassedIndex === -1) onComplete({ denominator: SNELLEN_DENOMINATORS[0], belowChart: true });
        else onComplete({ denominator: SNELLEN_DENOMINATORS[lastPassedIndex], belowChart: false });
      } else {
        setDirection(randomDirection());
      }
    },
    [direction, outcomes, levelIndex, lastPassedIndex, onComplete],
  );

  const denominator = SNELLEN_DENOMINATORS[levelIndex];
  const heightMm = computeOptotypeHeightMm(denominator, calibration.testDistanceMeters);
  // Never distort the letter: if the line cannot fit the screen it is capped, not stretched.
  const size = Math.max(8, Math.min(heightMm * calibration.pixelsPerMM, width * 0.85));

  const pad: { dir: Direction; arrow: string; label: string }[] = [
    { dir: 'up', arrow: '↑', label: t.visualAcuity.up },
    { dir: 'left', arrow: '←', label: t.visualAcuity.left },
    { dir: 'right', arrow: '→', label: t.visualAcuity.right },
    { dir: 'down', arrow: '↓', label: t.visualAcuity.down },
  ];
  const DirButton = ({ dir, arrow, label }: (typeof pad)[number]) => (
    <TouchableOpacity style={styles.dirButton} onPress={() => handleAnswer(dir)} activeOpacity={0.7}>
      <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Text style={styles.dirArrow}>{arrow}</Text>
      <Text style={styles.dirLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.eyeRow}>
          <Eye size={26} color={Colors.primary} />
          <Text style={styles.eyeText}>{coverLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <Badge label={`${t.visualAcuity.lineLabel} ${snellenLabel(denominator)}`} tone="primary" />
          <View style={styles.dots}>
            {outcomes.map((o, i) => (
              <View key={i} style={[styles.dot, o === 'correct' && styles.dotOk, o === 'incorrect' && styles.dotBad]} />
            ))}
          </View>
        </View>
        <Text style={styles.instructions}>{t.visualAcuity.testInstructions}</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{t.visualAcuity.whichWayPoints}</Text>
        <View style={[styles.optotypeBox, { minHeight: size + Spacing.lg }]}>
          <OptotypeE size={size} direction={direction} />
        </View>

        <View style={styles.pad}>
          <View style={styles.padRow}>
            <DirButton {...pad[0]} />
          </View>
          <View style={styles.padRow}>
            <DirButton {...pad[1]} />
            <DirButton {...pad[2]} />
          </View>
          <View style={styles.padRow}>
            <DirButton {...pad[3]} />
          </View>
        </View>

        <TouchableOpacity style={styles.cantSee} onPress={() => handleAnswer('cantSee')} activeOpacity={0.7}>
          <Text style={styles.cantSeeText}>{t.visualAcuity.cantSee}</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  eyeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, alignSelf: 'center' },
  eyeText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.navy },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  dotOk: { backgroundColor: Colors.success },
  dotBad: { backgroundColor: Colors.danger },
  instructions: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  body: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.lg },
  question: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.navy, textAlign: 'center' },
  optotypeBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', alignSelf: 'stretch', borderRadius: Radius.xl },
  pad: { gap: Spacing.sm },
  padRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  dirButton: {
    width: 84,
    height: 84,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirArrow: { fontSize: 34, color: '#FFFFFF' },
  dirLabel: { fontSize: FontSize.xs, fontWeight: '700', color: '#FFFFFF' },
  cantSee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.textSecondary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  cantSeeText: { fontSize: FontSize.md, fontWeight: '700', color: '#FFFFFF' },
});
