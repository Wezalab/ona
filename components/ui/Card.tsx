import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Colors, { Radius, Shadow, Spacing } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info' | 'primary';
  accentBorder?: boolean;
}

const toneBackground: Record<string, string> = {
  default: Colors.surface,
  danger: Colors.dangerLight,
  warning: Colors.warningLight,
  success: Colors.successLight,
  info: Colors.infoLight,
  primary: Colors.surfaceElevated,
};

const toneAccent: Record<string, string> = {
  default: Colors.border,
  danger: Colors.danger,
  warning: Colors.warning,
  success: Colors.success,
  info: Colors.info,
  primary: Colors.primary,
};

export default function Card({ children, style, padded = true, elevated = false, tone = 'default', accentBorder = false }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevated && Shadow.card,
        { backgroundColor: toneBackground[tone] },
        tone === 'default' ? styles.border : null,
        accentBorder && { borderLeftWidth: 4, borderLeftColor: toneAccent[tone] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
  },
  padded: {
    padding: Spacing.lg,
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
