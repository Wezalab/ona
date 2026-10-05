import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { CataractAssessment, CataractEyeExam, EyeFinding, Urgency } from '@/constants/cataractExam';
import Colors, { FontSize, Gradients, Radius, Spacing } from '@/constants/colors';
import { Badge, Card } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

interface Props {
  rightEye: CataractEyeExam;
  leftEye: CataractEyeExam;
  assessment: CataractAssessment;
}

const FINDING_TONE: Record<EyeFinding, BadgeTone> = { normal: 'success', monitor: 'warning', cataract: 'danger', urgent: 'danger' };

/** Per-eye findings plus the overall referral advice. Used by the exam and the saved-exam view. */
export default function CataractSummary({ rightEye, leftEye, assessment }: Props) {
  const { t } = useApp();
  const c = t.cataractExam;

  const findingLabel: Record<EyeFinding, string> = {
    normal: c.findNormal,
    monitor: c.findMonitor,
    cataract: c.findCataract,
    urgent: c.findUrgent,
  };
  const urgencyLabel: Record<Urgency, string> = { routine: c.urgRoutine, soon: c.urgSoon, urgent: c.urgUrgent };
  const advice: Record<Urgency, string> =
    assessment.urgency === 'urgent'
      ? { routine: '', soon: '', urgent: c.recUrgent }
      : assessment.urgency === 'soon'
        ? { routine: '', soon: c.recCataract, urgent: '' }
        : { routine: assessment.overallRisk === 'medium' ? c.recMonitor : c.recRoutine, soon: '', urgent: '' };

  const gradient = assessment.urgency === 'routine' ? (assessment.overallRisk === 'low' ? 'success' : 'warning') : 'danger';
  const Icon = assessment.referralNeeded ? AlertTriangle : CheckCircle2;

  const eyes = [
    { label: c.rightEyeLabel, exam: rightEye, result: assessment.rightEye },
    { label: c.leftEyeLabel, exam: leftEye, result: assessment.leftEye },
  ];

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[...Gradients[gradient]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon size={34} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.heroTitle}>{urgencyLabel[assessment.urgency]}</Text>
          <Text style={styles.heroText}>{advice[assessment.urgency]}</Text>
        </View>
      </LinearGradient>

      {eyes.map(({ label, exam, result }) => (
        <Card key={label} elevated style={styles.eyeCard}>
          <View style={styles.eyeHead}>
            <Eye size={20} color={Colors.primary} />
            <Text style={styles.eyeTitle}>{label}</Text>
            <Badge label={findingLabel[result.finding]} tone={FINDING_TONE[result.finding]} size="sm" />
          </View>
          <View style={styles.facts}>
            <Text style={styles.fact}>
              {c.unaided}: <Text style={styles.bold}>{exam.vaUnaided}</Text> · {c.pinhole}: <Text style={styles.bold}>{exam.vaPinhole}</Text>
            </Text>
            <Text style={styles.fact}>
              {c.nuclear}: <Text style={styles.bold}>{exam.nuclear}</Text> · {c.cortical}: <Text style={styles.bold}>{exam.cortical}</Text> · {c.psc}: <Text style={styles.bold}>{exam.psc}</Text>
            </Text>
            <Text style={styles.fact}>
              {c.redReflex}: <Text style={styles.bold}>{exam.redReflex === 'normal' ? c.rrNormal : exam.redReflex === 'dim' ? c.rrDim : c.rrAbsent}</Text>
            </Text>
          </View>
          {exam.photoUri ? <Image source={{ uri: exam.photoUri }} style={styles.photo} /> : null}
        </Card>
      ))}

      <Text style={styles.disclaimer}>{c.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  flex: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.xl },
  heroIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFFFFF' },
  heroText: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.95)', marginTop: 4, lineHeight: 21 },
  eyeCard: { gap: Spacing.md, borderRadius: Radius.xl },
  eyeHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  eyeTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.navy, flex: 1 },
  facts: { gap: 4 },
  fact: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '800', color: Colors.navy },
  photo: { width: '100%', height: 160, borderRadius: Radius.lg },
  disclaimer: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
});
