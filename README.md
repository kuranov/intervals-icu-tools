# @kuranov/intervals-client

Modern, type-safe TypeScript client for the [Intervals.icu](https://intervals.icu) API.

## Table of Contents

- [Why This Library?](#why-this-library)
- [Install](#install)
- [Quick Start](#quick-start)
  - [API Key Authentication](#api-key-authentication-personal-scripts)
  - [OAuth2 Authentication](#oauth2-authentication-public-apps)
- [API Coverage](#api-coverage)
  - [Resources](#resources)
  - [Quick Reference](#quick-reference)
- [Configuration](#configuration)
  - [Retry with jitter](#retry-with-jitter)
  - [Hooks for observability](#hooks-for-observability)
- [Examples](#examples)
  - [Working with activities](#working-with-activities)
  - [Working with events](#working-with-events)
  - [Working with athletes](#working-with-athletes)
  - [Working with wellness](#working-with-wellness)
  - [OAuth2 Flow](#oauth2-flow)
  - [Working with workout library](#working-with-workout-library)
- [Error Handling](#error-handling)
  - [Result Pattern](#result-pattern)
  - [Error Types](#error-types)
- [Type Safety & Validation](#type-safety--validation)
  - [Validation Philosophy](#validation-philosophy)
- [Contributing](#contributing)
- [Development](#development)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Why This Library?

- **🛡️ Runtime Validation** - Catches API changes before they break your app (powered by [Valibot](https://valibot.dev))
- **🌍 Universal** - Works in Node.js 18+, Bun, Deno, browsers, and edge runtimes
- **🪶 Lightweight** - Zero heavy dependencies (~12KB gzipped)
- **🔐 Auth Ready** - Supports both API key and OAuth2 authentication
- **⚡ Smart Rate Limiting** - Automatic retry with exponential backoff
- **📦 Extensive Coverage** - 64/146 API endpoints (44%): Activities, Events, Athletes, Wellness, Library, Chats
- **🎯 Type Safe** - Full TypeScript support with strict types
- **🧪 Well Tested** - 125 tests covering all operations

## Install

```bash
npm install @kuranov/intervals-client
# or
pnpm add @kuranov/intervals-client
# or
yarn add @kuranov/intervals-client
```

## Quick Start

### API Key Authentication (Personal Scripts)

Perfect for personal automation scripts and server-side integrations.

```ts
import { IntervalsClient } from '@kuranov/intervals-client';

const client = new IntervalsClient({
  auth: { type: 'apiKey', apiKey: process.env.INTERVALS_API_KEY! },
});

// List recent activities
const result = await client.activities.list(0, {
  oldest: '2024-01-01',
  limit: 10,
});

if (!result.ok) {
  console.error('Error:', result.error.kind);
  process.exitCode = 1;
} else {
  console.log(`Found ${result.value.length} activities`);
  result.value.forEach(activity => {
    console.log(`${activity.startDateLocal}: ${activity.name}`);
  });
}
```

### OAuth2 Authentication (Public Apps)

Required for applications serving multiple users. The library handles token management and refresh.

```ts
import { IntervalsClient } from '@kuranov/intervals-client';

const client = new IntervalsClient({
  auth: {
    type: 'accessToken',
    accessToken: user.intervalsAccessToken,
  },
});

// Get athlete profile
const athlete = await client.athletes.get('me');
if (athlete.ok) {
  console.log(`Athlete: ${athlete.value.name}`);
  console.log(`FTP: ${athlete.value.ftp || 'Not set'}`);
}
```

> **Note:** OAuth2 flow requires separate handling of authorization URL generation and token exchange. See the [OAuth Guide](#oauth2-flow) below for complete implementation.

## API Coverage

v1.1.0 provides **44% coverage** (64/146 endpoints) of the Intervals.icu API with complete support for core resources:

### Resources

- **Activities** (39/39 endpoints, 100%) - List, get, update, delete activities, intervals, streams, power curves, search
- **Events** (17/17 endpoints, 100%) - Manage calendar events, workouts, plans, downloads
- **Chats** (8/8 endpoints, 100%) - Messages, activity comments, notifications
- **Athletes** (~10 endpoints) - Get athlete profiles, settings, and summaries
- **Wellness** (~6 endpoints) - Track daily wellness metrics (HRV, sleep, mood, etc.)
- **Library** (~10 endpoints) - Manage workout library folders and plans

### Quick Reference

```ts
// Activities - Basic operations
await client.activities.list(athleteId, { oldest: '2024-01-01' });
await client.activities.get(activityId);
await client.activities.update(activityId, { name: 'Morning Ride' });
await client.activities.delete(activityId);

// Activities - Streams & analysis (NEW in v1.1.0)
await client.activities.getStreams(activityId, { types: ['watts', 'heartrate'] });
await client.activities.getPowerCurve(activityId);
await client.activities.search(athleteId, 'race');
await client.activities.downloadFitFile(activityId);

// Events (Calendar)
await client.events.list(athleteId, { oldest: '2024-01-01' });
await client.events.create(athleteId, { name: 'Workout', startDateLocal: '2024-01-15' });
await client.events.update(athleteId, eventId, { description: 'Updated' });
await client.events.downloadWorkout(athleteId, eventId, 'fit'); // NEW
await client.events.applyPlan(athleteId, { folderId: 123, oldest: '2024-01-01', newest: '2024-12-31' }); // NEW

// Chats - Messages & comments (NEW in v1.1.0)
await client.chats.list(athleteId);
await client.chats.sendMessage({ chatId: 123, text: 'Great workout!' });
await client.chats.listActivityMessages(activityId);
await client.chats.addActivityMessage(activityId, 'Nice effort!');

// Wellness
await client.wellness.list(athleteId, { oldest: '2024-01-01' });
await client.wellness.update(athleteId, '2024-01-15', { weight: 72, restingHR: 45 });

// Athletes
await client.athletes.get(athleteId);
await client.athletes.update(athleteId, { name: 'New Name' });
await client.athletes.getSettings(athleteId);

// Library
await client.library.listWorkouts(athleteId);
await client.library.listFolders(athleteId);
await client.library.createFolder(athleteId, { type: 'FOLDER', name: 'My Workouts' });
```

See [Examples](#examples) below for complete usage patterns.

## Configuration

### Retry with jitter

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

Jitter prevents "thundering herd" when many clients retry simultaneously. The library automatically respects `Retry-After` headers when present.

### Hooks for observability

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

All hooks support both sync and async functions. **Note:** If a hook throws an error, it will fail the request (except `onError`, which is swallowed to avoid masking the original error).

## Examples

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
  { type: 'ACTIVE', start: 0, end: 300, averageWatts: 250 },
  { type: 'REST', start: 300, end: 420, averageWatts: 100 },
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
  console.log(`Max HR: ${profile.value.maxHeartrate}`);
  console.log(`Threshold Power: ${profile.value.thresholdPower}`);
}

// Get athlete summary (CTL, ATL, TSB, etc.)
const summary = await client.athletes.getSummary(0, {
  start: '2024-01-01',
  end: '2024-01-31',
  tags: ['cycling', 'running'],
});
if (summary.ok) {
  summary.value.forEach((s) => {
    console.log(`${s.startDateLocal}: CTL=${s.ctl}, ATL=${s.atl}, TSB=${s.tsb}`);
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

### OAuth2 Flow

For public applications serving multiple users, implement the full OAuth2 authorization code flow:

```ts
// Step 1: Redirect user to authorization URL
const authUrl = new URL('https://intervals.icu/oauth/authorize');
authUrl.searchParams.set('client_id', YOUR_CLIENT_ID);
authUrl.searchParams.set('redirect_uri', YOUR_REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'ACTIVITY:READ ACTIVITY:WRITE WELLNESS:READ');
authUrl.searchParams.set('state', generateRandomState()); // CSRF protection

// Redirect user to: authUrl.toString()

// Step 2: Handle callback and exchange code for token
const tokenResponse = await fetch('https://intervals.icu/api/v1/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: codeFromCallback,
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET,
    redirect_uri: YOUR_REDIRECT_URI,
  }),
});

const tokens = await tokenResponse.json();
// { access_token, refresh_token, expires_in, token_type, scope }

// Step 3: Use the access token
const client = new IntervalsClient({
  auth: { type: 'accessToken', accessToken: tokens.access_token },
});

// Step 4: Refresh when expired (tokens expire after 8 hours)
const refreshResponse = await fetch('https://intervals.icu/api/v1/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET,
  }),
});

const newTokens = await refreshResponse.json();
// Update stored tokens and recreate client with new access_token
```

**Available OAuth scopes:**
- `ACTIVITY:READ`, `ACTIVITY:WRITE`
- `WELLNESS:READ`, `WELLNESS:WRITE`
- `CALENDAR:READ`, `CALENDAR:WRITE`
- `SETTINGS:READ`

### Working with workout library

```ts
// List all workouts in your library
const workouts = await client.library.listWorkouts(0);
if (workouts.ok) {
  workouts.value.forEach((w) => {
    console.log(`${w.name} (${w.activityType})`);
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

## Error Handling

All API calls return a `Result<T, ApiError>` - no exceptions are thrown.

### Result Pattern

```ts
const result = await client.activities.get(123);

if (!result.ok) {
  // Error handling
  switch (result.error.kind) {
    case 'Unauthorized':
      console.error('Invalid credentials');
      break;
    case 'NotFound':
      console.error('Activity not found');
      break;
    case 'Schema':
      console.error('Validation failed:', result.error.issues);
      break;
    case 'RateLimit':
      console.error('Rate limited, retry after:', result.error.retryAfter);
      break;
    default:
      console.error('Unknown error:', result.error);
  }
} else {
  // Success - use result.value
  console.log(result.value.name);
}
```

### Error Types

- `Unauthorized` (401) - Invalid API key or expired token
- `Forbidden` (403) - Insufficient permissions
- `NotFound` (404) - Resource doesn't exist
- `RateLimit` (429) - Too many requests (includes `retryAfter` hint)
- `Schema` - Response validation failed (API changed or malformed data)
- `Network` - Connection error, timeout, or DNS failure
- `Unknown` - Other HTTP errors

## Type Safety & Validation

This library uses [Valibot](https://valibot.dev/) for runtime schema validation and TypeScript type generation.

### Validation Philosophy

The library uses a **"loose object"** validation strategy that balances type safety with API flexibility:

```typescript
// Schema example (simplified)
export const ActivitySchema = v.looseObject({
  // Required fields - API always returns these
  id: v.union([v.string(), v.number()]),
  type: v.string(),
  startDateLocal: v.string(),

  // Optional fields - may or may not be present
  name: v.optional(v.string()),
  distance: v.optional(v.number()),
  // ... 100+ more optional fields
});
```

#### Why `looseObject`?

**Reason 1: API Evolution**
The Intervals.icu API can return extra fields not documented in the OpenAPI spec. Using `looseObject` allows the library to accept these fields without breaking.

**Reason 2: Incomplete Documentation**
Some API endpoints return fields that aren't in the official spec. Strict validation would reject valid API responses.

**Reason 3: Future Compatibility**
When Intervals.icu adds new fields, your code continues working without requiring a library update.

#### What Gets Validated?

✅ **Required fields are enforced:**
```typescript
// TypeScript knows these are always present
activity.id         // number | string (never undefined)
activity.type       // string (never undefined)
activity.startDateLocal  // string (never undefined)
```

✅ **Optional fields are typed correctly:**
```typescript
// TypeScript knows these might be undefined
activity.name       // string | undefined
activity.distance   // number | undefined
```

✅ **Invalid data is caught at runtime:**
```typescript
const result = await client.activities.get(123);

if (!result.ok && result.error.kind === 'Schema') {
  // API returned data that doesn't match the schema
  console.error('Validation failed:', result.error.issues);
}
```

❌ **Extra fields are allowed (not validated):**
```typescript
// If API returns a new field "future_field", it passes validation
// and is available on the object (but TypeScript doesn't know about it)
```

#### Trade-offs

**Benefits:**
- ✅ Forward compatible with API changes
- ✅ Works with undocumented API fields
- ✅ No false-positive validation errors
- ✅ Simple, consistent pattern across all schemas

**Limitations:**
- ⚠️ Extra fields aren't typed in TypeScript (use type assertions if needed)
- ⚠️ Can't catch typos in field names at runtime (TypeScript catches them at compile time)

#### When Validation Fails

If the API returns data that doesn't match the schema (e.g., missing required field, wrong type), you'll get a `Schema` error:

```typescript
const result = await client.activities.get(123);

if (!result.ok) {
  if (result.error.kind === 'Schema') {
    // Valibot validation failed
    console.error('Schema validation error:');
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path}: ${issue.message}`);
    });
  }
}
```

This is rare but can happen if:
- The Intervals.icu API changes in a breaking way
- There's a bug in the API
- Network corruption (very rare)

## Contributing

Contributions are welcome! Please:

1. Open an issue to discuss the change
2. Fork the repository
3. Create a feature branch
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm test`)
6. Submit a pull request

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm run typecheck

# Run tests
pnpm test

# Build
pnpm run build
```

## License

MIT © [Anton Kuranov](https://github.com/kuranov)

## Acknowledgments

Built for the [Intervals.icu](https://intervals.icu) community. Special thanks to David Tinker for creating and maintaining the platform and its open API.



