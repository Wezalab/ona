import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Info, AlertTriangle, Shield, Target, Package } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { Radius, Spacing } from '@/constants/colors';
import { Card, ScreenHeader, Section } from '@/components/ui';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader variant="bar" title={t.about.title} onBack={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.appInfo}>
            <Info size={48} color={Colors.primary} />
            <Text style={styles.appName}>{t.appName}</Text>
            <View style={styles.versionBadge}>
              <Package size={16} color={Colors.textSecondary} />
              <Text style={styles.versionText}>{t.about.version} 1.0.0</Text>
            </View>
          </View>

          <Section icon={AlertTriangle} iconColor={Colors.danger} title={t.about.disclaimer}>
            <Card tone="danger" accentBorder>
              <Text style={styles.disclaimerText}>{t.about.disclaimerText}</Text>
            </Card>
          </Section>

          <Section icon={Target} title={t.about.purpose}>
            <Text style={styles.sectionText}>{t.about.purposeText}</Text>
          </Section>

          <Section icon={Info} iconColor={Colors.warning} title={t.about.limitations}>
            <Text style={styles.sectionText}>{t.about.limitationsText}</Text>
          </Section>

          <Section icon={Shield} iconColor={Colors.success} title="Fonctionnalités de Sécurité">
            <View style={styles.featuresList}>
              {[
                'Fonctionne 100% hors ligne',
                'Stockage local crypté',
                'Aucune donnée personnelle requise',
                'Examen de vue calibré et vérifiable',
                'Aucune connexion cloud',
              ].map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Section>

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  appInfo: {
    alignItems: 'center',
    gap: Spacing.md,
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
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  disclaimerText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  featuresList: {
    gap: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
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
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
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
