// Offline-first screening queue.
//
// Screenings are captured into a persisted queue and flushed to the ONA API
// when connectivity allows. Sync is idempotent: each item carries a stable
// `clientRecordId` that the backend's `/screenings/sync` de-duplicates, so
// retries never create duplicates.
//
// Each item first ensures its (pseudonymized) patient exists on the server,
// caching the returned patient id so partial-failure retries skip re-creation.

import { STORAGE_KEYS } from '@/constants/config';
import { getJSON, setJSON } from '@/services/storage';
import { api, ApiError } from '@/services/api';
import type { AiResultInput, CreateScreeningInput, Sex } from '@/types/api';

export type QueuedScreening = {
  clientRecordId: string;
  createdAt: string;
  capturedAt: string;
  // Patient (pseudonymized — no name is ever sent to the server)
  patientReference: string;
  patientAge?: number;
  patientSex?: Sex;
  clinicId: string;
  clinicCode: number;
  ai: AiResultInput;
  isReferral: boolean;
  device?: CreateScreeningInput['device'];
  // Mutable sync state
  patientId?: string;
  attempts: number;
  lastError?: string;
};

export type FlushResult = {
  synced: number;
  remaining: number;
  failed: number;
};

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readQueue(): Promise<QueuedScreening[]> {
  return (await getJSON<QueuedScreening[]>(STORAGE_KEYS.screeningQueue)) ?? [];
}

async function writeQueue(items: QueuedScreening[]): Promise<void> {
  await setJSON(STORAGE_KEYS.screeningQueue, items);
}

/** Input needed to enqueue a screening (patient name is intentionally excluded). */
export type EnqueueInput = {
  patientReference?: string;
  patientAge?: number;
  patientSex?: Sex;
  clinicId: string;
  clinicCode: number;
  ai: AiResultInput;
  isReferral: boolean;
  device?: CreateScreeningInput['device'];
};

/** Add a screening to the persisted queue and return the stored item. */
export async function enqueueScreening(input: EnqueueInput): Promise<QueuedScreening> {
  const now = new Date().toISOString();
  const item: QueuedScreening = {
    clientRecordId: uid('scr'),
    createdAt: now,
    capturedAt: now,
    patientReference: input.patientReference?.trim() || uid('pt'),
    patientAge: input.patientAge,
    patientSex: input.patientSex,
    clinicId: input.clinicId,
    clinicCode: input.clinicCode,
    ai: input.ai,
    isReferral: input.isReferral,
    device: input.device,
    attempts: 0,
  };
  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);
  return item;
}

export async function getQueue(): Promise<QueuedScreening[]> {
  return readQueue();
}

export async function getPendingCount(): Promise<number> {
  return (await readQueue()).length;
}

let flushing = false;

/**
 * Attempt to sync every queued screening. Network failures leave items in the
 * queue for a later retry; validation/permission errors (4xx, non-idempotency)
 * are recorded but keep the item so an operator can investigate.
 * Returns a summary. Safe against concurrent invocation.
 */
export async function flushQueue(): Promise<FlushResult> {
  if (flushing) return { synced: 0, remaining: (await readQueue()).length, failed: 0 };
  if (!api.isAuthenticated()) {
    return { synced: 0, remaining: (await readQueue()).length, failed: 0 };
  }
  flushing = true;
  let synced = 0;
  let failed = 0;
  try {
    const queue = await readQueue();
    const survivors: QueuedScreening[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        await syncOne(item);
        synced += 1;
      } catch (err) {
        item.attempts += 1;
        item.lastError = err instanceof Error ? err.message : String(err);
        // On a network error, always keep for later. On a hard 4xx we still
        // keep it (bounded) so data is never silently dropped.
        if (err instanceof ApiError && !err.isNetworkError) failed += 1;
        survivors.push(item);
      }
      // Persist progress after each item so a mid-flush kill never loses data:
      // remaining = survivors so far + items not yet processed.
      await writeQueue([...survivors, ...queue.slice(i + 1)]);
    }

    return { synced, remaining: survivors.length, failed };
  } finally {
    flushing = false;
  }
}

/** Ensure the patient exists, then idempotently sync the screening. */
async function syncOne(item: QueuedScreening): Promise<void> {
  if (!item.patientId) {
    try {
      const patient = await api.createPatient({
        reference: item.patientReference,
        age: item.patientAge,
        sex: item.patientSex,
        clinic: item.clinicId,
      });
      item.patientId = patient._id;
    } catch (err) {
      // Reference collided from a prior partial attempt — use a fresh one.
      if (err instanceof ApiError && err.status === 409) {
        item.patientReference = uid('pt');
        const patient = await api.createPatient({
          reference: item.patientReference,
          age: item.patientAge,
          sex: item.patientSex,
          clinic: item.clinicId,
        });
        item.patientId = patient._id;
      } else {
        throw err;
      }
    }
  }

  const screening: CreateScreeningInput = {
    patient: item.patientId,
    clinic: item.clinicId,
    ai: item.ai,
    isReferral: item.isReferral,
    device: item.device,
    sync: {
      source: 'offline',
      clientRecordId: item.clientRecordId,
      capturedAt: item.capturedAt,
    },
  };
  // /screenings/sync is idempotent on clientRecordId → safe to retry
  await api.syncScreenings([screening]);
}
