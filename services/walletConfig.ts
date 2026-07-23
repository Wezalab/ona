import * as SecureStore from 'expo-secure-store';

// ─── Secure operator-wallet storage ─────────────────────────────────────────
//
// The ONA operator wallet (a funded Starknet Sepolia account that owns the
// ImpactRegistry contract) is used only to sign anchoring transactions.
// The private key is stored in the device keychain / keystore via
// expo-secure-store — never in AsyncStorage, React state, or logs — and is
// read transiently at the moment a proof is anchored.

const ADDRESS_KEY = 'ona.wallet.address';
const PRIVATE_KEY = 'ona.wallet.privateKey';

export type WalletConfig = {
  address: string;
  privateKey: string;
};

/** A 0x-prefixed hex string of 1–64 hex chars. */
function isHex(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(value.trim());
}

/**
 * Validate a wallet address + private key pair.
 * Throws with a human-readable message when invalid.
 */
export function validateWalletConfig(address: string, privateKey: string): WalletConfig {
  const addr = address.trim();
  const pk = privateKey.trim();
  if (!isHex(addr)) {
    throw new Error('Invalid account address — expected a 0x hex value.');
  }
  if (!isHex(pk)) {
    throw new Error('Invalid private key — expected a 0x hex value.');
  }
  return { address: addr, privateKey: pk };
}

/** Persist the operator wallet securely. Validates before writing. */
export async function saveWalletConfig(address: string, privateKey: string): Promise<WalletConfig> {
  const cfg = validateWalletConfig(address, privateKey);
  await SecureStore.setItemAsync(ADDRESS_KEY, cfg.address);
  await SecureStore.setItemAsync(PRIVATE_KEY, cfg.privateKey);
  return cfg;
}

/** Read the full operator wallet (address + private key), or null if unset. */
export async function getWalletConfig(): Promise<WalletConfig | null> {
  const [address, privateKey] = await Promise.all([
    SecureStore.getItemAsync(ADDRESS_KEY),
    SecureStore.getItemAsync(PRIVATE_KEY),
  ]);
  if (!address || !privateKey) return null;
  return { address, privateKey };
}

/**
 * Read only the wallet address (safe to surface in the UI). Returns null if
 * no wallet is configured.
 */
export async function getWalletAddress(): Promise<string | null> {
  return SecureStore.getItemAsync(ADDRESS_KEY);
}

/** Remove the operator wallet from secure storage. */
export async function clearWalletConfig(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ADDRESS_KEY),
    SecureStore.deleteItemAsync(PRIVATE_KEY),
  ]);
}
