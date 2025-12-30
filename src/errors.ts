export type ApiError =
  | {
      kind: 'Unauthorized';
      status: 401;
      message: string;
      body?: unknown;
    }
  | {
      kind: 'Forbidden';
      status: 403;
      message: string;
      body?: unknown;
    }
  | {
      kind: 'NotFound';
      status: 404;
      message: string;
      body?: unknown;
    }
  | {
      kind: 'RateLimit';
      status: 429;
      message: string;
      retryAfterSeconds?: number;
      body?: unknown;
    }
  | {
      kind: 'Schema';
      message: string;
      issues?: unknown;
      cause?: unknown;
    }
  | {
      kind: 'Timeout';
      message: string;
      cause?: unknown;
    }
  | {
      kind: 'Network';
      message: string;
      cause?: unknown;
    }
  | {
      kind: 'Http';
      status: number;
      message: string;
      body?: unknown;
    }
  | {
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


