export type IntervalsAuth =
  | {
      type: 'apiKey';
      /**
       * Intervals.icu API key (used as Basic auth password with username "API_KEY")
       */
      apiKey: string;
    }
  | {
      type: 'accessToken';
      /**
       * OAuth access token (used as Bearer token)
       */
      accessToken: string;
    };

export type RetryConfig = {
  /**
   * Maximum number of retries for 429 responses.
   * Total attempts = 1 initial request + `limit` retries.
   * Default: 3
   */
  limit?: number;
  /**
   * Fallback base delay when Retry-After is missing.
   * Default: 1000ms
   */
  initialDelayMs?: number;
  /**
   * Fallback max delay when Retry-After is missing.
   * Default: 8000ms
   */
  maxDelayMs?: number;
  /**
   * Enable jitter to prevent thundering herd problem.
   * When true, adds random variation to retry delays.
   * Default: true
   */
  jitter?: boolean;
  /**
   * Jitter factor (0-1). Determines how much randomness to add.
   * For example, 0.2 means ±20% variation.
   * Default: 0.2
   */
  jitterFactor?: number;
};

export type RequestHooks = {
  /**
   * Called before each request is sent.
   */
  onRequest?: (info: {
    method: string;
    path: string;
    options?: Record<string, unknown>;
  }) => void | Promise<void>;
  /**
   * Called after a successful response.
   */
  onResponse?: (info: {
    method: string;
    path: string;
    status: number;
    durationMs: number;
  }) => void | Promise<void>;
  /**
   * Called when an error occurs (HTTP error, network error, timeout, etc.).
   */
  onError?: (info: {
    method: string;
    path: string;
    error: Error | unknown;
    durationMs: number;
  }) => void | Promise<void>;
  /**
   * Called when a retry is about to happen.
   */
  onRetry?: (info: {
    method: string;
    path: string;
    attempt: number;
    maxAttempts: number;
    delayMs: number;
    reason: string;
  }) => void | Promise<void>;
};

export type IntervalsClientConfig = {
  auth: IntervalsAuth;
  /**
   * Base URL for the API (defaults to Intervals.icu v1 API).
   */
  baseUrl?: string;
  /**
   * Request timeout in milliseconds.
   * Default: 30000ms (30 seconds)
   */
  timeoutMs?: number;
  /**
   * Retry behavior for rate limiting.
   */
  retry?: RetryConfig;
  /**
   * Hooks for logging, metrics, and observability.
   */
  hooks?: RequestHooks;
};

export const DEFAULT_BASE_URL = 'https://intervals.icu/api/v1';

export function buildAuthorizationHeader(auth: IntervalsAuth): string {
  if (auth.type === 'apiKey') {
    const token = Buffer.from(`API_KEY:${auth.apiKey}`, 'utf8').toString('base64');
    return `Basic ${token}`;
  }
  return `Bearer ${auth.accessToken}`;
}



