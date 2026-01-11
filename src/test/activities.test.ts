import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('ActivitiesResource', () => {
  describe('list()', () => {
    test('happy path: returns ok + parsed activities', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/activities`, ({ request }) => {
          // Verify Basic auth with API_KEY username
          const expectedAuth = `Basic ${btoa('API_KEY:test')}`;
          expect(request.headers.get('authorization')).toBe(expectedAuth);
          return HttpResponse.json([{ id: 123, name: 'Test Ride', type: 'Ride', start_date_local: '2024-01-15T10:00:00' }]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.list(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]?.name).toBe('Test Ride');
      }
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/activities`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('oldest')).toBe('2024-01-01');
          expect(url.searchParams.get('limit')).toBe('10');
          return HttpResponse.json([{ id: 456, name: 'Morning Run', type: 'Run', start_date_local: '2024-01-15T06:00:00' }]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.list(0, { oldest: '2024-01-01', limit: 10 });

      expect(result.ok).toBe(true);
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/activities`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.list(0);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
        if (result.error.kind === 'Schema') {
          expect(result.error.issues).toBeDefined();
        }
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/activities`, () => {
          return HttpResponse.json({ message: 'nope' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.list(0);

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
    test('happy path: returns ok + parsed activity', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123`, () => {
          return HttpResponse.json({ id: 123, name: 'Test Ride', type: 'Ride', start_date_local: '2024-01-15T10:00:00' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.get(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(123);
        expect(result.value.name).toBe('Test Ride');
      }
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.get(`${baseUrl}/activity/999`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.get(999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  describe('update()', () => {
    test('happy path: returns updated activity', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123`, async ({ request }) => {
          const body = (await request.json()) as { name: string };
          expect(body.name).toBe('Updated Name');
          return HttpResponse.json({ id: 123, name: 'Updated Name', type: 'Ride', start_date_local: '2024-01-15T10:00:00' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.update(123, { name: 'Updated Name' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Updated Name');
      }
    });

    test('403: returns Forbidden error', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123`, () => {
          return HttpResponse.json({ error: 'Cannot update Strava activity' }, { status: 403 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.update(123, { name: 'New Name' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Forbidden');
      }
    });
  });

  describe('delete()', () => {
    test('happy path: returns activity id', async () => {
      server.use(
        http.delete(`${baseUrl}/activity/123`, () => {
          return HttpResponse.json({ id: 123 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.delete(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(123);
      }
    });
  });

  describe('getIntervals()', () => {
    test('happy path: returns intervals', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/intervals`, () => {
          return HttpResponse.json({
            intervals: [
              { id: 1, type: 'ACTIVE', start: 0, end: 100 },
              { id: 2, type: 'REST', start: 100, end: 200 },
            ],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getIntervals(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.intervals).toHaveLength(2);
        expect(result.value.intervals?.[0]?.type).toBe('ACTIVE');
      }
    });
  });

  describe('updateIntervals()', () => {
    test('happy path: returns updated intervals', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/intervals`, async ({ request }) => {
          const body = (await request.json()) as Array<{ type: string }>;
          expect(body).toHaveLength(1);
          return HttpResponse.json({ intervals: body });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.updateIntervals(123, [
        { type: 'ACTIVE', start: 0, end: 100 },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.intervals).toHaveLength(1);
      }
    });
  });

  describe('deleteIntervals()', () => {
    test('happy path: returns remaining intervals', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/delete-intervals`, () => {
          return HttpResponse.json({ intervals: [] });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.deleteIntervals(123, [{ id: 1 }]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.intervals).toEqual([]);
      }
    });
  });

  describe('updateInterval()', () => {
    test('happy path: returns updated interval', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/intervals/1`, async ({ request }) => {
          const body = (await request.json()) as { type: string };
          expect(body.type).toBe('REST');
          return HttpResponse.json({ intervals: [{ id: 1, type: 'REST' }] });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.updateInterval(123, 1, { type: 'REST' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.intervals?.[0]?.type).toBe('REST');
      }
    });
  });

  describe('splitInterval()', () => {
    test('happy path: returns split intervals', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/split-interval`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('splitAt')).toBe('50');
          return HttpResponse.json({
            intervals: [
              { id: 1, start: 0, end: 50 },
              { id: 2, start: 50, end: 100 },
            ],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.splitInterval(123, 50);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.intervals).toHaveLength(2);
      }
    });
  });

  describe('getStreams()', () => {
    test('happy path: returns ok + parsed streams', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/streams.json`, () => {
          return HttpResponse.json([
            {
              type: 'watts',
              name: 'Power',
              data: { '0': 210, '1': 215, '2': 220 },
              valueTypeIsArray: false,
              custom: false,
              allNull: false,
            },
            {
              type: 'heartrate',
              name: 'Heart Rate',
              data: { '0': 145, '1': 148, '2': 152 },
              valueTypeIsArray: false,
              custom: false,
              allNull: false,
            },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getStreams(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.type).toBe('watts');
        expect(result.value[1]?.type).toBe('heartrate');
      }
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/streams.json`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('types')).toBe('watts,heartrate');
          expect(url.searchParams.get('includeDefaults')).toBe('true');
          return HttpResponse.json([
            { type: 'watts', name: 'Power', data: { '0': 210 } },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getStreams(123, {
        types: ['watts', 'heartrate'],
        includeDefaults: true,
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('getStreamsCsv()', () => {
    test('happy path: returns CSV text', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/streams.csv`, () => {
          return HttpResponse.text('time,watts,heartrate\n0,210,145\n1,215,148');
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getStreamsCsv(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('time,watts,heartrate');
        expect(result.value).toContain('0,210,145');
      }
    });
  });

  describe('updateStreams()', () => {
    test('happy path: returns update result', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/streams`, async ({ request }) => {
          const body = await request.json();
          expect(Array.isArray(body)).toBe(true);
          return HttpResponse.json({
            updated: ['watts', 'heartrate'],
            deleted: [],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.updateStreams(123, [
        { type: 'watts', name: 'Power', data: { '0': 210 } },
        { type: 'heartrate', name: 'Heart Rate', data: { '0': 145 } },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updated).toContain('watts');
        expect(result.value.updated).toContain('heartrate');
      }
    });
  });

  describe('updateStreamsCsv()', () => {
    test('happy path: returns update result', async () => {
      server.use(
        http.put(`${baseUrl}/activity/123/streams.csv`, async ({ request }) => {
          const body = await request.text();
          expect(body).toBe('time,watts,heartrate\n0,210,145');
          return HttpResponse.json({
            updated: ['watts', 'heartrate'],
            deleted: [],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.updateStreamsCsv(123, 'time,watts,heartrate\n0,210,145');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.updated).toContain('watts');
        expect(result.value.updated).toContain('heartrate');
      }
    });
  });

  describe('getPowerCurve()', () => {
    test('happy path: returns power curve', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/power-curve.json`, () => {
          return HttpResponse.json({
            id: 'curve-1',
            secs: [5, 60, 300, 1200],
            values: [500, 400, 350, 300],
            watts_per_kg: [6.0, 5.0, 4.5, 4.0],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getPowerCurve(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.secs).toEqual([5, 60, 300, 1200]);
        expect(result.value.wattsPerKg).toEqual([6.0, 5.0, 4.5, 4.0]);
      }
    });
  });

  describe('getPaceCurve()', () => {
    test('happy path: returns pace curve', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/pace-curve.json`, () => {
          return HttpResponse.json({
            id: 'curve-1',
            distance: [400, 1000, 5000],
            values: [65, 180, 1020],
            type: 'PACE',
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getPaceCurve(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.distance).toEqual([400, 1000, 5000]);
        expect(result.value.type).toBe('PACE');
      }
    });
  });

  describe('getHRCurve()', () => {
    test('happy path: returns HR curve', async () => {
      server.use(
        http.get(`${baseUrl}/activity/123/hr-curve.json`, () => {
          return HttpResponse.json({
            id: 'curve-1',
            secs: [60, 300, 1200],
            values: [160, 155, 150],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.getHRCurve(123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.secs).toEqual([60, 300, 1200]);
        expect(result.value.values).toEqual([160, 155, 150]);
      }
    });
  });

  describe('listAthletePowerCurves()', () => {
    test('happy path: returns array of power curves', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/power-curves.json`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('type')).toBe('Ride');
          return HttpResponse.json([
            { id: 'curve-1', secs: [60, 300], values: [400, 350] },
            { id: 'curve-2', secs: [60, 300], values: [380, 330] },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.activities.listAthletePowerCurves(0, { type: 'Ride' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.id).toBe('curve-1');
      }
    });
  });
});


