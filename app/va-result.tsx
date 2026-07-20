import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { CheckCircle2, AlertCircle, Eye, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import React from "react";

export default function VAResultScreen() {
  const router = useRouter();
  const { t, currentScreening } = useApp();

  const visualAcuity = currentScreening.visualAcuity;

  if (!visualAcuity) {
    router.replace('/home');
    return null;
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    return risk === 'low' ? CheckCircle2 : AlertCircle;
  };

  const getRiskText = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  const handleContinue = () => {
    router.push('/eye-capture');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Eye size={48} color={Colors.primary} />
          <Text style={styles.title}>{t.results.visualAcuityResults}</Text>
          <Text style={styles.subtitle}>Test terminé</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.eyeLabel}>{t.results.rightEye}</Text>
              {React.createElement(getRiskIcon(visualAcuity.rightEye.risk), {
                size: 24,
                color: getRiskColor(visualAcuity.rightEye.risk),
              })}
            </View>
            <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(visualAcuity.rightEye.risk)}20` }]}>
              <Text style={[styles.riskText, { color: getRiskColor(visualAcuity.rightEye.risk) }]}>
                {getRiskText(visualAcuity.rightEye.risk)}
              </Text>
            </View>
            <Text style={styles.scoreText}>Score: {visualAcuity.rightEye.score}/6</Text>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.eyeLabel}>{t.results.leftEye}</Text>
              {React.createElement(getRiskIcon(visualAcuity.leftEye.risk), {
                size: 24,
                color: getRiskColor(visualAcuity.leftEye.risk),
              })}
            </View>
            <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(visualAcuity.leftEye.risk)}20` }]}>
              <Text style={[styles.riskText, { color: getRiskColor(visualAcuity.leftEye.risk) }]}>
                {getRiskText(visualAcuity.leftEye.risk)}
              </Text>
            </View>
            <Text style={styles.scoreText}>Score: {visualAcuity.leftEye.score}/6</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Ces résultats sont indicatifs uniquement. Ils ne constituent pas un diagnostic médical.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.nextStep}>Étape suivante: Capture d&apos;image de l&apos;œil</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t.continue}</Text>
            <ArrowRight size={20} color={Colors.surface} />
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
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  riskBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  nextStep: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },
});
