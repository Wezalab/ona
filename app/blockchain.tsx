import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useStarknet, type ScreeningProof } from '@/hooks/useStarknet';
import { ONA_IMPACT_CONTRACT_ADDRESS, STARKNET_NETWORK } from '@/services/starknet';
import Colors from '@/constants/colors';

const DEMO_RECORDS = [
  { id: 'demo-1', timestamp: Date.now() - 86400000 * 2, riskLevel: 'low' as const, facilityCode: 1 },
  { id: 'demo-2', timestamp: Date.now() - 86400000, riskLevel: 'medium' as const, facilityCode: 1 },
  { id: 'demo-3', timestamp: Date.now() - 3600000, riskLevel: 'high' as const, facilityCode: 2 },
];

function riskColor(risk: string): string {
  switch (risk) {
    case 'low': return Colors.success;
    case 'medium': return Colors.warning;
    case 'high': return Colors.danger;
    default: return Colors.primary;
  }
}

function truncateHex(hex: string, chars = 10): string {
  if (!hex || hex.length <= chars * 2 + 3) return hex;
  return `${hex.slice(0, chars + 2)}…${hex.slice(-chars)}`;
}

export default function BlockchainScreen() {
  const router = useRouter();
  const { t } = useApp();
  const {
    network,
    networkLoading,
    proofQueue,
    onChainCount,
    pendingCount,
    anchoredCount,
    refreshNetwork,
    enqueueProof,
    anchorProof,
    voyagerTxUrl,
  } = useStarknet();

  const statusLabel = (status: ScreeningProof['status']): string => {
    switch (status) {
      case 'pending': return t.blockchain.pending;
      case 'anchoring': return t.blockchain.anchoring;
      case 'anchored': return t.blockchain.anchored;
      case 'error': return t.error;
      default: return status;
    }
  };

  const statusBadgeStyle = (status: ScreeningProof['status']) => {
    switch (status) {
      case 'pending': return { backgroundColor: Colors.surfaceElevated };
      case 'anchoring': return { backgroundColor: Colors.warningLight };
      case 'anchored': return { backgroundColor: Colors.successLight };
      case 'error': return { backgroundColor: Colors.dangerLight };
      default: return { backgroundColor: Colors.surfaceElevated };
    }
  };

  function loadDemoProofs() {
    for (const record of DEMO_RECORDS) {
      if (!proofQueue.some((p) => p.record.id === record.id)) {
        enqueueProof(record);
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.blockchain.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.subtitle}>{t.blockchain.subtitle}</Text>

          {/* Network status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.blockchain.network}</Text>
            </View>
            <View style={styles.networkCard}>
              <View style={styles.networkRow}>
                <View style={[styles.dot, { backgroundColor: network?.connected ? Colors.success : Colors.disabled }]} />
                <Text style={styles.networkName}>
                  {networkLoading ? t.blockchain.connecting : (network?.networkName ?? 'Starknet Sepolia')}
                </Text>
              </View>
              {network?.blockNumber != null && (
                <Text style={styles.networkDetail}>Block #{network.blockNumber.toLocaleString()}</Text>
              )}
              <Text style={styles.networkDetail}>
                {t.blockchain.contract}: {truncateHex(ONA_IMPACT_CONTRACT_ADDRESS)}
              </Text>
              <Text style={styles.networkDetail}>{String(STARKNET_NETWORK)}</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={refreshNetwork} activeOpacity={0.7}>
                <RefreshCw size={16} color={Colors.primary} />
                <Text style={styles.refreshBtnText}>{t.blockchain.refresh}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Impact summary */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>{t.blockchain.pending}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{anchoredCount}</Text>
              <Text style={styles.statLabel}>{t.blockchain.anchored}</Text>
            </View>
            {onChainCount !== null && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{onChainCount}</Text>
                <Text style={styles.statLabel}>{t.blockchain.onChainTotal}</Text>
              </View>
            )}
          </View>

          {/* Privacy notice */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{t.blockchain.privacy}</Text>
          </View>

          {/* Proof queue */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.blockchain.proofs}</Text>
            </View>

            {proofQueue.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t.blockchain.empty}</Text>
                <TouchableOpacity style={styles.demoBtn} onPress={loadDemoProofs} activeOpacity={0.7}>
                  <Text style={styles.demoBtnText}>{t.blockchain.loadDemo}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              proofQueue.map((proof) => (
                <View key={proof.record.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={[styles.riskBadge, { backgroundColor: riskColor(proof.record.riskLevel) }]}>
                      <Text style={styles.riskBadgeText}>{proof.record.riskLevel.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.cardDate}>
                      {new Date(proof.record.timestamp).toLocaleDateString()}
                    </Text>
                    <View style={[styles.statusBadge, statusBadgeStyle(proof.status)]}>
                      <Text style={styles.statusText}>{statusLabel(proof.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.proofLabel}>Poseidon proof</Text>
                  <Text style={styles.proofHash}>{truncateHex(proof.proof)}</Text>

                  {proof.txHash && (
                    <>
                      <Text style={styles.proofLabel}>Tx hash</Text>
                      <Text style={styles.proofHash}>{truncateHex(proof.txHash)}</Text>
                    </>
                  )}

                  {proof.error && <Text style={styles.errorText}>{proof.error}</Text>}

                  <View style={styles.cardActions}>
                    {proof.status === 'pending' && (
                      <TouchableOpacity style={styles.anchorBtn} onPress={() => anchorProof(proof.record.id)} activeOpacity={0.8}>
                        <Text style={styles.anchorBtnText}>{t.blockchain.anchorToStarknet}</Text>
                      </TouchableOpacity>
                    )}
                    {proof.status === 'anchoring' && (
                      <Text style={styles.anchoringText}>{t.blockchain.anchoring}</Text>
                    )}
                    {proof.status === 'anchored' && proof.txHash && (
                      <TouchableOpacity
                        style={styles.explorerBtn}
                        activeOpacity={0.7}
                        onPress={() => proof.txHash && Linking.openURL(voyagerTxUrl(proof.txHash))}
                      >
                        <ExternalLink size={16} color={Colors.primary} />
                        <Text style={styles.explorerBtnText}>{t.blockchain.viewOnVoyager}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.push('/home')} activeOpacity={0.7}>
            <Text style={styles.backHomeText}>{t.blockchain.backHome}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.surface },
  placeholder: { width: 40 },
  content: { flex: 1 },
  contentContainer: { padding: 24, gap: 24 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 21 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  networkCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  networkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  networkName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  networkDetail: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'monospace' },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  refreshBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 30, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  notice: {
    backgroundColor: Colors.infoLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  noticeText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDate: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  riskBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.surface },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', color: Colors.text },
  proofLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proofHash: { fontSize: 12, fontFamily: 'monospace', color: Colors.primaryDark },
  errorText: { fontSize: 12, color: Colors.danger, fontStyle: 'italic' },
  cardActions: { marginTop: 4 },
  anchorBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  anchorBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  anchoringText: { fontSize: 13, color: Colors.primaryDark, fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  explorerBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 16 },
  emptyText: { fontSize: 14, color: Colors.textLight, textAlign: 'center' },
  demoBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  demoBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  backHomeBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backHomeText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
});
