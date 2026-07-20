import { RpcProvider, Account, Contract, Signer, hash, num } from 'starknet';

// ─── Network configuration ────────────────────────────────────────────────────

// Starknet Sepolia testnet — switch to 'SN_MAIN' after clinical validation.
// Using a plain string to avoid Metro bundler stripping the starknet constants object.
export const STARKNET_NETWORK = 'SN_SEPOLIA';

// Public Starknet Sepolia RPC (no API key needed). starknet.js 10.x speaks
// RPC spec 0.9+, so use the unversioned Cartridge endpoint (currently 0.9.0).
const SEPOLIA_RPC = 'https://api.cartridge.gg/x/starknet/sepolia';

// ONA Impact Registry contract on Sepolia.
// Updated automatically by contracts/scripts/deploy.sh after deployment.
export const ONA_IMPACT_CONTRACT_ADDRESS =
  '0x60992a96095dded8c0b44485cf793bff9692e228cb55730f5e92b2351405289';

// Typed ABI for the ImpactRegistry contract — mirrors contracts/src/lib.cairo
export const IMPACT_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'anchor_screening_proof',
    inputs: [
      { name: 'proof', type: 'core::felt252' },
      { name: 'timestamp', type: 'core::integer::u64' },
      { name: 'risk_level', type: 'core::integer::u8' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'get_anchored_count',
    inputs: [],
    outputs: [{ type: 'core::integer::u64' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'is_proof_anchored',
    inputs: [{ name: 'proof', type: 'core::felt252' }],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'get_owner',
    inputs: [],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view',
  },
  {
    type: 'event',
    name: 'ona_contracts::ImpactRegistry::ScreeningProofAnchored',
    kind: 'struct',
    members: [
      { name: 'proof', type: 'core::felt252', kind: 'key' },
      { name: 'timestamp', type: 'core::integer::u64', kind: 'data' },
      { name: 'risk_level', type: 'core::integer::u8', kind: 'data' },
      { name: 'anchored_at', type: 'core::integer::u64', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'ona_contracts::ImpactRegistry::OwnershipTransferred',
    kind: 'struct',
    members: [
      {
        name: 'previous_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
      {
        name: 'new_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    // Top-level Event enum — starknet.js requires this to be present alongside
    // the event structs, otherwise Contract construction throws
    // "inconsistency in ABI events definition."
    type: 'event',
    name: 'ona_contracts::ImpactRegistry::Event',
    kind: 'enum',
    variants: [
      {
        name: 'ScreeningProofAnchored',
        type: 'ona_contracts::ImpactRegistry::ScreeningProofAnchored',
        kind: 'nested',
      },
      {
        name: 'OwnershipTransferred',
        type: 'ona_contracts::ImpactRegistry::OwnershipTransferred',
        kind: 'nested',
      },
    ],
  },
] as const;

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

// ─── On-chain reads ───────────────────────────────────────────────────────────

/**
 * Read the total anchored proof count directly from the deployed contract.
 * Returns null if the contract is not yet deployed (zero address).
 */
export async function fetchAnchoredCount(): Promise<number | null> {
  if (ONA_IMPACT_CONTRACT_ADDRESS === '0x' + '0'.repeat(64)) return null;
  try {
    const provider = getProvider();
    const contract = new Contract({
      abi: IMPACT_REGISTRY_ABI,
      address: ONA_IMPACT_CONTRACT_ADDRESS,
      providerOrAccount: provider,
    });
    const count = await contract.get_anchored_count();
    return Number(count);
  } catch {
    return null;
  }
}

/**
 * Check on-chain whether a given proof has already been anchored.
 */
export async function checkProofAnchored(proof: string): Promise<boolean> {
  if (ONA_IMPACT_CONTRACT_ADDRESS === '0x' + '0'.repeat(64)) return false;
  try {
    const provider = getProvider();
    const contract = new Contract({
      abi: IMPACT_REGISTRY_ABI,
      address: ONA_IMPACT_CONTRACT_ADDRESS,
      providerOrAccount: provider,
    });
    return Boolean(await contract.is_proof_anchored(proof));
  } catch {
    return false;
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

export const RISK_CODE: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

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

// ─── On-chain write ───────────────────────────────────────────────────────────

export type AnchorParams = {
  /** Starknet account address of the ONA operator wallet */
  walletAddress: string;
  /** Private key of the ONA operator wallet (stored securely, never logged) */
  privateKey: string;
  record: ScreeningRecord;
};

/**
 * Submit a screening proof to the deployed ImpactRegistry contract.
 *
 * Prerequisites:
 *   1. ONA_IMPACT_CONTRACT_ADDRESS must be set to the deployed contract
 *   2. walletAddress + privateKey must belong to a funded Starknet Sepolia account
 *      that is the contract owner (set during deployment)
 *
 * Returns the transaction hash on success.
 */
export async function anchorScreeningProof(params: AnchorParams): Promise<string> {
  const { walletAddress, privateKey, record } = params;

  if (ONA_IMPACT_CONTRACT_ADDRESS === '0x' + '0'.repeat(64)) {
    throw new Error('Contract not deployed — run contracts/scripts/deploy.sh first');
  }

  const provider = getProvider();
  const signer = new Signer(privateKey);
  const account = new Account({ provider, address: walletAddress, signer });
  const { proof } = buildAnchorCalldata(record);

  const { transaction_hash } = await account.execute({
    contractAddress: ONA_IMPACT_CONTRACT_ADDRESS,
    entrypoint: 'anchor_screening_proof',
    calldata: [proof, num.toHex(record.timestamp), num.toHex(RISK_CODE[record.riskLevel])],
  });

  // Wait for transaction to be accepted on L2
  await provider.waitForTransaction(transaction_hash);

  return transaction_hash;
}

// ─── Explorer URLs ────────────────────────────────────────────────────────────

export function voyagerTxUrl(txHash: string): string {
  return `https://sepolia.voyager.online/tx/${txHash}`;
}

export function voyagerContractUrl(): string {
  return `https://sepolia.voyager.online/contract/${ONA_IMPACT_CONTRACT_ADDRESS}`;
}
