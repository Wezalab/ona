import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { t } from '@/constants/translations';
import { useAppContext } from '@/contexts/AppContext';
import { useRequireConsent } from '@/hooks/useRequireConsent';
import { useStarknet, type ScreeningProof } from '@/hooks/useStarknet';
import { ONA_IMPACT_CONTRACT_ADDRESS, STARKNET_NETWORK } from '@/services/starknet';

// Demo screenings to illustrate the proof queue
const DEMO_RECORDS = [
  { id: 'demo-1', timestamp: Date.now() - 86400000 * 2, riskLevel: 'low' as const, facilityCode: 1 },
  { id: 'demo-2', timestamp: Date.now() - 86400000, riskLevel: 'medium' as const, facilityCode: 1 },
  { id: 'demo-3', timestamp: Date.now() - 3600000, riskLevel: 'high' as const, facilityCode: 2 },
];

const RISK_COLOR: Record<string, string> = {
  low: '#4caf82',
  medium: '#f5a623',
  high: '#f86048',
};

function truncateHex(hex: string, chars = 10): string {
  if (!hex || hex.length <= chars * 2 + 3) return hex;
  return `${hex.slice(0, chars + 2)}…${hex.slice(-chars)}`;
}

function ProofCard({
  proof,
  onAnchor,
  onViewExplorer,
}: {
  proof: ScreeningProof;
  onAnchor: () => void;
  onViewExplorer: () => void;
}) {
  const date = new Date(proof.record.timestamp).toLocaleDateString();
  const riskColor = RISK_COLOR[proof.record.riskLevel] ?? colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
          <Text style={styles.riskBadgeText}>{proof.record.riskLevel.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
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

      {proof.error && (
        <Text style={styles.errorText}>{proof.error}</Text>
      )}

      <View style={styles.cardActions}>
        {proof.status === 'pending' && (
          <Pressable style={styles.anchorBtn} onPress={onAnchor}>
            <Text style={styles.anchorBtnText}>Anchor to Starknet</Text>
          </Pressable>
        )}
        {proof.status === 'anchoring' && (
          <Text style={styles.anchoringText}>Anchoring…</Text>
        )}
        {proof.status === 'anchored' && proof.txHash && (
          <Pressable style={styles.explorerBtn} onPress={onViewExplorer}>
            <Text style={styles.explorerBtnText}>View on Voyager</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function statusLabel(status: ScreeningProof['status']): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'anchoring': return 'Anchoring…';
    case 'anchored': return 'Anchored';
    case 'error': return 'Error';
  }
}

function statusBadgeStyle(status: ScreeningProof['status']) {
  switch (status) {
    case 'pending': return { backgroundColor: '#e0e0e0' };
    case 'anchoring': return { backgroundColor: '#fff3cd' };
    case 'anchored': return { backgroundColor: '#d4edda' };
    case 'error': return { backgroundColor: '#f8d7da' };
  }
}

export default function BlockchainScreen() {
  useRequireConsent();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useAppContext();
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

  const loadedDemos = DEMO_RECORDS.every((d) => proofQueue.some((p) => p.record.id === d.id));

  function loadDemoProofs() {
    for (const record of DEMO_RECORDS) {
      if (!proofQueue.some((p) => p.record.id === record.id)) {
        enqueueProof(record);
      }
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title}>{t(language, 'blockchain')}</Text>
      <Text style={styles.subtitle}>{t(language, 'blockchainSubtitle')}</Text>

      {/* Network status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(language, 'blockchainNetwork')}</Text>
        <View style={styles.networkCard}>
          <View style={styles.networkRow}>
            <View style={[styles.dot, { backgroundColor: network?.connected ? '#4caf82' : '#ccc' }]} />
            <Text style={styles.networkName}>
              {networkLoading ? 'Connecting…' : (network?.networkName ?? 'Starknet Sepolia')}
            </Text>
          </View>
          {network?.blockNumber != null && (
            <Text style={styles.networkDetail}>Block #{network.blockNumber.toLocaleString()}</Text>
          )}
          <Text style={styles.networkDetail}>
            Contract: {truncateHex(ONA_IMPACT_CONTRACT_ADDRESS)}
          </Text>
          <Text style={styles.networkDetail}>
            Network: {String(STARKNET_NETWORK)}
          </Text>
          <Pressable style={styles.refreshBtn} onPress={refreshNetwork}>
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {/* Impact summary */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>{t(language, 'blockchainPending')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{anchoredCount}</Text>
          <Text style={styles.statLabel}>{t(language, 'blockchainAnchored')}</Text>
        </View>
        {onChainCount !== null && (
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{onChainCount}</Text>
            <Text style={styles.statLabel}>On-chain total</Text>
          </View>
        )}
      </View>

      {/* Privacy notice */}
      <View style={styles.notice}>
        <Text style={styles.noticeText}>{t(language, 'blockchainPrivacy')}</Text>
      </View>

      {/* Proof queue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(language, 'blockchainProofs')}</Text>

        {proofQueue.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t(language, 'blockchainEmpty')}</Text>
            <Pressable style={styles.demoBtn} onPress={loadDemoProofs}>
              <Text style={styles.demoBtnText}>{t(language, 'blockchainLoadDemo')}</Text>
            </Pressable>
          </View>
        )}

        {!loadedDemos && proofQueue.length === 0 ? null : proofQueue.length > 0 && !loadedDemos && (
          <Pressable style={[styles.demoBtn, { marginBottom: 12 }]} onPress={loadDemoProofs}>
            <Text style={styles.demoBtnText}>{t(language, 'blockchainLoadDemo')}</Text>
          </Pressable>
        )}

        {proofQueue.map((proof) => (
          <ProofCard
            key={proof.record.id}
            proof={proof}
            onAnchor={() => anchorProof(proof.record.id)}
            onViewExplorer={() => {
              if (proof.txHash) {
                Linking.openURL(voyagerTxUrl(proof.txHash));
              }
            }}
          />
        ))}
      </View>

      {/* Back */}
      <Pressable style={styles.backBtn} onPress={() => router.push('/home' as never)}>
        <Text style={styles.backBtnText}>{t(language, 'backHome')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.65,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    opacity: 0.45,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  networkCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  networkName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  networkDetail: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.55,
    fontFamily: 'monospace',
  },
  refreshBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refreshBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'center',
  },
  notice: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  noticeText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.75,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
  },
  proofLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proofHash: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.secondary,
  },
  errorText: {
    fontSize: 12,
    color: '#c0392b',
    fontStyle: 'italic',
  },
  cardActions: {
    marginTop: 4,
  },
  anchorBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  anchorBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  anchoringText: {
    fontSize: 13,
    color: colors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  explorerBtn: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  explorerBtnText: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  demoBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  backBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
