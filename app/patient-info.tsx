import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { User, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import type { PatientInfo } from '@/contexts/AppContext';

export default function PatientInfoScreen() {
  const router = useRouter();
  const { t, startNewScreening, updatePatientInfo } = useApp();
  
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [notes, setNotes] = useState('');

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <User size={48} color={Colors.primary} />
          <Text style={styles.title}>{t.patientInfo.title}</Text>
          <Text style={styles.subtitle}>{t.patientInfo.subtitle}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{t.patientInfo.patientId}</Text>
            <TextInput
              style={styles.input}
              value={patientId}
              onChangeText={setPatientId}
              placeholder={t.patientInfo.patientIdPlaceholder}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t.patientInfo.age}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder={t.patientInfo.agePlaceholder}
              placeholderTextColor={Colors.textLight}
              keyboardType="number-pad"
            />
          </View>

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

          <View style={styles.field}>
            <Text style={styles.label}>{t.patientInfo.notes}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t.patientInfo.notesPlaceholder}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartScreening}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t.patientInfo.startScreening}</Text>
            <ArrowRight size={20} color={Colors.surface} />
          </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  genderTextSelected: {
    color: Colors.surface,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },
});
