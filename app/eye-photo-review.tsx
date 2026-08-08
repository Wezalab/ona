import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { ArrowRight, Camera, Clock } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import Colors, { FontSize, Radius, Spacing } from "@/constants/colors";
import {
  Badge,
  Button,
  Card,
  ScreenHeader,
  StepProgress,
} from "@/components/ui";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function EyePhotoReviewScreen() {
  const router = useRouter();
  const { t, currentScreening } = useApp();
  const eyeImages = currentScreening.eyeImages;

  useEffect(() => {
    if (!eyeImages) {
      router.replace("/screening-results");
    }
  }, [eyeImages, router]);

  if (!eyeImages) {
    return null;
  }

  const steps = [
    t.screeningFlow.stepPatient,
    t.screeningFlow.stepCalibration,
    t.screeningFlow.stepVisionTest,
    t.screeningFlow.stepPhotos,
    t.screeningFlow.stepResults,
  ];

  const entries = [
    { label: t.results.rightEye, photo: eyeImages.rightEye },
    { label: t.results.leftEye, photo: eyeImages.leftEye },
  ].filter((entry) => !!entry.photo);

  const handleContinue = () => {
    router.replace("/screening-results");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepBar}>
          <StepProgress steps={steps} currentStepIndex={3} />
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <ScreenHeader
            icon={Camera}
            title={t.eyePhotoReview.title}
            subtitle={t.eyePhotoReview.subtitle}
            compact
          />

          <View style={styles.content}>
            {entries.length === 0 ? (
              <Text style={styles.noPhotosText}>
                {t.eyePhotoReview.noPhotosMessage}
              </Text>
            ) : (
              entries.map((entry) => (
                <Card key={entry.label} elevated>
                  <View style={styles.cardHeader}>
                    <Text style={styles.eyeLabel}>{entry.label}</Text>
                    <Badge
                      label={t.eyePhotoReview.pendingBadge}
                      tone="warning"
                      dot
                    />
                  </View>
                  {entry.photo ? (
                    <Image
                      source={{ uri: entry.photo.imageUri }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : null}
                </Card>
              ))
            )}

            <View style={styles.noticeBox}>
              <Clock size={20} color={Colors.info} />
              <Text style={styles.noticeText}>
                {t.eyePhotoReview.savedMessage}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title={t.eyePhotoReview.continueButton}
              onPress={handleContinue}
              icon={ArrowRight}
              iconPosition="right"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  eyeLabel: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  noPhotosText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: Colors.infoLight,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  noticeText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
});
