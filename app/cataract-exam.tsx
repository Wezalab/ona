import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CheckCircle2, Eye, ShieldCheck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import {
  RISK_FACTOR_KEYS,
  SYMPTOM_KEYS,
  VA_SCALE,
  assessExam,
  type CataractEyeExam,
  type CataractExamRecord,
  type LensGrade,
  type RiskFactorKey,
  type SymptomDuration,
  type SymptomKey,
} from '@/constants/cataractExam';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import { Button, Card, ChoiceChips, GradientCard, ScreenHeader, StepProgress, TextField } from '@/components/ui';
import CataractSummary from '@/components/cataract/CataractSummary';

type Side = 'rightEye' | 'leftEye';
type EyeDraft = Partial<CataractEyeExam>;

const SIDES: Side[] = ['rightEye', 'leftEye'];
const vaOptions = VA_SCALE.map((v) => ({ value: v, label: v }));

export default function CataractExamScreen() {
  const router = useRouter();
  const { t, saveCataractExam } = useApp();
  const c = t.cataractExam;
  const cameraRef = useRef<CameraView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStepState] = useState(0);
  const setStep = (next: number) => {
    setStepState(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>();
  const [duration, setDuration] = useState<SymptomDuration | undefined>();
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactorKey[]>([]);
  const [eyes, setEyes] = useState<Record<Side, EyeDraft>>({ rightEye: { leukocoria: false }, leftEye: { leukocoria: false } });
  const [capturing, setCapturing] = useState<Side | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<CataractExamRecord | null>(null);

  const eyeLabel: Record<Side, string> = { rightEye: c.rightEyeLabel, leftEye: c.leftEyeLabel };
  const steps = [c.stepRegistration, c.stepHistory, c.stepVision, c.stepTorch, c.stepLens, c.stepPhotos, c.stepSummary];

  const setEye = (side: Side, patch: EyeDraft) => setEyes((prev) => ({ ...prev, [side]: { ...prev[side], ...patch } }));
  const toggle = <T extends string>(list: T[], setList: (v: T[]) => void, key: T) =>
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  const stepValid = (() => {
    switch (step) {
      case 2: return SIDES.every((s) => eyes[s].vaUnaided && eyes[s].vaPinhole);
      case 3: return SIDES.every((s) => eyes[s].redReflex && eyes[s].pupil);
      case 4: return SIDES.every((s) => eyes[s].nuclear !== undefined && eyes[s].cortical !== undefined && eyes[s].psc !== undefined);
      default: return true;
    }
  })();

  const complete = (): { right: CataractEyeExam; left: CataractEyeExam } => ({
    right: eyes.rightEye as CataractEyeExam,
    left: eyes.leftEye as CataractEyeExam,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { right, left } = complete();
      const record: CataractExamRecord = {
        id: `cataract_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        patientInfo: { patientId: patientId.trim() || undefined, age: age.trim() || undefined, gender },
        duration,
        symptoms,
        riskFactors,
        rightEye: right,
        leftEye: left,
        assessment: assessExam(right, left),
      };
      await saveCataractExam(record);
      setSaved(record);
    } catch (error) {
      console.error('Error saving cataract exam:', error);
      Alert.alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  const takePhoto = async () => {
    try {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (shot && capturing) setEye(capturing, { photoUri: shot.uri });
      setCapturing(null);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t.error);
    }
  };

  const openCamera = async (side: Side) => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setCapturing(side);
  };

  // ── Saved confirmation ──────────────────────────────────────────────────
  if (saved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader variant="bar" title={c.title} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <GradientCard gradient="success">
            <View style={styles.row}>
              <CheckCircle2 size={32} color="#FFFFFF" />
              <Text style={styles.gradTitle}>{c.savedTitle}</Text>
            </View>
          </GradientCard>
          <Card elevated style={styles.rounded}>
            <View style={styles.row}>
              <ShieldCheck size={22} color={Colors.primary} />
              <Text style={[styles.body, styles.flex]}>{c.savedBody}</Text>
            </View>
          </Card>
          <Button title={c.openBlockchain} icon={ShieldCheck} onPress={() => router.replace('/blockchain')} />
          <Button title={c.backHome} variant="outline" onPress={() => router.replace('/home')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Full-screen camera ──────────────────────────────────────────────────
  if (capturing) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.dark]}>
        <Text style={styles.cameraTitle}>{eyeLabel[capturing]}</Text>
        <View style={styles.cameraFrame}>
          <CameraView ref={cameraRef} style={styles.flex} facing="back" />
        </View>
        <View style={styles.cameraActions}>
          <Button title={c.addPhoto} icon={Camera} onPress={takePhoto} />
          <Button title={c.cancel} variant="ghost" onPress={() => setCapturing(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Step content ────────────────────────────────────────────────────────
  const eyeCard = (side: Side, body: React.ReactNode) => (
    <Card key={side} elevated style={styles.rounded}>
      <View style={styles.row}>
        <Eye size={20} color={Colors.primary} />
        <Text style={styles.cardTitle}>{eyeLabel[side]}</Text>
      </View>
      {body}
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.stepTitle}>{c.regTitle}</Text>
            <Text style={styles.help}>{c.regSubtitle}</Text>
            <TextField label={t.patientInfo.patientId} value={patientId} onChangeText={setPatientId} placeholder={t.patientInfo.patientIdPlaceholder} />
            <TextField label={t.patientInfo.age} value={age} onChangeText={setAge} placeholder={t.patientInfo.agePlaceholder} keyboardType="number-pad" />
            <Text style={styles.label}>{t.patientInfo.gender}</Text>
            <ChoiceChips
              value={gender}
              onChange={setGender}
              options={[
                { value: 'male', label: t.patientInfo.male },
                { value: 'female', label: t.patientInfo.female },
                { value: 'other', label: t.patientInfo.other },
              ]}
            />
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>{c.historyTitle}</Text>
            <Text style={styles.label}>{c.symptomsTitle}</Text>
            {SYMPTOM_KEYS.map((k) => (
              <SwitchRow
                key={k}
                label={{ blur: c.sBlur, glare: c.sGlare, color: c.sColor, night: c.sNight, double: c.sDouble, change: c.sChange }[k]}
                value={symptoms.includes(k)}
                onChange={() => toggle(symptoms, setSymptoms, k)}
              />
            ))}
            <Text style={styles.label}>{c.duration}</Text>
            <ChoiceChips
              value={duration}
              onChange={setDuration}
              options={[
                { value: 'short', label: c.durShort },
                { value: 'medium', label: c.durMedium },
                { value: 'long', label: c.durLong },
              ]}
            />
            <Text style={styles.label}>{c.riskTitle}</Text>
            {RISK_FACTOR_KEYS.map((k) => (
              <SwitchRow
                key={k}
                label={{ diabetes: c.rDiabetes, steroid: c.rSteroid, smoking: c.rSmoking, trauma: c.rTrauma, family: c.rFamily, hypertension: c.rHypertension }[k]}
                value={riskFactors.includes(k)}
                onChange={() => toggle(riskFactors, setRiskFactors, k)}
              />
            ))}
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>{c.visionTitle}</Text>
            <Text style={styles.help}>{c.visionHelp}</Text>
            {SIDES.map((s) =>
              eyeCard(
                s,
                <>
                  <Text style={styles.label}>{c.unaided}</Text>
                  <ChoiceChips value={eyes[s].vaUnaided} onChange={(v) => setEye(s, { vaUnaided: v })} options={vaOptions} />
                  <Text style={styles.label}>{c.pinhole}</Text>
                  <ChoiceChips value={eyes[s].vaPinhole} onChange={(v) => setEye(s, { vaPinhole: v })} options={vaOptions} />
                </>,
              ),
            )}
            <Text style={styles.help}>{c.vaLegend}</Text>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>{c.torchTitle}</Text>
            <Text style={styles.help}>{c.torchHelp}</Text>
            {SIDES.map((s) =>
              eyeCard(
                s,
                <>
                  <Text style={styles.label}>{c.redReflex}</Text>
                  <ChoiceChips
                    value={eyes[s].redReflex}
                    onChange={(v) => setEye(s, { redReflex: v })}
                    options={[
                      { value: 'normal', label: c.rrNormal },
                      { value: 'dim', label: c.rrDim },
                      { value: 'absent', label: c.rrAbsent },
                    ]}
                  />
                  <Text style={styles.label}>{c.pupilReaction}</Text>
                  <ChoiceChips
                    value={eyes[s].pupil}
                    onChange={(v) => setEye(s, { pupil: v })}
                    options={[
                      { value: 'normal', label: c.pupNormal },
                      { value: 'afferent', label: c.pupAfferent },
                    ]}
                  />
                  <SwitchRow label={c.leukocoria} value={!!eyes[s].leukocoria} onChange={() => setEye(s, { leukocoria: !eyes[s].leukocoria })} />
                </>,
              ),
            )}
          </>
        );
      case 4: {
        const gradeOptions = ([0, 1, 2, 3] as LensGrade[]).map((g) => ({ value: g, label: `${g} · ${[c.g0, c.g1, c.g2, c.g3][g]}` }));
        return (
          <>
            <Text style={styles.stepTitle}>{c.lensTitle}</Text>
            <Text style={styles.help}>{c.lensHelp}</Text>
            {SIDES.map((s) =>
              eyeCard(
                s,
                <>
                  <Text style={styles.label}>{c.nuclear}</Text>
                  <ChoiceChips value={eyes[s].nuclear} onChange={(v) => setEye(s, { nuclear: v })} options={gradeOptions} />
                  <Text style={styles.label}>{c.cortical}</Text>
                  <ChoiceChips value={eyes[s].cortical} onChange={(v) => setEye(s, { cortical: v })} options={gradeOptions} />
                  <Text style={styles.label}>{c.psc}</Text>
                  <ChoiceChips value={eyes[s].psc} onChange={(v) => setEye(s, { psc: v })} options={gradeOptions} />
                </>,
              ),
            )}
          </>
        );
      }
      case 5:
        return (
          <>
            <Text style={styles.stepTitle}>{c.photosTitle}</Text>
            <Text style={styles.help}>{c.photosHelp}</Text>
            {SIDES.map((s) =>
              eyeCard(
                s,
                <>
                  {eyes[s].photoUri ? <Image source={{ uri: eyes[s].photoUri }} style={styles.photo} /> : null}
                  <Button
                    title={eyes[s].photoUri ? t.cataract.retake : c.addPhoto}
                    icon={Camera}
                    variant="outline"
                    size="md"
                    onPress={() => openCamera(s)}
                  />
                </>,
              ),
            )}
          </>
        );
      default: {
        const { right, left } = complete();
        return (
          <>
            <Text style={styles.stepTitle}>{c.summaryTitle}</Text>
            <CataractSummary rightEye={right} leftEye={left} assessment={assessExam(right, left)} />
          </>
        );
      }
    }
  };

  const last = step === steps.length - 1;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader variant="bar" title={c.title} onBack={() => (step === 0 ? router.back() : setStep(step - 1))} />
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={step} />
      </View>
      <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>
      <View style={styles.footer}>
        {!stepValid ? <Text style={styles.warn}>{c.completeAll}</Text> : null}
        {last ? (
          <Button title={c.saveExam} icon={ShieldCheck} onPress={handleSave} loading={saving} />
        ) : (
          <Button title={c.next} onPress={() => setStep(step + 1)} disabled={!stepValid} />
        )}
      </View>
    </SafeAreaView>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.switchLabel, styles.flex]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: Colors.primaryLight, false: Colors.border }} thumbColor={value ? Colors.primary : '#FFFFFF'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  dark: { backgroundColor: '#000' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepBar: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  footer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.sm, backgroundColor: Colors.surface },
  warn: { fontSize: FontSize.sm, color: Colors.warningDark, textAlign: 'center' },
  stepTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.navy },
  help: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  label: { fontSize: FontSize.md, fontWeight: '700', color: Colors.navy, marginTop: Spacing.sm },
  rounded: { borderRadius: Radius.xl, gap: Spacing.md },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.navy },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 2 },
  switchLabel: { fontSize: FontSize.base, color: Colors.text },
  photo: { width: '100%', height: 180, borderRadius: Radius.lg },
  body: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  gradTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#FFFFFF' },
  cameraTitle: { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '700', textAlign: 'center', padding: Spacing.lg },
  cameraFrame: { flex: 1, marginHorizontal: Spacing.lg, borderRadius: Radius.xxl, overflow: 'hidden' },
  cameraActions: { padding: Spacing.xl, gap: Spacing.sm },
});
