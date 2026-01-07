import { describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { IntervalsClient } from "../client";
import type { IntervalsClientConfig } from "../config";
import { server } from "./mswServer";

const BASE_URL = "https://intervals.icu/api/v1";

describe("Phase 4: Robustness & Ergonomics", () => {
  describe("Retry with Jitter", () => {
    test("applies jitter to retry delays when enabled", async () => {
      let attemptCount = 0;
      const delays: number[] = [];
      let lastAttemptTime = Date.now();

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          attemptCount++;
          const now = Date.now();
          if (attemptCount > 1) {
            delays.push(now - lastAttemptTime);
          }
          lastAttemptTime = now;

          if (attemptCount < 3) {
            return HttpResponse.json(
              { error: "Rate limited" },
              { status: 429 }
            );
          }
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        retry: {
          limit: 3,
          initialDelayMs: 100,
          maxDelayMs: 1000,
          jitter: true,
          jitterFactor: 0.2,
        },
      };

      const client = new IntervalsClient(config);
      const result = await client.athletes.get("i123");

      expect(result.ok).toBe(true);
      expect(attemptCount).toBe(3);
      expect(delays).toHaveLength(2);

      // With jitter factor 0.2, delays should be ±20% of base
      // First retry: 100ms ± 20% = 80-120ms
      // Second retry: 200ms ± 20% = 160-240ms
      expect(delays[0]).toBeGreaterThanOrEqual(80);
      expect(delays[0]).toBeLessThanOrEqual(120);
      expect(delays[1]).toBeGreaterThanOrEqual(160);
      expect(delays[1]).toBeLessThanOrEqual(240);
    });

    test("does not apply jitter when disabled", async () => {
      let attemptCount = 0;
      const delays: number[] = [];
      let lastAttemptTime = Date.now();

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          attemptCount++;
          const now = Date.now();
          if (attemptCount > 1) {
            delays.push(now - lastAttemptTime);
          }
          lastAttemptTime = now;

          if (attemptCount < 3) {
            return HttpResponse.json(
              { error: "Rate limited" },
              { status: 429 }
            );
          }
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        retry: {
          limit: 3,
          initialDelayMs: 100,
          maxDelayMs: 1000,
          jitter: false,
        },
      };

      const client = new IntervalsClient(config);
      const result = await client.athletes.get("i123");

      expect(result.ok).toBe(true);
      expect(attemptCount).toBe(3);
      expect(delays).toHaveLength(2);

      // Without jitter, delays should be exact exponential backoff
      // First retry: ~100ms
      // Second retry: ~200ms
      expect(delays[0]).toBeGreaterThanOrEqual(95);
      expect(delays[0]).toBeLessThanOrEqual(105);
      expect(delays[1]).toBeGreaterThanOrEqual(195);
      expect(delays[1]).toBeLessThanOrEqual(205);
    });

    test("respects Retry-After header exactly without jitter", async () => {
      let attemptCount = 0;
      const delays: number[] = [];
      let lastAttemptTime = Date.now();

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          attemptCount++;
          const now = Date.now();
          if (attemptCount > 1) {
            delays.push(now - lastAttemptTime);
          }
          lastAttemptTime = now;

          if (attemptCount < 2) {
            return HttpResponse.json(
              { error: "Rate limited" },
              {
                status: 429,
                headers: { "Retry-After": "1" }, // 1 second
              }
            );
          }
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        retry: {
          limit: 3,
          initialDelayMs: 100,
          jitter: true, // Jitter enabled but shouldn't apply to Retry-After
          jitterFactor: 0.2,
        },
      };

      const client = new IntervalsClient(config);
      const result = await client.athletes.get("i123");

      expect(result.ok).toBe(true);
      expect(attemptCount).toBe(2);
      expect(delays).toHaveLength(1);

      // Retry-After should be respected exactly (no jitter)
      // Allow small timing variance (±50ms)
      expect(delays[0]).toBeGreaterThanOrEqual(950);
      expect(delays[0]).toBeLessThanOrEqual(1050);
    });
  });

  describe("Hooks System", () => {
    test("calls onRequest hook before each request", async () => {
      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const onRequest = vi.fn();
      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: { onRequest },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(onRequest).toHaveBeenCalledTimes(1);
      expect(onRequest).toHaveBeenCalledWith({
        method: "GET",
        path: "athlete/i123",
        options: undefined,
      });
    });

    test("calls onResponse hook on successful response", async () => {
      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const onResponse = vi.fn();
      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: { onResponse },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(onResponse).toHaveBeenCalledTimes(1);
      expect(onResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          path: "athlete/i123",
          status: 200,
          durationMs: expect.any(Number),
        })
      );
    });

    test("calls onError hook on HTTP error", async () => {
      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ error: "Not found" }, { status: 404 });
        })
      );

      const onError = vi.fn();
      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: { onError },
      };

      const client = new IntervalsClient(config);
      const result = await client.athletes.get("i123");

      expect(result.ok).toBe(false);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          path: "athlete/i123",
          error: expect.any(Error),
          durationMs: expect.any(Number),
        })
      );
    });

    test("calls onRetry hook before each retry", async () => {
      let attemptCount = 0;

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          attemptCount++;
          if (attemptCount < 3) {
            return HttpResponse.json(
              { error: "Rate limited" },
              { status: 429 }
            );
          }
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const onRetry = vi.fn();
      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        retry: { limit: 3, initialDelayMs: 10 },
        hooks: { onRetry },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          method: "GET",
          path: "athlete/i123",
          attempt: 1,
          maxAttempts: 4,
          delayMs: expect.any(Number),
          reason: "Rate limit (429)",
        })
      );
      expect(onRetry).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          method: "GET",
          path: "athlete/i123",
          attempt: 2,
          maxAttempts: 4,
          delayMs: expect.any(Number),
          reason: "Rate limit (429)",
        })
      );
    });

    test("calls all hooks in correct order", async () => {
      const callOrder: string[] = [];

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: {
          onRequest: () => {
            callOrder.push("request");
          },
          onResponse: () => {
            callOrder.push("response");
          },
          onError: () => {
            callOrder.push("error");
          },
        },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(callOrder).toEqual(["request", "response"]);
    });

    test("calls onError instead of onResponse on failure", async () => {
      const callOrder: string[] = [];

      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ error: "Not found" }, { status: 404 });
        })
      );

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: {
          onRequest: () => {
            callOrder.push("request");
          },
          onResponse: () => {
            callOrder.push("response");
          },
          onError: () => {
            callOrder.push("error");
          },
        },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(callOrder).toEqual(["request", "error"]);
    });

    test("supports async hooks", async () => {
      server.use(
        http.get(`${BASE_URL}/athlete/i123`, () => {
          return HttpResponse.json({ id: "i123", name: "Test" });
        })
      );

      const onRequest = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const config: IntervalsClientConfig = {
        auth: { type: "apiKey", apiKey: "test" },
        hooks: { onRequest },
      };

      const client = new IntervalsClient(config);
      await client.athletes.get("i123");

      expect(onRequest).toHaveBeenCalledTimes(1);
    });
  });
});
