import { StyleSheet, Text, View } from 'react-native';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';

export type BadgeTone = 'low' | 'medium' | 'high' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
  low: { bg: Colors.successLight, fg: Colors.successDark },
  success: { bg: Colors.successLight, fg: Colors.successDark },
  medium: { bg: Colors.warningLight, fg: Colors.warningDark },
  warning: { bg: Colors.warningLight, fg: Colors.warningDark },
  high: { bg: Colors.dangerLight, fg: Colors.dangerDark },
  danger: { bg: Colors.dangerLight, fg: Colors.dangerDark },
  info: { bg: Colors.infoLight, fg: Colors.info },
  primary: { bg: Colors.surfaceElevated, fg: Colors.primary },
  neutral: { bg: Colors.surfaceElevated, fg: Colors.textSecondary },
};

export default function Badge({ label, tone = 'neutral', size = 'md', dot = false }: BadgeProps) {
  const colors = toneColors[tone];
  return (
    <View style={[styles.base, size === 'sm' ? styles.sm : styles.md, { backgroundColor: colors.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: colors.fg }]} />}
      <Text style={[styles.text, size === 'sm' ? styles.textSm : styles.textMd, { color: colors.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
  },
  md: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
  },
  textSm: {
    fontSize: FontSize.xs,
  },
  textMd: {
    fontSize: FontSize.sm,
  },
});
