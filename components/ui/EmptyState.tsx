import { StyleSheet, Text, View } from 'react-native';
import type { ComponentType } from 'react';
import Colors, { FontSize, Spacing } from '@/constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

interface EmptyStateProps {
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon size={64} color={Colors.textLight} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
