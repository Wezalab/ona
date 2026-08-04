import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';

interface TextFieldProps extends TextInputProps {
  label?: string;
  monospace?: boolean;
}

export default function TextField({ label, monospace, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.textLight}
        style={[styles.input, monospace && styles.monospace, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  monospace: {
    fontFamily: 'monospace',
  },
});
