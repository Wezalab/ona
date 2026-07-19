# ONA Impact Registry — Cairo Contract

Smart contract for anchoring anonymized eye screening proofs on Starknet.

## Privacy model

Only non-identifying data is recorded on-chain:

| Field | Type | Example |
|---|---|---|
| `proof` | `felt252` | Poseidon hash of (timestamp + risk_code + facility_code) |
| `timestamp` | `u64` | Unix seconds of screening event |
| `risk_level` | `u8` | 1 = low · 2 = medium · 3 = high |
| `anchored_at` | `u64` | Block timestamp when anchored |

No patient name, image, biometric, or any identifying field is ever submitted.

## Prerequisites

```bash
# Scarb (Cairo build tool)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# starkli (Starknet CLI)
curl https://get.starkli.sh | sh

# snforge (test runner)
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
```

## Build

```bash
cd contracts
scarb build
```

Outputs (with `casm = true` in `Scarb.toml`):
- `target/dev/ona_contracts_ImpactRegistry.contract_class.json` (Sierra)
- `target/dev/ona_contracts_ImpactRegistry.compiled_contract_class.json` (CASM)

## Test

```bash
cd contracts
snforge test
```

Expected: 7 tests, all passing.

## Deploy to Starknet Sepolia

### 1. Create and fund a Starknet account

```bash
# Create a keystore
starkli signer keystore new ~/.starkli-wallets/deployer/keystore.json

# Create an OpenZeppelin account
starkli account oz init ~/.starkli-wallets/deployer/account.json

# Deploy the account (needs ETH on Sepolia)
starkli account deploy ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json \
  --rpc https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_8

# Get test ETH from the faucet
# https://starknet-faucet.vercel.app/
```

### 2. Deploy

There are two deploy paths. **Prefer the starknet.js path** — recent Scarb
emits Sierra 1.9.2+, which the compiler bundled in `starkli` 0.4.x rejects
(`unsupported Sierra version`). starknet.js declares the Sierra + CASM that
Scarb already produced, so it stays compatible with the latest toolchain.

**Recommended — starknet.js (`scripts/deploy-contract.ts`):**

```bash
# Reveal the deployer private key from your starkli keystore
export STARKNET_ACCOUNT_ADDRESS=0x014e9e...        # the deployed account
export STARKNET_PRIVATE_KEY=$(starkli signer keystore inspect-private \
  ~/.starkli-wallets/deployer/keystore.json --raw)

# Build (once) then declare + deploy
scarb build
npx tsx scripts/deploy-contract.ts
```

**Alternative — starkli (`scripts/deploy.sh`):** only works when your Scarb's
Sierra version is supported by the installed `starkli` release.

```bash
export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json
export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json
bash scripts/deploy.sh
```

Either path will:
1. Declare the class on Starknet Sepolia
2. Deploy with your address as owner
3. Automatically update `ONA_IMPACT_CONTRACT_ADDRESS` in `services/starknet.ts`

### 3. Verify on Voyager

```
https://sepolia.voyager.online/contract/<deployed_address>
```

## Contract interface

```cairo
fn anchor_screening_proof(proof: felt252, timestamp: u64, risk_level: u8)
fn get_anchored_count() -> u64
fn is_proof_anchored(proof: felt252) -> bool
fn get_owner() -> ContractAddress
```

## Network progression

| Stage | Network |
|---|---|
| Development | Starknet Sepolia (current) |
| After clinical validation | Starknet Mainnet |
