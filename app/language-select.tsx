import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import type { Language } from '@/constants/translations';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { setLanguage } = useApp();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleLanguageSelect = async (lang: Language) => {
    setSelected(lang);
    await setLanguage(lang);
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9vlow4ppzc6erbcy80bri' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Choisir la langue</Text>
          <Text style={styles.subtitle}>Select your language / Chagua lugha yako / Pona monoko</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, selected === 'en' && styles.buttonSelected]}
            onPress={() => handleLanguageSelect('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, selected === 'en' && styles.buttonTextSelected]}>
              English
            </Text>
            <Text style={styles.buttonSubtext}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, selected === 'fr' && styles.buttonSelected]}
            onPress={() => handleLanguageSelect('fr')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, selected === 'fr' && styles.buttonTextSelected]}>
              Français
            </Text>
            <Text style={styles.buttonSubtext}>French</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, selected === 'sw' && styles.buttonSelected]}
            onPress={() => handleLanguageSelect('sw')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, selected === 'sw' && styles.buttonTextSelected]}>
              Kiswahili
            </Text>
            <Text style={styles.buttonSubtext}>Swahili</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, selected === 'ln' && styles.buttonSelected]}
            onPress={() => handleLanguageSelect('ln')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, selected === 'ln' && styles.buttonTextSelected]}>
              Lingala
            </Text>
            <Text style={styles.buttonSubtext}>Lingala</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.surface,
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 16,
  },
  button: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  buttonTextSelected: {
    color: Colors.surface,
  },
  buttonSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
