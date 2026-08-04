import { StyleSheet, Text, View } from 'react-native';
import Colors, { FontSize, Spacing } from '@/constants/colors';

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
              <View
                style={[
                  styles.segment,
                  (isDone || isCurrent) && styles.segmentActive,
                ]}
              />
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
    height: 4,
    borderRadius: 2,
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
