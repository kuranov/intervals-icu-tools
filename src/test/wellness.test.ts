import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('WellnessResource', () => {
  describe('list()', () => {
    test('happy path: returns ok + parsed wellness records', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json([
            {
              id: '2024-01-15',
              weight: 70.5,
              restingHR: 55,
              hrv: 65.3,
              sleepSecs: 28800,
              soreness: 3,
              fatigue: 2,
            },
            {
              id: '2024-01-16',
              weight: 70.3,
              restingHR: 54,
              sleepSecs: 25200,
            },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.id).toBe('2024-01-15');
        expect(result.value[0]?.weight).toBe(70.5);
        expect(result.value[0]?.restingHR).toBe(55);
        expect(result.value[1]?.id).toBe('2024-01-16');
      }
    });

    test('with date range: passes query params correctly', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/wellness`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('oldest')).toBe('2024-01-01');
          expect(url.searchParams.get('newest')).toBe('2024-01-31');
          return HttpResponse.json([
            { id: '2024-01-15', weight: 70 },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.list(0, {
        oldest: '2024-01-01',
        newest: '2024-01-31',
      });

      expect(result.ok).toBe(true);
    });

    test('with fields filter: passes fields correctly', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/wellness`, ({ request }) => {
          const url = new URL(request.url);
          const fields = url.searchParams.get('fields');
          expect(fields).toBe('weight,restingHR');
          return HttpResponse.json([
            { id: '2024-01-15', weight: 70, restingHR: 55 },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.list(0, {
        fields: ['weight', 'restingHR'],
      });

      expect(result.ok).toBe(true);
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json({ error: 'nope' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
        if (result.error.kind === 'Unauthorized') {
          expect(result.error.status).toBe(401);
        }
      }
    });
  });

  describe('get()', () => {
    test('happy path: returns ok + wellness for date', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness/2024-01-15`, () => {
          return HttpResponse.json({
            id: '2024-01-15',
            weight: 70.5,
            restingHR: 55,
            hrv: 65.3,
            sleepSecs: 28800,
            soreness: 3,
            fatigue: 2,
            mood: 8,
            comments: 'Feeling good',
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.get('i123', '2024-01-15');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('2024-01-15');
        expect(result.value.weight).toBe(70.5);
        expect(result.value.comments).toBe('Feeling good');
      }
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness/2024-01-15`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.get('i123', '2024-01-15');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
        if (result.error.kind === 'NotFound') {
          expect(result.error.status).toBe(404);
        }
      }
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness/2024-01-15`, () => {
          return HttpResponse.json({ id: 123 }); // id should be string
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.get('i123', '2024-01-15');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
      }
    });
  });

  describe('update()', () => {
    test('happy path: updates and returns wellness', async () => {
      server.use(
        http.put(
          `${baseUrl}/athlete/i123/wellness/2024-01-15`,
          async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;
            expect(body).toEqual({
              weight: 71.0,
              soreness: 2,
            });
            return HttpResponse.json({
              id: '2024-01-15',
              weight: 71.0,
              soreness: 2,
              restingHR: 55, // Existing data preserved
            });
          },
        ),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.update('i123', '2024-01-15', {
        weight: 71.0,
        soreness: 2,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('2024-01-15');
        expect(result.value.weight).toBe(71.0);
        expect(result.value.soreness).toBe(2);
      }
    });

    test('sends auth header correctly', async () => {
      server.use(
        http.put(
          `${baseUrl}/athlete/0/wellness/2024-01-15`,
          ({ request }) => {
            const authHeader = request.headers.get('authorization');
            expect(authHeader).toBeTruthy();
            expect(authHeader).toContain('Basic');
            return HttpResponse.json({ id: '2024-01-15', weight: 70 });
          },
        ),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.update(0, '2024-01-15', {
        weight: 70,
      });

      expect(result.ok).toBe(true);
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/i123/wellness/2024-01-15`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.update('i123', '2024-01-15', {
        weight: 70,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });
  });

  describe('updateBulk()', () => {
    test('happy path: updates multiple records', async () => {
      server.use(
        http.put(
          `${baseUrl}/athlete/i123/wellness-bulk`,
          async ({ request }) => {
            const body = (await request.json()) as Array<Record<string, unknown>>;
            expect(body).toHaveLength(2);
            expect(body[0]).toEqual({ id: '2024-01-15', weight: 70.5 });
            expect(body[1]).toEqual({ id: '2024-01-16', weight: 70.3 });
            return HttpResponse.json(null, { status: 200 });
          },
        ),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.updateBulk('i123', [
        { id: '2024-01-15', weight: 70.5 },
        { id: '2024-01-16', weight: 70.3 },
      ]);

      expect(result.ok).toBe(true);
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/i123/wellness-bulk`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.wellness.updateBulk('i123', [
        { id: '2024-01-15', weight: 70 },
      ]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });

    test('429: returns RateLimit error', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/i123/wellness-bulk`, () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 },
          );
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
        retry: { limit: 0 }, // Disable retries for this test
      });
      const result = await client.wellness.updateBulk('i123', [
        { id: '2024-01-15', weight: 70 },
      ]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('RateLimit');
        if (result.error.kind === 'RateLimit') {
          expect(result.error.status).toBe(429);
        }
      }
    });
  });
});
