import { useCallback, useEffect, useReducer } from 'react';
import {
  buildAnchorCalldata,
  fetchNetworkStatus,
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
};

type Action =
  | { type: 'SET_NETWORK'; payload: NetworkStatus }
  | { type: 'SET_NETWORK_LOADING'; payload: boolean }
  | { type: 'ENQUEUE_PROOF'; payload: ScreeningProof }
  | { type: 'UPDATE_PROOF'; id: string; patch: Partial<ScreeningProof> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NETWORK':
      return { ...state, network: action.payload, networkLoading: false };
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
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStarknet() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Fetch network status on mount
  useEffect(() => {
    dispatch({ type: 'SET_NETWORK_LOADING', payload: true });
    fetchNetworkStatus().then((status) => {
      dispatch({ type: 'SET_NETWORK', payload: status });
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
   * Simulate anchoring a proof to Starknet.
   *
   * When ONA_IMPACT_CONTRACT_ADDRESS is a real deployed contract and an
   * Account object (with a funded private key) is available, replace the
   * simulation below with:
   *
   *   const account = new Account(provider, walletAddress, privateKey);
   *   const { transaction_hash } = await account.execute({
   *     contractAddress: ONA_IMPACT_CONTRACT_ADDRESS,
   *     entrypoint: 'anchor_screening_proof',
   *     calldata: proof.calldata,
   *   });
   *   dispatch({ type: 'UPDATE_PROOF', id, patch: { status: 'anchored', txHash: transaction_hash } });
   */
  const anchorProof = useCallback(
    async (id: string) => {
      const proof = state.proofQueue.find((p) => p.record.id === id);
      if (!proof || proof.status !== 'pending') return;

      dispatch({ type: 'UPDATE_PROOF', id, patch: { status: 'anchoring' } });

      try {
        // Simulated delay while contract deployment is pending
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));

        if (ONA_IMPACT_CONTRACT_ADDRESS === '0x' + '0'.repeat(64)) {
          // Contract not yet deployed — mark as staged with a simulated hash
          const simulatedTxHash =
            '0x' + proof.proof.replace('0x', '').padStart(64, '0').slice(0, 62) + 'ff';
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: {
              status: 'anchored',
              txHash: simulatedTxHash,
              error: 'Simulated — contract deployment pending',
            },
          });
        } else {
          // TODO: submit real transaction when account + deployed contract are ready
          dispatch({
            type: 'UPDATE_PROOF',
            id,
            patch: { status: 'error', error: 'Account not configured' },
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
    pendingCount,
    anchoredCount,
    refreshNetwork,
    enqueueProof,
    anchorProof,
    voyagerTxUrl,
  };
}
