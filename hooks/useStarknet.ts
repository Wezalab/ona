import { useCallback, useEffect, useReducer } from 'react';
import {
  buildAnchorCalldata,
  checkProofAnchored,
  fetchNetworkStatus,
  anchorScreeningProof,
  fetchAnchoredCount,
  NetworkStatus,
  ONA_IMPACT_CONTRACT_ADDRESS,
  ScreeningRecord,
  voyagerTxUrl,
} from '@/services/starknet';
import {
  getWalletAddress,
  getWalletConfig,
  saveWalletConfig,
  clearWalletConfig,
} from '@/services/walletConfig';

// ─── State types ──────────────────────────────────────────────────────────────

export type ProofStatus = 'pending' | 'anchoring' | 'anchored' | 'error';

export type ScreeningProof = {
  record: ScreeningRecord;
  proof: string;
  calldata: string[];
  status: ProofStatus;
  txHash?: string;
  error?: string;
};

type State = {
  network: NetworkStatus | null;
  networkLoading: boolean;
  proofQueue: ScreeningProof[];
  onChainCount: number | null;
  walletAddress: string | null;
};

type Action =
  | { type: 'SET_NETWORK'; payload: NetworkStatus }
  | { type: 'SET_NETWORK_LOADING'; payload: boolean }
  | { type: 'SET_ON_CHAIN_COUNT'; payload: number | null }
  | { type: 'SET_WALLET_ADDRESS'; payload: string | null }
  | { type: 'ENQUEUE_PROOF'; payload: ScreeningProof }
  | { type: 'UPDATE_PROOF'; id: string; patch: Partial<ScreeningProof> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NETWORK':
      return { ...state, network: action.payload, networkLoading: false };
    case 'SET_ON_CHAIN_COUNT':
      return { ...state, onChainCount: action.payload };
    case 'SET_NETWORK_LOADING':
      return { ...state, networkLoading: action.payload };
    case 'SET_WALLET_ADDRESS':
      return { ...state, walletAddress: action.payload };
    case 'ENQUEUE_PROOF':
      return { ...state, proofQueue: [action.payload, ...state.proofQueue] };
    case 'UPDATE_PROOF':
      return {
        ...state,
        proofQueue: state.proofQueue.map((p) =>
          p.record.id === action.id ? { ...p, ...action.patch } : p,
        ),
      };
    default:
      return state;
  }
}

const INITIAL_STATE: State = {
  network: null,
  networkLoading: true,
  proofQueue: [],
  onChainCount: null,
  walletAddress: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStarknet() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Fetch network status, on-chain count, and load the saved wallet on mount
  useEffect(() => {
    dispatch({ type: 'SET_NETWORK_LOADING', payload: true });
    fetchNetworkStatus().then((status) => {
      dispatch({ type: 'SET_NETWORK', payload: status });
    });
    fetchAnchoredCount().then((count) => {
      dispatch({ type: 'SET_ON_CHAIN_COUNT', payload: count });
    });
    getWalletAddress().then((address) => {
      dispatch({ type: 'SET_WALLET_ADDRESS', payload: address });
    });
  }, []);

  /** Persist the operator wallet securely, then expose its address. */
  const saveWallet = useCallback(async (address: string, privateKey: string) => {
    const cfg = await saveWalletConfig(address, privateKey);
    dispatch({ type: 'SET_WALLET_ADDRESS', payload: cfg.address });
  }, []);

  /** Remove the operator wallet — anchoring reverts to simulation. */
  const clearWallet = useCallback(async () => {
    await clearWalletConfig();
    dispatch({ type: 'SET_WALLET_ADDRESS', payload: null });
  }, []);

  const refreshNetwork = useCallback(() => {
    dispatch({ type: 'SET_NETWORK_LOADING', payload: true });
    fetchNetworkStatus().then((status) => {
      dispatch({ type: 'SET_NETWORK', payload: status });
    });
  }, []);

  /**
   * Queue an anonymized screening record for on-chain anchoring.
   * Computes the Poseidon proof locally, checks if it's already anchored,
   * and stages it as 'anchored' or 'pending' accordingly.
   */
  const enqueueProof = useCallback(async (record: ScreeningRecord) => {
    const { proof, calldata } = buildAnchorCalldata(record);
    // Optimistically add as pending, then correct the status if already on-chain.
    dispatch({
      type: 'ENQUEUE_PROOF',
      payload: { record, proof, calldata, status: 'pending' },
    });
    try {
      const alreadyAnchored = await checkProofAnchored(proof);
      if (alreadyAnchored) {
        dispatch({
          type: 'UPDATE_PROOF',
          id: record.id,
          patch: { status: 'anchored', error: 'Already anchored on-chain' },
        });
      }
    } catch {
      // best-effort — leave as pending if the check fails
    }
  }, []);

  /**
   * Anchor a proof on Starknet.
   *
   * If the contract is deployed (ONA_IMPACT_CONTRACT_ADDRESS is set) and an
   * operator wallet has been configured (saved via saveWallet, read here
   * transiently from expo-secure-store), submits a real transaction.
   * Otherwise stages the proof locally with a simulation marker so the
   * queue is still usable before a wallet is configured / the contract is
   * deployed.
   *
   * The private key is never held in React state — it is read from secure
   * storage only for the duration of the signing call.
   */
  const anchorProof = useCallback(
    async (id: string) => {
      const proof = state.proofQueue.find((p) => p.record.id === id);
      if (!proof || proof.status !== 'pending') return;

      dispatch({ type: 'UPDATE_PROOF', id, patch: { status: 'anchoring' } });

      const contractDeployed = ONA_IMPACT_CONTRACT_ADDRESS !== '0x' + '0'.repeat(64);
      const wallet = await getWalletConfig();

      try {
        if (contractDeployed && wallet) {
          // ── Real on-chain submission ──────────────────────────────────────
          const txHash = await anchorScreeningProof({
            walletAddress: wallet.address,
            privateKey: wallet.privateKey,
            record: proof.record,
          });
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: { status: 'anchored', txHash },
          });
          // Refresh on-chain count after successful anchor
          fetchAnchoredCount().then((count) => {
            dispatch({ type: 'SET_ON_CHAIN_COUNT', payload: count });
          });
        } else {
          // ── Simulation (contract not deployed or no account configured) ───
          await new Promise<void>((resolve) => setTimeout(resolve, 1200));
          const simulatedTxHash =
            '0x' + proof.proof.replace('0x', '').padStart(64, '0').slice(0, 62) + 'ff';
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: {
              status: 'anchored',
              txHash: simulatedTxHash,
              error: contractDeployed
                ? 'Simulated — wallet not configured'
                : 'Simulated — contract deployment pending',
            },
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Contract already has this proof — treat as success, not error.
        if (msg.includes('proof already anchored')) {
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: { status: 'anchored', error: 'Already anchored on-chain' },
          });
          fetchAnchoredCount().then((count) => {
            dispatch({ type: 'SET_ON_CHAIN_COUNT', payload: count });
          });
        } else {
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: {
              status: 'error',
              error: msg,
            },
          });
        }
      }
    },
    [state.proofQueue],
  );

  const pendingCount = state.proofQueue.filter((p) => p.status === 'pending').length;
  const anchoredCount = state.proofQueue.filter((p) => p.status === 'anchored').length;

  return {
    network: state.network,
    networkLoading: state.networkLoading,
    proofQueue: state.proofQueue,
    onChainCount: state.onChainCount,
    pendingCount,
    anchoredCount,
    walletAddress: state.walletAddress,
    hasWallet: state.walletAddress !== null,
    saveWallet,
    clearWallet,
    refreshNetwork,
    enqueueProof,
    anchorProof,
    voyagerTxUrl,
  };
}
