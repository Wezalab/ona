import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RefreshCw, ShieldCheck, ExternalLink, Wallet, Trash2, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useStarknet, type ScreeningProof } from '@/hooks/useStarknet';
import { ONA_IMPACT_CONTRACT_ADDRESS, STARKNET_NETWORK, voyagerContractUrl } from '@/services/starknet';
import Colors, { FontSize, Radius, Spacing } from '@/constants/colors';
import { Badge, Button, Card, EmptyState, ScreenHeader, Section, TextField } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';

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
  const { t, screenings } = useApp();
  const {
    network,
    networkLoading,
    proofQueue,
    onChainCount,
    pendingCount,
    anchoredCount,
    walletAddress,
    hasWallet,
    saveWallet,
    clearWallet,
    refreshNetwork,
    enqueueProof,
    anchorProof,
    voyagerTxUrl,
  } = useStarknet();

  const [addressInput, setAddressInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [anchorAllBusy, setAnchorAllBusy] = useState(false);

  // ─── Auto-enqueue: load all local screenings into the proof queue ──────────
  // proofQueue is in-memory only, so we sync from AsyncStorage-backed screenings
  // every time this screen mounts (deduped by record.id).
  const enqueuedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const s of screenings) {
      if (!enqueuedIdsRef.current.has(s.id)) {
        enqueuedIdsRef.current.add(s.id);
        // enqueueProof is async — fires and forgets; status corrects itself
        void enqueueProof({
          id: s.id,
          timestamp: s.timestamp,
          riskLevel: s.overallRisk,
          facilityCode: 1,       // default facility (Blue Rock Optic, code 1)
          isReferral: s.referralNeeded,
        });
      }
    }
  }, [screenings, enqueueProof]);

  // ─── Anchor all pending proofs in sequence ────────────────────────────────
  const handleAnchorAll = useCallback(async () => {
    const pending = proofQueue.filter((p) => p.status === 'pending');
    if (pending.length === 0) return;
    setAnchorAllBusy(true);
    try {
      for (const p of pending) {
        await anchorProof(p.record.id);
      }
    } finally {
      setAnchorAllBusy(false);
    }
  }, [proofQueue, anchorProof]);

  const handleSaveWallet = async () => {
    setWalletBusy(true);
    setWalletError(null);
    try {
      await saveWallet(addressInput, keyInput);
      setAddressInput('');
      setKeyInput('');
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : String(err));
    } finally {
      setWalletBusy(false);
    }
  };

  const handleClearWallet = async () => {
    setWalletBusy(true);
    setWalletError(null);
    try {
      await clearWallet();
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : String(err));
    } finally {
      setWalletBusy(false);
    }
  };

  const statusLabel = (status: ScreeningProof['status']): string => {
    switch (status) {
      case 'pending': return t.blockchain.pending;
      case 'anchoring': return t.blockchain.anchoring;
      case 'anchored': return t.blockchain.anchored;
      case 'error': return t.error;
      default: return status;
    }
  };

  const statusTone = (status: ScreeningProof['status']): BadgeTone => {
    switch (status) {
      case 'pending': return 'neutral';
      case 'anchoring': return 'warning';
      case 'anchored': return 'success';
      case 'error': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader variant="bar" title={t.blockchain.title} onBack={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.subtitle}>{t.blockchain.subtitle}</Text>

          {/* Network status */}
          <Section icon={ShieldCheck} title={t.blockchain.network}>
            <Card>
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
              <Button
                title={t.blockchain.refresh}
                onPress={refreshNetwork}
                variant="outline"
                size="md"
                fullWidth={false}
                icon={RefreshCw}
                style={styles.refreshBtn}
              />
            </Card>
          </Section>

          {/* Operator wallet */}
          <Section icon={Wallet} title={t.blockchain.wallet}>
            <Badge
              label={hasWallet ? t.blockchain.realMode : t.blockchain.simulationMode}
              tone={hasWallet ? 'success' : 'warning'}
              dot
            />

            {hasWallet ? (
              <Card>
                <Text style={styles.walletOkText}>{t.blockchain.walletConfigured}</Text>
                <Text style={styles.networkDetail}>{truncateHex(walletAddress ?? '', 12)}</Text>
                <Button
                  title={t.blockchain.clearWallet}
                  onPress={handleClearWallet}
                  disabled={walletBusy}
                  variant="outline"
                  size="md"
                  icon={Trash2}
                  style={styles.clearBtn}
                />
              </Card>
            ) : (
              <Card style={styles.walletFormCard}>
                <Text style={styles.walletMissingText}>{t.blockchain.walletMissing}</Text>
                <TextField
                  label={t.blockchain.accountAddress}
                  value={addressInput}
                  onChangeText={setAddressInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="0x…"
                  monospace
                />
                <TextField
                  label={t.blockchain.privateKey}
                  value={keyInput}
                  onChangeText={setKeyInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  placeholder="0x…"
                  monospace
                />
                <Button
                  title={t.blockchain.saveWallet}
                  onPress={handleSaveWallet}
                  disabled={walletBusy}
                  loading={walletBusy}
                  size="md"
                />
              </Card>
            )}

            <Text style={styles.walletHint}>{t.blockchain.walletHint}</Text>
            {walletError && <Text style={styles.errorText}>{walletError}</Text>}
          </Section>

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
          <Card tone="info" accentBorder>
            <Text style={styles.noticeText}>{t.blockchain.privacy}</Text>
          </Card>

          {/* Proof queue */}
          <Section
            title={t.blockchain.proofs}
            rightSlot={
              pendingCount > 0 ? (
                <Button
                  title={anchorAllBusy ? t.blockchain.anchoring : `Anchor all (${pendingCount})`}
                  onPress={handleAnchorAll}
                  disabled={anchorAllBusy}
                  loading={anchorAllBusy}
                  icon={Zap}
                  size="md"
                  fullWidth={false}
                />
              ) : undefined
            }
          >
            {proofQueue.length === 0 ? (
              <EmptyState icon={ShieldCheck} title={t.blockchain.empty} />
            ) : (
              <View style={{ gap: Spacing.md }}>
                {proofQueue.map((proof) => (
                  <Card key={proof.record.id}>
                    <View style={styles.cardRow}>
                      <Badge label={proof.record.riskLevel.toUpperCase()} tone={proof.record.riskLevel as BadgeTone} size="sm" />
                      <Text style={styles.cardDate}>
                        {new Date(proof.record.timestamp).toLocaleDateString()}
                      </Text>
                      <Badge label={statusLabel(proof.status)} tone={statusTone(proof.status)} size="sm" />
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
                        <Button
                          title={t.blockchain.anchorToStarknet}
                          onPress={() => anchorProof(proof.record.id)}
                          size="md"
                        />
                      )}
                      {proof.status === 'anchoring' && (
                        <Text style={styles.anchoringText}>{t.blockchain.anchoring}</Text>
                      )}
                      {proof.status === 'anchored' && (
                        <TouchableOpacity
                          style={styles.explorerBtn}
                          activeOpacity={0.7}
                          onPress={() =>
                            Linking.openURL(
                              proof.txHash ? voyagerTxUrl(proof.txHash) : voyagerContractUrl(),
                            )
                          }
                        >
                          <ExternalLink size={16} color={Colors.primary} />
                          <Text style={styles.explorerBtnText}>{t.blockchain.viewOnVoyager}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </Section>

          <Button title={t.blockchain.backHome} onPress={() => router.push('/home')} variant="outline" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primaryDark },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.xl, gap: Spacing.xl },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 21 },
  networkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  networkName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text },
  networkDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: 'monospace' },
  refreshBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  walletFormCard: { gap: Spacing.md },
  walletOkText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.success },
  clearBtn: { marginTop: Spacing.sm },
  walletMissingText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  walletHint: { fontSize: FontSize.xs, color: Colors.textLight, lineHeight: 17 },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statBox: { flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center' },
  statValue: { fontSize: 30, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  noticeText: { fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardDate: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  proofLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proofHash: { fontSize: FontSize.xs, fontFamily: 'monospace', color: Colors.primaryDark, marginBottom: Spacing.xs },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, fontStyle: 'italic' },
  cardActions: { marginTop: Spacing.sm },
  anchoringText: { fontSize: FontSize.sm, color: Colors.primaryDark, fontStyle: 'italic', textAlign: 'center', paddingVertical: Spacing.sm },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
  },
  explorerBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.base },
});
