/// ONA Impact Registry v2 — Starknet contract
///
/// Records anonymized screening statistics on-chain as immutable, publicly
/// verifiable evidence of impact. The ONA backend is the only writer (owner);
/// the public website reads aggregate stats directly from this contract and
/// never touches the backend database.
///
/// Privacy model:
///   - Stores a Poseidon `proof` hash derived from non-identifying inputs
///     (timestamp + risk_level + facility_code) plus coarse public aggregates.
///   - `facility_code` is a clinic-level identifier (NOT patient data) so the
///     public dashboard can show a per-facility breakdown.
///   - No patient name, image, biometric, or identifying information is ever
///     submitted on-chain.
///
/// Deployment: Starknet Sepolia (testnet) → Starknet Mainnet after clinical validation

// ─── Interface ────────────────────────────────────────────────────────────────

#[starknet::interface]
pub trait IImpactRegistry<TContractState> {
    /// Anchor an anonymized screening on-chain and update public aggregates.
    /// `proof`        — Poseidon hash of (timestamp, risk_level * 1000 + facility_code)
    /// `timestamp`    — Unix seconds of the screening event
    /// `risk_level`   — 1 = low, 2 = medium, 3 = high
    /// `facility_code`— clinic identifier (must be registered first)
    /// `is_referral`  — whether this screening resulted in a referral
    fn anchor_screening(
        ref self: TContractState,
        proof: felt252,
        timestamp: u64,
        risk_level: u8,
        facility_code: u32,
        is_referral: bool,
    );

    /// Register (or rename) a clinic/facility so the public site can enumerate
    /// facilities and show their names without any backend dependency.
    fn register_facility(ref self: TContractState, code: u32, name: felt252);

    // ── Aggregate views ──
    /// Total number of screenings anchored so far.
    fn get_total_screenings(self: @TContractState) -> u64;
    /// Backward-compatible alias of `get_total_screenings`.
    fn get_anchored_count(self: @TContractState) -> u64;
    /// Total number of referrals across all facilities.
    fn get_referral_count(self: @TContractState) -> u64;
    /// Risk distribution as (low, medium, high).
    fn get_risk_counts(self: @TContractState) -> (u64, u64, u64);

    // ── Facility registry views ──
    /// Number of registered facilities (length of the enumerable registry).
    fn get_facility_count(self: @TContractState) -> u32;
    /// Facility code at a registry index (0..get_facility_count).
    fn get_facility_code_at(self: @TContractState, index: u32) -> u32;
    /// Per-facility stats as (screenings, referrals).
    fn get_facility_stats(self: @TContractState, code: u32) -> (u64, u64);
    /// Short on-chain name/label for a facility code.
    fn get_facility_name(self: @TContractState, code: u32) -> felt252;
    /// Whether a facility code has been registered.
    fn is_facility_registered(self: @TContractState, code: u32) -> bool;

    // ── Proof / admin views ──
    /// Check whether a given proof hash has already been anchored.
    fn is_proof_anchored(self: @TContractState, proof: felt252) -> bool;
    /// Return the contract owner address.
    fn get_owner(self: @TContractState) -> starknet::ContractAddress;
    /// Transfer ownership to a new backend account (owner only).
    fn transfer_ownership(ref self: TContractState, new_owner: starknet::ContractAddress);
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
        /// Contract owner — the only address allowed to write (the ONA backend)
        owner: ContractAddress,
        /// Running total of anchored screenings (public impact counter)
        total_screenings: u64,
        /// Running total of referrals
        referral_count: u64,
        /// Risk distribution counters
        risk_low: u64,
        risk_medium: u64,
        risk_high: u64,
        /// Map from proof hash → anchored (true/false), prevents duplicates
        proofs: Map<felt252, bool>,
        // ── Enumerable facility registry ──
        /// Number of registered facilities
        facility_count: u32,
        /// index → facility code (enables enumeration from the website)
        facility_codes: Map<u32, u32>,
        /// facility code → registered flag
        facility_registered: Map<u32, bool>,
        /// facility code → short on-chain name
        facility_name: Map<u32, felt252>,
        /// facility code → screenings count
        facility_screenings: Map<u32, u64>,
        /// facility code → referrals count
        facility_referrals: Map<u32, u64>,
    }

    // ── Events ───────────────────────────────────────────────────────────────

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ScreeningAnchored: ScreeningAnchored,
        FacilityRegistered: FacilityRegistered,
        OwnershipTransferred: OwnershipTransferred,
    }

    /// Emitted once per anchored screening. All fields are publicly queryable
    /// on Starknet block explorers and used to build the weekly trend on the site.
    #[derive(Drop, starknet::Event)]
    pub struct ScreeningAnchored {
        #[key]
        pub proof: felt252,
        pub timestamp: u64,
        pub risk_level: u8,
        pub facility_code: u32,
        pub is_referral: bool,
        pub anchored_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FacilityRegistered {
        #[key]
        pub code: u32,
        pub name: felt252,
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
        fn anchor_screening(
            ref self: ContractState,
            proof: felt252,
            timestamp: u64,
            risk_level: u8,
            facility_code: u32,
            is_referral: bool,
        ) {
            // Only owner (the ONA backend account) can anchor
            assert!(get_caller_address() == self.owner.read(), "ONA: caller is not owner");

            // Validate risk level
            assert!(risk_level >= 1 && risk_level <= 3, "ONA: invalid risk level");

            // Facility must be registered so the public breakdown stays consistent
            assert!(self.facility_registered.entry(facility_code).read(), "ONA: facility not registered");

            // Prevent duplicate anchoring
            assert!(!self.proofs.entry(proof).read(), "ONA: proof already anchored");

            // Persist proof + global counters
            self.proofs.entry(proof).write(true);
            self.total_screenings.write(self.total_screenings.read() + 1);

            // Risk distribution
            if risk_level == 1 {
                self.risk_low.write(self.risk_low.read() + 1);
            } else if risk_level == 2 {
                self.risk_medium.write(self.risk_medium.read() + 1);
            } else {
                self.risk_high.write(self.risk_high.read() + 1);
            }

            // Per-facility aggregates
            self
                .facility_screenings
                .entry(facility_code)
                .write(self.facility_screenings.entry(facility_code).read() + 1);

            if is_referral {
                self.referral_count.write(self.referral_count.read() + 1);
                self
                    .facility_referrals
                    .entry(facility_code)
                    .write(self.facility_referrals.entry(facility_code).read() + 1);
            }

            // Emit public event (drives the website weekly trend)
            self
                .emit(
                    ScreeningAnchored {
                        proof,
                        timestamp,
                        risk_level,
                        facility_code,
                        is_referral,
                        anchored_at: get_block_timestamp(),
                    },
                );
        }

        fn register_facility(ref self: ContractState, code: u32, name: felt252) {
            assert!(get_caller_address() == self.owner.read(), "ONA: caller is not owner");

            // First-time registration appends to the enumerable index
            if !self.facility_registered.entry(code).read() {
                let idx = self.facility_count.read();
                self.facility_codes.entry(idx).write(code);
                self.facility_count.write(idx + 1);
                self.facility_registered.entry(code).write(true);
            }
            // Name can be set/updated on every call
            self.facility_name.entry(code).write(name);

            self.emit(FacilityRegistered { code, name });
        }

        fn get_total_screenings(self: @ContractState) -> u64 {
            self.total_screenings.read()
        }

        fn get_anchored_count(self: @ContractState) -> u64 {
            self.total_screenings.read()
        }

        fn get_referral_count(self: @ContractState) -> u64 {
            self.referral_count.read()
        }

        fn get_risk_counts(self: @ContractState) -> (u64, u64, u64) {
            (self.risk_low.read(), self.risk_medium.read(), self.risk_high.read())
        }

        fn get_facility_count(self: @ContractState) -> u32 {
            self.facility_count.read()
        }

        fn get_facility_code_at(self: @ContractState, index: u32) -> u32 {
            self.facility_codes.entry(index).read()
        }

        fn get_facility_stats(self: @ContractState, code: u32) -> (u64, u64) {
            (
                self.facility_screenings.entry(code).read(),
                self.facility_referrals.entry(code).read(),
            )
        }

        fn get_facility_name(self: @ContractState, code: u32) -> felt252 {
            self.facility_name.entry(code).read()
        }

        fn is_facility_registered(self: @ContractState, code: u32) -> bool {
            self.facility_registered.entry(code).read()
        }

        fn is_proof_anchored(self: @ContractState, proof: felt252) -> bool {
            self.proofs.entry(proof).read()
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            let previous = self.owner.read();
            assert!(get_caller_address() == previous, "ONA: caller is not owner");
            self.owner.write(new_owner);
            self.emit(OwnershipTransferred { previous_owner: previous, new_owner });
        }
    }
}
