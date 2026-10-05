import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { FontSize, Spacing, Gradients } from '@/constants/colors';

interface StepProgressProps {
  steps: string[];
  currentStepIndex: number;
}

export default function StepProgress({ steps, currentStepIndex }: StepProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        {steps.map((_, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <View key={index} style={styles.segmentWrap}>
              {isDone || isCurrent ? (
                <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.segment} />
              ) : (
                <View style={styles.segment} />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {steps[currentStepIndex]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  trackRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  segmentWrap: {
    flex: 1,
  },
  segment: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
