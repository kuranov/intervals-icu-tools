import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient, buildAuthorizationHeader } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('ActivitiesResource', () => {
  test('happy path: returns ok + parsed activities', async () => {
    server.use(
      http.get(`${baseUrl}/athlete/0/activities`, ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          buildAuthorizationHeader({ type: 'apiKey', apiKey: 'test' }),
        );
        return HttpResponse.json([{ id: 123, name: 'Test Ride' }]);
      }),
    );

    const client = new IntervalsClient({ auth: { type: 'apiKey', apiKey: 'test' } });
    const result = await client.activities.list(0);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]?.name).toBe('Test Ride');
    }
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
      expect(result.error.status).toBe(401);
    }
  });
});


