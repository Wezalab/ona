// ONA API configuration.
//
// The base URL resolves in this order:
//   1. A runtime override saved from the in-app API settings screen.
//   2. The `EXPO_PUBLIC_API_BASE_URL` build-time env var (Expo inlines it).
//   3. A localhost default for development.
//
// Only `EXPO_PUBLIC_*` vars are exposed to the app bundle by Expo.

export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

// AsyncStorage keys (namespaced to avoid collisions).
export const STORAGE_KEYS = {
  apiBaseUrl: 'ona.api.baseUrl',
  accessToken: 'ona.auth.accessToken',
  refreshToken: 'ona.auth.refreshToken',
  authUser: 'ona.auth.user',
  selectedClinic: 'ona.clinic.selected',
  screeningQueue: 'ona.screenings.queue',
} as const;
