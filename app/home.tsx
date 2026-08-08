import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import {
  Plus,
  History,
  Settings,
  Info,
  Server,
  ShieldCheck,
} from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { Spacing } from "@/constants/colors";
import { IconTile } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { t, screenings } = useApp();

  const menuItems = [
    {
      icon: Plus,
      title: t.home.newScreening,
      description: t.home.newScreeningDesc,
      color: Colors.primary,
      onPress: () => router.push("/patient-info"),
    },
    {
      icon: History,
      title: t.home.history,
      description: t.home.historyDesc + ` (${screenings.length})`,
      color: Colors.info,
      onPress: () => router.push("/history"),
    },
    {
      icon: Server,
      title: t.home.server,
      description: t.home.serverDesc,
      color: Colors.success,
      onPress: () => router.push("/api-settings"),
    },
    {
      icon: ShieldCheck,
      title: t.home.blockchain,
      description: t.home.blockchainDesc,
      color: Colors.primaryLight,
      onPress: () => router.push("/blockchain"),
    },
    {
      icon: Settings,
      title: t.home.settings,
      description: t.home.settingsDesc,
      color: Colors.textSecondary,
      onPress: () => router.push("/settings"),
    },
    {
      icon: Info,
      title: t.home.about,
      description: t.home.aboutDesc,
      color: Colors.warning,
      onPress: () => router.push("/about"),
    },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>{t.appName}</Text>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
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
              ⚠️ Outil de dépistage uniquement - Pas un diagnostic médical
            </Text>
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
    backgroundColor: Colors.primary,
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
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
    textAlign: "center",
    fontWeight: "600",
  },
});
