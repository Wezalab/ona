import { useCallback, useEffect, useReducer } from 'react';
import {
  buildAnchorCalldata,
  fetchNetworkStatus,
  anchorScreeningProof,
  fetchAnchoredCount,
  NetworkStatus,
  ONA_IMPACT_CONTRACT_ADDRESS,
  ScreeningRecord,
  voyagerTxUrl,
} from '@/services/starknet';

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
};

type Action =
  | { type: 'SET_NETWORK'; payload: NetworkStatus }
  | { type: 'SET_NETWORK_LOADING'; payload: boolean }
  | { type: 'SET_ON_CHAIN_COUNT'; payload: number | null }
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
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStarknet() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Fetch network status and on-chain count on mount
  useEffect(() => {
    dispatch({ type: 'SET_NETWORK_LOADING', payload: true });
    fetchNetworkStatus().then((status) => {
      dispatch({ type: 'SET_NETWORK', payload: status });
    });
    fetchAnchoredCount().then((count) => {
      dispatch({ type: 'SET_ON_CHAIN_COUNT', payload: count });
    });
  }, []);

  const refreshNetwork = useCallback(() => {
    dispatch({ type: 'SET_NETWORK_LOADING', payload: true });
    fetchNetworkStatus().then((status) => {
      dispatch({ type: 'SET_NETWORK', payload: status });
    });
  }, []);

  /**
   * Queue an anonymized screening record for on-chain anchoring.
   * Computes the Poseidon proof locally and stages it — no tx is sent yet.
   */
  const enqueueProof = useCallback((record: ScreeningRecord) => {
    const { proof, calldata } = buildAnchorCalldata(record);
    dispatch({
      type: 'ENQUEUE_PROOF',
      payload: { record, proof, calldata, status: 'pending' },
    });
  }, []);

  /**
   * Anchor a proof on Starknet.
   *
   * If the contract is deployed (ONA_IMPACT_CONTRACT_ADDRESS is set) and
   * walletAddress + privateKey are provided, submits a real transaction.
   * Otherwise stages the proof locally with a simulation marker so the
   * queue is still usable before deployment.
   *
   * walletAddress and privateKey should be stored securely (e.g. device
   * keychain via expo-secure-store) and passed in from the calling screen.
   */
  const anchorProof = useCallback(
    async (id: string, walletAddress?: string, privateKey?: string) => {
      const proof = state.proofQueue.find((p) => p.record.id === id);
      if (!proof || proof.status !== 'pending') return;

      dispatch({ type: 'UPDATE_PROOF', id, patch: { status: 'anchoring' } });

      const contractDeployed = ONA_IMPACT_CONTRACT_ADDRESS !== '0x' + '0'.repeat(64);

      try {
        if (contractDeployed && walletAddress && privateKey) {
          // ── Real on-chain submission ──────────────────────────────────────
          const txHash = await anchorScreeningProof({
            walletAddress,
            privateKey,
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
        dispatch({
          type: 'UPDATE_PROOF',
          id,
          patch: {
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
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
    refreshNetwork,
    enqueueProof,
    anchorProof,
    voyagerTxUrl,
  };
}
