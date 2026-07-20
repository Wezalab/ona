import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { Brain, Loader } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import type { EyeImageResult } from '@/contexts/AppContext';

export default function AIProcessingScreen() {
  const router = useRouter();
  const { t, updateEyeImages } = useApp();
  const [progress, setProgress] = useState(0);
  const [spinAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const simulateAIResults = () => {
      const rightScore = Math.random();
      const leftScore = Math.random();

      const getRisk = (score: number): 'low' | 'medium' | 'high' => {
        if (score < 0.3) return 'high';
        if (score < 0.6) return 'medium';
        return 'low';
      };

      const result: EyeImageResult = {
        rightEye: {
          imageUri: 'simulated_right_eye.jpg',
          quality: rightScore > 0.2 ? 'good' : 'poor',
          risk: getRisk(rightScore),
          aiScore: rightScore,
        },
        leftEye: {
          imageUri: 'simulated_left_eye.jpg',
          quality: leftScore > 0.2 ? 'good' : 'poor',
          risk: getRisk(leftScore),
          aiScore: leftScore,
        },
      };

      updateEyeImages(result);
      router.replace('/screening-results');
    };

    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    const processingTimeout = setTimeout(() => {
      simulateAIResults();
    }, 3500);

    return () => {
      spinAnimation.stop();
      clearInterval(progressInterval);
      clearTimeout(processingTimeout);
    };
  }, [router, spinAnim, updateEyeImages]);



  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Brain size={80} color={Colors.primary} />
          </Animated.View>

          <Text style={styles.title}>{t.aiProcessing.title}</Text>
          <Text style={styles.subtitle}>{t.aiProcessing.analyzing}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t.aiProcessing.subtitle}</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Loader size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Détection des anomalies</Text>
            </View>
            <View style={styles.feature}>
              <Loader size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Évaluation de la qualité</Text>
            </View>
            <View style={styles.feature}>
              <Loader size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Classification du risque</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  features: {
    gap: 12,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
});
