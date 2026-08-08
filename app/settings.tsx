import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Languages, RefreshCw, Trash2, Calendar } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { Radius, Spacing } from "@/constants/colors";
import { Button, ScreenHeader, Section } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage, syncData, clearAllData, lastSync } =
    useApp();

  const languageOptions = [
    { code: "en" as const, label: "English" },
    { code: "fr" as const, label: "Français" },
    { code: "sw" as const, label: "Kiswahili" },
    { code: "ln" as const, label: "Lingala" },
  ];

  const handleLanguageChange = async (lang: typeof language) => {
    await setLanguage(lang);
  };

  const handleSync = async () => {
    try {
      await syncData();
      Alert.alert("Succès", "Données synchronisées localement", [
        { text: "OK" },
      ]);
    } catch {
      Alert.alert(t.error, "Erreur lors de la synchronisation", [
        { text: "OK" },
      ]);
    }
  };

  const handleClearData = () => {
    Alert.alert("Confirmation", t.settings.clearDataConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.yes,
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllData();
            Alert.alert("Succès", "Toutes les données ont été effacées", [
              { text: "OK" },
            ]);
          } catch {
            Alert.alert(t.error, "Erreur lors de l'effacement des données", [
              { text: "OK" },
            ]);
          }
        },
      },
    ]);
  };

  const formatLastSync = () => {
    if (!lastSync) return t.settings.never;
    const date = new Date(lastSync);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader
            variant="bar"
            title={t.settings.title}
            onBack={() => router.back()}
          />

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <Section icon={Languages} title={t.settings.language}>
              <View style={styles.languageOptions}>
                {languageOptions.map((option) => (
                  <TouchableOpacity
                    key={option.code}
                    style={[
                      styles.languageOption,
                      language === option.code && styles.languageOptionSelected,
                    ]}
                    onPress={() => handleLanguageChange(option.code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        language === option.code && styles.languageTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            <Section
              icon={RefreshCw}
              iconColor={Colors.info}
              title={t.settings.dataSync}
            >
              <View style={styles.syncInfo}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.syncText}>
                  {t.settings.lastSync}: {formatLastSync()}
                </Text>
              </View>
              <Button
                title={t.settings.syncNow}
                onPress={handleSync}
                variant="secondary"
                icon={RefreshCw}
                size="md"
              />
            </Section>

            <Section
              icon={Trash2}
              iconColor={Colors.danger}
              title={t.settings.clearData}
            >
              <Text style={styles.warningText}>
                Cette action supprimera tous les dépistages enregistrés
                localement. Cette action est irréversible.
              </Text>
              <Button
                title={t.settings.clearData}
                onPress={handleClearData}
                variant="danger"
                icon={Trash2}
                size="md"
              />
            </Section>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
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
    gap: Spacing.xxl,
  },
  languageOptions: {
    gap: Spacing.md,
  },
  languageOption: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  languageOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  languageTextSelected: {
    color: Colors.surface,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  syncText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
