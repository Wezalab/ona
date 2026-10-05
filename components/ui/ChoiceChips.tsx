import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { FontSize, Gradients, Radius, Spacing } from '@/constants/colors';

interface ChoiceChipsProps<T extends string | number> {
  options: readonly { value: T; label: string }[];
  value: T | null | undefined;
  onChange: (value: T) => void;
}

/** Single-select pill row (hospital-form style answer buttons). */
export default function ChoiceChips<T extends string | number>({ options, value, onChange }: ChoiceChipsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
          >
            {selected ? (
              <LinearGradient colors={[...Gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            ) : null}
            <Text style={[styles.text, selected && styles.textSelected]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  chipSelected: { borderColor: Colors.primary },
  text: { fontSize: FontSize.base, fontWeight: '700', color: Colors.navy },
  textSelected: { color: '#FFFFFF' },
});
