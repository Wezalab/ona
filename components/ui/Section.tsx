import { StyleSheet, Text, View } from 'react-native';
import type { ComponentType } from 'react';
import Colors, { FontSize, Spacing } from '@/constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

interface SectionProps {
  icon?: ComponentType<IconProps>;
  iconColor?: string;
  title?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export default function Section({ icon: Icon, iconColor = Colors.primary, title, rightSlot, children }: SectionProps) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {Icon && <Icon size={22} color={iconColor} />}
            <Text style={styles.title}>{title}</Text>
          </View>
          {rightSlot}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
});
