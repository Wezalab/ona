import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Server,
  LogIn,
  LogOut,
  RefreshCw,
  Building2,
} from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import { useApi } from "@/contexts/ApiContext";
import Colors, { Radius, Spacing } from "@/constants/colors";
import { Button, ScreenHeader, Section, TextField } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function ApiSettingsScreen() {
  const router = useRouter();
  const { t } = useApp();
  const {
    ready,
    isAuthenticated,
    user,
    baseUrl,
    clinics,
    selectedClinic,
    pendingCount,
    login,
    logout,
    setBaseUrl,
    loadClinics,
    selectClinic,
    syncNow,
  } = useApi();

  const [url, setUrl] = useState(baseUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setUrl(baseUrl), [baseUrl]);

  useEffect(() => {
    if (isAuthenticated) loadClinics().catch(() => undefined);
  }, [isAuthenticated, loadClinics]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader
            variant="bar"
            title={t.apiSettings.title}
            onBack={() => router.back()}
          />

          {!ready ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
            >
              <Text style={styles.subtitle}>{t.apiSettings.subtitle}</Text>

              <Section icon={Server} title={t.apiSettings.serverUrl}>
                <TextField
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  placeholder="https://api.example.com/api"
                  onBlur={() => run(() => setBaseUrl(url))}
                />
              </Section>

              {!isAuthenticated ? (
                <Section
                  icon={LogIn}
                  iconColor={Colors.info}
                  title={t.apiSettings.login}
                >
                  <TextField
                    label={t.apiSettings.email}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="worker@ona.org"
                  />
                  <TextField
                    label={t.apiSettings.password}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="••••••••"
                  />
                  <Button
                    title={t.apiSettings.login}
                    icon={LogIn}
                    disabled={busy}
                    onPress={() =>
                      run(async () => {
                        await setBaseUrl(url);
                        await login(email, password);
                      })
                    }
                    size="md"
                  />
                </Section>
              ) : (
                <>
                  <Text style={styles.meta}>
                    {t.apiSettings.loggedInAs}:{" "}
                    <Text style={styles.metaStrong}>{user?.email}</Text>
                  </Text>

                  <Section icon={Building2} title={t.apiSettings.selectClinic}>
                    <Text style={styles.meta}>
                      {t.apiSettings.clinicSelected}:{" "}
                      <Text style={styles.metaStrong}>
                        {selectedClinic
                          ? `${selectedClinic.name} (#${selectedClinic.code})`
                          : t.apiSettings.noClinic}
                      </Text>
                    </Text>
                    {clinics.map((clinic) => (
                      <TouchableOpacity
                        key={clinic._id}
                        style={[
                          styles.clinic,
                          selectedClinic?._id === clinic._id &&
                            styles.clinicSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => run(() => selectClinic(clinic))}
                      >
                        <Text
                          style={[
                            styles.clinicText,
                            selectedClinic?._id === clinic._id &&
                              styles.clinicTextSelected,
                          ]}
                        >
                          {clinic.name} · #{clinic.code}
                          {clinic.province ? ` · ${clinic.province}` : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <Button
                      title={t.apiSettings.loadClinics}
                      icon={RefreshCw}
                      variant="outline"
                      disabled={busy}
                      onPress={() =>
                        run(async () => {
                          await loadClinics();
                        })
                      }
                      size="md"
                    />
                  </Section>

                  <Section
                    icon={RefreshCw}
                    iconColor={Colors.info}
                    title={t.apiSettings.pendingSync}
                  >
                    <Text style={styles.meta}>
                      {t.apiSettings.pendingSync}:{" "}
                      <Text style={styles.metaStrong}>{pendingCount}</Text>
                    </Text>
                    <Button
                      title={t.apiSettings.syncNow}
                      icon={RefreshCw}
                      disabled={busy}
                      onPress={() =>
                        run(async () => {
                          await syncNow();
                        })
                      }
                      size="md"
                    />
                  </Section>

                  <Button
                    title={t.apiSettings.logout}
                    icon={LogOut}
                    variant="danger"
                    disabled={busy}
                    onPress={() => run(logout)}
                    size="md"
                  />
                </>
              )}

              {busy ? (
                <ActivityIndicator
                  color={Colors.primary}
                  style={{ marginTop: Spacing.lg }}
                />
              ) : null}
              {message ? <Text style={styles.error}>{message}</Text> : null}
            </ScrollView>
          )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    gap: Spacing.xxl,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  meta: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metaStrong: {
    fontWeight: "700",
    color: Colors.text,
  },
  clinic: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  clinicSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  clinicText: {
    fontSize: 15,
    color: Colors.text,
  },
  clinicTextSelected: {
    color: Colors.surface,
    fontWeight: "600",
  },
  error: {
    color: Colors.danger,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
});
