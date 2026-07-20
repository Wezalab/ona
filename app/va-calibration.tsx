import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CreditCard, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;

export default function VACalibrationScreen() {
  const router = useRouter();
  const { t } = useApp();
  const [calibrated, setCalibrated] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const cardDisplayWidth = screenWidth * 0.7;
  const cardDisplayHeight = (cardDisplayWidth * CARD_HEIGHT_MM) / CARD_WIDTH_MM;

  const handleCalibrated = () => {
    setCalibrated(true);
    setTimeout(() => {
      router.push('/va-test');
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <CreditCard size={48} color={Colors.primary} />
          <Text style={styles.title}>{t.visualAcuity.calibrationTitle}</Text>
          <Text style={styles.subtitle}>{t.visualAcuity.calibrationInstructions}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.instruction}>{t.visualAcuity.placeCardInstruction}</Text>
          
          <View style={styles.calibrationContainer}>
            <View 
              style={[
                styles.cardOutline,
                {
                  width: cardDisplayWidth,
                  height: cardDisplayHeight,
                }
              ]}
            >
              <CreditCard 
                size={cardDisplayWidth * 0.3} 
                color={Colors.textLight} 
                strokeWidth={1}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📏 Placez une carte bancaire standard (85.6mm x 53.98mm) sur le rectangle pour calibrer la taille d&apos;affichage
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, calibrated && styles.buttonSuccess]}
            onPress={handleCalibrated}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t.visualAcuity.cardPlaced}</Text>
            <ArrowRight size={20} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 32,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  calibrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOutline: {
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.infoLight,
  },
  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  buttonSuccess: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },
});
