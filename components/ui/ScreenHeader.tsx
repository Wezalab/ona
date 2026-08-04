import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { ComponentType } from 'react';
import Colors, { FontSize, Spacing } from '@/constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

interface BarHeaderProps {
  variant: 'bar';
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

interface HeroHeaderProps {
  variant?: 'hero';
  icon?: ComponentType<IconProps>;
  iconColor?: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}

type ScreenHeaderProps = BarHeaderProps | HeroHeaderProps;

export default function ScreenHeader(props: ScreenHeaderProps) {
  if (props.variant === 'bar') {
    const { title, onBack, rightSlot } = props;
    return (
      <View style={styles.barHeader}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7} testID="screen-header-back">
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.barTitle} numberOfLines={1}>{title}</Text>
        {rightSlot ?? <View style={styles.placeholder} />}
      </View>
    );
  }

  const { icon: Icon, iconColor, title, subtitle, compact } = props;
  return (
    <View style={[styles.heroHeader, compact && styles.heroHeaderCompact]}>
      {Icon && (
        <View style={[styles.heroIconWrap, { backgroundColor: `${iconColor ?? Colors.primary}18` }]}>
          <Icon size={compact ? 32 : 40} color={iconColor ?? Colors.primary} />
        </View>
      )}
      <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.surface,
  },
  heroHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  heroHeaderCompact: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  heroTitleCompact: {
    fontSize: FontSize.lg,
  },
  heroSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 21,
  },
});
