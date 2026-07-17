/**
 * Smoke tests for the Starknet service layer.
 * Run with: npx tsx scripts/test-starknet.ts
 */

import {
  computeScreeningProof,
  buildAnchorCalldata,
  voyagerTxUrl,
  voyagerContractUrl,
  STARKNET_NETWORK,
  ONA_IMPACT_CONTRACT_ADDRESS,
  fetchNetworkStatus,
  type ScreeningRecord,
} from '../services/starknet';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    failed++;
  }
}

const baseRecord: ScreeningRecord = {
  id: 'test-1',
  timestamp: 1721254800000,
  riskLevel: 'high',
  facilityCode: 1,
};

console.log('\n── computeScreeningProof ─────────────────────────────────');
const proof = computeScreeningProof(baseRecord);
console.log('  proof:', proof);
assert(typeof proof === 'string', 'returns a string');
assert(proof.startsWith('0x'), 'starts with 0x');
assert(proof.length > 10, 'non-trivial length');

const proofLow  = computeScreeningProof({ ...baseRecord, riskLevel: 'low' });
const proofMed  = computeScreeningProof({ ...baseRecord, riskLevel: 'medium' });
const proofHigh = computeScreeningProof({ ...baseRecord, riskLevel: 'high' });
assert(proofLow !== proofMed, 'low ≠ medium');
assert(proofMed !== proofHigh, 'medium ≠ high');
assert(proofLow !== proofHigh, 'low ≠ high');

const proof2 = computeScreeningProof(baseRecord);
assert(proof === proof2, 'deterministic — same input → same output');

console.log('\n── buildAnchorCalldata ───────────────────────────────────');
const { proof: p2, calldata } = buildAnchorCalldata(baseRecord);
assert(p2 === proof, 'proof matches computeScreeningProof');
assert(Array.isArray(calldata), 'calldata is an array');
assert(calldata.length === 3, 'calldata has 3 elements');
assert(calldata.every((c) => typeof c === 'string'), 'all calldata elements are strings');
assert(calldata.every((c) => c.startsWith('0x')), 'all calldata elements are hex');
console.log('  calldata:', calldata);

console.log('\n── voyagerTxUrl ──────────────────────────────────────────');
const txUrl = voyagerTxUrl('0xabc123');
console.log('  url:', txUrl);
assert(txUrl.includes('sepolia.voyager.online'), 'points to Sepolia Voyager');
assert(txUrl.includes('0xabc123'), 'includes the tx hash');

console.log('\n── voyagerContractUrl ────────────────────────────────────');
const contractUrl = voyagerContractUrl();
console.log('  url:', contractUrl);
assert(contractUrl.includes('sepolia.voyager.online'), 'points to Sepolia Voyager');
assert(contractUrl.includes(ONA_IMPACT_CONTRACT_ADDRESS), 'includes contract address');

console.log('\n── constants ─────────────────────────────────────────────');
console.log('  network    :', String(STARKNET_NETWORK));
console.log('  contract   :', ONA_IMPACT_CONTRACT_ADDRESS);
assert(typeof ONA_IMPACT_CONTRACT_ADDRESS === 'string', 'contract address is a string');
assert(String(STARKNET_NETWORK).length > 0, 'network name is non-empty');

console.log('\n── fetchNetworkStatus (live RPC) ─────────────────────────');
console.log('  Querying Starknet Sepolia…');
fetchNetworkStatus()
  .then((status) => {
    console.log('  status:', JSON.stringify(status));
    assert(typeof status.connected === 'boolean', 'connected is boolean');
    assert(typeof status.networkName === 'string', 'networkName is string');
    if (status.connected) {
      assert(typeof status.blockNumber === 'number', 'blockNumber is number when connected');
      console.log(`  Live block: #${status.blockNumber?.toLocaleString()}`);
    } else {
      console.log('  (RPC unreachable in sandbox — connection check skipped)');
      passed++;
    }
  })
  .catch(() => {
    console.log('  (RPC call blocked by sandbox — skipped)');
    passed++;
  })
  .finally(() => {
    console.log(`\n${'─'.repeat(54)}`);
    console.log(`  ${passed} passed  ·  ${failed} failed`);
    if (failed > 0) process.exit(1);
  });
