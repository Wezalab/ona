import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { User, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import type { PatientInfo } from '@/contexts/AppContext';
import { Button, ScreenHeader, StepProgress, TextField } from '@/components/ui';

export default function PatientInfoScreen() {
  const router = useRouter();
  const { t, startNewScreening, updatePatientInfo } = useApp();

  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  const handleStartScreening = () => {
    if (age && (isNaN(parseInt(age, 10)) || parseInt(age, 10) < 0 || parseInt(age, 10) > 120)) {
      Alert.alert(t.error, 'Âge invalide. Veuillez entrer un âge entre 0 et 120.', [{ text: 'OK' }]);
      return;
    }

    startNewScreening();

    const info: PatientInfo = {
      patientId: patientId.trim() || undefined,
      age: age.trim() || undefined,
      gender,
      notes: notes.trim() || undefined,
    };

    updatePatientInfo(info);
    router.push('/va-calibration');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stepBar}>
        <StepProgress steps={steps} currentStepIndex={0} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader icon={User} title={t.patientInfo.title} subtitle={t.patientInfo.subtitle} compact />

          <View style={styles.form}>
            <TextField
              label={t.patientInfo.patientId}
              value={patientId}
              onChangeText={setPatientId}
              placeholder={t.patientInfo.patientIdPlaceholder}
            />

            <TextField
              label={t.patientInfo.age}
              value={age}
              onChangeText={setAge}
              placeholder={t.patientInfo.agePlaceholder}
              keyboardType="number-pad"
            />

            <View style={styles.field}>
              <Text style={styles.label}>{t.patientInfo.gender}</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonSelected]}
                  onPress={() => setGender('male')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>
                    {t.patientInfo.male}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonSelected]}
                  onPress={() => setGender('female')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>
                    {t.patientInfo.female}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'other' && styles.genderButtonSelected]}
                  onPress={() => setGender('other')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>
                    {t.patientInfo.other}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextField
              label={t.patientInfo.notes}
              value={notes}
              onChangeText={setNotes}
              placeholder={t.patientInfo.notesPlaceholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>

          <View style={styles.footer}>
            <Button title={t.patientInfo.startScreening} onPress={handleStartScreening} icon={ArrowRight} iconPosition="right" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  form: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.lg,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  genderTextSelected: {
    color: Colors.surface,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
});
