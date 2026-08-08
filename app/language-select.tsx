import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { FontSize, Spacing } from "@/constants/colors";
import type { Language } from "@/constants/translations";
import { SelectableCard } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { setLanguage } = useApp();
  const [selected, setSelected] = useState<Language | null>(null);

  const handleLanguageSelect = async (lang: Language) => {
    setSelected(lang);
    await setLanguage(lang);
    router.replace("/welcome");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={{
                uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9vlow4ppzc6erbcy80bri",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Choisir la langue</Text>
            <Text style={styles.subtitle}>
              Select your language / Chagua lugha yako / Pona monoko
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <SelectableCard
              title="English"
              subtitle="English"
              selected={selected === "en"}
              onPress={() => handleLanguageSelect("en")}
            />
            <SelectableCard
              title="Français"
              subtitle="French"
              selected={selected === "fr"}
              onPress={() => handleLanguageSelect("fr")}
            />
            <SelectableCard
              title="Kiswahili"
              subtitle="Swahili"
              selected={selected === "sw"}
              onPress={() => handleLanguageSelect("sw")}
            />
            <SelectableCard
              title="Lingala"
              subtitle="Lingala"
              selected={selected === "ln"}
              onPress={() => handleLanguageSelect("ln")}
            />
          </View>
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
  header: {
    alignItems: "center",
    paddingTop: 72,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.surface,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
});
