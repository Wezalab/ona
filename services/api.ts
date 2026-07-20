// ONA REST API client for the mobile app.
//
// Responsibilities:
//   - Resolve the API base URL (runtime override → env → localhost default).
//   - Persist/attach JWT access + refresh tokens; transparently refresh on 401.
//   - Unwrap the backend's `{ success, data }` envelope.
//   - Surface network failures distinctly so the offline queue can retry later.

import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from '@/constants/config';
import { getItem, getJSON, removeItem, setItem, setJSON } from '@/services/storage';
import type {
  ApiEnvelope,
  AuthUser,
  Clinic,
  CreatePatientInput,
  CreateScreeningInput,
  LoginResponse,
  Patient,
  ScreeningBlockchainRef,
  SyncScreeningsResult,
  TokenPair,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly isNetworkError = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  /** Internal: prevents infinite refresh recursion. */
  _retry?: boolean;
};

class ApiClient {
  private baseUrl = DEFAULT_API_BASE_URL;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private loaded = false;

  /** Hydrate base URL + tokens from storage. Safe to call repeatedly. */
  async init(): Promise<void> {
    if (this.loaded) return;
    const [savedUrl, access, refresh] = await Promise.all([
      getItem(STORAGE_KEYS.apiBaseUrl),
      getItem(STORAGE_KEYS.accessToken),
      getItem(STORAGE_KEYS.refreshToken),
    ]);
    if (savedUrl) this.baseUrl = savedUrl;
    this.accessToken = access;
    this.refreshToken = refresh;
    this.loaded = true;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url.replace(/\/+$/, '');
    await setItem(STORAGE_KEYS.apiBaseUrl, this.baseUrl);
  }

  isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  private async persistTokens(tokens: TokenPair): Promise<void> {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    await Promise.all([
      setItem(STORAGE_KEYS.accessToken, tokens.accessToken),
      setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken),
    ]);
  }

  private async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    await Promise.all([
      removeItem(STORAGE_KEYS.accessToken),
      removeItem(STORAGE_KEYS.refreshToken),
      removeItem(STORAGE_KEYS.authUser),
    ]);
  }

  // ─── Core request ─────────────────────────────────────────────────────────

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    await this.init();
    const { method = 'GET', body, auth = true, _retry = false } = options;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      // fetch rejects only on network failure (no connectivity, DNS, etc.)
      throw new ApiError(
        err instanceof Error ? err.message : 'Network request failed',
        0,
        true,
      );
    }

    // Transparent one-shot refresh on expired access token
    if (res.status === 401 && auth && !_retry && this.refreshToken) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, { ...options, _retry: true });
    }

    const text = await res.text();
    const json = text ? safeParse(text) : null;

    if (!res.ok) {
      const message =
        (json && (json.message as string)) || res.statusText || `HTTP ${res.status}`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, res.status);
    }

    // Unwrap the { success, data } envelope when present
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as ApiEnvelope<T>).data;
    }
    return json as T;
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const tokens = await this.request<TokenPair>('/auth/refresh', {
        method: 'POST',
        auth: false,
        body: { refreshToken: this.refreshToken },
        _retry: true,
      });
      await this.persistTokens(tokens);
      return true;
    } catch {
      await this.clearTokens();
      return false;
    }
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthUser> {
    const res = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await this.persistTokens(res);
    await setJSON(STORAGE_KEYS.authUser, res.user);
    return res.user;
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) await this.request<void>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore server errors on logout
    }
    await this.clearTokens();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return getJSON<AuthUser>(STORAGE_KEYS.authUser);
  }

  // ─── Resources ──────────────────────────────────────────────────────────────

  async getActiveClinics(): Promise<Clinic[]> {
    // GET /clinics returns active clinics for the picker (any authenticated role)
    return this.request<Clinic[]>('/clinics');
  }

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    return this.request<Patient>('/patients', { method: 'POST', body: input });
  }

  async syncScreenings(screenings: CreateScreeningInput[]): Promise<SyncScreeningsResult> {
    return this.request<SyncScreeningsResult>('/screenings/sync', {
      method: 'POST',
      body: { screenings },
    });
  }

  async getScreeningBlockchain(id: string): Promise<ScreeningBlockchainRef> {
    return this.request<ScreeningBlockchainRef>(`/screenings/${id}/blockchain`);
  }
}

function safeParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const api = new ApiClient();
