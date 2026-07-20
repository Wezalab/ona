use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait,
};
use starknet::ContractAddress;
use ona_contracts::{IImpactRegistryDispatcher, IImpactRegistryDispatcherTrait};

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn owner() -> ContractAddress {
    'owner'.try_into().unwrap()
}

fn other() -> ContractAddress {
    'other'.try_into().unwrap()
}

fn deploy_registry() -> IImpactRegistryDispatcher {
    let contract = declare("ImpactRegistry").unwrap().contract_class();
    let mut calldata = array![];
    owner().serialize(ref calldata);
    let (address, _) = contract.deploy(@calldata).unwrap();
    IImpactRegistryDispatcher { contract_address: address }
}

/// Deploy and register a single facility (code 1) as the owner.
fn deploy_with_facility() -> IImpactRegistryDispatcher {
    let registry = deploy_registry();
    start_cheat_caller_address(registry.contract_address, owner());
    registry.register_facility(1_u32, 'Clinique Ngaliema');
    stop_cheat_caller_address(registry.contract_address);
    registry
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[test]
fn test_initial_state() {
    let registry = deploy_registry();
    assert!(registry.get_total_screenings() == 0, "initial count should be 0");
    assert!(registry.get_anchored_count() == 0, "alias should be 0");
    assert!(registry.get_referral_count() == 0, "referrals should be 0");
    assert!(registry.get_facility_count() == 0, "facilities should be 0");
    assert!(registry.get_owner() == owner(), "owner should match constructor arg");
}

#[test]
fn test_register_facility() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.register_facility(7_u32, 'CS Kimbanguiste');
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_facility_count() == 1, "one facility registered");
    assert!(registry.get_facility_code_at(0) == 7_u32, "code at index 0 is 7");
    assert!(registry.is_facility_registered(7_u32), "facility 7 registered");
    assert!(registry.get_facility_name(7_u32) == 'CS Kimbanguiste', "name matches");
}

#[test]
fn test_register_facility_idempotent_index() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.register_facility(7_u32, 'First Name');
    registry.register_facility(7_u32, 'Renamed');
    stop_cheat_caller_address(registry.contract_address);

    // Re-registering the same code must not grow the enumerable index
    assert!(registry.get_facility_count() == 1, "count stays 1 on rename");
    assert!(registry.get_facility_name(7_u32) == 'Renamed', "name updated");
}

#[test]
fn test_anchor_screening_success() {
    let registry = deploy_with_facility();
    let proof: felt252 = 0x745d3ecbb85c002a3289c4017414bd87bc5642e116cfd61aaaca9a61494a4a3;

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(proof, 1721254800_u64, 3_u8, 1_u32, true);
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_total_screenings() == 1, "total should be 1");
    assert!(registry.get_referral_count() == 1, "referral should be 1");
    assert!(registry.is_proof_anchored(proof), "proof should be anchored");

    let (low, medium, high) = registry.get_risk_counts();
    assert!(low == 0 && medium == 0 && high == 1, "high risk should be 1");

    let (screenings, referrals) = registry.get_facility_stats(1_u32);
    assert!(screenings == 1 && referrals == 1, "facility stats should be (1,1)");
}

#[test]
fn test_anchor_non_referral() {
    let registry = deploy_with_facility();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(0xaaa, 1000_u64, 1_u8, 1_u32, false);
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_referral_count() == 0, "no referral counted");
    let (screenings, referrals) = registry.get_facility_stats(1_u32);
    assert!(screenings == 1 && referrals == 0, "facility (1,0)");
}

#[test]
fn test_anchor_emits_event() {
    let registry = deploy_with_facility();
    let proof: felt252 = 0x1234abcd;
    let mut spy = spy_events();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(proof, 1721254800_u64, 2_u8, 1_u32, false);
    stop_cheat_caller_address(registry.contract_address);

    spy
        .assert_emitted(
            @array![
                (
                    registry.contract_address,
                    ona_contracts::ImpactRegistry::Event::ScreeningAnchored(
                        ona_contracts::ImpactRegistry::ScreeningAnchored {
                            proof,
                            timestamp: 1721254800_u64,
                            risk_level: 2_u8,
                            facility_code: 1_u32,
                            is_referral: false,
                            anchored_at: 0 // snforge uses 0 for block_timestamp in tests
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_multiple_proofs_and_risk_distribution() {
    let registry = deploy_with_facility();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(0x111, 1000_u64, 1_u8, 1_u32, false);
    registry.anchor_screening(0x222, 2000_u64, 2_u8, 1_u32, true);
    registry.anchor_screening(0x333, 3000_u64, 3_u8, 1_u32, false);
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_total_screenings() == 3, "should have 3 screenings");
    assert!(registry.get_referral_count() == 1, "1 referral");

    let (low, medium, high) = registry.get_risk_counts();
    assert!(low == 1 && medium == 1 && high == 1, "risk spread (1,1,1)");
    assert!(!registry.is_proof_anchored(0x999), "unknown proof not anchored");
}

#[test]
fn test_transfer_ownership() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.transfer_ownership(other());
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_owner() == other(), "owner should be updated");
}

#[test]
#[should_panic(expected: "ONA: proof already anchored")]
fn test_duplicate_proof_reverts() {
    let registry = deploy_with_facility();
    let proof: felt252 = 0xdeadbeef;

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(proof, 1000_u64, 1_u8, 1_u32, false);
    registry.anchor_screening(proof, 2000_u64, 1_u8, 1_u32, false); // should panic
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: caller is not owner")]
fn test_non_owner_reverts() {
    let registry = deploy_with_facility();

    start_cheat_caller_address(registry.contract_address, other());
    registry.anchor_screening(0xabc, 1000_u64, 1_u8, 1_u32, false); // should panic
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: invalid risk level")]
fn test_invalid_risk_level_reverts() {
    let registry = deploy_with_facility();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(0xabc, 1000_u64, 0_u8, 1_u32, false); // 0 is invalid
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: invalid risk level")]
fn test_risk_level_above_max_reverts() {
    let registry = deploy_with_facility();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(0xabc, 1000_u64, 4_u8, 1_u32, false); // 4 is invalid
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: facility not registered")]
fn test_unregistered_facility_reverts() {
    let registry = deploy_registry(); // no facility registered

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening(0xabc, 1000_u64, 1_u8, 99_u32, false); // 99 not registered
    stop_cheat_caller_address(registry.contract_address);
}
