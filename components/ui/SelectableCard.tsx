import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ComponentType } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { FontSize, Radius, Shadow, Spacing, Gradients } from '@/constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<IconProps>;
  selected?: boolean;
  onPress: () => void;
  size?: 'md' | 'lg';
}

export default function SelectableCard({ title, subtitle, icon: Icon, selected = false, onPress, size = 'md' }: SelectableCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, size === 'lg' && styles.cardLg, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selected ? (
        <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : null}
      {Icon && <Icon size={size === 'lg' ? 36 : 28} color={selected ? Colors.surface : Colors.primary} />}
      <Text style={[styles.title, size === 'lg' && styles.titleLg, selected && styles.textSelected]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardLg: {
    paddingVertical: Spacing.xxl,
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  titleLg: {
    fontSize: 28,
  },
  textSelected: {
    color: Colors.surface,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  subtitleSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
});
