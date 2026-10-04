import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Camera, CheckCircle2, Eye, Lightbulb, Sun } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import { Badge, Button, Card, GradientCard, ScreenHeader } from '@/components/ui';

type Stage = 'intro' | 'capture' | 'result';

export default function CataractCheckScreen() {
  const router = useRouter();
  const { t } = useApp();
  const c = t.cataract;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('intro');
  const [photo, setPhoto] = useState<string | null>(null);

  const takePicture = async () => {
    try {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (shot) setPhoto(shot.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t.error);
    }
  };

  if (stage === 'capture') {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <Camera size={56} color={Colors.violet} />
            <Text style={styles.centerText}>{c.cameraPermission}</Text>
            <Button title={c.allowCamera} onPress={requestPermission} />
            <Button title={t.back} onPress={() => setStage('intro')} variant="ghost" />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader variant="bar" title={c.title} onBack={() => setStage('intro')} />
        <View style={styles.captureBody}>
          <Text style={styles.centerText}>{c.whichEye}</Text>
          <View style={styles.frame}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.camera} />
            ) : (
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            )}
          </View>
          {photo ? (
            <View style={styles.actions}>
              <Button title={c.usePhoto} icon={CheckCircle2} onPress={() => setStage('result')} />
              <Button title={c.retake} variant="outline" onPress={() => setPhoto(null)} />
            </View>
          ) : (
            <Button title={c.takePhoto} icon={Camera} onPress={takePicture} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (stage === 'result') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader variant="bar" title={c.title} />
        <ScrollView contentContainerStyle={styles.scroll}>
          {photo ? <Image source={{ uri: photo }} style={styles.resultImage} /> : null}
          <GradientCard gradient="violet">
            <View style={styles.row}>
              <CheckCircle2 size={28} color="#fff" />
              <Text style={styles.gradTitle}>{c.resultTitle}</Text>
            </View>
            <View style={styles.badgeRow}>
              <Badge label={c.resultPending} tone="warning" dot />
            </View>
          </GradientCard>
          <Card tone="warning" accentBorder>
            <Text style={styles.body}>{c.resultBody}</Text>
          </Card>
          <Button title={c.done} onPress={() => router.replace('/home')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader variant="bar" title={c.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <GradientCard gradient="violet">
          <View style={styles.row}>
            <Eye size={32} color="#fff" />
            <Text style={[styles.gradTitle, styles.flex]}>{c.intro}</Text>
          </View>
        </GradientCard>

        <Card elevated>
          <View style={styles.row}>
            <AlertTriangle size={20} color={Colors.warning} />
            <Text style={styles.sectionTitle}>{c.signsTitle}</Text>
          </View>
          {[c.sign1, c.sign2, c.sign3, c.sign4].map((s) => (
            <Text key={s} style={styles.bullet}>• {s}</Text>
          ))}
        </Card>

        <Card elevated>
          <View style={styles.row}>
            <Sun size={20} color={Colors.indigo} />
            <Text style={styles.sectionTitle}>{c.tipsTitle}</Text>
          </View>
          {[c.tip1, c.tip2, c.tip3, c.tip4].map((s) => (
            <View key={s} style={styles.tipRow}>
              <Lightbulb size={14} color={Colors.amber} />
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}
        </Card>

        <Button title={c.startCapture} icon={Camera} onPress={() => setStage('capture')} />
        <Text style={styles.disclaimer}>{c.disclaimer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, gap: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  centerText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  captureBody: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
  frame: { flex: 1, borderRadius: Radius.xxl, overflow: 'hidden', borderWidth: 3, borderColor: Colors.violet },
  camera: { flex: 1 },
  actions: { gap: Spacing.sm },
  resultImage: { width: '100%', height: 220, borderRadius: Radius.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flex: { flex: 1 },
  badgeRow: { flexDirection: 'row', marginTop: Spacing.md },
  gradTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  bullet: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: Spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  bulletText: { fontSize: FontSize.base, color: Colors.textSecondary, flex: 1 },
  body: { fontSize: FontSize.base, color: Colors.text, lineHeight: 22 },
  disclaimer: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'center' },
});
