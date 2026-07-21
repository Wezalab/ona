import { Buffer } from 'buffer';

// Make Buffer available globally — required by starknet.js in React Native
if (typeof global.Buffer === 'undefined') {
  (global as unknown as Record<string, unknown>).Buffer = Buffer;
}
