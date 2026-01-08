# intervals-icu-client

Type-safe TypeScript client for the Intervals.icu API (Node.js 18+).

## Install

```bash
pnpm add intervals-icu-client
```

## Usage

### Basic auth (personal API key)

```ts
import { IntervalsClient } from 'intervals-icu-client';

const client = new IntervalsClient({
  auth: { type: 'apiKey', apiKey: process.env.INTERVALS_API_KEY! },
});

// List activities
const activities = await client.activities.list(0, {
  oldest: '2024-01-01',
  limit: 10,
});

if (!activities.ok) {
  console.error(activities.error);
  process.exitCode = 1;
} else {
  console.log(activities.value);
}
```

### OAuth (Bearer access token)

```ts
import { IntervalsClient } from 'intervals-icu-client';

const client = new IntervalsClient({
  auth: { type: 'accessToken', accessToken: process.env.INTERVALS_ACCESS_TOKEN! },
});

// Get a single activity
const activity = await client.activities.get(123456);
if (activity.ok) console.log(activity.value);
```

### Advanced configuration

#### Retry with jitter

Automatically retries rate-limited requests (429) with exponential backoff and optional jitter:

```ts
const client = new IntervalsClient({
  auth: { type: 'apiKey', apiKey: process.env.INTERVALS_API_KEY! },
  retry: {
    limit: 3,              // Max retries (default: 3)
    initialDelayMs: 1000,  // Base delay (default: 1000ms)
    maxDelayMs: 8000,      // Max delay cap (default: 8000ms)
    jitter: true,          // Add randomness (default: true)
    jitterFactor: 0.2,     // ±20% variation (default: 0.2)
  },
});
```

Jitter prevents "thundering herd" when many clients retry simultaneously.

#### Hooks for observability

Add logging, metrics, or monitoring with lifecycle hooks:

```ts
const client = new IntervalsClient({
  auth: { type: 'apiKey', apiKey: process.env.INTERVALS_API_KEY! },
  hooks: {
    onRequest: ({ method, path }) => {
      console.log(`→ ${method} ${path}`);
    },
    onResponse: ({ method, path, status, durationMs }) => {
      console.log(`← ${method} ${path} ${status} (${durationMs}ms)`);
    },
    onError: ({ method, path, error, durationMs }) => {
      console.error(`✗ ${method} ${path} failed after ${durationMs}ms:`, error);
    },
    onRetry: ({ method, path, attempt, maxAttempts, delayMs, reason }) => {
      console.log(`⟳ ${method} ${path} retry ${attempt}/${maxAttempts} after ${delayMs}ms (${reason})`);
    },
  },
});
```

All hooks support both sync and async functions.

### Working with activities

```ts
// Update an activity
const updated = await client.activities.update(123456, {
  name: 'Morning Run',
  description: 'Easy recovery run',
});

// Delete an activity
const deleted = await client.activities.delete(123456);

// Get intervals for an activity
const intervals = await client.activities.getIntervals(123456);

// Update intervals
const updatedIntervals = await client.activities.updateIntervals(123456, [
  { type: 'ACTIVE', start: 0, end: 300, average_watts: 250 },
  { type: 'REST', start: 300, end: 420, average_watts: 100 },
]);

// Split an interval at a specific point
const split = await client.activities.splitInterval(123456, 150);
```

### Working with events

```ts
// List events (planned workouts, notes, etc.)
const events = await client.events.list(0, {
  oldest: '2024-01-01',
  newest: '2024-01-31',
  category: ['WORKOUT', 'NOTES'],
});

// Get a single event
const event = await client.events.get(0, 789);

// Create an event
const newEvent = await client.events.create(0, {
  name: 'Morning Workout',
  category: 'WORKOUT',
  start_date_local: '2024-01-15',
  description: '5x5min @ FTP',
});

// Update an event
const updated = await client.events.update(0, 789, {
  name: 'Updated Workout Name',
});

// Delete an event
const deleted = await client.events.delete(0, 789);

// Bulk create events
const bulkEvents = await client.events.createMultiple(0, [
  { name: 'Workout 1', start_date_local: '2024-01-15', category: 'WORKOUT' },
  { name: 'Workout 2', start_date_local: '2024-01-16', category: 'WORKOUT' },
]);

// Bulk delete events
const bulkDeleted = await client.events.deleteBulk(0, [
  { id: 100 },
  { id: 101 },
  { external_id: 'external-123' },
]);

// Update multiple events in a date range
const updatedRange = await client.events.updateMultiple(
  0,
  { hide_from_athlete: true },
  { oldest: '2024-01-01', newest: '2024-01-31' }
);

// List event tags
const tags = await client.events.listTags(0);
```

### Working with athletes

```ts
// Get athlete with sport settings
const athlete = await client.athletes.get(0);
if (athlete.ok) {
  console.log(athlete.value.name);
  console.log(athlete.value.sportSettings);
}

// Update athlete
const updated = await client.athletes.update(123, {
  name: 'Updated Name',
  weight: 72,
  timezone: 'America/New_York',
});

// Get athlete settings for a device
const desktopSettings = await client.athletes.getSettings(0, 'desktop');
const phoneSettings = await client.athletes.getSettings(0, 'phone');
const tabletSettings = await client.athletes.getSettings(0, 'tablet');

// Get athlete profile (includes FTP, thresholds, etc.)
const profile = await client.athletes.getProfile(0);
if (profile.ok) {
  console.log(`FTP: ${profile.value.ftp}`);
  console.log(`Max HR: ${profile.value.max_heartrate}`);
  console.log(`Threshold Power: ${profile.value.threshold_power}`);
}

// Get athlete summary (CTL, ATL, TSB, etc.)
const summary = await client.athletes.getSummary(0, {
  start: '2024-01-01',
  end: '2024-01-31',
  tags: ['cycling', 'running'],
});
if (summary.ok) {
  summary.value.forEach((s) => {
    console.log(`${s.start_date_local}: CTL=${s.ctl}, ATL=${s.atl}, TSB=${s.tsb}`);
  });
}
```

### Working with wellness

```ts
// List wellness records for a date range
const records = await client.wellness.list(0, {
  oldest: '2024-01-01',
  newest: '2024-01-31',
});
if (records.ok) {
  records.value.forEach((w) => {
    console.log(`${w.id}: weight=${w.weight}kg, HR=${w.restingHR}`);
  });
}

// Get wellness for a specific date
const wellness = await client.wellness.get(0, '2024-01-15');
if (wellness.ok) {
  console.log(`Weight: ${wellness.value.weight}kg`);
  console.log(`Resting HR: ${wellness.value.restingHR}bpm`);
  console.log(`HRV: ${wellness.value.hrv}`);
  console.log(`Sleep: ${wellness.value.sleepSecs}s`);
}

// Update wellness for a date
const updated = await client.wellness.update(0, '2024-01-15', {
  weight: 71.5,
  sleepSecs: 28800, // 8 hours
  soreness: 3,
  fatigue: 2,
  mood: 8,
  comments: 'Feeling good today',
});

// Bulk update multiple wellness records
const bulkUpdate = await client.wellness.updateBulk(0, [
  { id: '2024-01-15', weight: 70.5, restingHR: 55 },
  { id: '2024-01-16', weight: 70.3, restingHR: 54 },
  { id: '2024-01-17', weight: 70.1, restingHR: 53 },
]);
```

### Working with workout library

```ts
// List all workouts in your library
const workouts = await client.library.listWorkouts(0);
if (workouts.ok) {
  workouts.value.forEach((w) => {
    console.log(`${w.name} (${w.activity_type})`);
  });
}

// Get a specific workout
const workout = await client.library.getWorkout(0, 123);
if (workout.ok) {
  console.log(`Workout: ${workout.value.name}`);
  console.log(`Description: ${workout.value.description}`);
}

// Create a new workout
const newWorkout = await client.library.createWorkout(0, {
  name: '5x5min @ FTP',
  description: '5 x 5min @ FTP with 3min recovery',
  folder_id: 10,
  activity_type: 'Ride',
  tags: ['intervals', 'ftp'],
});

// Update a workout
const updated = await client.library.updateWorkout(0, 123, {
  name: 'Updated Workout Name',
  description: 'New description',
});

// Delete a workout
const deleted = await client.library.deleteWorkout(0, 123);

// Create multiple workouts at once
const bulkWorkouts = await client.library.createMultipleWorkouts(0, [
  { name: 'Workout 1', folder_id: 10, activity_type: 'Ride' },
  { name: 'Workout 2', folder_id: 10, activity_type: 'Ride' },
]);

// List folders and plans
const folders = await client.library.listFolders(0);
if (folders.ok) {
  folders.value.forEach((f) => {
    console.log(`${f.name} (${f.type})`);
    console.log(`  Workouts: ${f.children?.length || 0}`);
  });
}

// Create a folder
const newFolder = await client.library.createFolder(0, {
  type: 'FOLDER',
  name: 'Cycling Workouts',
  description: 'My cycling library',
  visibility: 'PRIVATE',
});

// Create a training plan
const newPlan = await client.library.createFolder(0, {
  type: 'PLAN',
  name: 'Base Building Plan',
  description: '12-week aerobic base',
  visibility: 'PUBLIC',
  rollout_weeks: 12,
  auto_rollout_day: 1, // Monday
  starting_ctl: 50,
  starting_atl: 40,
});

// Update a folder
const updatedFolder = await client.library.updateFolder(0, 10, {
  name: 'Updated Folder Name',
  description: 'New description',
});

// Delete a folder
const deletedFolder = await client.library.deleteFolder(0, 10);

// List all workout tags
const tags = await client.library.listTags(0);
if (tags.ok) {
  console.log('Tags:', tags.value.join(', '));
}
```

## Error handling

All API calls return a `Result<T, ApiError>`:

- `{ ok: true, value }` on success
- `{ ok: false, error }` on failure (HTTP, auth, schema validation, network, etc.)

## Development

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```



