import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import {
  Camera,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  SkipForward,
} from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { FontSize, Radius, Spacing } from "@/constants/colors";
import { Button, StepProgress } from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

type EyeBeingCaptured = "right" | "left";

export default function EyeCaptureScreen() {
  const router = useRouter();
  const { t, updateEyeImages } = useApp();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [currentEye, setCurrentEye] = useState<EyeBeingCaptured>("right");
  const [rightEyeImage, setRightEyeImage] = useState<string | null>(null);
  const [leftEyeImage, setLeftEyeImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={Colors.textSecondary} />
          <Text style={styles.permissionTitle}>Permission Caméra Requise</Text>
          <Text style={styles.permissionText}>
            Nous avons besoin d&apos;accéder à votre caméra pour capturer des
            images de l&apos;œil.
          </Text>
          <Button title="Autoriser la Caméra" onPress={requestPermission} />
          <Button
            title={t.eyeImage.skipAllPhotos}
            onPress={() => router.push("/screening-results")}
            variant="ghost"
          />
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
        console.error("Error taking picture:", error);
        Alert.alert(t.error, "Erreur lors de la capture de la photo", [
          { text: "OK" },
        ]);
      }
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
  };

  const finishCapture = (rightUri: string | null, leftUri: string | null) => {
    if (!rightUri && !leftUri) {
      router.push("/screening-results");
      return;
    }
    const now = Date.now();
    updateEyeImages({
      rightEye: rightUri ? { imageUri: rightUri, capturedAt: now } : undefined,
      leftEye: leftUri ? { imageUri: leftUri, capturedAt: now } : undefined,
      reviewStatus: "pending",
    });
    router.push("/eye-photo-review");
  };

  const commitEye = (uri: string | null) => {
    if (currentEye === "right") {
      setRightEyeImage(uri);
      setPreviewImage(null);
      setCurrentEye("left");
    } else {
      setLeftEyeImage(uri);
      setPreviewImage(null);
      finishCapture(rightEyeImage, uri);
    }
  };

  const handleUsePhoto = () => {
    if (!previewImage) return;
    commitEye(previewImage);
  };

  const handleSkipEye = () => commitEye(null);
  const handleSkipAll = () => router.push("/screening-results");

  if (previewImage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.eyeImage.qualityCheck}</Text>
            <Text style={styles.subtitle}>
              {currentEye === "right" ? t.results.rightEye : t.results.leftEye}
            </Text>
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />

            <View style={styles.savedBadge}>
              <CheckCircle2 size={20} color={Colors.success} />
              <Text style={styles.savedBadgeText}>{t.eyeImage.photoSaved}</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                {t.eyeImage.qualityPoorReason}
              </Text>
            </View>
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.stepBarWrap}>
            <StepProgress steps={steps} currentStepIndex={3} />
          </View>

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.surface} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{t.eyeImage.captureTitle}</Text>
              <Text style={styles.subtitle}>
                {currentEye === "right"
                  ? t.results.rightEye
                  : t.results.leftEye}
              </Text>
            </View>
            {currentEye === "right" ? (
              <TouchableOpacity
                onPress={handleSkipAll}
                style={styles.headerSkipButton}
              >
                <SkipForward size={20} color={Colors.surface} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>

          <View style={styles.cameraContainer}>
            {Platform.OS !== "web" ? (
              <CameraView ref={cameraRef} style={styles.camera} facing="back">
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
            <Text style={styles.optionalNote}>{t.eyeImage.optionalNote}</Text>
            <View style={styles.instructionItem}>
              <CheckCircle2 size={18} color={Colors.success} />
              <Text style={styles.instructionText}>
                {t.eyeImage.goodLighting}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <CheckCircle2 size={18} color={Colors.success} />
              <Text style={styles.instructionText}>
                {t.eyeImage.holdSteady}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <CheckCircle2 size={18} color={Colors.success} />
              <Text style={styles.instructionText}>
                {t.eyeImage.openEyeWide}
              </Text>
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
            <Text style={styles.captureButtonText}>
              {t.eyeImage.capturePhoto}
            </Text>

            <TouchableOpacity
              onPress={handleSkipEye}
              activeOpacity={0.7}
              style={styles.skipEyeButton}
            >
              <Text style={styles.skipEyeText}>{t.eyeImage.skipEye}</Text>
            </TouchableOpacity>
          </View>

          {(rightEyeImage || leftEyeImage) && (
            <View style={styles.progress}>
              <View
                style={[
                  styles.progressDot,
                  rightEyeImage && styles.progressDotCompleted,
                ]}
              />
              <View
                style={[
                  styles.progressDot,
                  leftEyeImage && styles.progressDotCompleted,
                ]}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  stepBarWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    gap: Spacing.lg,
  },
  permissionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  permissionText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 40,
  },
  headerSkipButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.surface,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aimCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  webCameraPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  webCameraText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  instructions: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  optionalNote: {
    fontSize: FontSize.xs,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  instructionText: {
    fontSize: FontSize.base,
    color: Colors.surface,
  },
  captureButtonContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    gap: Spacing.sm,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.surface,
  },
  skipEyeButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  skipEyeText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    textDecorationLine: "underline",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  savedBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.successLight,
  },
  savedBadgeText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.success,
  },
  warningBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  warningText: {
    fontSize: FontSize.base,
    color: Colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
  },
  retakeButton: {
    backgroundColor: Colors.surface,
  },
  retakeButtonText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
  },
  useButton: {
    backgroundColor: Colors.primary,
  },
  useButtonText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.surface,
  },
});
