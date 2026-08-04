import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, Alert, TouchableOpacity } from 'react-native';
import { FileText, User, Eye, Camera, Printer } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { RiskLevel } from '@/constants/visualAcuity';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Badge, Card, EmptyState, ScreenHeader, Section } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

export default function ScreeningDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, screenings } = useApp();

  const screening = screenings.find(s => s.id === id);

  if (!screening) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader variant="bar" title="Screening Details" onBack={() => router.back()} />
          <EmptyState icon={FileText} title="Screening not found" />
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

  const hasPhotos = !!(screening.eyeImages?.rightEye || screening.eyeImages?.leftEye);

  const handlePrint = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
            .logo { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            .subtitle { color: #6b7280; font-size: 14px; }
            .section { margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1e40af; display: flex; align-items: center; }
            .section-title::before { content: "●"; margin-right: 10px; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: 600; color: #4b5563; font-size: 14px; }
            .field-value { color: #1a1a1a; font-size: 16px; margin-top: 4px; }
            .risk-badge { display: inline-block; padding: 6px 16px; border-radius: 6px; font-weight: bold; font-size: 14px; }
            .risk-low { background: #dcfce7; color: #166534; }
            .risk-medium { background: #fef3c7; color: #92400e; }
            .risk-high { background: #fee2e2; color: #991b1b; }
            .disclaimer { margin-top: 40px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; }
            .disclaimer-title { font-weight: bold; margin-bottom: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 2px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ONA</div>
            <div class="subtitle">Eye Health Screening Report</div>
          </div>

          <div class="section">
            <div class="section-title">Patient Information</div>
            ${screening.patientInfo.patientId ? `<div class="field"><div class="field-label">Patient ID</div><div class="field-value">${screening.patientInfo.patientId}</div></div>` : ''}
            ${screening.patientInfo.age ? `<div class="field"><div class="field-label">Age</div><div class="field-value">${screening.patientInfo.age} years</div></div>` : ''}
            ${screening.patientInfo.gender ? `<div class="field"><div class="field-label">Gender</div><div class="field-value">${screening.patientInfo.gender === 'male' ? 'Male' : screening.patientInfo.gender === 'female' ? 'Female' : 'Other'}</div></div>` : ''}
            <div class="field"><div class="field-label">Screening Date</div><div class="field-value">${formatDate(screening.timestamp)}</div></div>
            ${screening.patientInfo.notes ? `<div class="field"><div class="field-label">Notes</div><div class="field-value">${screening.patientInfo.notes}</div></div>` : ''}
          </div>

          ${screening.visualAcuity ? `
          <div class="section">
            <div class="section-title">Visual Acuity Results (${screening.visualAcuity.distanceMeters}m test distance)</div>
            <div class="field">
              <div class="field-label">Right Eye</div>
              <div class="field-value">
                Snellen: ${screening.visualAcuity.rightEye.belowChart ? '&lt; ' : ''}${screening.visualAcuity.rightEye.snellen} (decimal ${screening.visualAcuity.rightEye.decimal})<br>
                Risk: <span class="risk-badge risk-${screening.visualAcuity.rightEye.risk}">${getRiskText(screening.visualAcuity.rightEye.risk)}</span>
              </div>
            </div>
            <div class="field">
              <div class="field-label">Left Eye</div>
              <div class="field-value">
                Snellen: ${screening.visualAcuity.leftEye.belowChart ? '&lt; ' : ''}${screening.visualAcuity.leftEye.snellen} (decimal ${screening.visualAcuity.leftEye.decimal})<br>
                Risk: <span class="risk-badge risk-${screening.visualAcuity.leftEye.risk}">${getRiskText(screening.visualAcuity.leftEye.risk)}</span>
              </div>
            </div>
          </div>
          ` : ''}

          ${hasPhotos ? `
          <div class="section">
            <div class="section-title">Eye Photos</div>
            <div class="field">
              <div class="field-value">Eye photos were captured and are pending specialist review. They do not affect the risk score above, which is based solely on the measured Visual Acuity result.</div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Overall Assessment</div>
            <div class="field">
              <div class="field-label">Overall Risk</div>
              <div class="field-value"><span class="risk-badge risk-${screening.overallRisk}">${getRiskText(screening.overallRisk)}</span></div>
            </div>
            <div class="field">
              <div class="field-label">Referral Needed</div>
              <div class="field-value">${screening.referralNeeded ? 'Yes - Referral Recommended' : 'No - No urgent referral needed'}</div>
            </div>
          </div>

          <div class="disclaimer">
            <div class="disclaimer-title">⚠️ Important Medical Notice</div>
            <p>This application is a SCREENING TOOL ONLY. It does not provide medical diagnosis or treatment. All results must be confirmed by a qualified health professional.</p>
          </div>

          <div class="footer">
            <p>Generated by ONA - Eye Health Screening Application</p>
            <p>Report ID: ${screening.id}</p>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Success', 'PDF generated successfully at: ' + uri);
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          variant="bar"
          title="Screening Details"
          onBack={() => router.back()}
          rightSlot={
            <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
              <Printer size={24} color={Colors.surface} />
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Section icon={User} title="Patient Information">
            <Card>
              {screening.patientInfo.patientId && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Patient ID:</Text>
                  <Text style={styles.infoValue}>{screening.patientInfo.patientId}</Text>
                </View>
              )}
              {screening.patientInfo.age && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{screening.patientInfo.age} years</Text>
                </View>
              )}
              {screening.patientInfo.gender && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>
                    {screening.patientInfo.gender === 'male' ? 'Male' : screening.patientInfo.gender === 'female' ? 'Female' : 'Other'}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(screening.timestamp)}</Text>
              </View>
              {screening.patientInfo.notes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Notes:</Text>
                  <Text style={styles.infoValue}>{screening.patientInfo.notes}</Text>
                </View>
              )}
            </Card>
          </Section>

          {screening.visualAcuity && (
            <Section icon={Eye} title={`${t.results.visualAcuityResults} · ${screening.visualAcuity.distanceMeters}m`}>
              <Card>
                {[
                  { label: t.results.rightEye, result: screening.visualAcuity.rightEye },
                  { label: t.results.leftEye, result: screening.visualAcuity.leftEye },
                ].map(({ label, result }, index) => (
                  <View key={label}>
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.eyeResult}>
                      <Text style={styles.eyeLabel}>{label}</Text>
                      <Text style={styles.scoreText}>
                        {result.belowChart ? `< ${result.snellen}` : result.snellen} ({result.decimal})
                      </Text>
                      <Badge label={getRiskText(result.risk)} tone={result.risk as BadgeTone} size="sm" />
                    </View>
                  </View>
                ))}
              </Card>
            </Section>
          )}

          {hasPhotos && (
            <Section icon={Camera} title={t.eyePhotoReview.title}>
              <Card tone="info" accentBorder>
                <Text style={styles.photosNoteText}>{t.eyePhotoReview.savedMessage}</Text>
              </Card>
            </Section>
          )}

          <Section icon={FileText} title="Overall Assessment">
            <Card style={styles.assessmentCard}>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Overall Risk:</Text>
                <Badge label={getRiskText(screening.overallRisk)} tone={screening.overallRisk as BadgeTone} />
              </View>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Referral:</Text>
                <Text style={[styles.referralText, { color: screening.referralNeeded ? Colors.warning : Colors.success }]}>
                  {screening.referralNeeded ? t.results.referralNeeded : 'No urgent referral needed'}
                </Text>
              </View>
            </Card>
          </Section>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Notice</Text>
            <Text style={styles.disclaimerText}>{t.about.disclaimerText}</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  printButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  eyeResult: {
    gap: Spacing.sm,
  },
  eyeLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  scoreText: {
    fontSize: FontSize.base,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  photosNoteText: {
    fontSize: FontSize.sm,
    lineHeight: 19,
    color: Colors.text,
  },
  assessmentCard: {
    gap: Spacing.lg,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  referralText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  disclaimerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
