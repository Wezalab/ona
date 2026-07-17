#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ONA ImpactRegistry — Starknet Sepolia deployment script
#
# Prerequisites:
#   - Scarb >= 2.8.0  →  curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
#   - starkli >= 0.3  →  curl https://get.starkli.sh | sh
#   - A funded Starknet Sepolia account (use https://starknet-faucet.vercel.app/)
#
# Usage:
#   export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json
#   export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json
#   cd contracts && bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SEPOLIA_RPC="https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
NETWORK="sepolia"

echo ""
echo "=== ONA ImpactRegistry — Deployment ==="
echo ""

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo "→ Building contract with Scarb..."
scarb build
echo "  Built: target/dev/ona_contracts_ImpactRegistry.contract_class.json"
echo ""

# ── 2. Declare ────────────────────────────────────────────────────────────────
echo "→ Declaring contract class on Starknet Sepolia..."
DECLARE_OUTPUT=$(starkli declare \
  target/dev/ona_contracts_ImpactRegistry.contract_class.json \
  --account "$STARKNET_ACCOUNT" \
  --keystore "$STARKNET_KEYSTORE" \
  --rpc "$SEPOLIA_RPC" \
  --watch)

CLASS_HASH=$(echo "$DECLARE_OUTPUT" | grep "Class hash declared:" | awk '{print $NF}')
echo "  Class hash: $CLASS_HASH"
echo ""

# ── 3. Get deployer address (becomes the contract owner) ──────────────────────
OWNER_ADDRESS=$(starkli account fetch "$STARKNET_ACCOUNT" --rpc "$SEPOLIA_RPC" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['deployment']['address'])")
echo "→ Owner address (deployer): $OWNER_ADDRESS"
echo ""

# ── 4. Deploy ─────────────────────────────────────────────────────────────────
echo "→ Deploying contract..."
DEPLOY_OUTPUT=$(starkli deploy \
  "$CLASS_HASH" \
  "$OWNER_ADDRESS" \
  --account "$STARKNET_ACCOUNT" \
  --keystore "$STARKNET_KEYSTORE" \
  --rpc "$SEPOLIA_RPC" \
  --watch)

CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "Contract deployed:" | awk '{print $NF}')
echo ""
echo "=== Deployment successful! ==="
echo ""
echo "  Contract address : $CONTRACT_ADDRESS"
echo "  Class hash       : $CLASS_HASH"
echo "  Owner            : $OWNER_ADDRESS"
echo "  Network          : Starknet Sepolia"
echo "  Explorer         : https://sepolia.voyager.online/contract/$CONTRACT_ADDRESS"
echo ""

# ── 5. Update services/starknet.ts ───────────────────────────────────────────
STARKNET_SERVICE="../services/starknet.ts"
if [ -f "$STARKNET_SERVICE" ]; then
  sed -i.bak \
    "s|export const ONA_IMPACT_CONTRACT_ADDRESS =.*|export const ONA_IMPACT_CONTRACT_ADDRESS = '$CONTRACT_ADDRESS';|" \
    "$STARKNET_SERVICE"
  rm "$STARKNET_SERVICE.bak"
  echo "→ Updated services/starknet.ts with contract address."
else
  echo "→ Manually update ONA_IMPACT_CONTRACT_ADDRESS in services/starknet.ts:"
  echo "   $CONTRACT_ADDRESS"
fi

echo ""
echo "Next: run the smoke tests to verify the deployment"
echo "  npm run test:starknet"
echo ""
