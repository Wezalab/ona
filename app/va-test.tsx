import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { Eye, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import type { VisualAcuityResult } from '@/contexts/AppContext';

type Direction = 'up' | 'down' | 'left' | 'right';

interface TestLevel {
  size: number;
  level: string;
}

const TEST_LEVELS: TestLevel[] = [
  { size: 120, level: '6/60' },
  { size: 90, level: '6/36' },
  { size: 60, level: '6/24' },
  { size: 40, level: '6/18' },
  { size: 30, level: '6/12' },
  { size: 20, level: '6/9' },
  { size: 15, level: '6/6' },
];

export default function VATestScreen() {
  const router = useRouter();
  const { t, updateVisualAcuity } = useApp();
  
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<Direction>('up');
  const [rightEyeScore, setRightEyeScore] = useState(0);
  
  const [rotateAnim] = useState(new Animated.Value(0));

  const generateNewDirection = useCallback(() => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
    
    Animated.timing(rotateAnim, {
      toValue: getRotationValue(randomDirection),
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [rotateAnim]);

  useEffect(() => {
    generateNewDirection();
  }, [generateNewDirection]);

  const getRotationValue = (direction: Direction): number => {
    switch (direction) {
      case 'up': return 0;
      case 'right': return 1;
      case 'down': return 2;
      case 'left': return 3;
      default: return 0;
    }
  };

  const handleAnswer = (answer: Direction | 'cantSee') => {
    if (answer === 'cantSee') {
      finishEye();
      return;
    }

    const isCorrect = answer === currentDirection;
    const newTotalAnswers = totalAnswers + 1;
    setTotalAnswers(newTotalAnswers);

    if (isCorrect && newTotalAnswers >= 2 && currentLevelIndex < TEST_LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setTotalAnswers(0);
    } else if (!isCorrect && newTotalAnswers >= 2) {
      finishEye();
    } else {
      generateNewDirection();
    }
  };

  const finishEye = () => {
    const score = currentLevelIndex;
    
    if (currentEye === 'right') {
      setRightEyeScore(score);
      setCurrentEye('left');
      setCurrentLevelIndex(0);
      setTotalAnswers(0);
      generateNewDirection();
    } else {
      const leftEyeScore = score;
      
      const result: VisualAcuityResult = {
        rightEye: {
          score: rightEyeScore,
          risk: rightEyeScore < 3 ? 'high' : rightEyeScore < 5 ? 'medium' : 'low',
        },
        leftEye: {
          score: leftEyeScore,
          risk: leftEyeScore < 3 ? 'high' : leftEyeScore < 5 ? 'medium' : 'low',
        },
      };
      
      updateVisualAcuity(result);
      router.push('/va-result');
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0deg', '90deg', '180deg', '270deg'],
  });

  const currentLevel = TEST_LEVELS[currentLevelIndex];
  const screenWidth = Dimensions.get('window').width;
  const optotypeSize = Math.min(currentLevel.size, screenWidth * 0.4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.eyeIndicator}>
            <Eye size={32} color={currentEye === 'right' ? Colors.info : Colors.warning} />
            <Text style={styles.eyeText}>
              {currentEye === 'right' ? t.visualAcuity.coverEye + ' ' + t.results.leftEye : t.visualAcuity.coverEye + ' ' + t.results.rightEye}
            </Text>
          </View>
          <Text style={styles.levelText}>Niveau: {currentLevel.level}</Text>
          <Text style={styles.instructions}>{t.visualAcuity.testInstructions}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>{t.visualAcuity.whichWayPoints}</Text>
          
          <View style={styles.optotypeContainer}>
            <Animated.Text 
              style={[
                styles.optotype,
                { 
                  fontSize: optotypeSize,
                  transform: [{ rotate: rotation }],
                }
              ]}
            >
              E
            </Animated.Text>
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.directionsRow}>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => handleAnswer('up')}
              activeOpacity={0.7}
            >
              <Text style={styles.directionText}>↑</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.up}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.directionsRow}>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => handleAnswer('left')}
              activeOpacity={0.7}
            >
              <Text style={styles.directionText}>←</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.left}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => handleAnswer('right')}
              activeOpacity={0.7}
            >
              <Text style={styles.directionText}>→</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.right}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.directionsRow}>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() => handleAnswer('down')}
              activeOpacity={0.7}
            >
              <Text style={styles.directionText}>↓</Text>
              <Text style={styles.directionLabel}>{t.visualAcuity.down}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cantSeeButton}
            onPress={() => handleAnswer('cantSee')}
            activeOpacity={0.7}
          >
            <Text style={styles.cantSeeText}>{t.visualAcuity.cantSee}</Text>
            {currentEye === 'right' ? <ArrowRight size={20} color={Colors.surface} /> : null}
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
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  eyeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'center',
  },
  eyeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 40,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  optotypeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  optotype: {
    fontWeight: '900',
    color: Colors.text,
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  directionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  directionButton: {
    width: 100,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionText: {
    fontSize: 40,
    color: Colors.surface,
  },
  directionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
  },
  cantSeeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.textSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  cantSeeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});
