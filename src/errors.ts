/**
 * Discriminated union of all possible API errors.
 * All errors include a `message` field describing the error.
 *
 * HTTP errors (Unauthorized, Forbidden, NotFound, RateLimit, Http) include:
 * - `status`: HTTP status code
 * - `body`: Optional response body from the server
 *
 * Schema errors include:
 * - `issues`: Validation issues from schema parsing
 * - `cause`: The underlying validation error
 *
 * Network errors (Timeout, Network, Unknown) include:
 * - `cause`: The underlying error that caused the failure
 */
export type ApiError =
  | {
      /** Authentication failed (invalid or missing credentials) */
      kind: 'Unauthorized';
      status: 401;
      message: string;
      body?: unknown;
    }
  | {
      /** Access denied (valid credentials but insufficient permissions) */
      kind: 'Forbidden';
      status: 403;
      message: string;
      body?: unknown;
    }
  | {
      /** Resource not found */
      kind: 'NotFound';
      status: 404;
      message: string;
      body?: unknown;
    }
  | {
      /** Rate limit exceeded. Check `retryAfterSeconds` if available. */
      kind: 'RateLimit';
      status: 429;
      message: string;
      /** Seconds to wait before retrying (from Retry-After header) */
      retryAfterSeconds?: number;
      body?: unknown;
    }
  | {
      /** Response validation failed (data doesn't match expected schema) */
      kind: 'Schema';
      message: string;
      /** Validation issues from Valibot */
      issues?: unknown;
      cause?: unknown;
    }
  | {
      /** Request timed out */
      kind: 'Timeout';
      message: string;
      cause?: unknown;
    }
  | {
      /** Network error (DNS, connection refused, etc.) */
      kind: 'Network';
      message: string;
      cause?: unknown;
    }
  | {
      /** HTTP error (other status codes like 500, 503, etc.) */
      kind: 'Http';
      status: number;
      message: string;
      body?: unknown;
    }
  | {
      /** Unknown/unexpected error */
      kind: 'Unknown';
      message: string;
      cause?: unknown;
    };

export function unknownError(message: string, cause?: unknown): ApiError {
  return { kind: 'Unknown', message, cause };
}

export function networkError(message: string, cause?: unknown): ApiError {
  return { kind: 'Network', message, cause };
}

export function timeoutError(message: string, cause?: unknown): ApiError {
  return { kind: 'Timeout', message, cause };
}


