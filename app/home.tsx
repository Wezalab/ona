import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Plus, History, Settings, Info, Server, ShieldCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

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
      color: Colors.primaryLight,
      onPress: () => router.push('/blockchain'),
    },
    {
      icon: Settings,
      title: t.home.settings,
      description: t.home.settingsDesc,
      color: Colors.textSecondary,
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
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>{t.appName}</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <item.icon size={32} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Outil de dépistage uniquement - Pas un diagnostic médical
          </Text>
        </View>
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
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: Colors.warningLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
});
