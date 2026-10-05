import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Spacing } from '@/constants/colors';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { ScanEye } from 'lucide-react-native';
import CataractSummary from '@/components/cataract/CataractSummary';

export default function CataractDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, cataractExams } = useApp();
  const exam = cataractExams.find((e) => e.id === id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader variant="bar" title={t.cataractExam.viewDetails} onBack={() => router.back()} />
      {exam ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.meta}>
            {exam.patientInfo.patientId || `#${exam.id.slice(-8)}`} · {new Date(exam.timestamp).toLocaleString()}
          </Text>
          <CataractSummary rightEye={exam.rightEye} leftEye={exam.leftEye} assessment={exam.assessment} />
        </ScrollView>
      ) : (
        <EmptyState icon={ScanEye} title={t.history.noScreenings} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  meta: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
