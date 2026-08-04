import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { History as HistoryIcon, FileText } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { RiskLevel } from '@/constants/visualAcuity';
import Colors, { FontSize, Radius, Shadow, Spacing } from '@/constants/colors';
import { Badge, EmptyState, ScreenHeader } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

export default function HistoryScreen() {
  const router = useRouter();
  const { t, screenings } = useApp();

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
        <ScreenHeader variant="bar" title={t.history.title} onBack={() => router.back()} />

        {screenings.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title={t.history.noScreenings}
            description="Les dépistages enregistrés apparaîtront ici"
          />
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
                    <FileText size={20} color={Colors.primary} />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  referralText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.warning,
  },
});
