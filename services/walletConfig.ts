import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── Secure operator-wallet storage ─────────────────────────────────────────
//
// The ONA operator wallet (a funded Starknet Sepolia account that owns the
// ImpactRegistry contract) is used only to sign anchoring transactions.
//
// Storage is cross-platform:
//   • native  → device keychain / keystore via expo-secure-store
//   • web     → localStorage (SecureStore is unavailable in the browser)
//
// A wallet may also be seeded from EXPO_PUBLIC_STARKNET_* env vars (see .env,
// which is gitignored) so the app can run in real mode without manual entry.
// The private key is never held in React state and is read transiently only
// at the moment a proof is anchored.

const ADDRESS_KEY = 'ona.wallet.address';
const PRIVATE_KEY = 'ona.wallet.privateKey';

const isWeb = Platform.OS === 'web';

export type WalletConfig = {
  address: string;
  privateKey: string;
};

// ─── Cross-platform key/value storage ───────────────────────────────────────

async function storageGet(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* ignore quota / unavailable storage */
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ─── Validation ─────────────────────────────────────────────────────────────

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

// ─── Environment-seeded wallet (optional) ────────────────────────────────────

/**
 * Read a wallet from EXPO_PUBLIC_STARKNET_* env vars, if both are present and
 * valid. Used as a fallback when no wallet has been saved on the device.
 * Note: EXPO_PUBLIC_* values are inlined into the client bundle — only use a
 * dedicated testnet operator key here, never a mainnet or personal wallet.
 */
export function getEnvWalletConfig(): WalletConfig | null {
  const address = process.env.EXPO_PUBLIC_STARKNET_ACCOUNT_ADDRESS?.trim();
  const privateKey = process.env.EXPO_PUBLIC_STARKNET_PRIVATE_KEY?.trim();
  if (!address || !privateKey) return null;
  if (!isHex(address) || !isHex(privateKey)) return null;
  return { address, privateKey };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Persist the operator wallet securely. Validates before writing. */
export async function saveWalletConfig(address: string, privateKey: string): Promise<WalletConfig> {
  const cfg = validateWalletConfig(address, privateKey);
  await storageSet(ADDRESS_KEY, cfg.address);
  await storageSet(PRIVATE_KEY, cfg.privateKey);
  return cfg;
}

/**
 * Read the full operator wallet (address + private key). Prefers a wallet
 * saved on the device, then falls back to the env-seeded wallet. Returns null
 * if neither is configured.
 */
export async function getWalletConfig(): Promise<WalletConfig | null> {
  const [address, privateKey] = await Promise.all([
    storageGet(ADDRESS_KEY),
    storageGet(PRIVATE_KEY),
  ]);
  if (address && privateKey) return { address, privateKey };
  return getEnvWalletConfig();
}

/**
 * Read only the wallet address (safe to surface in the UI). Prefers a saved
 * wallet, then the env-seeded wallet. Returns null if none is configured.
 */
export async function getWalletAddress(): Promise<string | null> {
  const stored = await storageGet(ADDRESS_KEY);
  if (stored) return stored;
  return getEnvWalletConfig()?.address ?? null;
}

/** Remove the operator wallet from device storage (env fallback still applies). */
export async function clearWalletConfig(): Promise<void> {
  await Promise.all([storageDelete(ADDRESS_KEY), storageDelete(PRIVATE_KEY)]);
}
