# Contributing to ONA

Thank you for your interest in contributing to ONA. This project is built and maintained by WEZA LAB. ONA is an open source mobile screening tool that uses on-device AI to detect early signs of vision impairment in low-resource clinical settings.

All contributions are licensed under [Apache 2.0](./LICENSE).

---

## Table of Contents

- [About the project](#about-the-project)
- [Areas where we need help](#areas-where-we-need-help)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Submitting a pull request](#submitting-a-pull-request)
- [Reporting a bug or requesting a feature](#reporting-a-bug-or-requesting-a-feature)
- [Code style](#code-style)
- [Community and contact](#community-and-contact)

---

## About the project

ONA is a React Native (Expo) mobile application for community health workers (CHWs) in sub-Saharan Africa. It guides CHWs through a structured eye screening workflow — patient consent, capture, AI analysis, and referral — entirely offline on low-cost Android devices.

The AI pipeline runs locally on-device using TensorFlow Lite. No patient data leaves the device. Only anonymized aggregate counts are synced to the cloud for public impact reporting.

---

## Areas where we need help

We welcome contributions in any of the following areas:

| Area | Skills |
|---|---|
| Android / React Native | Expo, Jetpack Compose interop, device compatibility testing |
| On-device AI / ML | TensorFlow Lite, model optimization, quantization, bias/fairness evaluation |
| Offline-first data | SQLite, Firebase Realtime DB, sync conflict resolution |
| Digital health standards | DHIS2 integration, ICD-10/11 coding, FHIR resources |
| Public data dashboard | Firebase → public read-only Firestore → Next.js or HTML dashboard |
| Accessibility & UX | Low-bandwidth UX, CHW-focused workflows, multilingual support (French, Swahili, Lingala) |
| Clinical validation tooling | Sensitivity/specificity benchmarking, ground-truth dataset tooling |
| Documentation | Translations, user guides, inline code comments |

If you are unsure where to start, look for issues tagged `good first issue`.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (preferred) or npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Android Studio](https://developer.android.com/studio) or a physical Android device for device testing
- An Expo account for running on a physical device via Expo Go

### Fork and clone

```bash
git clone https://github.com/Wezalab/ona.git
cd ona
```

### Install dependencies

```bash
bun install
# or
npm install
```

### Start the development server

```bash
bun start
# or
npx expo start
```

Then scan the QR code with Expo Go on your device, or press `a` to open on a connected Android emulator.

---

## Project structure

```
ona/
├── app/                    # Screens and routing (Expo Router file-based)
│   ├── _layout.tsx         # Root layout and navigation shell
│   ├── index.tsx           # Entry point
│   ├── welcome.tsx         # Onboarding
│   ├── consent.tsx         # Patient consent flow
│   ├── patient-info.tsx    # Patient registration
│   ├── eye-capture.tsx     # Camera capture screen
│   ├── ai-processing.tsx   # On-device TFLite inference
│   ├── screening-results.tsx
│   ├── screening-detail.tsx
│   ├── history.tsx         # Past screenings
│   ├── va-test.tsx         # Visual acuity test
│   ├── va-calibration.tsx
│   ├── va-result.tsx
│   ├── settings.tsx
│   └── about.tsx
├── components/             # Shared UI components
├── contexts/               # Global app state (AppContext)
├── hooks/                  # Custom React hooks
├── constants/              # App-wide constants and config
├── assets/                 # Images and static files
├── LICENSE                 # Apache 2.0
└── CONTRIBUTING.md         # This file
```

---

## Development workflow

1. **Create a branch** from `main` with a descriptive name:
   ```bash
   git checkout -b fix/consent-screen-back-button
   git checkout -b feat/dhis2-export
   ```

2. **Make your changes.** Keep each PR focused on a single concern — one bug fix or one feature at a time.

3. **Test on a real Android device** if your change touches camera, AI inference, or offline sync. Emulators do not accurately reflect low-end device performance.

4. **Run the linter** before committing:
   ```bash
   npm run lint
   ```

5. **Commit with a clear message** following the `type: description` convention:
   ```
   fix: handle null result from TFLite inference
   feat: add Swahili language option
   chore: update Expo SDK to 52
   docs: add inline comments to AppContext
   ```

6. **Push your branch** and open a pull request.

---

## Submitting a pull request

- Target the `main` branch.
- Fill in the PR description: what changed, why, and how to test it.
- Link the related issue if one exists (e.g. `Closes #42`).
- A maintainer from WEZA LAB will review within a few business days.
- Please be patient — we are a small team operating across time zones.

For large changes (new screens, new AI models, new data pipelines), open an issue first to discuss the approach before writing code.

---

## Reporting a bug or requesting a feature

Use [GitHub Issues](https://github.com/Wezalab/ona/issues).

When reporting a bug, please include:
- Device model and Android version
- Steps to reproduce
- Expected vs. actual behavior
- A screenshot or screen recording if relevant

---

## Code style

- **TypeScript** throughout. Avoid `any` — use proper types or generics.
- **Expo Router** file-based routing — each screen is a file in `app/`.
- **No patient data in logs or analytics.** Any logging that might touch patient info must be gated behind a debug flag.
- **Offline-first.** Assume no internet connection. Network calls are only for anonymous aggregate sync.
- Component files use `.tsx`, utility/hook files use `.ts`.

---

## Community and contact

- **Email:** wezalab@gmail.com
- **GitHub Discussions:** open a discussion for questions, ideas, or general feedback about ONA

We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. Be respectful, constructive, and inclusive.

---

*ONA is built by WEZA LAB in the Democratic Republic of Congo. Licensed under Apache 2.0.*
