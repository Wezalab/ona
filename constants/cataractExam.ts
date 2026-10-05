/**
 * Cataract examination model, modelled on the hospital / community workflow:
 * registration -> symptom & risk history -> Snellen acuity (unaided + pinhole)
 * -> torch exam (red reflex, pupils) -> WHO simplified lens grading
 * (nuclear / cortical / posterior subcapsular, grade 0-3) -> assessment.
 *
 * The assessment is a transparent rule set, NOT a diagnosis and NOT AI. It
 * only triages who should be referred; an ophthalmologist confirms.
 */

/** Snellen categories ordered best -> worst (WHO acuity categories). */
export const VA_SCALE = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', 'CF', 'HM', 'PL'] as const;
export type VaCode = (typeof VA_SCALE)[number];

export const vaIndex = (v: VaCode): number => VA_SCALE.indexOf(v);

/** Visual impairment starts worse than 6/18 (WHO). */
const IMPAIRED_FROM = vaIndex('6/18') + 1;

export type RedReflex = 'normal' | 'dim' | 'absent';
export type PupilReaction = 'normal' | 'afferent';
export type LensGrade = 0 | 1 | 2 | 3;
export type SymptomDuration = 'short' | 'medium' | 'long';

export const SYMPTOM_KEYS = ['blur', 'glare', 'color', 'night', 'double', 'change'] as const;
export const RISK_FACTOR_KEYS = ['diabetes', 'steroid', 'smoking', 'trauma', 'family', 'hypertension'] as const;
export type SymptomKey = (typeof SYMPTOM_KEYS)[number];
export type RiskFactorKey = (typeof RISK_FACTOR_KEYS)[number];

export interface CataractEyeExam {
  vaUnaided: VaCode;
  vaPinhole: VaCode;
  redReflex: RedReflex;
  pupil: PupilReaction;
  leukocoria: boolean;
  nuclear: LensGrade;
  cortical: LensGrade;
  psc: LensGrade;
  photoUri?: string;
}

export type EyeFinding = 'normal' | 'monitor' | 'cataract' | 'urgent';
export type Urgency = 'routine' | 'soon' | 'urgent';
export type Risk = 'low' | 'medium' | 'high';

export interface EyeAssessment {
  finding: EyeFinding;
  maxGrade: LensGrade;
  visualImpairment: boolean;
  pinholeImproves: boolean;
}

export interface CataractAssessment {
  rightEye: EyeAssessment;
  leftEye: EyeAssessment;
  overallRisk: Risk;
  urgency: Urgency;
  referralNeeded: boolean;
}

export function assessEye(e: CataractEyeExam): EyeAssessment {
  const maxGrade = Math.max(e.nuclear, e.cortical, e.psc) as LensGrade;
  const best = Math.min(vaIndex(e.vaUnaided), vaIndex(e.vaPinhole));
  const visualImpairment = best >= IMPAIRED_FROM;
  // Two or more lines better with a pinhole points to a refractive error.
  const pinholeImproves = vaIndex(e.vaUnaided) - vaIndex(e.vaPinhole) >= 2;
  const reflexAbnormal = e.redReflex !== 'normal';

  let finding: EyeFinding = 'normal';
  if (e.leukocoria || e.pupil === 'afferent') {
    // A white pupil or afferent defect can be other serious disease.
    finding = 'urgent';
  } else if (maxGrade >= 2 && (visualImpairment || reflexAbnormal) && !pinholeImproves) {
    finding = 'cataract';
  } else if (maxGrade >= 1 || reflexAbnormal || (visualImpairment && !pinholeImproves)) {
    finding = 'monitor';
  }
  return { finding, maxGrade, visualImpairment, pinholeImproves };
}

export function assessExam(right: CataractEyeExam, left: CataractEyeExam): CataractAssessment {
  const rightEye = assessEye(right);
  const leftEye = assessEye(left);
  const findings = [rightEye.finding, leftEye.finding];
  const urgency: Urgency = findings.includes('urgent') ? 'urgent' : findings.includes('cataract') ? 'soon' : 'routine';
  const overallRisk: Risk = urgency === 'routine' ? (findings.includes('monitor') ? 'medium' : 'low') : 'high';
  return { rightEye, leftEye, overallRisk, urgency, referralNeeded: overallRisk === 'high' };
}

export interface CataractExamRecord {
  id: string;
  timestamp: number;
  patientInfo: { patientId?: string; age?: string; gender?: 'male' | 'female' | 'other'; notes?: string };
  duration?: SymptomDuration;
  symptoms: SymptomKey[];
  riskFactors: RiskFactorKey[];
  rightEye: CataractEyeExam;
  leftEye: CataractEyeExam;
  assessment: CataractAssessment;
}
