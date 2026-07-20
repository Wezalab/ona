/**
 * End-to-end write test: anchor one demo screening proof to the live
 * ImpactRegistry on Sepolia, then read back the count + membership.
 *
 * Usage:
 *   export STARKNET_ACCOUNT_ADDRESS=0x014e9e...
 *   export STARKNET_PRIVATE_KEY=0x...        # owner key, never logged
 *   npx tsx contracts/scripts/anchor-demo.ts
 */

import {
  anchorScreeningProof,
  buildAnchorCalldata,
  checkProofAnchored,
  fetchAnchoredCount,
  voyagerTxUrl,
  type ScreeningRecord,
} from '../../services/starknet';

const walletAddress = process.env.STARKNET_ACCOUNT_ADDRESS;
const privateKey = process.env.STARKNET_PRIVATE_KEY;

async function main(): Promise<void> {
  if (!walletAddress || !privateKey) {
    throw new Error('Set STARKNET_ACCOUNT_ADDRESS and STARKNET_PRIVATE_KEY');
  }

  // Unique demo record (timestamp = now) so the proof isn't already anchored.
  const record: ScreeningRecord = {
    id: 'demo-e2e',
    timestamp: Math.floor(Date.now() / 1000),
    riskLevel: 'high',
    facilityCode: 42,
  };

  const { proof } = buildAnchorCalldata(record);
  console.log('Demo proof   :', proof);

  const before = await fetchAnchoredCount();
  console.log('Count before :', before);

  console.log('\n→ Anchoring proof on-chain...');
  const txHash = await anchorScreeningProof({ walletAddress, privateKey, record });
  console.log('  Tx hash    :', txHash);
  console.log('  Explorer   :', voyagerTxUrl(txHash));

  const after = await fetchAnchoredCount();
  const anchored = await checkProofAnchored(proof);
  console.log('\nCount after  :', after);
  console.log('is_proof_anchored(proof):', anchored);

  if (after === (before ?? 0) + 1 && anchored) {
    console.log('\n✓ End-to-end write verified: count incremented and proof is anchored.');
  } else {
    console.log('\n✗ Unexpected result — check the tx on the explorer.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nAnchor test failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
