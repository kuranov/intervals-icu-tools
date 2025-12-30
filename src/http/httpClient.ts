import ky, { type KyInstance, type Options as KyOptions } from 'ky';

import { buildAuthorizationHeader, DEFAULT_BASE_URL, type IntervalsClientConfig } from '../config';
import type { ApiError } from '../errors';
import { networkError, timeoutError, unknownError } from '../errors';
import type { Result } from '../result';
import { err, ok } from '../result';

export type Decoder<T> = (data: unknown) => T;

export type RequestOptions = {
  method?: KyOptions['method'];
  searchParams?: KyOptions['searchParams'];
  headers?: KyOptions['headers'];
  json?: KyOptions['json'];
  body?: KyOptions['body'];
};

type NormalizedConfig = Required<Pick<IntervalsClientConfig, 'timeoutMs' | 'baseUrl'>> & {
  auth: IntervalsClientConfig['auth'];
  retry: Required<NonNullable<IntervalsClientConfig['retry']>>;
};

function normalizeConfig(config: IntervalsClientConfig): NormalizedConfig {
  return {
    auth: config.auth,
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    timeoutMs: config.timeoutMs ?? 30_000,
    retry: {
      limit: config.retry?.limit ?? 3,
      initialDelayMs: config.retry?.initialDelayMs ?? 1_000,
      maxDelayMs: config.retry?.maxDelayMs ?? 8_000,
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readBodyBestEffort(res: Response): Promise<unknown | undefined> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await res.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}

function parseRetryAfterSeconds(retryAfter: string | null): number | undefined {
  if (!retryAfter) return undefined;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  return undefined;
}

function httpErrorFromStatus(status: number, message: string, body?: unknown): ApiError {
  if (status === 401) return { kind: 'Unauthorized', status: 401, message, body };
  if (status === 403) return { kind: 'Forbidden', status: 403, message, body };
  if (status === 404) return { kind: 'NotFound', status: 404, message, body };
  if (status === 429) return { kind: 'RateLimit', status: 429, message, body };
  return { kind: 'Http', status, message, body };
}

export class IntervalsHttpClient {
  private readonly cfg: NormalizedConfig;
  private readonly client: KyInstance;

  constructor(config: IntervalsClientConfig) {
    this.cfg = normalizeConfig(config);
    this.client = ky.create({
      prefixUrl: this.cfg.baseUrl,
      timeout: this.cfg.timeoutMs,
      throwHttpErrors: false,
      hooks: {
        beforeRequest: [
          (req) => {
            req.headers.set('authorization', buildAuthorizationHeader(this.cfg.auth));
            req.headers.set('accept', 'application/json');
          },
        ],
      },
    });
  }

  async requestJson<T>(
    path: string,
    options: RequestOptions = {},
    decode?: Decoder<T>,
  ): Promise<Result<T, ApiError>> {
    const attempts = 1 + this.cfg.retry.limit;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const reqOptions: KyOptions = {};
        if (options.method) reqOptions.method = options.method;
        if (options.headers) reqOptions.headers = options.headers;
        if (options.searchParams) reqOptions.searchParams = options.searchParams;
        if (options.json !== undefined) reqOptions.json = options.json;
        if (options.body !== undefined) reqOptions.body = options.body;

        const res = await this.client(path, reqOptions);

        if (res.status === 429 && attempt < attempts) {
          const retryAfterSeconds = parseRetryAfterSeconds(res.headers.get('retry-after'));
          const fallbackDelay = Math.min(
            this.cfg.retry.initialDelayMs * 2 ** (attempt - 1),
            this.cfg.retry.maxDelayMs,
          );
          await sleep(
            retryAfterSeconds !== undefined && retryAfterSeconds > 0
              ? retryAfterSeconds * 1000
              : fallbackDelay,
          );
          continue;
        }

        if (!res.ok) {
          const body = await readBodyBestEffort(res);
          const message = `HTTP ${res.status} ${res.statusText}`.trim();
          const base = httpErrorFromStatus(res.status, message, body);
          if (base.kind === 'RateLimit') {
            const retryAfterSeconds = parseRetryAfterSeconds(res.headers.get('retry-after'));
            return err({
              ...base,
              ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
            });
          }
          return err(base);
        }

        const data = (await readBodyBestEffort(res)) as unknown;
        if (decode) {
          try {
            return ok(decode(data));
          } catch (e) {
            const issues =
              typeof e === 'object' && e !== null && 'issues' in e
                ? (e as { issues?: unknown }).issues
                : undefined;
            return err({
              kind: 'Schema',
              message: 'Response validation failed',
              issues,
              cause: e,
            });
          }
        }
        return ok(data as T);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Request failed';
        if (e instanceof Error && e.name === 'TimeoutError') return err(timeoutError(msg, e));
        if (e instanceof Error) return err(networkError(msg, e));
        return err(unknownError(msg, e));
      }
    }

    return err(unknownError('Request failed after retries'));
  }
}


