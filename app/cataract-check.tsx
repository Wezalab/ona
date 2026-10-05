import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ClipboardList, Eye, Flashlight, Image as ImageIcon, ListChecks, ScanEye, Stethoscope, UserPlus } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Gradients, Spacing } from '@/constants/colors';
import { BottomTabBar, Button, Card, GradientCard, ScreenHeader } from '@/components/ui';

export default function CataractCheckScreen() {
  const router = useRouter();
  const { t } = useApp();
  const c = t.cataractExam;

  const pathway = [
    { icon: UserPlus, label: c.stepRegistration, grad: 'primary' },
    { icon: ClipboardList, label: c.stepHistory, grad: 'violet' },
    { icon: Eye, label: c.stepVision, grad: 'info' },
    { icon: Flashlight, label: c.stepTorch, grad: 'warning' },
    { icon: Stethoscope, label: c.stepLens, grad: 'pink' },
    { icon: ImageIcon, label: c.stepPhotos, grad: 'success' },
    { icon: ListChecks, label: c.stepSummary, grad: 'danger' },
  ] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader variant="bar" title={c.title} onBack={() => router.replace('/home')} />
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
        <GradientCard gradient="violet">
          <View style={styles.row}>
            <ScanEye size={32} color="#FFFFFF" />
            <Text style={[styles.gradTitle, styles.flex]}>{c.intro}</Text>
          </View>
        </GradientCard>

        <Card elevated style={styles.card}>
          <Text style={styles.sectionTitle}>{c.pathwayTitle}</Text>
          {pathway.map(({ icon: Icon, label, grad }, i) => (
            <View key={label} style={styles.stepRow}>
              <LinearGradient colors={[...Gradients[grad]]} style={styles.stepIcon}>
                <Icon size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.stepText}>
                {i + 1}. {label}
              </Text>
            </View>
          ))}
        </Card>

        <Button title={c.startExam} icon={ScanEye} onPress={() => router.push('/cataract-exam')} />
        <Text style={styles.disclaimer}>{c.disclaimer}</Text>
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  gradTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#FFFFFF' },
  card: { gap: Spacing.md, borderRadius: 20 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.navy },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.navy },
  disclaimer: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
});
