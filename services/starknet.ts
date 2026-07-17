import { RpcProvider, hash, num, constants as starkConstants } from 'starknet';

// ─── Network configuration ────────────────────────────────────────────────────

// Starknet Sepolia testnet — switch to MAINNET after clinical validation
export const STARKNET_NETWORK = starkConstants.NetworkName.SN_SEPOLIA;

// Public Starknet Sepolia RPC (no API key needed for reads)
const SEPOLIA_RPC = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

// ONA Impact Registry contract on Sepolia
// TODO: Replace with actual deployed contract address after running:
//   scarb build && starkli deploy target/dev/ona_ImpactRegistry.contract_class.json
export const ONA_IMPACT_CONTRACT_ADDRESS =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

// Expected ABI entry point for anchoring a screening proof
export const ANCHOR_SELECTOR = hash.getSelectorFromName('anchor_screening_proof');

// ─── Provider ─────────────────────────────────────────────────────────────────

let _provider: RpcProvider | null = null;

export function getProvider(): RpcProvider {
  if (!_provider) {
    _provider = new RpcProvider({ nodeUrl: SEPOLIA_RPC });
  }
  return _provider;
}

// ─── Network status ───────────────────────────────────────────────────────────

export type NetworkStatus = {
  connected: boolean;
  blockNumber: number | null;
  networkName: string;
};

export async function fetchNetworkStatus(): Promise<NetworkStatus> {
  try {
    const provider = getProvider();
    const block = await provider.getBlockWithTxs('latest');
    return {
      connected: true,
      blockNumber: block.block_number,
      networkName: 'Starknet Sepolia',
    };
  } catch {
    return {
      connected: false,
      blockNumber: null,
      networkName: 'Starknet Sepolia',
    };
  }
}

// ─── Proof computation ────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export type ScreeningRecord = {
  id: string;
  timestamp: number;
  riskLevel: RiskLevel;
  facilityCode: number;
};

const RISK_CODE: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

/**
 * Compute an anonymized Poseidon proof for a single screening.
 * Inputs are non-identifying: timestamp, risk level code, facility code.
 * No patient name, age, or image data is ever included.
 */
export function computeScreeningProof(record: ScreeningRecord): string {
  const riskCode = RISK_CODE[record.riskLevel];
  return hash.computePoseidonHash(
    num.toHex(record.timestamp),
    num.toHex(riskCode * 1000 + record.facilityCode),
  );
}

/**
 * Build the Starknet calldata for the `anchor_screening_proof` entry point.
 * Returns the hex-encoded proof and the calldata array ready for submission.
 */
export function buildAnchorCalldata(record: ScreeningRecord): {
  proof: string;
  calldata: string[];
} {
  const proof = computeScreeningProof(record);
  return {
    proof,
    calldata: [proof, num.toHex(record.timestamp), num.toHex(RISK_CODE[record.riskLevel])],
  };
}

/**
 * Construct a Voyager block-explorer URL for a given transaction hash.
 */
export function voyagerTxUrl(txHash: string): string {
  return `https://sepolia.voyager.online/tx/${txHash}`;
}

/**
 * Construct a Voyager block-explorer URL for the ONA contract.
 */
export function voyagerContractUrl(): string {
  return `https://sepolia.voyager.online/contract/${ONA_IMPACT_CONTRACT_ADDRESS}`;
}
