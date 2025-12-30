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

const activities = await client.activities.list(0);
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

const activities = await client.activities.list(0);
if (activities.ok) console.log(activities.value);
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


