import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, History, Settings, Info, Server, ShieldCheck, ScanEye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { Gradients, Spacing } from '@/constants/colors';
import { IconTile } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { t, screenings } = useApp();

  const menuItems = [
    {
      icon: Plus,
      title: t.home.newScreening,
      description: t.home.newScreeningDesc,
      color: Colors.primary,
      onPress: () => router.push('/patient-info'),
    },
    {
      icon: ScanEye,
      title: t.home.cataract,
      description: t.home.cataractDesc,
      color: Colors.violet,
      onPress: () => router.push('/cataract-check'),
    },
    {
      icon: History,
      title: t.home.history,
      description: t.home.historyDesc + ` (${screenings.length})`,
      color: Colors.info,
      onPress: () => router.push('/history'),
    },
    {
      icon: Server,
      title: t.home.server,
      description: t.home.serverDesc,
      color: Colors.success,
      onPress: () => router.push('/api-settings'),
    },
    {
      icon: ShieldCheck,
      title: t.home.blockchain,
      description: t.home.blockchainDesc,
      color: Colors.teal,
      onPress: () => router.push('/blockchain'),
    },
    {
      icon: Settings,
      title: t.home.settings,
      description: t.home.settingsDesc,
      color: Colors.pink,
      onPress: () => router.push('/settings'),
    },
    {
      icon: Info,
      title: t.home.about,
      description: t.home.aboutDesc,
      color: Colors.warning,
      onPress: () => router.push('/about'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={[...Gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>{t.appName}</Text>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {menuItems.map((item, index) => (
            <IconTile
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              color={item.color}
              onPress={item.onPress}
            />
          ))}
        </ScrollView>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ {t.home.disclaimer}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E7490',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  logo: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    width: 200,
    height: 80,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  disclaimer: {
    backgroundColor: Colors.warningLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
});
