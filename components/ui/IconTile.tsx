import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ComponentType } from 'react';
import { ChevronRight } from 'lucide-react-native';
import Colors, { FontSize, Radius, Shadow, Spacing } from '@/constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

interface IconTileProps {
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
  color?: string;
  onPress: () => void;
  chevron?: boolean;
}

export default function IconTile({ icon: Icon, title, description, color = Colors.primary, onPress, chevron = true }: IconTileProps) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        <Icon size={30} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {chevron && <ChevronRight size={20} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
