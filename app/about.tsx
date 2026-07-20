import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Info, AlertTriangle, Shield, Target, ArrowLeft, Package } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.about.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.appInfo}>
            <Info size={48} color={Colors.primary} />
            <Text style={styles.appName}>{t.appName}</Text>
            <View style={styles.versionBadge}>
              <Package size={16} color={Colors.textSecondary} />
              <Text style={styles.versionText}>{t.about.version} 1.0.0</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={24} color={Colors.danger} />
              <Text style={styles.sectionTitle}>{t.about.disclaimer}</Text>
            </View>
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>{t.about.disclaimerText}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.about.purpose}</Text>
            </View>
            <Text style={styles.sectionText}>{t.about.purposeText}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={24} color={Colors.warning} />
              <Text style={styles.sectionTitle}>{t.about.limitations}</Text>
            </View>
            <Text style={styles.sectionText}>{t.about.limitationsText}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={24} color={Colors.success} />
              <Text style={styles.sectionTitle}>Fonctionnalités de Sécurité</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Fonctionne 100% hors ligne</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Stockage local crypté</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Aucune donnée personnelle requise</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Traitement IA sur l&apos;appareil</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>Aucune connexion cloud</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Conçu pour les agents de santé communautaire en République Démocratique du Congo
            </Text>
            <Text style={styles.footerCopyright}>© 2024 - Dépistage Visuel</Text>
          </View>
        </ScrollView>
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
    paddingTop: 20,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
    gap: 32,
  },
  appInfo: {
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  disclaimerBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  disclaimerText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureBullet: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  footerInfo: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  footerCopyright: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
