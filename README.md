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


