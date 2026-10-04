import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Radius, Shadow, Spacing, type GradientName } from '@/constants/colors';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: GradientName;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export default function GradientCard({ children, gradient = 'primary', style, padded = true }: GradientCardProps) {
  return (
    <LinearGradient
      colors={[...Gradients[gradient]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, padded && styles.padded, Shadow.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.xl, overflow: 'hidden' },
  padded: { padding: Spacing.lg },
});
