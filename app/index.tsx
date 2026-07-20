import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Eye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { isLoading, onboardingDone, language } = useApp();

  useEffect(() => {
    if (!isLoading) {
      if (!language) {
        router.replace('/language-select');
      } else if (!onboardingDone) {
        router.replace('/welcome');
      } else {
        router.replace('/home');
      }
    }
  }, [isLoading, onboardingDone, language, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Eye size={64} color={Colors.surface} strokeWidth={2} />
        </View>
        <Text style={styles.appName}>ONA</Text>
        <Text style={styles.tagline}>Eye Health Screening</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
