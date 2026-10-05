import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { History as HistoryIcon, FileText, ScanEye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { RiskLevel } from '@/constants/visualAcuity';
import Colors, { FontSize, Gradients, Radius, Shadow, Spacing } from '@/constants/colors';
import { Badge, BottomTabBar, EmptyState, ScreenHeader } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

export default function HistoryScreen() {
  const router = useRouter();
  const { t, screenings, cataractExams } = useApp();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader variant="bar" title={t.history.title} onBack={() => router.replace('/home')} />

        {screenings.length === 0 && cataractExams.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title={t.history.noScreenings}
            description="Les dépistages enregistrés apparaîtront ici"
          />
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {cataractExams.slice().reverse().map((exam) => (
              <TouchableOpacity
                key={exam.id}
                style={styles.screeningCard}
                onPress={() => router.push(`/cataract-detail?id=${exam.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <LinearGradient colors={[...Gradients.pink]} style={styles.cardAvatar}>
                      <ScanEye size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.cardTitle}>
                      {t.cataractExam.chainBadge} · {exam.patientInfo.patientId || `#${exam.id.slice(-8)}`}
                    </Text>
                  </View>
                  <Badge label={getRiskText(exam.assessment.overallRisk)} tone={exam.assessment.overallRisk as BadgeTone} size="sm" />
                </View>
                <Text style={styles.dateText}>{formatDate(exam.timestamp)}</Text>
                {exam.assessment.referralNeeded && (
                  <View style={styles.referralBadge}>
                    <Text style={styles.referralText}>{t.results.referralNeeded}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {screenings.slice().reverse().map((screening) => (
              <TouchableOpacity
                key={screening.id}
                style={styles.screeningCard}
                onPress={() => {
                  router.push(`/screening-detail?id=${screening.id}`);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <LinearGradient colors={[...Gradients.violet]} style={styles.cardAvatar}>
                      <FileText size={20} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.cardTitle}>
                      {screening.patientInfo.patientId || `Dépistage #${screening.id.slice(-8)}`}
                    </Text>
                  </View>
                  <Badge label={getRiskText(screening.overallRisk)} tone={screening.overallRisk as BadgeTone} size="sm" />
                </View>

                <View style={styles.cardDetails}>
                  {screening.patientInfo.age && (
                    <Text style={styles.detailText}>Âge: {screening.patientInfo.age} ans</Text>
                  )}
                  {screening.patientInfo.gender && (
                    <Text style={styles.detailText}>
                      Genre: {screening.patientInfo.gender === 'male' ? 'Homme' : screening.patientInfo.gender === 'female' ? 'Femme' : 'Autre'}
                    </Text>
                  )}
                  <Text style={styles.dateText}>{formatDate(screening.timestamp)}</Text>
                </View>

                {screening.referralNeeded && (
                  <View style={styles.referralBadge}>
                    <Text style={styles.referralText}>{t.results.referralNeeded}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <BottomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  screeningCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  cardDetails: {
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  referralBadge: {
    backgroundColor: Colors.warningLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  referralText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.warning,
  },
});
