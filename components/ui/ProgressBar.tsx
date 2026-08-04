import { StyleSheet, View } from 'react-native';
import Colors, { Radius } from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function ProgressBar({ progress, color = Colors.primary, trackColor = Colors.border, height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.pill,
  },
  fill: {
    height: '100%',
  },
});
