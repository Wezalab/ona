import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { t } from '@/constants/translations';
import { useAppContext } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';

export default function ApiSettingsScreen() {
  const { language } = useAppContext();
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
  const insets = useSafeAreaInsets();

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

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title}>{t(language, 'apiSettings')}</Text>
      <Text style={styles.subtitle}>{t(language, 'apiSettingsSubtitle')}</Text>

      {/* Server URL */}
      <Text style={styles.label}>{t(language, 'apiServerUrl')}</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder="https://api.example.com/api"
        placeholderTextColor={colors.text + '80'}
        style={styles.input}
        onBlur={() => run(() => setBaseUrl(url))}
      />

      {!isAuthenticated ? (
        <>
          <Text style={styles.label}>{t(language, 'apiEmail')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="worker@ona.org"
            placeholderTextColor={colors.text + '80'}
            style={styles.input}
          />
          <Text style={styles.label}>{t(language, 'apiPassword')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.text + '80'}
            style={styles.input}
          />
          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            disabled={busy}
            onPress={() => run(async () => { await setBaseUrl(url); await login(email, password); })}
          >
            <Text style={styles.buttonTextPrimary}>{t(language, 'apiLogin')}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.meta}>
            {t(language, 'apiLoggedInAs')}: <Text style={styles.metaStrong}>{user?.email}</Text>
          </Text>

          {/* Clinic selection */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>{t(language, 'apiSelectClinic')}</Text>
            <Pressable disabled={busy} onPress={() => run(async () => { await loadClinics(); })}>
              <Text style={styles.link}>{t(language, 'apiLoadClinics')}</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {t(language, 'apiClinicSelected')}:{' '}
            <Text style={styles.metaStrong}>
              {selectedClinic ? `${selectedClinic.name} (#${selectedClinic.code})` : t(language, 'apiNoClinic')}
            </Text>
          </Text>
          {clinics.map((clinic) => (
            <Pressable
              key={clinic._id}
              style={[styles.clinic, selectedClinic?._id === clinic._id && styles.clinicSelected]}
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
            </Pressable>
          ))}

          {/* Sync */}
          <Text style={[styles.meta, { marginTop: 20 }]}>
            {t(language, 'apiPendingSync')}: <Text style={styles.metaStrong}>{pendingCount}</Text>
          </Text>
          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            disabled={busy}
            onPress={() => run(async () => { await syncNow(); })}
          >
            <Text style={styles.buttonTextPrimary}>{t(language, 'apiSyncNow')}</Text>
          </Pressable>

          <Pressable style={styles.button} disabled={busy} onPress={() => run(logout)}>
            <Text style={styles.buttonText}>{t(language, 'apiLogout')}</Text>
          </Pressable>
        </>
      )}

      {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} /> : null}
      {message ? <Text style={styles.error}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flexGrow: 1, paddingHorizontal: 24, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.text, opacity: 0.7, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  buttonTextPrimary: { fontSize: 16, fontWeight: '600', color: colors.background },
  meta: { fontSize: 14, color: colors.text, marginTop: 12 },
  metaStrong: { fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  clinic: {
    borderWidth: 1,
    borderColor: colors.primary + '55',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  clinicSelected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  clinicText: { fontSize: 15, color: colors.text },
  clinicTextSelected: { color: colors.background, fontWeight: '600' },
  error: { color: '#c0392b', marginTop: 16, fontSize: 14 },
});
