import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Check, CheckCircle2, Shield, UserCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Gradients, Radius, Spacing } from '@/constants/colors';
import { Button, Card } from '@/components/ui';

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
        <LinearGradient colors={[...Gradients.warning]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerIcon}>
            <AlertTriangle size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{t.consent.title}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card elevated>
            <View style={styles.sectionHead}>
              <LinearGradient colors={[...Gradients.danger]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sectionIcon}>
                <AlertTriangle size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>{t.consent.disclaimer}</Text>
            </View>
            <View style={styles.noticeBox}>
              <Text style={styles.disclaimerText}>
                Cette application est un OUTIL DE DÉPISTAGE UNIQUEMENT.
                {'\n\n'}
                Elle NE FOURNIT PAS de diagnostic médical ou de traitement.
                {'\n\n'}
                Tous les résultats doivent être confirmés par un professionnel de santé qualifié.
              </Text>
            </View>
          </Card>

          <Card elevated>
            <View style={styles.sectionHead}>
              <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sectionIcon}>
                <CheckCircle2 size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>{t.consent.purpose}</Text>
            </View>
            <Text style={styles.sectionText}>
              Identifier les personnes qui peuvent nécessiter une évaluation oculaire professionnelle. Aider les agents de santé communautaire à effectuer des dépistages visuels de base.
            </Text>
          </Card>

          <Card elevated>
            <View style={styles.sectionHead}>
              <LinearGradient colors={[...Gradients.success]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sectionIcon}>
                <Shield size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>{t.consent.dataPrivacy}</Text>
            </View>
            <Text style={styles.sectionText}>
              Toutes les données sont stockées localement sur cet appareil et cryptées. Aucune donnée n&apos;est envoyée automatiquement. Aucune information d&apos;identification personnelle n&apos;est requise.
            </Text>
          </Card>

          <Card elevated>
            <View style={styles.sectionHead}>
              <LinearGradient colors={[...Gradients.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sectionIcon}>
                <UserCheck size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>{t.consent.voluntaryParticipation}</Text>
            </View>
            <Text style={styles.sectionText}>
              Le dépistage est volontaire. Le patient peut refuser ou arrêter à tout moment.
            </Text>
          </Card>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setUnderstood(!understood)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, understood && styles.checkboxBoxChecked]}>
              {understood ? (
                <LinearGradient colors={[...Gradients.primary]} style={styles.checkboxFill}>
                  <Check size={20} color="#FFFFFF" strokeWidth={3} />
                </LinearGradient>
              ) : null}
            </View>
            <Text style={styles.checkboxText}>{t.consent.iUnderstand}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, agreed && styles.checkboxBoxChecked]}>
              {agreed ? (
                <LinearGradient colors={[...Gradients.primary]} style={styles.checkboxFill}>
                  <Check size={20} color="#FFFFFF" strokeWidth={3} />
                </LinearGradient>
              ) : null}
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
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    marginBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  noticeBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  checkboxFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
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
    overflow: 'hidden',
  },
  checkboxBoxChecked: {
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
