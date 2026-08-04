import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AlertTriangle, CheckCircle2, Shield, UserCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import { Button, Card, Section } from '@/components/ui';

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
          <AlertTriangle size={52} color={Colors.warning} />
          <Text style={styles.title}>{t.consent.title}</Text>
        </View>

        <View style={styles.content}>
          <Section icon={AlertTriangle} iconColor={Colors.danger} title={t.consent.disclaimer}>
            <Card tone="danger" accentBorder>
              <Text style={styles.disclaimerText}>
                Cette application est un OUTIL DE DÉPISTAGE UNIQUEMENT.
                {'\n\n'}
                Elle NE FOURNIT PAS de diagnostic médical ou de traitement.
                {'\n\n'}
                Tous les résultats doivent être confirmés par un professionnel de santé qualifié.
              </Text>
            </Card>
          </Section>

          <Section icon={CheckCircle2} title={t.consent.purpose}>
            <Text style={styles.sectionText}>
              Identifier les personnes qui peuvent nécessiter une évaluation oculaire professionnelle. Aider les agents de santé communautaire à effectuer des dépistages visuels de base.
            </Text>
          </Section>

          <Section icon={Shield} iconColor={Colors.success} title={t.consent.dataPrivacy}>
            <Text style={styles.sectionText}>
              Toutes les données sont stockées localement sur cet appareil et cryptées. Aucune donnée n&apos;est envoyée automatiquement. Aucune information d&apos;identification personnelle n&apos;est requise.
            </Text>
          </Section>

          <Section icon={UserCheck} iconColor={Colors.info} title={t.consent.voluntaryParticipation}>
            <Text style={styles.sectionText}>
              Le dépistage est volontaire. Le patient peut refuser ou arrêter à tout moment.
            </Text>
          </Section>
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
          <Button title={t.continue} onPress={handleContinue} disabled={!understood || !agreed} />
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
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  sectionText: {
    fontSize: FontSize.base,
    lineHeight: 20,
    color: Colors.textSecondary,
    paddingLeft: 34,
  },
  disclaimerText: {
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '600',
  },
  checkboxContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkboxBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
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
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
});
