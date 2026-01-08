import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';

import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('LibraryResource', () => {
  // ============================================================================
  // Workouts
  // ============================================================================

  describe('listWorkouts()', () => {
    test('happy path: returns ok + workouts array', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workouts`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: '5x5min @ FTP',
              description: '5 x 5min @ FTP, 3min rest',
              folder_id: 10,
              activity_type: 'Ride',
              tags: ['intervals', 'ftp'],
            },
            {
              id: 2,
              name: 'Long Run',
              description: '90min easy',
              folder_id: 11,
              activity_type: 'Run',
            },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listWorkouts('i123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.name).toBe('5x5min @ FTP');
        expect(result.value[1]?.name).toBe('Long Run');
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workouts`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listWorkouts('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });
  });

  describe('getWorkout()', () => {
    test('happy path: returns ok + single workout', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workouts/1`, () => {
          return HttpResponse.json({
            id: 1,
            name: '5x5min @ FTP',
            description: '5 x 5min @ FTP, 3min rest',
            folder_id: 10,
            activity_type: 'Ride',
            tags: ['intervals', 'ftp'],
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.getWorkout('i123', 1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('5x5min @ FTP');
      }
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workouts/999`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.getWorkout('i123', 999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  describe('createWorkout()', () => {
    test('happy path: creates and returns workout', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/i123/workouts`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.name).toBe('New Workout');
          expect(body.folder_id).toBe(10);
          return HttpResponse.json({
            id: 100,
            name: 'New Workout',
            folder_id: 10,
            activity_type: 'Ride',
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.createWorkout('i123', {
        name: 'New Workout',
        folder_id: 10,
        activity_type: 'Ride',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(100);
        expect(result.value.name).toBe('New Workout');
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/i123/workouts`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.createWorkout('i123', {
        name: 'Test',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });
  });

  describe('updateWorkout()', () => {
    test('happy path: updates and returns workout', async () => {
      server.use(
        http.put(
          `${baseUrl}/athlete/i123/workouts/1`,
          async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.name).toBe('Updated Name');
            return HttpResponse.json({
              id: 1,
              name: 'Updated Name',
              description: 'Original description',
            });
          },
        ),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.updateWorkout('i123', 1, {
        name: 'Updated Name',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Updated Name');
      }
    });
  });

  describe('deleteWorkout()', () => {
    test('happy path: deletes workout', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/i123/workouts/1`, () => {
          return HttpResponse.json(null, { status: 200 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.deleteWorkout('i123', 1);

      expect(result.ok).toBe(true);
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/i123/workouts/999`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.deleteWorkout('i123', 999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  describe('createMultipleWorkouts()', () => {
    test('happy path: creates multiple workouts', async () => {
      server.use(
        http.post(
          `${baseUrl}/athlete/i123/workouts/bulk`,
          async ({ request }) => {
            const body = (await request.json()) as Array<Record<string, unknown>>;
            expect(body).toHaveLength(2);
            return HttpResponse.json([
              { id: 100, name: 'Workout 1' },
              { id: 101, name: 'Workout 2' },
            ]);
          },
        ),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.createMultipleWorkouts('i123', [
        { name: 'Workout 1', folder_id: 10 },
        { name: 'Workout 2', folder_id: 10 },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });
  });

  // ============================================================================
  // Folders
  // ============================================================================

  describe('listFolders()', () => {
    test('happy path: returns ok + folders array', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/folders`, () => {
          return HttpResponse.json([
            {
              id: 10,
              type: 'FOLDER',
              name: 'Cycling Workouts',
              description: 'My cycling library',
              visibility: 'PRIVATE',
              children: [
                { id: 1, name: '5x5min @ FTP' },
                { id: 2, name: '2x20min @ Threshold' },
              ],
            },
            {
              id: 11,
              type: 'PLAN',
              name: 'Base Building Plan',
              description: '12 week base plan',
              visibility: 'PUBLIC',
              rollout_weeks: 12,
              children: [],
            },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listFolders('i123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]?.type).toBe('FOLDER');
        expect(result.value[1]?.type).toBe('PLAN');
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/folders`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listFolders('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
      }
    });
  });

  describe('createFolder()', () => {
    test('happy path: creates and returns folder', async () => {
      server.use(
        http.post(`${baseUrl}/athlete/i123/folders`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.name).toBe('New Folder');
          expect(body.type).toBe('FOLDER');
          return HttpResponse.json({
            id: 20,
            type: 'FOLDER',
            name: 'New Folder',
            visibility: 'PRIVATE',
            children: [],
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.createFolder('i123', {
        name: 'New Folder',
        type: 'FOLDER',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(20);
        expect(result.value.name).toBe('New Folder');
      }
    });
  });

  describe('updateFolder()', () => {
    test('happy path: updates and returns folder', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/i123/folders/10`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.name).toBe('Updated Folder Name');
          return HttpResponse.json({
            id: 10,
            type: 'FOLDER',
            name: 'Updated Folder Name',
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.updateFolder('i123', 10, {
        name: 'Updated Folder Name',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Updated Folder Name');
      }
    });
  });

  describe('deleteFolder()', () => {
    test('happy path: deletes folder', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/i123/folders/10`, () => {
          return HttpResponse.json(null, { status: 200 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.deleteFolder('i123', 10);

      expect(result.ok).toBe(true);
    });

    test('404: returns NotFound error', async () => {
      server.use(
        http.delete(`${baseUrl}/athlete/i123/folders/999`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.deleteFolder('i123', 999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('NotFound');
      }
    });
  });

  // ============================================================================
  // Tags
  // ============================================================================

  describe('listTags()', () => {
    test('happy path: returns ok + tags array', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workout-tags`, () => {
          return HttpResponse.json([
            'intervals',
            'ftp',
            'threshold',
            'endurance',
            'recovery',
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listTags('i123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(5);
        expect(result.value).toContain('ftp');
        expect(result.value).toContain('intervals');
      }
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/workout-tags`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' },
      });
      const result = await client.library.listTags('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
      }
    });
  });
});
