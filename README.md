# ONA

**AI-powered mobile vision screening for community health workers.**

ONA helps detect early signs of vision impairment and preventable blindness in children and adults — offline, on low-cost Android devices, in the clinics and communities that need it most.

Built by [WEZA LAB](https://wezalab.org) in the Democratic Republic of Congo. Open source under [Apache 2.0](./LICENSE).

### Demo

[![ONA pitch and product overview](https://img.youtube.com/vi/gtX4Hn4JZc0/hqdefault.jpg)](https://www.youtube.com/watch?v=gtX4Hn4JZc0)

Watch the ONA pitch and product overview on [YouTube](https://www.youtube.com/watch?v=gtX4Hn4JZc0).

---

## Why ONA

Over one billion people live with vision impairment worldwide. Most cases of childhood blindness are preventable or treatable when caught early — but specialist eye care is scarce in many low-resource settings.

Community health workers (CHWs) are often the first and only point of contact. ONA gives them a structured screening workflow and on-device AI support so they can identify risk, document findings, and refer patients before irreversible vision loss.

---

## What it does

| Capability | Description |
|---|---|
| Guided screening | End-to-end flow: consent → patient info → eye capture → AI analysis → results → referral |
| Visual acuity testing | Built-in VA test with calibration and results |
| On-device AI | Local inference — no internet required for screening |
| Offline-first | Works without connectivity; patient data stays on the device |
| Multilingual | English and French (more languages planned) |
| Screening history | Review past screenings and detailed results on device |
| Blockchain anchoring | Anonymized proof of each screening anchored to Starknet Sepolia via Poseidon hash |
| Impact dashboard | Public web dashboard reads aggregate statistics directly from the on-chain ImpactRegistry |
| Server sync | Optional sync to ONA API backend (NestJS + MongoDB) with JWT auth and offline queue |

---

## Privacy by design

- Patient data is stored **locally on the device**
- Only **anonymized cryptographic proofs** (Poseidon hash of timestamp + risk level + facility code) are written on-chain — no names, images, or demographics ever leave the device
- Aggregate counts (screenings, referrals, facilities reached) are readable by anyone directly from the blockchain — transparent and independently verifiable
- No identifiable patient information is sent to third parties for inference

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 · React Native · TypeScript |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Target | Android (primary) · iOS · Web (dev) |
| State | React Context + AsyncStorage (offline-first) |
| Backend | NestJS · MongoDB (optional server sync) |
| Blockchain | [Starknet](https://starknet.io) Sepolia · Cairo smart contract · starknet.js |
| AI (roadmap) | TensorFlow Lite / on-device vision models |
| License | Apache 2.0 |

---

## Screens

```
Welcome → Language → Consent → Patient info → Eye capture
    → AI processing → Screening results → History / Settings
Visual acuity: Calibration → Test → Result
Blockchain: Proof queue → Anchor to Starknet → View on Voyager
Server: Login → Clinic picker → Offline sync
```

See [USER-MANUAL.md](./USER-MANUAL.md) for end-user documentation.

---

## Getting started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) or npm
- Expo Go (for a physical device) or Android Studio (emulator)

### Install

```bash
git clone https://github.com/Wezalab/ona.git
cd ona
bun install   # or: npm install
```

### Run

```bash
bun start     # or: npm start
```

Then:

- Press `a` for Android emulator  
- Press `i` for iOS simulator  
- Scan the QR code with Expo Go on a device  

```bash
npm run android   # open Android directly
npm run ios       # open iOS directly
npm run web       # run in the browser
npm run lint      # ESLint
```

---

## Project structure

```
ona/
├── app/                  # Screens (Expo Router)
├── components/           # Shared UI
├── contexts/             # App state (language, consent, session, API)
├── hooks/                # Custom hooks (useStarknet, useRequireConsent)
├── services/             # API client, Starknet, wallet storage, offline queue
├── contracts/            # Cairo smart contract + deploy/register scripts
├── constants/            # Colors, translations
├── assets/               # Images and icons
├── CONTRIBUTING.md       # How to contribute
├── USER-MANUAL.md        # End-user guide
└── LICENSE               # Apache 2.0
```

---

## Blockchain — ImpactRegistry on Starknet

ONA anchors an anonymized proof of every completed screening to the **Starknet Sepolia** testnet through the `ImpactRegistry` Cairo smart contract.

### How it works

```
Screening completed (offline)
  └─► Poseidon hash(timestamp | risk_level | facility_code)
        └─► Queued locally in the blockchain screen
              └─► Operator taps "Anchor all"
                    └─► Transaction sent to Starknet Sepolia
                          └─► Event emitted: ProofAnchored(hash, facility, timestamp)
```

- The proof is a **Poseidon hash** of `(timestamp_ms, risk_level, facility_code)`.  
- No names, images, or clinical details ever leave the device.  
- After reload, the app re-checks each proof against the chain and marks it `anchored` automatically.

### Deployed contract

| Network | Address |
|---|---|
| Starknet Sepolia | [`0x437335ac6168b6114bbdff68abdf6334f9a14e3a597c7ce8d8cc5f48d79aa6a`](https://sepolia.voyager.online/contract/0x437335ac6168b6114bbdff68abdf6334f9a14e3a597c7ce8d8cc5f48d79aa6a) |

Browse all anchored proofs on [Voyager](https://sepolia.voyager.online/contract/0x437335ac6168b6114bbdff68abdf6334f9a14e3a597c7ce8d8cc5f48d79aa6a#events).

### Registered facilities

| Code | Name |
|---|---|
| 1 | BlueRockOptic |

### Environment variables

Create a `.env` at the repo root (gitignored):

```bash
# Starknet operator wallet (owner of ImpactRegistry)
EXPO_PUBLIC_STARKNET_ACCOUNT_ADDRESS=0x0061846dFea34312c274Ee9b06887e1ae9A9401D0A83D2ECa477B2EdD5D6b614
EXPO_PUBLIC_STARKNET_PRIVATE_KEY=0x011dafa5bbce54b7b4d0b78a180188e981fed4b39c51695ee8f9204579b56d38

# Optional: ONA API backend
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3002/api   # Android emulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3002/api # iOS / web
```

### Deploying a new contract

```bash
cd contracts
bun run scripts/deploy-contract.ts
# then register each clinic:
bun run scripts/register-facility.ts
```

The deploy script automatically updates `services/starknet.ts` with the new contract address.

### RPC nodes (Sepolia)

The app tries these in order:

1. `https://starknet-sepolia-rpc.publicnode.com` (primary)
2. `https://api.cartridge.gg/x/starknet/sepolia` (fallback)

Public RPCs can be flaky. If fee estimation fails the app falls back to manual `resourceBounds` (reading current block gas prices and applying a 2× safety margin).

---



We welcome contributors — especially around React Native/Expo, on-device ML, offline sync, DHIS2/digital health standards, and multilingual UX.

Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, workflow, and areas where we need help.

---

## Roadmap

- [x] Blockchain proof anchoring on Starknet Sepolia (ImpactRegistry contract)
- [x] Public aggregate impact dashboard reading live on-chain data
- [x] Offline proof queue with automatic on-chain status reconciliation
- [x] Operator wallet management (secure storage, cross-platform)
- [ ] Public Apache 2.0 release and contributor onboarding
- [ ] On-device TFLite vision models with documented metrics
- [ ] Starknet Mainnet migration
- [ ] DHIS2 integration scoping
- [ ] Expanded language support (e.g. Swahili, Lingala)
- [ ] Clinical validation with ophthalmologists and CHW pilots

---

## License

Copyright © WEZA LAB. Licensed under the [Apache License 2.0](./LICENSE).

---

## Contact

- **ONA / WEZA LAB:** wezalab@gmail.com  
- **Issues:** [GitHub Issues](https://github.com/Wezalab/ona/issues)  

ONA is built in the Democratic Republic of Congo for communities that deserve better access to eye care.
