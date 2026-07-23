# ONA User Manual

## Overview

Welcome to the ONA application user manual.

ONA is a mobile vision screening app for community health workers. It guides you through patient consent, eye capture, AI analysis, visual acuity testing, and screening results — including when you are offline.

## Features

### Screens

- **Welcome**: Initial welcome screen
- **Language Select**: Choose your preferred language
- **Home**: Main dashboard
- **Patient Info**: Patient information management
- **Consent**: Consent forms and agreements
- **Eye Capture**: Eye image capture interface
- **AI Processing**: AI analysis processing screen
- **VA Test**: Visual acuity test
- **VA Calibration**: Visual acuity calibration
- **VA Result**: Visual acuity test results
- **Screening Results**: Complete screening results
- **Screening Detail**: Detailed screening information
- **History**: Patient history and records
- **Blockchain (Preuves)**: On-chain proof anchoring and impact registry
- **Settings**: Application settings
- **About**: Application information

## Getting Started

1. Launch ONA
2. Select your preferred language
3. Review and accept the consent terms
4. Follow the on-screen instructions to complete a screening

---

## Blockchain proof anchoring

Every completed screening can be cryptographically anchored to the **Starknet Sepolia** blockchain, creating an immutable, independently verifiable record of your impact — without storing any patient data on-chain.

### What gets anchored

A **Poseidon hash** of `(timestamp, risk_level, facility_code)` is submitted as a transaction. No patient names, images, or clinical details ever leave the device.

### How to anchor proofs

1. Open **Home → Blockchain** (the chain icon in the navigation).
2. The screen automatically loads all local screenings into the **proof queue**.
3. Each proof shows one of three states:
   - 🟡 **Pending** — not yet sent to the blockchain
   - 🔵 **Submitting** — transaction in flight
   - 🟢 **Anchored** — confirmed on-chain
4. Tap **"Anchor all pending"** to submit all pending proofs in sequence.
5. Once anchored, tap **"Voir sur Voyager"** to open the transaction or the contract's event log on [Voyager Explorer](https://sepolia.voyager.online/).

### Network status

The top of the screen shows:
- **Réseau** (Network): Connected ✅ or Disconnected ❌
- **Contrat**: The deployed ImpactRegistry contract address
- **En attente / Ancrées**: Count of pending vs. anchored proofs in the current session

### Wallet configuration (operator only)

The blockchain screen includes a section for the **operator wallet** — the Starknet account that signs and pays for transactions.

- The wallet is pre-configured via environment variables (`EXPO_PUBLIC_STARKNET_ACCOUNT_ADDRESS` / `EXPO_PUBLIC_STARKNET_PRIVATE_KEY`).
- Field health workers do **not** need to enter a wallet — anchoring happens automatically with the shared operator key.
- Supervisors can override the wallet address/key in the UI; credentials are stored in device secure storage (Keychain / Keystore) and never sent to any server.

---

## Support

For support and questions about ONA, contact WEZA LAB at **wezalab@gmail.com**.

## Local API (development)

When testing against a local ONA API, sign in from **Home → ONA server** with the seeded admin account configured in the API `.env` (see `ona-api` `.env.example`). Do not paste access or refresh tokens into this file.
