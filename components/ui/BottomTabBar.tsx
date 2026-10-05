import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { History, Home, ScanEye, Settings } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { Radius, Shadow, Spacing } from '@/constants/colors';

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useApp();

  const tabs = [
    { path: '/home', label: t.home.title, icon: Home },
    { path: '/cataract-check', label: t.cataract.title, icon: ScanEye },
    { path: '/history', label: t.home.history, icon: History },
    { path: '/settings', label: t.home.settings, icon: Settings },
  ] as const;

  return (
    <View style={styles.bar}>
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path;
        const color = active ? Colors.primary : '#C4CAD6';
        return (
          <TouchableOpacity
            key={path}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => {
              if (!active) router.replace(path);
            }}
          >
            <Icon size={26} color={color} fill={active ? `${Colors.primary}33` : 'none'} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    ...Shadow.card,
    shadowOffset: { width: 0, height: -4 },
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.xs },
  label: { fontSize: 11, fontWeight: '700' },
});
