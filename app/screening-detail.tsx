import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform, Alert } from 'react-native';
import { ArrowLeft, FileText, User, Eye, Activity, Printer } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ScreeningDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, screenings } = useApp();

  const screening = screenings.find(s => s.id === id);

  if (!screening) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.surface} />
            </TouchableOpacity>
            <Text style={styles.title}>Screening Details</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Screening not found</Text>
          </View>
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

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
    }
  };

  const getRiskText = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return t.results.riskLow;
      case 'medium': return t.results.riskMedium;
      case 'high': return t.results.riskHigh;
    }
  };

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
            <div class="section-title">Visual Acuity Results</div>
            <div class="field">
              <div class="field-label">Right Eye</div>
              <div class="field-value">
                Score: ${screening.visualAcuity.rightEye.score}/10<br>
                Risk: <span class="risk-badge risk-${screening.visualAcuity.rightEye.risk}">${getRiskText(screening.visualAcuity.rightEye.risk)}</span>
              </div>
            </div>
            <div class="field">
              <div class="field-label">Left Eye</div>
              <div class="field-value">
                Score: ${screening.visualAcuity.leftEye.score}/10<br>
                Risk: <span class="risk-badge risk-${screening.visualAcuity.leftEye.risk}">${getRiskText(screening.visualAcuity.leftEye.risk)}</span>
              </div>
            </div>
          </div>
          ` : ''}

          ${screening.eyeImages ? `
          <div class="section">
            <div class="section-title">Eye Image Analysis</div>
            <div class="field">
              <div class="field-label">Right Eye</div>
              <div class="field-value">
                Quality: ${screening.eyeImages.rightEye.quality === 'good' ? 'Good' : 'Poor'}<br>
                AI Score: ${screening.eyeImages.rightEye.aiScore}/100<br>
                Risk: <span class="risk-badge risk-${screening.eyeImages.rightEye.risk}">${getRiskText(screening.eyeImages.rightEye.risk)}</span>
              </div>
            </div>
            <div class="field">
              <div class="field-label">Left Eye</div>
              <div class="field-value">
                Quality: ${screening.eyeImages.leftEye.quality === 'good' ? 'Good' : 'Poor'}<br>
                AI Score: ${screening.eyeImages.leftEye.aiScore}/100<br>
                Risk: <span class="risk-badge risk-${screening.eyeImages.leftEye.risk}">${getRiskText(screening.eyeImages.leftEye.risk)}</span>
              </div>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.title}>Screening Details</Text>
          <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
            <Printer size={24} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Patient Information</Text>
            </View>
            <View style={styles.infoCard}>
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
            </View>
          </View>

          {screening.visualAcuity && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Eye size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Visual Acuity Results</Text>
              </View>
              <View style={styles.resultsCard}>
                <View style={styles.eyeResult}>
                  <Text style={styles.eyeLabel}>{t.results.rightEye}</Text>
                  <Text style={styles.scoreText}>Score: {screening.visualAcuity.rightEye.score}/10</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.visualAcuity.rightEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(screening.visualAcuity.rightEye.risk) }]}>
                      {getRiskText(screening.visualAcuity.rightEye.risk)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.eyeResult}>
                  <Text style={styles.eyeLabel}>{t.results.leftEye}</Text>
                  <Text style={styles.scoreText}>Score: {screening.visualAcuity.leftEye.score}/10</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.visualAcuity.leftEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(screening.visualAcuity.leftEye.risk) }]}>
                      {getRiskText(screening.visualAcuity.leftEye.risk)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {screening.eyeImages && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Eye Image Analysis</Text>
              </View>
              <View style={styles.resultsCard}>
                <View style={styles.eyeResult}>
                  <Text style={styles.eyeLabel}>{t.results.rightEye}</Text>
                  <Text style={styles.detailText}>Quality: {screening.eyeImages.rightEye.quality === 'good' ? 'Good' : 'Poor'}</Text>
                  <Text style={styles.detailText}>AI Score: {screening.eyeImages.rightEye.aiScore}/100</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.eyeImages.rightEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(screening.eyeImages.rightEye.risk) }]}>
                      {getRiskText(screening.eyeImages.rightEye.risk)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.eyeResult}>
                  <Text style={styles.eyeLabel}>{t.results.leftEye}</Text>
                  <Text style={styles.detailText}>Quality: {screening.eyeImages.leftEye.quality === 'good' ? 'Good' : 'Poor'}</Text>
                  <Text style={styles.detailText}>AI Score: {screening.eyeImages.leftEye.aiScore}/100</Text>
                  <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.eyeImages.leftEye.risk)}20` }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(screening.eyeImages.leftEye.risk) }]}>
                      {getRiskText(screening.eyeImages.leftEye.risk)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Overall Assessment</Text>
            </View>
            <View style={styles.assessmentCard}>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Overall Risk:</Text>
                <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(screening.overallRisk)}20` }]}>
                  <Text style={[styles.riskText, { color: getRiskColor(screening.overallRisk) }]}>
                    {getRiskText(screening.overallRisk)}
                  </Text>
                </View>
              </View>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Referral:</Text>
                <Text style={[styles.referralText, { color: screening.referralNeeded ? Colors.warning : Colors.success }]}>
                  {screening.referralNeeded ? t.results.referralNeeded : 'No urgent referral needed'}
                </Text>
              </View>
            </View>
          </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  resultsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyeResult: {
    gap: 8,
  },
  eyeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  riskText: {
    fontSize: 13,
    fontWeight: '700',
  },
  assessmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  referralText: {
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginTop: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
