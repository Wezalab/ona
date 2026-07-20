use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait};
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

// ─── Tests ────────────────────────────────────────────────────────────────────

#[test]
fn test_initial_state() {
    let registry = deploy_registry();
    assert!(registry.get_anchored_count() == 0, "initial count should be 0");
    assert!(registry.get_owner() == owner(), "owner should match constructor arg");
}

#[test]
fn test_anchor_proof_success() {
    let registry = deploy_registry();
    let proof: felt252 = 0x745d3ecbb85c002a3289c4017414bd87bc5642e116cfd61aaaca9a61494a4a3;

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(proof, 1721254800_u64, 3_u8);
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_anchored_count() == 1, "count should be 1 after anchoring");
    assert!(registry.is_proof_anchored(proof), "proof should be marked as anchored");
}

#[test]
fn test_anchor_emits_event() {
    let registry = deploy_registry();
    let proof: felt252 = 0x1234abcd;
    let mut spy = spy_events();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(proof, 1721254800_u64, 2_u8);
    stop_cheat_caller_address(registry.contract_address);

    spy.assert_emitted(
        @array![
            (
                registry.contract_address,
                ona_contracts::ImpactRegistry::Event::ScreeningProofAnchored(
                    ona_contracts::ImpactRegistry::ScreeningProofAnchored {
                        proof,
                        timestamp: 1721254800_u64,
                        risk_level: 2_u8,
                        anchored_at: 0, // snforge uses 0 for block_timestamp in tests
                    }
                )
            )
        ]
    );
}

#[test]
fn test_multiple_proofs() {
    let registry = deploy_registry();
    let proofs: Array<felt252> = array![0x111, 0x222, 0x333];

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(*proofs.at(0), 1000_u64, 1_u8);
    registry.anchor_screening_proof(*proofs.at(1), 2000_u64, 2_u8);
    registry.anchor_screening_proof(*proofs.at(2), 3000_u64, 3_u8);
    stop_cheat_caller_address(registry.contract_address);

    assert!(registry.get_anchored_count() == 3, "should have 3 proofs");
    assert!(registry.is_proof_anchored(*proofs.at(0)), "proof 0 anchored");
    assert!(registry.is_proof_anchored(*proofs.at(1)), "proof 1 anchored");
    assert!(registry.is_proof_anchored(*proofs.at(2)), "proof 2 anchored");
    assert!(!registry.is_proof_anchored(0x999), "unknown proof not anchored");
}

#[test]
#[should_panic(expected: "ONA: proof already anchored")]
fn test_duplicate_proof_reverts() {
    let registry = deploy_registry();
    let proof: felt252 = 0xdeadbeef;

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(proof, 1000_u64, 1_u8);
    registry.anchor_screening_proof(proof, 2000_u64, 1_u8); // should panic
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: caller is not owner")]
fn test_non_owner_reverts() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, other());
    registry.anchor_screening_proof(0xabc, 1000_u64, 1_u8); // should panic
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: invalid risk level")]
fn test_invalid_risk_level_reverts() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(0xabc, 1000_u64, 0_u8); // 0 is invalid
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
#[should_panic(expected: "ONA: invalid risk level")]
fn test_risk_level_above_max_reverts() {
    let registry = deploy_registry();

    start_cheat_caller_address(registry.contract_address, owner());
    registry.anchor_screening_proof(0xabc, 1000_u64, 4_u8); // 4 is invalid
    stop_cheat_caller_address(registry.contract_address);
}
