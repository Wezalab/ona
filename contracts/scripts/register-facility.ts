/**
 * One-time setup: register facility code 1 on the deployed ImpactRegistry.
 * Must be run by the contract owner.
 *
 * Usage:
 *   npx tsx contracts/scripts/register-facility.ts
 */
import { Account, RpcProvider, Signer, shortString } from 'starknet';

const RPCS = [
  'https://api.cartridge.gg/x/starknet/sepolia',
  'https://starknet-sepolia-rpc.publicnode.com',
];

const CONTRACT =
  process.env.STARKNET_CONTRACT_ADDRESS ??
  '0x437335ac6168b6114bbdff68abdf6334f9a14e3a597c7ce8d8cc5f48d79aa6a';
const OWNER =
  process.env.STARKNET_ACCOUNT_ADDRESS ??
  '0x0061846dFea34312c274Ee9b06887e1ae9A9401D0A83D2ECa477B2EdD5D6b614';
const KEY =
  process.env.STARKNET_PRIVATE_KEY ??
  '0x011dafa5bbce54b7b4d0b78a180188e981fed4b39c51695ee8f9204579b56d38';

const FACILITY_CODE = Number(process.env.FACILITY_CODE ?? '1');
const FACILITY_NAME = process.env.FACILITY_NAME ?? 'BlueRockOptic';

async function tryRpc(rpc: string): Promise<boolean> {
  console.log('Trying RPC:', rpc);
  const provider = new RpcProvider({ nodeUrl: rpc });
  const block = await provider.getBlockWithTxHashes('latest');
  console.log('  Connected — block:', block.block_number);

  const account = new Account({ provider, address: OWNER, signer: new Signer(KEY) });

  const fri = (p?: { price_in_fri?: string }): bigint =>
    p?.price_in_fri ? BigInt(p.price_in_fri) : 1n;
  const B = 4n;
  const resourceBounds = {
    l1_gas:      { max_amount: 0x400n,     max_price_per_unit: fri(block.l1_gas_price)      * B },
    l1_data_gas: { max_amount: 0x20000n,   max_price_per_unit: fri(block.l1_data_gas_price) * B },
    l2_gas:      { max_amount: 0x1000000n, max_price_per_unit: fri(block.l2_gas_price)      * B },
  };

  console.log(`  Registering facility ${FACILITY_CODE} = "${FACILITY_NAME}"...`);
  const { transaction_hash } = await account.execute(
    {
      contractAddress: CONTRACT,
      entrypoint: 'register_facility',
      calldata: [
        String(FACILITY_CODE),
        shortString.encodeShortString(FACILITY_NAME),
      ],
    },
    { resourceBounds },
  );
  console.log('  TX:', transaction_hash);
  await provider.waitForTransaction(transaction_hash);
  console.log('\n✅ Done — facility registered!');
  console.log(
    `   View: https://sepolia.voyager.online/tx/${transaction_hash}`,
  );
  return true;
}

async function main(): Promise<void> {
  console.log('\n=== Register ONA Facility ===');
  console.log('  Contract:', CONTRACT);
  console.log('  Owner:   ', OWNER);
  console.log('  Facility:', FACILITY_CODE, '=', FACILITY_NAME, '\n');

  for (const rpc of RPCS) {
    try {
      if (await tryRpc(rpc)) return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log('  ✗ failed:', msg.slice(0, 120));
    }
  }
  console.error('\nAll RPCs failed — check your network connection.');
  process.exit(1);
}

main();
