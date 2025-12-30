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
   */
  limit?: number;
  /**
   * Fallback base delay when Retry-After is missing.
   */
  initialDelayMs?: number;
  /**
   * Fallback max delay when Retry-After is missing.
   */
  maxDelayMs?: number;
};

export type IntervalsClientConfig = {
  auth: IntervalsAuth;
  /**
   * Base URL for the API (defaults to Intervals.icu v1 API).
   */
  baseUrl?: string;
  /**
   * Request timeout in milliseconds.
   */
  timeoutMs?: number;
  /**
   * Retry behavior for rate limiting.
   */
  retry?: RetryConfig;
};

export const DEFAULT_BASE_URL = 'https://intervals.icu/api/v1';

export function buildAuthorizationHeader(auth: IntervalsAuth): string {
  if (auth.type === 'apiKey') {
    const token = Buffer.from(`API_KEY:${auth.apiKey}`, 'utf8').toString('base64');
    return `Basic ${token}`;
  }
  return `Bearer ${auth.accessToken}`;
}


