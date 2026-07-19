/**
 * ONA ImpactRegistry — declare + deploy via starknet.js
 *
 * Why this instead of starkli: starkli 0.4.x bundles an older Sierra→CASM
 * compiler that rejects the Sierra version emitted by recent Scarb (1.9.2+).
 * starknet.js compiles nothing — it declares the Sierra + CASM that Scarb
 * already produced — so it stays compatible with the latest Cairo toolchain.
 *
 * Prerequisites:
 *   1. cd contracts && scarb build           (with casm = true in Scarb.toml)
 *   2. A funded Starknet Sepolia account
 *
 * Usage:
 *   export STARKNET_ACCOUNT_ADDRESS=0x014e9e...        # deployer / contract owner
 *   export STARKNET_PRIVATE_KEY=0x...                  # never committed or logged
 *   # optional: export STARKNET_RPC=https://...        # defaults to Cartridge v0.8
 *   npx tsx contracts/scripts/deploy-contract.ts
 *
 * To reveal the private key from a starkli keystore:
 *   starkli signer keystore inspect-private ~/.starkli-wallets/deployer/keystore.json --raw
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Account, RpcProvider, Signer, json } from 'starknet';

const CONTRACTS_DIR = resolve(__dirname, '..');
const REPO_ROOT = resolve(CONTRACTS_DIR, '..');
const TARGET_DIR = join(CONTRACTS_DIR, 'target', 'dev');

const SIERRA_PATH = join(TARGET_DIR, 'ona_contracts_ImpactRegistry.contract_class.json');
const CASM_PATH = join(TARGET_DIR, 'ona_contracts_ImpactRegistry.compiled_contract_class.json');
const SERVICE_PATH = join(REPO_ROOT, 'services', 'starknet.ts');

// starknet.js 10.x speaks RPC spec 0.9+, NOT 0.8. Use an endpoint on 0.9.0
// (the v0_8-pinned Cartridge URL returns -32603 on estimateFee here).
const RPC_URL = process.env.STARKNET_RPC ?? 'https://api.cartridge.gg/x/starknet/sepolia';
const ACCOUNT_ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS;
const PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;

function requireEnv(): void {
  const missing: string[] = [];
  if (!ACCOUNT_ADDRESS) missing.push('STARKNET_ACCOUNT_ADDRESS');
  if (!PRIVATE_KEY) missing.push('STARKNET_PRIVATE_KEY');
  if (missing.length > 0) {
    console.error(`\nMissing required env var(s): ${missing.join(', ')}`);
    console.error('\nExample:');
    console.error('  export STARKNET_ACCOUNT_ADDRESS=0x014e9e...');
    console.error('  export STARKNET_PRIVATE_KEY=$(starkli signer keystore inspect-private \\');
    console.error('    ~/.starkli-wallets/deployer/keystore.json --raw)');
    console.error('  npx tsx contracts/scripts/deploy-contract.ts\n');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  requireEnv();

  console.log('\n=== ONA ImpactRegistry — declare + deploy (starknet.js) ===\n');
  console.log(`  RPC     : ${RPC_URL}`);
  console.log(`  Deployer: ${ACCOUNT_ADDRESS}`);

  const sierra = json.parse(readFileSync(SIERRA_PATH, 'utf8'));
  const casm = json.parse(readFileSync(CASM_PATH, 'utf8'));

  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const signer = new Signer(PRIVATE_KEY as string);
  const account = new Account({ provider, address: ACCOUNT_ADDRESS as string, signer });

  // ── 1. Declare (skips if the class is already declared) ──────────────────────
  console.log('\n→ Declaring contract class...');
  const declareResponse = await account.declareIfNot({ contract: sierra, casm });
  const classHash = declareResponse.class_hash;

  if (declareResponse.transaction_hash) {
    console.log(`  Declare tx: ${declareResponse.transaction_hash}`);
    await provider.waitForTransaction(declareResponse.transaction_hash);
  } else {
    console.log('  Class already declared — skipping.');
  }
  console.log(`  Class hash: ${classHash}`);

  // ── 2. Deploy (constructor: owner = deployer address) ────────────────────────
  console.log('\n→ Deploying contract...');
  const deployResponse = await account.deployContract({
    classHash,
    constructorCalldata: [ACCOUNT_ADDRESS as string],
  });
  console.log(`  Deploy tx: ${deployResponse.transaction_hash}`);
  await provider.waitForTransaction(deployResponse.transaction_hash);

  const contractAddress = deployResponse.contract_address;

  console.log('\n=== Deployment successful! ===\n');
  console.log(`  Contract address : ${contractAddress}`);
  console.log(`  Class hash       : ${classHash}`);
  console.log(`  Owner            : ${ACCOUNT_ADDRESS}`);
  console.log(`  Network          : Starknet Sepolia`);
  console.log(`  Explorer         : https://sepolia.voyager.online/contract/${contractAddress}\n`);

  // ── 3. Patch services/starknet.ts with the live contract address ─────────────
  try {
    const service = readFileSync(SERVICE_PATH, 'utf8');
    const patched = service.replace(
      /export const ONA_IMPACT_CONTRACT_ADDRESS =\s*'0x[0-9a-fA-F]+';/,
      `export const ONA_IMPACT_CONTRACT_ADDRESS =\n  '${contractAddress}';`,
    );
    if (patched !== service) {
      writeFileSync(SERVICE_PATH, patched);
      console.log('→ Updated services/starknet.ts with the deployed contract address.\n');
    } else {
      console.log('→ Could not auto-patch services/starknet.ts. Set manually:');
      console.log(`   export const ONA_IMPACT_CONTRACT_ADDRESS = '${contractAddress}';\n`);
    }
  } catch {
    console.log('→ Set ONA_IMPACT_CONTRACT_ADDRESS manually in services/starknet.ts:');
    console.log(`   ${contractAddress}\n`);
  }

  console.log('Next: npm run test:starknet\n');
}

main().catch((err) => {
  console.error('\nDeployment failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
