import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Platform, Image } from 'react-native';
import { Camera, CheckCircle2, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

type EyeBeingCaptured = 'right' | 'left';

export default function EyeCaptureScreen() {
  const router = useRouter();
  const { t } = useApp();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [currentEye, setCurrentEye] = useState<EyeBeingCaptured>('right');
  const [rightEyeImage, setRightEyeImage] = useState<string | null>(null);
  const [leftEyeImage, setLeftEyeImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={Colors.textSecondary} />
          <Text style={styles.permissionTitle}>Permission Caméra Requise</Text>
          <Text style={styles.permissionText}>
            Nous avons besoin d&apos;accéder à votre caméra pour capturer des images de l&apos;œil.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la Caméra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          setPreviewImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert(t.error, 'Erreur lors de la capture de la photo', [{ text: 'OK' }]);
      }
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  const handleUsePhoto = () => {
    if (!previewImage) return;

    if (currentEye === 'right') {
      setRightEyeImage(previewImage);
      setPreviewImage(null);
      setCurrentEye('left');
    } else {
      setLeftEyeImage(previewImage);
      setPreviewImage(null);
      router.push('/ai-processing');
    }
  };

  const getQualityScore = (): number => {
    return Math.random() > 0.3 ? 0.8 : 0.4;
  };

  const isQualityGood = getQualityScore() >= 0.6;

  if (previewImage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.eyeImage.qualityCheck}</Text>
            <Text style={styles.subtitle}>
              {currentEye === 'right' ? t.results.rightEye : t.results.leftEye}
            </Text>
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
            
            <View style={[styles.qualityBadge, { backgroundColor: isQualityGood ? Colors.successLight : Colors.warningLight }]}>
              {isQualityGood ? (
                <CheckCircle2 size={20} color={Colors.success} />
              ) : (
                <AlertCircle size={20} color={Colors.warning} />
              )}
              <Text style={[styles.qualityText, { color: isQualityGood ? Colors.success : Colors.warning }]}>
                {isQualityGood ? t.eyeImage.qualityGood : t.eyeImage.qualityPoor}
              </Text>
            </View>
            
            {!isQualityGood && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{t.eyeImage.qualityPoorReason}</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={handleRetake}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color={Colors.text} />
              <Text style={styles.retakeButtonText}>{t.eyeImage.retake}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.useButton]}
              onPress={handleUsePhoto}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={20} color={Colors.surface} />
              <Text style={styles.useButtonText}>{t.eyeImage.usePhoto}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t.eyeImage.captureTitle}</Text>
            <Text style={styles.subtitle}>
              {currentEye === 'right' ? t.results.rightEye : t.results.leftEye}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.cameraContainer}>
          {Platform.OS !== 'web' ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.aimCircle} />
              </View>
            </CameraView>
          ) : (
            <View style={styles.webCameraPlaceholder}>
              <Camera size={64} color={Colors.textLight} />
              <Text style={styles.webCameraText}>
                Caméra disponible sur mobile uniquement
              </Text>
            </View>
          )}
        </View>

        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <CheckCircle2 size={20} color={Colors.success} />
            <Text style={styles.instructionText}>{t.eyeImage.goodLighting}</Text>
          </View>
          <View style={styles.instructionItem}>
            <CheckCircle2 size={20} color={Colors.success} />
            <Text style={styles.instructionText}>{t.eyeImage.holdSteady}</Text>
          </View>
          <View style={styles.instructionItem}>
            <CheckCircle2 size={20} color={Colors.success} />
            <Text style={styles.instructionText}>{t.eyeImage.openEyeWide}</Text>
          </View>
        </View>

        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            activeOpacity={0.7}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <Text style={styles.captureButtonText}>{t.eyeImage.capturePhoto}</Text>
        </View>

        {(rightEyeImage || leftEyeImage) && (
          <View style={styles.progress}>
            <View style={[styles.progressDot, rightEyeImage && styles.progressDotCompleted]} />
            <View style={[styles.progressDot, leftEyeImage && styles.progressDotCompleted]} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aimCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  webCameraPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  webCameraText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.surface,
  },
  captureButtonContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    gap: 8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textLight,
  },
  progressDotCompleted: {
    backgroundColor: Colors.success,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  qualityBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  warningBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: Colors.surface,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  useButton: {
    backgroundColor: Colors.primary,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});
