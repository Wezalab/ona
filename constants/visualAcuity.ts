// Single source of truth for the visual-acuity exam's clinical parameters.
// An eye-care specialist can review/tune these numbers without touching any
// screen or state-machine code.

export type RiskLevel = 'low' | 'medium' | 'high';
export type TestDistanceMeters = 3 | 6;
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Snellen denominators, largest/easiest optotype first ("A by A"). */
export const SNELLEN_DENOMINATORS: number[] = [60, 36, 24, 18, 12, 9, 6];

/** Real 2-of-3 staircase: up to 3 trials per line, 2 correct to pass. */
export const TRIALS_PER_LEVEL = 3;
export const CORRECT_TO_PASS = 2;
/** A line is failed as soon as this many incorrect answers are given (can no longer reach CORRECT_TO_PASS). */
export const INCORRECT_TO_FAIL = TRIALS_PER_LEVEL - CORRECT_TO_PASS + 1;

export const DISTANCE_OPTIONS_M: TestDistanceMeters[] = [3, 6];
export const DEFAULT_DISTANCE_M: TestDistanceMeters = 3;

/** ISO/IEC 7810 ID-1 card (standard bank/ID card) used to calibrate screen scale. */
export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 53.98;

export interface SnellenLine {
  denominator: number;
  label: string;
  decimal: number;
}

export const SNELLEN_LINES: SnellenLine[] = SNELLEN_DENOMINATORS.map((denominator) => ({
  denominator,
  label: `6/${denominator}`,
  decimal: Math.round((6 / denominator) * 100) / 100,
}));

export function snellenLabel(denominator: number): string {
  return `6/${denominator}`;
}

export function snellenDecimal(denominator: number): number {
  return Math.round((6 / denominator) * 100) / 100;
}

/**
 * Risk banding by Snellen denominator reached (bigger denominator = worse acuity).
 * Adjustable by a clinician: low = 6/6-6/12, medium = 6/18-6/24, high = 6/36 or worse.
 */
export function riskForSnellenDenominator(denominator: number): RiskLevel {
  if (denominator <= 12) return 'low';
  if (denominator <= 24) return 'medium';
  return 'high';
}

/**
 * Physically correct optotype height (in millimeters) for a given Snellen line,
 * scaled to the actual test distance.
 *
 * Standard optotypes are designed so their overall height subtends 5 arcminutes
 * of visual angle at the line's design distance (e.g. the 6/6 letter subtends 5'
 * at 6m; the 6/60 letter — 10x bigger — subtends the same 5' but at 60m).
 * The angle required to test a given line is therefore independent of where the
 * patient is actually standing: requiredAngle(denominator) = 5' * (denominator / 6).
 * We then convert that fixed angle into a physical size at the *actual* test
 * distance so the exam stays clinically valid at both 3m and 6m.
 */
export function computeOptotypeHeightMm(denominator: number, distanceMeters: number): number {
  const distanceMm = distanceMeters * 1000;
  const requiredAngleArcmin = 5 * (denominator / 6);
  const halfAngleRad = (requiredAngleArcmin / 2) * (Math.PI / (180 * 60));
  return 2 * distanceMm * Math.tan(halfAngleRad);
}

export interface EyeVisualAcuity {
  /** Snellen denominator reached, e.g. 12 means 6/12. */
  denominator: number;
  snellen: string;
  decimal: number;
  risk: RiskLevel;
  /** True if the patient could not reliably read even the largest (6/60) optotype. */
  belowChart: boolean;
}

export function buildEyeResult(denominator: number, belowChart: boolean): EyeVisualAcuity {
  return {
    denominator,
    snellen: snellenLabel(denominator),
    decimal: snellenDecimal(denominator),
    risk: belowChart ? 'high' : riskForSnellenDenominator(denominator),
    belowChart,
  };
}
