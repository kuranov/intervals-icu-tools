import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('EventsResource', () => {
  describe('list()', () => {
    test('happy path: returns ok + parsed events', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/events`, () => {
          return HttpResponse.json([
            { id: 1, name: 'Morning Workout', category: 'WORKOUT' },
            { id: 2, name: 'Recovery Run', category: 'WORKOUT' },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.list(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.name).toBe('Morning Workout');
      }
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/events`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('oldest')).toBe('2024-01-01');
          expect(url.searchParams.get('newest')).toBe('2024-01-31');
          expect(url.searchParams.get('category')).toBe('WORKOUT,NOTES');
          expect(url.searchParams.get('limit')).toBe('10');
          return HttpResponse.json([{ id: 3, name: 'Test Event' }]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.list(0, {
        oldest: '2024-01-01',
        newest: '2024-01-31',
        category: ['WORKOUT', 'NOTES'],
        limit: 10,
      });

      expect(result.ok).toBe(true);
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/events`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.list(0);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
        if (result.error.kind === 'Schema') {
          expect(result.error.issues).toBeDefined();
        }
      }
    });
  });

  describe('get()', () => {
    test('happy path: returns ok + parsed event', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/events/123`, () => {
          return HttpResponse.json({
            id: 123,
            name: 'Morning Workout',
            category: 'WORKOUT',
            description: '5x5min @ FTP',
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.get(0, 123);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(123);
        expect(result.value.name).toBe('Morning Workout');
      }
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/events/999`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.get(0, 999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  describe('create()', () => {
    test('happy path: returns created event', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/0/events`, async ({ request }) => {
          const body = (await request.json()) as { name: string };
          expect(body.name).toBe('New Workout');
          return HttpResponse.json({
            id: 456,
            name: 'New Workout',
            category: 'WORKOUT',
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.create(0, {
        name: 'New Workout',
        category: 'WORKOUT',
        start_date_local: '2024-01-15',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(456);
        expect(result.value.name).toBe('New Workout');
      }
    });

    test('with upsertOnUid option: passes query parameter', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/0/events`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('upsertOnUid')).toBe('true');
          return HttpResponse.json({ id: 789, name: 'Upserted Event' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.create(
        0,
        { name: 'Upserted Event', uid: 'unique-123' },
        { upsertOnUid: true }
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('update()', () => {
    test('happy path: returns updated event', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/0/events/123`, async ({ request }) => {
          const body = (await request.json()) as { name: string };
          expect(body.name).toBe('Updated Name');
          return HttpResponse.json({ id: 123, name: 'Updated Name' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.update(0, 123, { name: 'Updated Name' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Updated Name');
      }
    });
  });

  describe('delete()', () => {
    test('happy path: returns ok', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/0/events/123`, () => {
          return HttpResponse.json({ success: true });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.delete(0, 123);

      expect(result.ok).toBe(true);
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/0/events/123`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('others')).toBe('true');
          expect(url.searchParams.get('notBefore')).toBe('2024-01-01');
          return HttpResponse.json({ success: true });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.delete(0, 123, {
        others: true,
        notBefore: '2024-01-01',
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('createMultiple()', () => {
    test('happy path: returns created events', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/0/events/bulk`, async ({ request }) => {
          const body = (await request.json()) as Array<{ name: string }>;
          expect(body).toHaveLength(2);
          expect(body[0]?.name).toBe('Event 1');
          return HttpResponse.json([
            { id: 100, name: 'Event 1' },
            { id: 101, name: 'Event 2' },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.createMultiple(0, [
        { name: 'Event 1', start_date_local: '2024-01-01' },
        { name: 'Event 2', start_date_local: '2024-01-02' },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.id).toBe(100);
      }
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/0/events/bulk`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('upsert')).toBe('true');
          expect(url.searchParams.get('updatePlanApplied')).toBe('true');
          return HttpResponse.json([{ id: 200, name: 'Bulk Event' }]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.createMultiple(
        0,
        [{ name: 'Bulk Event' }],
        { upsert: true, updatePlanApplied: true }
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('deleteBulk()', () => {
    test('happy path: returns delete count', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/0/events/bulk-delete`, async ({ request }) => {
          const body = (await request.json()) as Array<{ id?: number }>;
          expect(body).toHaveLength(3);
          return HttpResponse.json({ eventsDeleted: 3 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.deleteBulk(0, [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.eventsDeleted).toBe(3);
      }
    });

    test('with external_id: accepts external IDs', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/0/events/bulk-delete`, async ({ request }) => {
          const body = (await request.json()) as Array<{ external_id?: string }>;
          expect(body[0]?.external_id).toBe('ext-123');
          return HttpResponse.json({ eventsDeleted: 1 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.deleteBulk(0, [{ external_id: 'ext-123' }]);

      expect(result.ok).toBe(true);
    });
  });

  describe('updateMultiple()', () => {
    test('happy path: returns updated events', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/0/events`, async ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('oldest')).toBe('2024-01-01');
          expect(url.searchParams.get('newest')).toBe('2024-01-31');
          const body = (await request.json()) as { hide_from_athlete?: boolean };
          expect(body.hide_from_athlete).toBe(true);
          return HttpResponse.json([
            { id: 1, hide_from_athlete: true },
            { id: 2, hide_from_athlete: true },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.updateMultiple(
        0,
        { hide_from_athlete: true },
        { oldest: '2024-01-01', newest: '2024-01-31' }
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.hide_from_athlete).toBe(true);
      }
    });
  });

  describe('listTags()', () => {
    test('happy path: returns tag list', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/event-tags`, () => {
          return HttpResponse.json(['interval', 'threshold', 'recovery']);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.listTags(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value).toContain('interval');
        expect(result.value).toContain('threshold');
      }
    });

    test('empty tags: returns empty array', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/event-tags`, () => {
          return HttpResponse.json([]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.events.listTags(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });
});
