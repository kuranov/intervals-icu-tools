# Code Conventions

This document establishes the coding conventions for the intervals-icu-client library.

## Resource Method Naming

All resource methods follow RESTful naming patterns:

### Standard CRUD Operations

- **`list()`** - GET collection (e.g., `GET /athlete/{id}/activities`)
  - Returns array of items
  - Supports optional query parameters (filters, pagination, etc.)
  - Example: `activities.list(athleteId, { oldest: '2024-01-01', limit: 10 })`

- **`get(id)`** - GET single item (e.g., `GET /activity/{id}`)
  - Returns single item by ID
  - Example: `activities.get(activityId)`

- **`create(data)`** - POST new item (e.g., `POST /events`)
  - Accepts payload data
  - Returns created item
  - Example: `events.create({ name: 'Morning Run', ... })`

- **`update(id, data)`** - PUT/PATCH existing item (e.g., `PUT /activity/{id}`)
  - Accepts item ID and payload data
  - Returns updated item
  - Example: `activities.update(activityId, { name: 'Updated Name' })`

- **`delete(id)`** - DELETE item (e.g., `DELETE /activity/{id}`)
  - Accepts item ID
  - Returns success confirmation or void
  - Example: `activities.delete(activityId)`

### Special Operations

For operations that don't fit standard CRUD:
- Use descriptive verb + noun naming (e.g., `splitInterval`, `getSettings`)
- Prefix with the action verb: `get`, `update`, `delete`, `split`, `apply`, etc.
- Keep names concise but clear

## Parameter Conventions

### Required vs Optional
- **Required parameters**: positional arguments (e.g., `get(id)`, `list(athleteId)`)
- **Optional parameters**: options object as last parameter (e.g., `list(athleteId, options)`)

### ID Parameters
- Accept `string | number` for IDs to support both numeric and string identifiers
- Use `athleteId`, `activityId`, `eventId` naming pattern

### Options Objects
```typescript
// Query parameters, filters, pagination
interface ListOptions {
  oldest?: string;
  newest?: string;
  limit?: number;
  fields?: string[];
}

// Example usage
activities.list(0, { oldest: '2024-01-01', limit: 10 });
```

## Return Types

All API methods return `Result<T, ApiError>`:

```typescript
// Success case
{ ok: true, value: T }

// Error case
{ ok: false, error: ApiError }
```

### Error Handling Pattern

```typescript
const result = await client.activities.get(123);

if (!result.ok) {
  // Handle error
  if (result.error.kind === 'NotFound') {
    console.log('Activity not found');
  }
  return;
}

// Use value
const activity = result.value;
```

## Schema Conventions

### Valibot Schemas
- Use `looseObject` for API responses (allows extra fields)
- Keep schemas minimal initially, expand as needed
- Export both schema and inferred type

```typescript
export const ActivitySchema = v.looseObject({
  id: v.union([v.string(), v.number()]),
  name: v.optional(v.string()),
  // ... other fields
});

export type Activity = v.InferOutput<typeof ActivitySchema>;
```

### Decoder Functions
- Create one decoder per endpoint response type
- Named as `decode{EntityName}` (e.g., `decodeActivities`, `decodeActivity`)
- Kept internal (not exported from main package)
- Use Valibot's `parse` which throws with `issues` on validation errors

## Testing Conventions

### Test Structure
- Use MSW (Mock Service Worker) for HTTP mocking
- Test files: `*.test.ts` in `src/test/`
- One describe block per resource class

### Test Coverage (minimum)
Each endpoint should have tests for:
1. **Happy path** - successful response with valid data
2. **Schema error** - invalid response data
3. **HTTP error** - at least one error case (401, 404, etc.)
4. **Special cases** - rate limiting, retries (where applicable)

### Example Test Pattern
```typescript
describe('ActivitiesResource', () => {
  test('happy path: returns ok + parsed data', async () => {
    server.use(
      http.get(`${baseUrl}/activity/123`, () => {
        return HttpResponse.json({ id: 123, name: 'Test' });
      })
    );

    const client = new IntervalsClient({ /* ... */ });
    const result = await client.activities.get(123);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe(123);
    }
  });

  test('404: returns NotFound error', async () => {
    server.use(
      http.get(`${baseUrl}/activity/999`, () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const client = new IntervalsClient({ /* ... */ });
    const result = await client.activities.get(999);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('NotFound');
      if (result.error.kind === 'NotFound') {
        expect(result.error.status).toBe(404);
      }
    }
  });
});
```

## File Organization

```
src/
├── client.ts              # Main IntervalsClient class
├── config.ts              # Configuration types
├── errors.ts              # ApiError types
├── result.ts              # Result type helpers
├── http/
│   └── httpClient.ts      # HTTP client with retry logic
├── resources/
│   ├── activities.ts      # ActivitiesResource class
│   ├── events.ts          # EventsResource class
│   └── athletes.ts        # AthletesResource class
├── schemas/
│   ├── activity.ts        # Activity schemas & types
│   ├── event.ts           # Event schemas & types
│   └── athlete.ts         # Athlete schemas & types
└── test/
    ├── activities.test.ts
    ├── events.test.ts
    └── ...
```

## Public API Surface

Keep the public API minimal. Only export:
- `IntervalsClient` class
- Configuration types: `IntervalsClientConfig`, `IntervalsAuth`, `RetryConfig`
- Error types: `ApiError`
- Result types and helpers: `Result`, `ok`, `err`
- Data types: `Activity`, `Activities`, `Event`, etc.

**Do NOT export:**
- Internal implementation details (decoders, schemas, HTTP client, error constructors)
- Internal utilities and helpers
- Test utilities
