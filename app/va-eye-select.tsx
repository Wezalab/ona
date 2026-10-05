import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, CheckCircle2, Eye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { EyeVisualAcuity } from '@/constants/visualAcuity';
import Colors, { FontSize, Gradients, Radius, Shadow, Spacing } from '@/constants/colors';
import { Badge, Button, StepProgress } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

type Side = 'right' | 'left';

export default function VAEyeSelectScreen() {
  const router = useRouter();
  const { t, currentScreening } = useApp();
  const e = t.eyeSelect;

  const results: Record<Side, EyeVisualAcuity | undefined> = {
    right: currentScreening.vaRight,
    left: currentScreening.vaLeft,
  };
  const bothDone = !!results.right && !!results.left;

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  const eyeCard = (side: Side, label: string) => {
    const result = results[side];
    return (
      <TouchableOpacity
        key={side}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.replace(`/va-test?eye=${side}`)}
      >
        <LinearGradient
          colors={[...(result ? Gradients.success : Gradients.primary)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardIcon}
        >
          {result ? <CheckCircle2 size={34} color="#FFFFFF" /> : <Eye size={34} color="#FFFFFF" />}
        </LinearGradient>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{label}</Text>
          {result ? (
            <View style={styles.resultRow}>
              <Badge label={result.belowChart ? `< ${result.snellen}` : result.snellen} tone={result.risk as BadgeTone} />
              <Text style={styles.retest}>{e.retest}</Text>
            </View>
          ) : (
            <Text style={styles.cardSub}>{e.notTested}</Text>
          )}
        </View>
        <View style={styles.go}>
          <ArrowRight size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={2} />
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{e.title}</Text>
        <Text style={styles.subtitle}>{e.subtitle}</Text>
        {eyeCard('right', t.results.rightEye)}
        {eyeCard('left', t.results.leftEye)}
      </ScrollView>
      <View style={styles.footer}>
        {!bothDone ? <Text style={styles.hint}>{e.bothNeeded}</Text> : null}
        <Button title={e.viewResults} icon={ArrowRight} iconPosition="right" disabled={!bothDone} onPress={() => router.push('/va-result')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  stepBar: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.navy },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  cardIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.navy },
  cardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 4 },
  retest: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  go: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.sm },
  hint: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});
