import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Smartphone } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { FontSize, Gradients, Radius, Spacing } from '@/constants/colors';
import { Button, Card } from '@/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useApp();

  const handleContinue = () => {
    router.push('/consent');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <LinearGradient colors={[...Gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t.welcome.title}</Text>
          <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>
        </LinearGradient>

        <View style={styles.sheet}>
        <View style={styles.features}>
          <Card style={styles.feature} elevated>
            <View style={styles.iconContainer}>
              <Smartphone size={30} color={Colors.primary} />
            </View>
            <Text style={styles.featureText}>{t.welcome.description}</Text>
          </Card>

          <Card style={styles.feature} elevated>
            <View style={[styles.iconContainer, { backgroundColor: Colors.successLight }]}>
              <ShieldCheck size={30} color={Colors.success} />
            </View>
            <Text style={styles.featureText}>
              Fonctionne 100% hors ligne • Données cryptées • Aucune information personnelle requise
            </Text>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button title={t.welcome.getStarted} onPress={handleContinue} />
        </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 56,
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -32,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  logo: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    width: 200,
    height: 100,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.surface,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
});
