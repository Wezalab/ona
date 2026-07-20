import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Server, LogIn, LogOut, RefreshCw, Building2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import Colors from '@/constants/colors';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.title}>{t.apiSettings.title}</Text>
          <View style={styles.placeholder} />
        </View>

        {!ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.subtitle}>{t.apiSettings.subtitle}</Text>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Server size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{t.apiSettings.serverUrl}</Text>
              </View>
              <TextInput
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://api.example.com/api"
                placeholderTextColor={Colors.textLight}
                style={styles.input}
                onBlur={() => run(() => setBaseUrl(url))}
              />
            </View>

            {!isAuthenticated ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LogIn size={24} color={Colors.info} />
                  <Text style={styles.sectionTitle}>{t.apiSettings.login}</Text>
                </View>
                <Text style={styles.label}>{t.apiSettings.email}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="worker@ona.org"
                  placeholderTextColor={Colors.textLight}
                  style={styles.input}
                />
                <Text style={styles.label}>{t.apiSettings.password}</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.primaryButton}
                  disabled={busy}
                  activeOpacity={0.8}
                  onPress={() => run(async () => { await setBaseUrl(url); await login(email, password); })}
                >
                  <LogIn size={20} color={Colors.surface} />
                  <Text style={styles.primaryButtonText}>{t.apiSettings.login}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.meta}>
                    {t.apiSettings.loggedInAs}: <Text style={styles.metaStrong}>{user?.email}</Text>
                  </Text>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Building2 size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>{t.apiSettings.selectClinic}</Text>
                  </View>
                  <Text style={styles.meta}>
                    {t.apiSettings.clinicSelected}:{' '}
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
                        selectedClinic?._id === clinic._id && styles.clinicSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => run(() => selectClinic(clinic))}
                    >
                      <Text
                        style={[
                          styles.clinicText,
                          selectedClinic?._id === clinic._id && styles.clinicTextSelected,
                        ]}
                      >
                        {clinic.name} · #{clinic.code}
                        {clinic.province ? ` · ${clinic.province}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    disabled={busy}
                    activeOpacity={0.7}
                    onPress={() => run(async () => { await loadClinics(); })}
                  >
                    <RefreshCw size={18} color={Colors.primary} />
                    <Text style={styles.secondaryButtonText}>{t.apiSettings.loadClinics}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <RefreshCw size={24} color={Colors.info} />
                    <Text style={styles.sectionTitle}>{t.apiSettings.pendingSync}</Text>
                  </View>
                  <Text style={styles.meta}>
                    {t.apiSettings.pendingSync}: <Text style={styles.metaStrong}>{pendingCount}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    disabled={busy}
                    activeOpacity={0.8}
                    onPress={() => run(async () => { await syncNow(); })}
                  >
                    <RefreshCw size={20} color={Colors.surface} />
                    <Text style={styles.primaryButtonText}>{t.apiSettings.syncNow}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.dangerButton}
                  disabled={busy}
                  activeOpacity={0.7}
                  onPress={() => run(logout)}
                >
                  <LogOut size={20} color={Colors.surface} />
                  <Text style={styles.dangerButtonText}>{t.apiSettings.logout}</Text>
                </TouchableOpacity>
              </>
            )}

            {busy ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} /> : null}
            {message ? <Text style={styles.error}>{message}</Text> : null}
          </ScrollView>
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 28,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  section: {
    gap: 12,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  secondaryButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
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
  meta: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metaStrong: {
    fontWeight: '700',
    color: Colors.text,
  },
  clinic: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
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
    fontWeight: '600',
  },
  error: {
    color: Colors.danger,
    marginTop: 8,
    fontSize: 14,
  },
});
