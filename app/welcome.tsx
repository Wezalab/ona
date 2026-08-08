import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { ShieldCheck, Smartphone } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { FontSize, Radius, Spacing } from "@/constants/colors";
import { Button, Card } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useApp();

  const handleContinue = () => {
    router.push("/consent");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t.welcome.title}</Text>
            <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>
          </View>

          <View style={styles.features}>
            <Card style={styles.feature} elevated>
              <View style={styles.iconContainer}>
                <Smartphone size={30} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>{t.welcome.description}</Text>
            </Card>

            <Card style={styles.feature} elevated>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.successLight },
                ]}
              >
                <ShieldCheck size={30} color={Colors.success} />
              </View>
              <Text style={styles.featureText}>
                Fonctionne 100% hors ligne • Données cryptées • Aucune
                information personnelle requise
              </Text>
            </Card>
          </View>

          <View style={styles.footer}>
            <Button title={t.welcome.getStarted} onPress={handleContinue} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    alignItems: "center",
    paddingTop: 72,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
  features: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: Colors.infoLight,
    alignItems: "center",
    justifyContent: "center",
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
