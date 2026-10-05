import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Eye, FileText, ScanEye, Server, ShieldCheck, Info } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Gradients, Radius, Shadow, Spacing } from '@/constants/colors';
import { Badge, BottomTabBar, GradientCard } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { t, screenings } = useApp();

  const total = screenings.length;
  const referrals = screenings.filter((s) => s.referralNeeded).length;
  const lowRisk = screenings.filter((s) => s.overallRisk === 'low').length;
  const recent = screenings.slice().reverse().slice(0, 3);

  const stats = [
    { icon: FileText, value: total, label: t.home.statTotal },
    { icon: AlertTriangle, value: referrals, label: t.home.statReferral },
    { icon: CheckCircle2, value: lowRisk, label: t.home.statHealthy },
  ];

  const riskLabel = (risk: 'low' | 'medium' | 'high') =>
    risk === 'low' ? t.results.riskLow : risk === 'medium' ? t.results.riskMedium : t.results.riskHigh;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <LinearGradient colors={[...Gradients.hero]} style={styles.avatar}>
              <Eye size={26} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.flex}>
              <Text style={styles.name}>{t.appName}</Text>
              <Text style={styles.role}>{t.home.role}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/api-settings')} activeOpacity={0.7}>
              <Server size={22} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <GradientCard gradient="hero" style={styles.banner}>
            <View style={styles.bannerCircleLg} />
            <View style={styles.bannerCircleSm} />
            <View style={styles.flex}>
              <Text style={styles.bannerSmall}>{t.home.newScreeningDesc}</Text>
              <Text style={styles.bannerTitle}>{t.home.newScreening}</Text>
              <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/patient-info')} activeOpacity={0.8}>
                <Text style={styles.bannerButtonText}>{t.home.startNow}</Text>
              </TouchableOpacity>
            </View>
            <Eye size={96} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          </GradientCard>

          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/cataract-check')}>
            <GradientCard gradient="pink" style={styles.miniBanner}>
              <ScanEye size={34} color="#FFFFFF" />
              <View style={styles.flex}>
                <Text style={styles.miniTitle}>{t.home.cataract}</Text>
                <Text style={styles.miniDesc}>{t.home.cataractDesc}</Text>
              </View>
              <ChevronRight size={22} color="#FFFFFF" />
            </GradientCard>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{t.home.statistics}</Text>
          <View style={styles.statsRow}>
            {stats.map(({ icon: Icon, value, label }) => (
              <LinearGradient key={label} colors={[...Gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statTile}>
                <Icon size={26} color="#FFFFFF" />
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
              </LinearGradient>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{t.home.recent}</Text>
            <TouchableOpacity style={styles.seeAll} onPress={() => router.replace('/history')} activeOpacity={0.8}>
              <Text style={styles.seeAllText}>{t.home.seeAll}</Text>
              <View style={styles.seeAllIcon}>
                <ArrowRight size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <Text style={styles.empty}>{t.home.noRecent}</Text>
          ) : (
            recent.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.recentCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/screening-detail?id=${s.id}`)}
              >
                <LinearGradient colors={[...Gradients.violet]} style={styles.recentAvatar}>
                  <FileText size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.flex}>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {s.patientInfo.patientId || `#${s.id.slice(-8)}`}
                  </Text>
                  <Text style={styles.recentDate}>{formatDate(s.timestamp)}</Text>
                </View>
                <Badge label={riskLabel(s.overallRisk)} tone={s.overallRisk as BadgeTone} size="sm" />
              </TouchableOpacity>
            ))
          )}

          <View style={styles.moreRow}>
            <TouchableOpacity style={styles.moreTile} onPress={() => router.push('/blockchain')} activeOpacity={0.8}>
              <ShieldCheck size={22} color={Colors.magenta} />
              <Text style={styles.moreText}>{t.home.blockchain}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreTile} onPress={() => router.push('/about')} activeOpacity={0.8}>
              <Info size={22} color={Colors.primary} />
              <Text style={styles.moreText}>{t.home.about}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>⚠️ {t.home.disclaimer}</Text>
        </ScrollView>
        <BottomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: Spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.navy },
  role: { fontSize: FontSize.sm, color: Colors.textSecondary },
  iconButton: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', ...Shadow.card,
  },
  banner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, minHeight: 170 },
  bannerCircleLg: { position: 'absolute', right: -40, top: -50, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.12)' },
  bannerCircleSm: { position: 'absolute', right: 70, bottom: -40, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.1)' },
  bannerSmall: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 2, marginBottom: Spacing.lg },
  bannerButton: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: Radius.pill,
    paddingVertical: 12, paddingHorizontal: Spacing.xxl,
  },
  bannerButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: FontSize.md },
  miniBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  miniTitle: { fontSize: FontSize.lg, fontWeight: '800', color: '#FFFFFF' },
  miniDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.navy, marginTop: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statTile: { flex: 1, borderRadius: Radius.xl, alignItems: 'center', paddingVertical: Spacing.xl, gap: 6, ...Shadow.card },
  statValue: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  seeAllText: { fontWeight: '700', color: Colors.navy },
  seeAllIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textSecondary, fontSize: FontSize.base },
  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.card,
  },
  recentAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.navy },
  recentDate: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  moreRow: { flexDirection: 'row', gap: Spacing.md },
  moreTile: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.card,
  },
  moreText: { fontWeight: '700', color: Colors.navy, flex: 1 },
  disclaimer: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
