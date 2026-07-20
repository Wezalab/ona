// Types mirroring the ONA backend API (NestJS) contract.
// Kept intentionally minimal — only the fields the mobile app sends/consumes.

import type { RiskLevel } from '@/services/starknet';

export type Role = 'admin' | 'supervisor' | 'health_worker';

export type Sex = 'male' | 'female' | 'other';

/** Backend wraps every success response in this envelope. */
export type ApiEnvelope<T> = {
  success: true;
  data: T;
  timestamp: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  role: Role;
  clinic?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type Clinic = {
  _id: string;
  code: number;
  name: string;
  province?: string;
  district?: string;
  status?: string;
};

export type Patient = {
  _id: string;
  reference: string;
  age?: number;
  sex?: Sex;
  clinic: string;
};

export type CreatePatientInput = {
  reference: string;
  age?: number;
  sex?: Sex;
  clinic: string;
};

/** AI prediction payload embedded in a screening. */
export type AiResultInput = {
  prediction: string;
  riskLevel: RiskLevel;
  confidence: number;
  modelVersion?: string;
  rawScores?: Record<string, number>;
};

export type DeviceInfoInput = {
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  deviceId?: string;
};

export type SyncInfoInput = {
  source?: 'online' | 'offline';
  clientRecordId?: string;
  capturedAt?: string;
};

export type CreateScreeningInput = {
  patient: string;
  clinic: string;
  ai: AiResultInput;
  images?: string[];
  isReferral?: boolean;
  device?: DeviceInfoInput;
  sync?: SyncInfoInput;
};

export type SyncScreeningsResult = {
  created: number;
  duplicates: number;
  ids: string[];
};

export type BlockchainStatus =
  | 'pending'
  | 'anchoring'
  | 'anchored'
  | 'failed'
  | 'disabled';

export type ScreeningBlockchainRef = {
  status: BlockchainStatus;
  proof?: string;
  txHash?: string;
  blockNumber?: number;
  anchoredAt?: string;
  onChainVerified?: boolean | null;
};
