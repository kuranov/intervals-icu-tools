import ky, { type KyInstance, type Options as KyOptions } from "ky";

import {
  buildAuthorizationHeader,
  DEFAULT_BASE_URL,
  type IntervalsClientConfig,
} from "../config";
import type { ApiError } from "../errors";
import { networkError, timeoutError, unknownError } from "../errors";
import type { Result } from "../result";
import { err, ok } from "../result";

export type Decoder<T> = (data: unknown) => T;

export type RequestOptions = {
  method?: KyOptions["method"];
  searchParams?: KyOptions["searchParams"];
  headers?: KyOptions["headers"];
  json?: KyOptions["json"];
  body?: KyOptions["body"];
};

type NormalizedConfig = Required<
  Pick<IntervalsClientConfig, "timeoutMs" | "baseUrl">
> & {
  auth: IntervalsClientConfig["auth"];
  retry: Required<NonNullable<IntervalsClientConfig["retry"]>>;
  hooks: IntervalsClientConfig["hooks"];
  concurrency: Required<NonNullable<IntervalsClientConfig["concurrency"]>>;
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
      jitter: config.retry?.jitter ?? true,
      jitterFactor: config.retry?.jitterFactor ?? 0.2,
    },
    hooks: config.hooks,
    concurrency: {
      maxConcurrent: config.concurrency?.maxConcurrent ?? 0,
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Applies jitter to a delay value to prevent thundering herd problem.
 * @param delayMs Base delay in milliseconds
 * @param jitterFactor Factor between 0-1 determining variation amount (default 0.2 = ±20%)
 * @returns Delay with random jitter applied
 */
function applyJitter(delayMs: number, jitterFactor: number): number {
  const variation = delayMs * jitterFactor;
  const jitter = Math.random() * variation * 2 - variation; // Random value between -variation and +variation
  return Math.max(0, Math.round(delayMs + jitter));
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

function toKyOptions(options: RequestOptions): KyOptions {
  const reqOptions: KyOptions = {};
  if (options.method) reqOptions.method = options.method;
  if (options.headers) reqOptions.headers = options.headers;
  if (options.searchParams) reqOptions.searchParams = options.searchParams;
  if (options.json !== undefined) reqOptions.json = options.json;
  if (options.body !== undefined) reqOptions.body = options.body;
  return reqOptions;
}

function extractIssues(e: unknown): unknown | undefined {
  return typeof e === "object" && e !== null && "issues" in e
    ? (e as { issues?: unknown }).issues
    : undefined;
}

async function readBodyBestEffort(res: Response): Promise<unknown | undefined> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
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

function httpErrorFromStatus(
  status: number,
  message: string,
  body?: unknown
): ApiError {
  if (status === 401)
    return { kind: "Unauthorized", status: 401, message, body };
  if (status === 403) return { kind: "Forbidden", status: 403, message, body };
  if (status === 404) return { kind: "NotFound", status: 404, message, body };
  if (status === 429) return { kind: "RateLimit", status: 429, message, body };
  return { kind: "Http", status, message, body };
}

/**
 * Request queue for concurrency control.
 * Limits the number of concurrent requests to prevent overwhelming the API.
 */
class RequestQueue {
  private queue: Array<() => void> = [];
  private activeCount = 0;

  constructor(private readonly maxConcurrent: number) {}

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    // If no limit or under limit, execute immediately
    if (this.maxConcurrent === 0 || this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      try {
        return await fn();
      } finally {
        this.activeCount--;
        this.processQueue();
      }
    }

    // Otherwise, queue it
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        this.activeCount++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.processQueue();
        }
      });
    });
  }

  private processQueue(): void {
    if (
      this.queue.length === 0 ||
      (this.maxConcurrent > 0 && this.activeCount >= this.maxConcurrent)
    ) {
      return;
    }

    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}

export class IntervalsHttpClient {
  private readonly cfg: NormalizedConfig;
  private readonly client: KyInstance;
  private readonly requestQueue: RequestQueue;

  constructor(config: IntervalsClientConfig) {
    this.cfg = normalizeConfig(config);
    this.requestQueue = new RequestQueue(this.cfg.concurrency.maxConcurrent);
    this.client = ky.create({
      prefixUrl: this.cfg.baseUrl,
      timeout: this.cfg.timeoutMs,
      throwHttpErrors: false,
      hooks: {
        beforeRequest: [
          (req) => {
            req.headers.set(
              "authorization",
              buildAuthorizationHeader(this.cfg.auth)
            );
            // Default to JSON, but allow per-request overrides (text/binary endpoints).
            if (!req.headers.has("accept")) {
              req.headers.set("accept", "application/json");
            }
          },
        ],
      },
    });
  }

  private async requestWithRetry(
    path: string,
    options: RequestOptions,
    readOk: (res: Response) => Promise<unknown>
  ): Promise<Result<unknown, ApiError>> {
    return this.requestQueue.enqueue(async () => {
      const attempts = 1 + this.cfg.retry.limit;
      const normalizedPath = normalizePath(path);
      const kyOptions = toKyOptions(options);
      const method = options.method ?? "GET";
      const startTime = Date.now();

      // Call onRequest hook
      if (this.cfg.hooks?.onRequest) {
        const hookInfo: { method: string; path: string; options?: Record<string, unknown> } = {
          method,
          path: normalizedPath,
        };
        if (options.searchParams) {
          hookInfo.options = { searchParams: options.searchParams as unknown };
        }
        await this.cfg.hooks.onRequest(hookInfo);
      }

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const res = await this.client(normalizedPath, kyOptions);

          if (res.status === 429 && attempt < attempts) {
            const retryAfterSeconds = parseRetryAfterSeconds(
              res.headers.get("retry-after")
            );

            let delayMs: number;
            if (retryAfterSeconds !== undefined) {
              // Respect Retry-After header exactly (don't apply jitter)
              delayMs = retryAfterSeconds * 1000;
            } else {
              // Use exponential backoff with optional jitter
              const fallbackDelay = Math.min(
                this.cfg.retry.initialDelayMs * 2 ** (attempt - 1),
                this.cfg.retry.maxDelayMs
              );
              delayMs = this.cfg.retry.jitter
                ? applyJitter(fallbackDelay, this.cfg.retry.jitterFactor)
                : fallbackDelay;
            }

            // Call onRetry hook
            await this.cfg.hooks?.onRetry?.({
              method,
              path: normalizedPath,
              attempt,
              maxAttempts: attempts,
              delayMs,
              reason: "Rate limit (429)",
            });

            await sleep(delayMs);
            continue;
          }

          if (!res.ok) {
            const body = await readBodyBestEffort(res);
            const message = `HTTP ${res.status} ${res.statusText}`.trim();
            const base = httpErrorFromStatus(res.status, message, body);
            const durationMs = Date.now() - startTime;

            // Call onError hook
            await this.cfg.hooks?.onError?.({
              method,
              path: normalizedPath,
              error: new Error(message),
              durationMs,
            });

            if (base.kind === "RateLimit") {
              const retryAfterSeconds = parseRetryAfterSeconds(
                res.headers.get("retry-after")
              );
              return err({
                ...base,
                ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
              });
            }
            return err(base);
          }

          const durationMs = Date.now() - startTime;

          // Call onResponse hook
          await this.cfg.hooks?.onResponse?.({
            method,
            path: normalizedPath,
            status: res.status,
            durationMs,
          });

          return ok(await readOk(res));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Request failed";
          const durationMs = Date.now() - startTime;

          // Call onError hook
          await this.cfg.hooks?.onError?.({
            method,
            path: normalizedPath,
            error: e,
            durationMs,
          });

          if (e instanceof Error && e.name === "TimeoutError")
            return err(timeoutError(msg, e));
          if (e instanceof Error) return err(networkError(msg, e));
          return err(unknownError(msg, e));
        }
      }

      const durationMs = Date.now() - startTime;
      const error = unknownError("Request failed after retries");

      // Call onError hook for final failure
      await this.cfg.hooks?.onError?.({
        method,
        path: normalizedPath,
        error: new Error(error.message),
        durationMs,
      });

      return err(error);
    });
  }

  async requestJson<T>(
    path: string,
    options: RequestOptions = {},
    decode?: Decoder<T>
  ): Promise<Result<T, ApiError>> {
    const result = await this.requestWithRetry(path, options, async (res) => {
      return (await readBodyBestEffort(res)) as unknown;
    });
    if (!result.ok) return result;

    const data = result.value as unknown;
    if (!decode) return ok(data as T);

    try {
      return ok(decode(data));
    } catch (e) {
      return err({
        kind: "Schema",
        message: "Response validation failed",
        issues: extractIssues(e),
        cause: e,
      });
    }
  }

  async requestText<T = string>(
    path: string,
    options: RequestOptions = {},
    decode?: (text: string) => T
  ): Promise<Result<T, ApiError>> {
    const result = await this.requestWithRetry(path, options, (res) =>
      res.text()
    );
    if (!result.ok) return result;

    const text = String(result.value);
    if (!decode) return ok(text as T);

    try {
      return ok(decode(text));
    } catch (e) {
      return err({
        kind: "Schema",
        message: "Response validation failed",
        issues: extractIssues(e),
        cause: e,
      });
    }
  }

  async requestArrayBuffer(
    path: string,
    options: RequestOptions = {}
  ): Promise<Result<ArrayBuffer, ApiError>> {
    const result = await this.requestWithRetry(path, options, (res) =>
      res.arrayBuffer()
    );
    if (!result.ok) return result;
    return ok(result.value as ArrayBuffer);
  }
}
