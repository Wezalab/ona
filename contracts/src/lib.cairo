/// ONA Impact Registry — Starknet contract
///
/// Records anonymized screening proof hashes on-chain as immutable evidence
/// of impact for funders and public verifiers.
///
/// Privacy model:
///   - Only stores a Poseidon hash derived from: timestamp + risk_level + facility_code
///   - No patient name, image, biometric, or identifying information is ever submitted
///   - The hash is computed on the mobile device and verified locally before submission
///
/// Deployment: Starknet Sepolia (testnet) → Starknet Mainnet after clinical validation

// ─── Interface ────────────────────────────────────────────────────────────────

#[starknet::interface]
pub trait IImpactRegistry<TContractState> {
    /// Anchor an anonymized screening proof on-chain.
    /// `proof`       — Poseidon hash of (timestamp, risk_level * 1000 + facility_code)
    /// `timestamp`   — Unix seconds of the screening event
    /// `risk_level`  — 1 = low, 2 = medium, 3 = high
    fn anchor_screening_proof(
        ref self: TContractState,
        proof: felt252,
        timestamp: u64,
        risk_level: u8,
    );

    /// Return the total number of proofs anchored so far.
    fn get_anchored_count(self: @TContractState) -> u64;

    /// Check whether a given proof hash has already been anchored.
    fn is_proof_anchored(self: @TContractState, proof: felt252) -> bool;

    /// Return the contract owner address.
    fn get_owner(self: @TContractState) -> starknet::ContractAddress;
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[starknet::contract]
pub mod ImpactRegistry {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map,
    };

    // ── Storage ──────────────────────────────────────────────────────────────

    #[storage]
    struct Storage {
        /// Contract owner — the only address allowed to anchor proofs
        owner: ContractAddress,
        /// Running total of anchored proofs (public impact counter)
        anchored_count: u64,
        /// Map from proof hash → anchored (true/false)
        proofs: Map<felt252, bool>,
    }

    // ── Events ───────────────────────────────────────────────────────────────

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ScreeningProofAnchored: ScreeningProofAnchored,
        OwnershipTransferred: OwnershipTransferred,
    }

    /// Emitted once per anchored screening. All fields are publicly queryable
    /// on Starknet block explorers (Voyager, Starkscan).
    #[derive(Drop, starknet::Event)]
    pub struct ScreeningProofAnchored {
        #[key]
        pub proof: felt252,
        pub timestamp: u64,
        pub risk_level: u8,
        pub anchored_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OwnershipTransferred {
        pub previous_owner: ContractAddress,
        pub new_owner: ContractAddress,
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    // ── Implementation ───────────────────────────────────────────────────────

    #[abi(embed_v0)]
    impl ImpactRegistryImpl of super::IImpactRegistry<ContractState> {
        fn anchor_screening_proof(
            ref self: ContractState,
            proof: felt252,
            timestamp: u64,
            risk_level: u8,
        ) {
            // Only owner (the ONA backend account) can anchor proofs
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "ONA: caller is not owner");

            // Validate risk level
            assert!(risk_level >= 1 && risk_level <= 3, "ONA: invalid risk level");

            // Prevent duplicate anchoring
            assert!(!self.proofs.entry(proof).read(), "ONA: proof already anchored");

            // Persist and count
            self.proofs.entry(proof).write(true);
            self.anchored_count.write(self.anchored_count.read() + 1);

            // Emit public event
            self
                .emit(
                    ScreeningProofAnchored {
                        proof,
                        timestamp,
                        risk_level,
                        anchored_at: get_block_timestamp(),
                    },
                );
        }

        fn get_anchored_count(self: @ContractState) -> u64 {
            self.anchored_count.read()
        }

        fn is_proof_anchored(self: @ContractState, proof: felt252) -> bool {
            self.proofs.entry(proof).read()
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }
    }

    // ── Admin (owner only) ───────────────────────────────────────────────────

    #[generate_trait]
    impl AdminImpl of AdminTrait {
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "ONA: caller is not owner");
            let previous = self.owner.read();
            self.owner.write(new_owner);
            self.emit(OwnershipTransferred { previous_owner: previous, new_owner });
        }
    }
}
