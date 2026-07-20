import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { History as HistoryIcon, FileText, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

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

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };

  const getRiskText = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.history.title}</Text>
          <View style={styles.placeholder} />
        </View>

        {screenings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HistoryIcon size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>{t.history.noScreenings}</Text>
            <Text style={styles.emptyText}>
              Les dépistages enregistrés apparaîtront ici
            </Text>
          </View>
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
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.overallRisk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(screening.overallRisk) }]}>
                      {getRiskText(screening.overallRisk)}
                    </Text>
                  </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  screeningCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  referralBadge: {
    backgroundColor: Colors.warningLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  referralText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
});
