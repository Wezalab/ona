# ONA: Open-source eye screening for women and girls in low-resource settings

**Applicant:** WEZA LAB, Democratic Republic of Congo
**Submission to:** UNICEF Venture Fund, FemTech call 2026
**Focus area:** Pillar 1, Healthcare access for women and girls (affordable screening, point-of-care diagnostic support, referral and follow-up, community health worker tools)
**Licence:** Apache 2.0 (all three repositories)
**Contact:** wezalab@gmail.com
**Demo video:** https://www.youtube.com/watch?v=gtX4Hn4JZc0

---

## 1. Summary

ONA is an open-source mobile app that lets a community health worker (CHW) screen a person's eyesight with a low-cost Android phone, flag who is at risk of avoidable blindness, and refer them to an eye clinic. It works without internet, runs in English, French, Swahili and Lingala, and keeps patient data on the device. An anonymous proof of every screening is written to a public blockchain, so funders, ministries and the public can verify how many people were screened and referred, without seeing anyone's personal data.

Women and girls carry most of the world's vision loss, and they are the least likely to reach treatment. ONA brings the first step of eye care, which is being tested and referred, to the places where they already are: villages, schools, antenatal and community health posts. That step should not depend on travel, money or a husband's permission.

With UNICEF support we will (1) make every ONA report and public statistic sex-disaggregated, (2) track referrals through to treatment so we can see and close the gap for women, (3) add on-device AI image support for cataract triage, validated with ophthalmologists, and (4) run a pilot with women CHWs in the DRC.

---

## 2. The problem

- **Women and girls carry most of the burden.** The International Agency for the Prevention of Blindness (IAPB) reports that about 55% of people with vision impairment are women and girls.
- **Women are treated less.** In sub-Saharan Africa, cataract surgical coverage for women is lower than for men in almost every published survey, sometimes only half. Cataract is the leading cause of blindness, and it is curable with a short operation.
- **The cause is access, not biology.** Women live longer, so they have more age-related cataract. They also have less money of their own, less freedom to travel to a distant hospital, and more caregiving duties. For girls, uncorrected poor eyesight affects schooling, which affects everything after.
- **Specialists are rare.** The DRC has very few ophthalmologists for a population of more than 100 million, almost all in cities. CHWs, many of whom are women, are often the only health contact a rural woman has. Today they have no structured tool to test eyesight or decide who must be referred.
- **Data is missing.** Ministries and donors rarely know how many women were screened, referred and treated. Without that data the gender gap stays invisible and unfunded.

---

## 3. The solution: what ONA does today

ONA is a working prototype. The mobile app, the backend API and the public impact website all run today.

### 3.1 Mobile app for community health workers (Android first, also iOS and web)

| Feature | What it does |
|---|---|
| **Guided screening** | Step by step: language, informed consent, patient details (age, sex), eye photos, vision test, result and referral advice. |
| **Visual acuity test** | A "tumbling E" test from 6/60 to 6/6, run on the phone screen. The screen is calibrated with any bank card (a standard size), so no special chart is needed. Each eye is tested separately at 3 m or 6 m. |
| **Cataract examination** | A structured exam modelled on hospital practice: symptoms and risk factors (diabetes, hypertension, steroids, trauma and others), unaided and pinhole acuity, torch exam (red reflex, pupils, white pupil), WHO simplified lens grading, and eye photos. |
| **Triage and referral** | Clear, transparent rules based on WHO visual impairment thresholds classify each person as low, medium or high risk and give referral advice. ONA does not diagnose; an eye specialist confirms. |
| **Offline first** | Everything works with no network. Data stays on the phone and syncs later only if the clinic chooses to. |
| **Local languages** | English, French, Swahili and Lingala. |
| **History and reports** | CHWs can review past screenings and print or share a result sheet. |

### 3.2 Backend API (optional, for clinics and programmes)

A secure server (NestJS, MongoDB, run with Docker) for clinics that want central records: user accounts with roles, clinics, patients, screenings, photo storage, statistics, dashboards and an audit log. It is the only system allowed to write to the blockchain.

### 3.3 Public impact dashboard

A public website that reads statistics straight from the blockchain: total screenings, referrals, risk levels and facilities reached. Nobody, including WEZA LAB, can inflate these numbers after the fact.

### 3.4 Frontier technology

- **Blockchain (live).** Each completed screening produces an anonymous fingerprint (a Poseidon hash of time, risk level and facility code). That fingerprint is anchored on Starknet through our open-source `ImpactRegistry` smart contract. It contains no name, photo, age or sex, and cannot be traced back to a person. It gives donors and governments real-time, tamper-proof impact data.
- **AI (in development, funded by this grant).** ONA already captures standardised eye photos together with an exam result. That is the training and validation data an on-device model needs. We will add a small model that runs on the phone (no internet, no data sent away) to support cataract and white-pupil detection. It will be validated against ophthalmologist diagnosis before any field use. Today's triage is deliberately rule-based and explainable.

---

## 4. Why this matters for women and girls

1. **Care comes to her.** Screening happens where women already go: the community health post, antenatal visit, women's group or school. She does not need to travel to the city just to find out whether she needs to travel to the city.
2. **Women CHWs.** The tool is simple, visual and in local languages, so women CHWs can run it with little training. This strengthens women's role and income in the health workforce.
3. **Girls in school.** The 3 m vision test works in a classroom, so girls with poor eyesight can be found and helped before they fall behind or drop out.
4. **Making the gap visible.** With this grant, every count ONA publishes will be split by sex and age group. Ministries will see for the first time how many women were screened, referred and actually treated, and where women are being lost along the way.
5. **Privacy as protection.** Women's health data can be sensitive. ONA collects only what is needed, asks for consent first, keeps data on the device and never puts personal data on the blockchain.

---

## 5. Safety, privacy and consent by design

- **Consent first.** The app will not start a screening until informed consent is recorded.
- **Data minimisation.** Only a patient reference, age, sex and the test results are collected. No national ID is required.
- **Local by default.** Data stays on the phone. Sync to a clinic server is optional, encrypted, and requires a logged-in, role-based account.
- **Nothing personal on-chain.** Only anonymous hashes and totals go to the blockchain.
- **Not a diagnosis.** Results are triage advice with clear wording; final diagnosis is always by a qualified eye professional.
- **Auditable.** The backend keeps an audit log of who accessed or changed records.
- **Open source.** All code is public under Apache 2.0 and can be reviewed by anyone.

---

## 6. Open source

| Repository | Content |
|---|---|
| [github.com/Wezalab/ona](https://github.com/Wezalab/ona) | Mobile app (React Native / Expo) and Cairo smart contract |
| [github.com/Wezalab/ona-api](https://github.com/Wezalab/ona-api) | Backend API (NestJS, MongoDB, Docker) |
| [github.com/guillainbisimwa/ona-web](https://github.com/guillainbisimwa/ona-web) | Public impact website (Next.js) |

Other countries and organisations can reuse ONA freely. The cataract exam rules, the vision test and the translations are separate, readable modules that can be adapted to new protocols and languages. Future work includes DHIS2 integration so results can flow into national health information systems.

---

## 7. Stage and traction

- **Stage:** Working prototype, deployed for testing. The app, API, smart contract and public dashboard are all functional.
- **Development:** Active since January 2026, more than 250 commits.
- **Blockchain:** `ImpactRegistry` deployed on Starknet Sepolia (test network), with one facility registered (BlueRockOptic).
- **Screenings to date:** [TO COMPLETE: number of people screened, % women, number referred]
- **Partners:** [TO COMPLETE: clinics, health zones, ophthalmologists, NGOs, letters of support]
- **Recognition:** [TO COMPLETE: prizes, accelerators, previous funding]

---

## 8. What we will do with UNICEF support (12 months)

| Months | Milestone |
|---|---|
| 1–3 | **Gender data.** Sex- and age-disaggregated statistics in the app, API, smart contract and public dashboard. Referral follow-up: record whether each referred person reached the clinic and was treated. |
| 1–6 | **On-device AI.** Collect a consented, anonymised photo dataset with ophthalmologist labels. Train and test a small on-device model for cataract and white-pupil support. Publish the method and accuracy openly. |
| 4–9 | **Pilot.** Train [TO COMPLETE: number] CHWs, mostly women, in [TO COMPLETE: health zones, e.g. South Kivu] to screen [TO COMPLETE: target] people, at least 55% women and girls, including school screening for girls. |
| 7–12 | **Clinical validation and scale.** Compare ONA triage with specialist diagnosis. Move the registry to Starknet mainnet. Scope DHIS2 integration with the Ministry of Health. Prepare the next phase with government and partners. |

### Success measures

- Number of people screened, with the share of women and girls
- Number referred, and the share who reached treatment, by sex
- Accuracy of triage and of the AI model compared with ophthalmologist diagnosis (sensitivity and specificity)
- Number of CHWs trained, and the share who are women
- Gap between women's and men's referral completion, measured at the start and the end

### Use of funds (indicative)

| Item | Share |
|---|---|
| Pilot (CHW training, field costs, phones, transport for referrals) | [TO COMPLETE] |
| AI model, dataset and clinical validation | [TO COMPLETE] |
| Software development (gender data, referral tracking, DHIS2) | [TO COMPLETE] |
| Blockchain mainnet costs and hosting | [TO COMPLETE] |
| Safety, privacy and ethics review | [TO COMPLETE] |

---

## 9. Team

[TO COMPLETE: founders and key team members, their roles, gender and age (the call encourages women-led teams and founders under 35), and clinical advisers.]

**Company registration:** [TO COMPLETE: legal name, country of registration and number. The company must be registered in a UNICEF programme country.]

---

## 10. Sources

- IAPB, Vision Atlas, *Gender and eye health*: https://visionatlas.iapb.org/topics/gender/
- *Overcoming gender inequity in prevention of blindness and visual impairment in Africa*: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3119299/
- UNICEF Venture Fund, *FemTech call*: https://www.unicef.org/innovation/FemTechCall
