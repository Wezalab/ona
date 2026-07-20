import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Languages, RefreshCw, Trash2, ArrowLeft, Calendar } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage, syncData, clearAllData, lastSync } = useApp();

  const languageOptions = [
    { code: 'en' as const, label: 'English' },
    { code: 'fr' as const, label: 'Français' },
    { code: 'sw' as const, label: 'Kiswahili' },
    { code: 'ln' as const, label: 'Lingala' },
  ];

  const handleLanguageChange = async (lang: typeof language) => {
    await setLanguage(lang);
  };

  const handleSync = async () => {
    try {
      await syncData();
      Alert.alert('Succès', 'Données synchronisées localement', [{ text: 'OK' }]);
    } catch {
      Alert.alert(t.error, 'Erreur lors de la synchronisation', [{ text: 'OK' }]);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Confirmation',
      t.settings.clearDataConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.yes,
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Succès', 'Toutes les données ont été effacées', [{ text: 'OK' }]);
            } catch {
              Alert.alert(t.error, 'Erreur lors de l\'effacement des données', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const formatLastSync = () => {
    if (!lastSync) return t.settings.never;
    const date = new Date(lastSync);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.settings.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Languages size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.settings.language}</Text>
            </View>
            <View style={styles.languageOptions}>
              {languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.languageOption, language === option.code && styles.languageOptionSelected]}
                  onPress={() => handleLanguageChange(option.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.languageText, language === option.code && styles.languageTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <RefreshCw size={24} color={Colors.info} />
              <Text style={styles.sectionTitle}>{t.settings.dataSync}</Text>
            </View>
            <View style={styles.syncInfo}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.syncText}>
                {t.settings.lastSync}: {formatLastSync()}
              </Text>
            </View>
            <TouchableOpacity style={styles.syncButton} onPress={handleSync} activeOpacity={0.7}>
              <RefreshCw size={20} color={Colors.surface} />
              <Text style={styles.syncButtonText}>{t.settings.syncNow}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trash2 size={24} color={Colors.danger} />
              <Text style={styles.sectionTitle}>{t.settings.clearData}</Text>
            </View>
            <Text style={styles.warningText}>
              Cette action supprimera tous les dépistages enregistrés localement. Cette action est irréversible.
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearData} activeOpacity={0.7}>
              <Trash2 size={20} color={Colors.surface} />
              <Text style={styles.dangerButtonText}>{t.settings.clearData}</Text>
            </TouchableOpacity>
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
    gap: 32,
  },
  section: {
    gap: 16,
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
  languageOptions: {
    gap: 12,
  },
  languageOption: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  languageOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  languageTextSelected: {
    color: Colors.surface,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  syncText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: Colors.info,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});
