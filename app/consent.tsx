import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AlertTriangle, CheckCircle2, Shield, UserCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function ConsentScreen() {
  const router = useRouter();
  const { t, completeOnboarding } = useApp();
  const [understood, setUnderstood] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleContinue = async () => {
    if (!understood || !agreed) {
      Alert.alert(
        t.error,
        'Vous devez comprendre et accepter pour continuer',
        [{ text: 'OK' }]
      );
      return;
    }

    await completeOnboarding();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <AlertTriangle size={56} color={Colors.warning} />
          <Text style={styles.title}>{t.consent.title}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={24} color={Colors.danger} />
              <Text style={styles.sectionTitle}>{t.consent.disclaimer}</Text>
            </View>
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                Cette application est un OUTIL DE DÉPISTAGE UNIQUEMENT.
                {'\n\n'}
                Elle NE FOURNIT PAS de diagnostic médical ou de traitement.
                {'\n\n'}
                Tous les résultats doivent être confirmés par un professionnel de santé qualifié.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.consent.purpose}</Text>
            </View>
            <Text style={styles.sectionText}>
              Identifier les personnes qui peuvent nécessiter une évaluation oculaire professionnelle. Aider les agents de santé communautaire à effectuer des dépistages visuels de base.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={24} color={Colors.success} />
              <Text style={styles.sectionTitle}>{t.consent.dataPrivacy}</Text>
            </View>
            <Text style={styles.sectionText}>
              Toutes les données sont stockées localement sur cet appareil et cryptées. Aucune donnée n&apos;est envoyée automatiquement. Aucune information d&apos;identification personnelle n&apos;est requise.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserCheck size={24} color={Colors.info} />
              <Text style={styles.sectionTitle}>{t.consent.voluntaryParticipation}</Text>
            </View>
            <Text style={styles.sectionText}>
              Le dépistage est volontaire. Le patient peut refuser ou arrêter à tout moment.
            </Text>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setUnderstood(!understood)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, understood && styles.checkboxBoxChecked]}>
              {understood && <CheckCircle2 size={20} color={Colors.surface} />}
            </View>
            <Text style={styles.checkboxText}>{t.consent.iUnderstand}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, agreed && styles.checkboxBoxChecked]}>
              {agreed && <CheckCircle2 size={20} color={Colors.surface} />}
            </View>
            <Text style={styles.checkboxText}>{t.consent.iAgree}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, (!understood || !agreed) && styles.buttonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!understood || !agreed}
          >
            <Text style={styles.buttonText}>{t.continue}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    paddingLeft: 36,
  },
  disclaimerBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  checkboxContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },
});
