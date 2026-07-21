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

---

## Privacy by design

- Patient data is stored **locally on the device**
- Only **anonymized aggregate** counts are intended for cloud sync (e.g. screenings per week, referrals by region)
- No identifiable patient information is sent to third parties for inference

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~51 · React Native 0.74 · TypeScript |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| Target | Android (primary) · iOS · Web (dev) |
| AI (roadmap) | TensorFlow Lite / on-device vision models |
| License | Apache 2.0 |

---

## Screens

```
Welcome → Language → Consent → Patient info → Eye capture
    → AI processing → Screening results → History / Settings
Visual acuity: Calibration → Test → Result
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
├── app/              # Screens (Expo Router)
├── components/       # Shared UI
├── contexts/         # App state (language, consent, session)
├── hooks/            # Custom hooks
├── constants/        # Colors, translations
├── assets/           # Images and icons
├── CONTRIBUTING.md   # How to contribute
├── USER-MANUAL.md    # End-user guide
└── LICENSE           # Apache 2.0
```

---

## Contributing

We welcome contributors — especially around React Native/Expo, on-device ML, offline sync, DHIS2/digital health standards, and multilingual UX.

Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, workflow, and areas where we need help.

---

## Roadmap

- [ ] Public Apache 2.0 release and contributor onboarding
- [ ] On-device TFLite vision models with documented metrics
- [ ] Public aggregate impact dashboard (anonymized real-time data)
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
