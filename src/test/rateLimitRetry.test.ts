import { afterEach, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { IntervalsClient } from "../index";
import { server } from "./mswServer";

const baseUrl = "https://intervals.icu/api/v1";

describe("429 retry behavior", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("retries 429 using Retry-After seconds when present", async () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    let hits = 0;
    server.use(
      http.get(`${baseUrl}/athlete/0/activities`, () => {
        hits++;
        if (hits < 3) {
          return new HttpResponse(null, {
            status: 429,
            headers: { "Retry-After": "2" },
          });
        }
        return HttpResponse.json([{ id: 123, name: "ok" }]);
      })
    );

    const client = new IntervalsClient({
      auth: { type: "apiKey", apiKey: "test" },
      retry: { limit: 2, initialDelayMs: 50, maxDelayMs: 50 },
    });

    const p = client.activities.list(0);

    // MSW/undici scheduling can vary under fake timers, so run all timers and then
    // assert on both call count and the sleep delays we requested.
    await vi.runAllTimersAsync();

    const result = await p;
    expect(result.ok).toBe(true);
    expect(hits).toBe(3);

    const delays = setTimeoutSpy.mock.calls
      .map((call) => call[1])
      .filter((ms): ms is number => typeof ms === "number");
    expect(delays.filter((d) => d === 2000).length).toBeGreaterThanOrEqual(2);
  });

  test("retries 429 using exponential backoff when Retry-After is missing", async () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    let hits = 0;
    server.use(
      http.get(`${baseUrl}/athlete/0/activities`, () => {
        hits++;
        if (hits < 3) {
          return new HttpResponse(null, { status: 429 });
        }
        return HttpResponse.json([{ id: 123, name: "ok" }]);
      })
    );

    const client = new IntervalsClient({
      auth: { type: "apiKey", apiKey: "test" },
      retry: { limit: 2, initialDelayMs: 100, maxDelayMs: 10_000, jitter: false },
    });

    const p = client.activities.list(0);

    await vi.runAllTimersAsync();

    const result = await p;
    expect(result.ok).toBe(true);
    expect(hits).toBe(3);

    const delays = setTimeoutSpy.mock.calls
      .map((call) => call[1])
      .filter((ms): ms is number => typeof ms === "number");
    expect(delays).toContain(100);
    expect(delays).toContain(200);
  });
});
