import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ComponentType } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { FontSize, Gradients, Radius, Shadow, Spacing } from '@/constants/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'md' | 'lg';

interface IconProps {
  size?: number;
  color?: string;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<IconProps>;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const containerStyles = [
    styles.base,
    size === 'lg' ? styles.sizeLg : styles.sizeMd,
    variantStyles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];
  const textColor = textColorFor(variant, isDisabled);

  const gradient = !isDisabled ? gradientFor[variant] : undefined;
  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {gradient ? (
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'left' && <Icon size={size === 'lg' ? 20 : 18} color={textColor} />}
          <Text style={[styles.text, size === 'lg' ? styles.textLg : styles.textMd, { color: textColor }]} numberOfLines={2}>
            {title}
          </Text>
          {Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 20 : 18} color={textColor} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const gradientFor: Partial<Record<ButtonVariant, readonly [string, string]>> = {
  primary: Gradients.primary,
  secondary: Gradients.info,
  danger: Gradients.danger,
};

function textColorFor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) {
    return variant === 'outline' || variant === 'ghost' ? Colors.textLight : Colors.surface;
  }
  switch (variant) {
    case 'outline':
    case 'ghost':
      return Colors.primary;
    default:
      return Colors.surface;
  }
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    ...Shadow.button,
  },
  secondary: {
    backgroundColor: Colors.info,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  outline: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeLg: {
    paddingVertical: 17,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  sizeMd: {
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textLg: {
    fontSize: FontSize.md,
  },
  textMd: {
    fontSize: FontSize.base,
  },
});
