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



