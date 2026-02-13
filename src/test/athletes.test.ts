import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('AthletesResource', () => {
  describe('get()', () => {
    test('happy path: returns ok + athlete with sport settings', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0`, () => {
          return HttpResponse.json({
            id: 123,
            name: 'Test Athlete',
            email: 'test@example.com',
            weight: 70,
            sportSettings: { bike: { ftp: 250 } },
            custom_items: { preferred_sport: 'cycling' },
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.get(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(123);
        expect(result.value.name).toBe('Test Athlete');
        expect(result.value.sportSettings).toBeDefined();
        expect(result.value.customItems).toBeDefined();
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'invalid' } });
      const result = await client.athletes.get(0);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });
  });

  describe('update()', () => {
    test('happy path: returns updated athlete', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/123`, async ({ request }) => {
          const body = (await request.json()) as { name: string; weight: number };
          expect(body.name).toBe('Updated Name');
          expect(body.weight).toBe(75);
          return HttpResponse.json({
            id: 123,
            name: 'Updated Name',
            weight: 75,
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.update(123, {
        name: 'Updated Name',
        weight: 75,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Updated Name');
        expect(result.value.weight).toBe(75);
      }
    });

    test('update icuNotes and icuTags: sends snake_case to API', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/123`, async ({ request }) => {
          const body = (await request.json()) as { icu_notes: string; icu_tags: string[] };
          expect(body.icu_notes).toBe('Some notes about the athlete');
          expect(body.icu_tags).toEqual(['tag1', 'tag2']);
          return HttpResponse.json({
            id: 123,
            name: 'Test Athlete',
            icu_notes: 'Some notes about the athlete',
            icu_tags: ['tag1', 'tag2'],
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.update(123, {
        icuNotes: 'Some notes about the athlete',
        icuTags: ['tag1', 'tag2'],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.icuNotes).toBe('Some notes about the athlete');
        expect(result.value.icuTags).toEqual(['tag1', 'tag2']);
      }
    });

    test('partial update: updates only specified fields', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/123`, async ({ request }) => {
          const body = (await request.json()) as { weight: number };
          expect(body.weight).toBe(72);
          return HttpResponse.json({
            id: 123,
            name: 'Existing Name',
            weight: 72,
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.update(123, { weight: 72 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.weight).toBe(72);
      }
    });
  });

  describe('getSettings()', () => {
    test('happy path: returns settings for desktop', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/settings/desktop`, () => {
          return HttpResponse.json({
            theme: 'dark',
            language: 'en',
            timezone: 'America/New_York',
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSettings(0, 'desktop');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty('theme');
        expect(result.value).toHaveProperty('language');
      }
    });

    test('phone device class: requests phone settings', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/settings/phone`, () => {
          return HttpResponse.json({
            notifications: true,
            compactView: true,
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSettings(0, 'phone');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty('notifications');
      }
    });

    test('tablet device class: requests tablet settings', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/settings/tablet`, () => {
          return HttpResponse.json({
            splitView: true,
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSettings(0, 'tablet');

      expect(result.ok).toBe(true);
    });
  });

  describe('getProfile()', () => {
    test('happy path: returns athlete profile', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/profile`, () => {
          return HttpResponse.json({
            id: 123,
            athlete_id: 456,
            name: 'Test Athlete',
            weight: 70,
            max_heartrate: 190,
            resting_heartrate: 45,
            lthr: 165,
            threshold_power: 250,
            ftp: 250,
            critical_power: 260,
            w_prime: 20000,
          });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getProfile(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Test Athlete');
        expect(result.value.weight).toBe(70);
        expect(result.value.ftp).toBe(250);
        expect(result.value.maxHeartrate).toBe(190);
      }
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/999/profile`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getProfile(999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  describe('getSummary()', () => {
    test('happy path: returns athlete summary', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/athlete-summary`, () => {
          return HttpResponse.json([
            {
              athlete_id: 123,
              athlete_name: 'Test Athlete',
              start_date_local: '2024-01-01',
              ctl: 85,
              atl: 92,
              tsb: -7,
              load: 450,
              training_volume: 10.5,
              avg_watts: 220,
              avg_hr: 145,
              activities: 5,
              moving_time: 37800,
            },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSummary(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.athleteName).toBe('Test Athlete');
        expect(result.value[0]?.ctl).toBe(85);
        expect(result.value[0]?.atl).toBe(92);
      }
    });

    test('with options: passes query parameters', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/athlete-summary`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('start')).toBe('2024-01-01');
          expect(url.searchParams.get('end')).toBe('2024-01-31');
          expect(url.searchParams.get('tags')).toBe('cycling,running');
          return HttpResponse.json([
            {
              athlete_id: 123,
              start_date_local: '2024-01-15',
              ctl: 90,
            },
          ]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSummary(0, {
        start: '2024-01-01',
        end: '2024-01-31',
        tags: ['cycling', 'running'],
      });

      expect(result.ok).toBe(true);
    });

    test('empty summary: returns empty array', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/athlete-summary`, () => {
          return HttpResponse.json([]);
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSummary(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/0/athlete-summary`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
      const result = await client.athletes.getSummary(0);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
        if (result.error.kind === 'Schema') {
          expect(result.error.issues).toBeDefined();
        }
      }
    });
  });
});
