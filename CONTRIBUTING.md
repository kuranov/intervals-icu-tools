# Contributing to intervals-icu-client

> **Guide for AI Agents & Developers**
>
> This document describes the philosophy, architecture, and patterns used in this library. Follow these guidelines to maintain consistency when adding new features or resources.

## Philosophy & DNA

### Core Principles

**1. Thin Yet Functional**
- Minimal abstraction over the Intervals.icu API
- No over-engineering - only add what's directly needed
- Zero unnecessary dependencies (only `ky` and `valibot`)
- Small bundle size matters

**2. Robust & Production-Ready**
- Type-safe with full TypeScript support
- Result types (no exceptions) for predictable error handling
- Retry with jitter for rate limits (429 responses)
- Observability hooks (optional, zero-cost if unused)
- Comprehensive test coverage with MSW

**3. Runtime-Agnostic**
- Works in Node.js 18+, Bun, Deno
- No Node-specific APIs in runtime code
- ESM + CJS dual exports
- Zero side effects (`sideEffects: false`)

**4. Developer Experience**
- Complete API coverage (not just common endpoints)
- IntelliSense-friendly types
- Clear error messages with structured data
- Simple, intuitive API surface

### Tech Stack

**Runtime Dependencies:**
- `ky` - Modern HTTP client (works everywhere)
- `valibot` - Lightweight schema validation

**Dev Dependencies:**
- `vitest` - Fast test runner
- `msw` - API mocking for tests
- `tsup` - Zero-config bundler
- TypeScript 5.7+

**What We DON'T Use:**
- ❌ Heavy frameworks (axios, got, etc.)
- ❌ Runtime schema libraries (zod is too heavy)
- ❌ Complex build setups
- ❌ Class decorators or experimental features
- ❌ Polyfills or compatibility layers

## Architecture Overview

```
src/
├── index.ts                 # Main client export
├── config.ts                # Client configuration types
├── errors.ts                # ApiError types
├── result.ts                # Result<T, E> type
├── http/
│   └── httpClient.ts        # HTTP layer with retry/hooks
├── resources/               # API resources
│   ├── activities.ts
│   ├── events.ts
│   ├── athletes.ts
│   └── wellness.ts          # Next to implement
├── schemas/                 # Valibot schemas + types
│   ├── activity.ts
│   ├── event.ts
│   └── athlete.ts
└── test/                    # Tests (mirrors resources)
    ├── activities.test.ts
    ├── events.test.ts
    ├── mswServer.ts         # MSW setup
    └── setup.ts             # Test hooks
```

## Implementation Guide

### Adding a New Resource (Step-by-Step)

When adding a new resource (e.g., `wellness`), follow this pattern:

#### 1. Create Schema File: `src/schemas/wellness.ts`

```typescript
import * as v from "valibot";

// Use looseObject for API responses (allows extra fields)
export const WellnessSchema = v.looseObject({
  id: v.string(), // ISO-8601 date (e.g., "2024-01-15")
  weight: v.optional(v.number()),
  restingHR: v.optional(v.number()),
  hrv: v.optional(v.number()),
  sleepSecs: v.optional(v.number()),
  soreness: v.optional(v.number()),
  fatigue: v.optional(v.number()),
  // ... add fields as needed
});

export type Wellness = v.InferOutput<typeof WellnessSchema>;

// Array decoder
export const WellnessListSchema = v.array(WellnessSchema);
export type WellnessList = v.InferOutput<typeof WellnessListSchema>;

// Decoder functions
export function decodeWellness(data: unknown): Wellness {
  return v.parse(WellnessSchema, data);
}

export function decodeWellnessList(data: unknown): WellnessList {
  return v.parse(WellnessListSchema, data);
}
```

**Schema Patterns:**
- Use `v.looseObject()` for API responses (Intervals.icu adds extra fields)
- Use `v.optional()` for nullable/optional fields
- Support `v.union([v.string(), v.number()])` for IDs (API is inconsistent)
- Keep schemas flat and focused - don't over-model
- Export both the schema and inferred types
- Create decoder functions (`decode*`) for each schema

#### 2. Create Resource File: `src/resources/wellness.ts`

```typescript
import type { ApiError } from "../errors";
import type { Result } from "../result";
import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeWellness,
  decodeWellnessList,
  type Wellness,
  type WellnessList,
} from "../schemas/wellness";

export type ListWellnessOptions = {
  /** Local date of oldest record (ISO-8601) */
  oldest?: string;
  /** Local date of newest record (ISO-8601), inclusive */
  newest?: string;
};

export class WellnessResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * List wellness records for date range.
   */
  list(
    athleteId: string | number,
    options?: ListWellnessOptions
  ): Promise<Result<WellnessList, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness`,
      { searchParams: options },
      decodeWellnessList
    );
  }

  /**
   * Get wellness record for specific date.
   */
  get(
    athleteId: string | number,
    date: string
  ): Promise<Result<Wellness, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness/${date}`,
      {},
      decodeWellness
    );
  }

  /**
   * Update wellness record for date.
   * Only fields provided are changed.
   */
  update(
    athleteId: string | number,
    date: string,
    data: Partial<Wellness>
  ): Promise<Result<Wellness, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness/${date}`,
      { method: "PUT", json: data },
      decodeWellness
    );
  }
}
```

**Resource Patterns:**
- One class per resource (`WellnessResource`)
- Constructor takes `IntervalsHttpClient`
- Methods return `Promise<Result<T, ApiError>>`
- Use `this.http.requestJson()` for JSON endpoints
- Use `searchParams` for query parameters
- Use `json` for request bodies
- Add JSDoc comments describing what each method does
- Export option types for complex parameters
- Use descriptive, clear method names (`list`, `get`, `update`, `delete`)

#### 3. Add to Main Client: `src/index.ts`

```typescript
import { WellnessResource } from "./resources/wellness";

export class IntervalsClient {
  // ... existing resources
  readonly wellness: WellnessResource;

  constructor(config: IntervalsClientConfig) {
    // ... existing setup
    this.wellness = new WellnessResource(this.http);
  }
}
```

#### 4. Create Test File: `src/test/wellness.test.ts`

```typescript
import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { IntervalsClient } from '../index';
import { server } from './mswServer';

const baseUrl = 'https://intervals.icu/api/v1';

describe('WellnessResource', () => {
  describe('list()', () => {
    test('happy path: returns ok + parsed wellness records', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json([
            { id: '2024-01-15', weight: 70.5, restingHR: 55 },
          ]);
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' }
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.weight).toBe(70.5);
      }
    });

    test('schema mismatch: returns Schema error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json({ not: 'an array' });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' }
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Schema');
      }
    });

    test('401: returns Unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/athlete/i123/wellness`, () => {
          return HttpResponse.json({ error: 'nope' }, { status: 401 });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' }
      });
      const result = await client.wellness.list('i123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe('Unauthorized');
        expect(result.error.status).toBe(401);
      }
    });
  });

  describe('update()', () => {
    test('happy path: updates and returns wellness', async () => {
      server.use(
        http.put(`${baseUrl}/athlete/i123/wellness/2024-01-15`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: '2024-01-15',
            ...body
          });
        }),
      );

      const client = new IntervalsClient({
        auth: { type: 'apiKey', apiKey: 'test' }
      });
      const result = await client.wellness.update('i123', '2024-01-15', {
        weight: 71.0,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.weight).toBe(71.0);
      }
    });
  });
});
```

**Test Patterns:**
- One `describe()` per method
- Always test: happy path, schema error, HTTP error (401/404/429)
- Use MSW to mock HTTP responses
- Test query parameters are passed correctly
- Test request bodies are sent correctly
- Verify auth headers in at least one test per resource
- Keep tests focused and readable

#### 5. Update README

Add usage example in the relevant section:

```typescript
// Get wellness for a date
const wellness = await client.wellness.get('i123', '2024-01-15');
if (wellness.ok) {
  console.log(`Weight: ${wellness.value.weight}kg`);
}

// Update wellness
await client.wellness.update('i123', '2024-01-15', {
  weight: 71.5,
  sleepSecs: 28800, // 8 hours
});
```

## Code Style & Conventions

### General Rules

1. **Use TypeScript strictly**
   - Enable all strict mode flags
   - No `any` types (use `unknown` if needed)
   - Prefer `type` over `interface` for simple objects

2. **Error Handling**
   - Always use `Result<T, E>` for operations that can fail
   - Never throw exceptions in library code
   - Use structured errors from `errors.ts`

3. **Naming Conventions**
   - Resources: `PascalCase` classes (e.g., `WellnessResource`)
   - Methods: `camelCase` (e.g., `list`, `get`, `update`)
   - Types: `PascalCase` (e.g., `Wellness`, `ListWellnessOptions`)
   - Constants: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_BASE_URL`)

4. **Imports**
   - Use `type` imports when importing only types
   - Group imports: external deps → internal → types
   - Use relative paths for internal imports

5. **Comments**
   - Use JSDoc for public APIs
   - Keep comments concise and useful
   - Don't state the obvious

### HTTP Client Usage

The `IntervalsHttpClient` provides these methods:

```typescript
// JSON endpoints (most common)
this.http.requestJson<T>(
  path: string,
  options?: RequestOptions,
  decode?: Decoder<T>
): Promise<Result<T, ApiError>>

// Text/CSV endpoints
this.http.requestText<T>(
  path: string,
  options?: RequestOptions,
  decode?: (text: string) => T
): Promise<Result<T, ApiError>>

// Binary endpoints (files)
this.http.requestArrayBuffer(
  path: string,
  options?: RequestOptions
): Promise<Result<ArrayBuffer, ApiError>>
```

**RequestOptions:**
```typescript
{
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  searchParams?: Record<string, any>; // Query parameters
  json?: any;                          // Request body (JSON)
  body?: string | FormData;            // Raw body
  headers?: Record<string, string>;    // Custom headers
}
```

## Testing Guidelines

### MSW Setup

Tests use Mock Service Worker (MSW) to mock HTTP requests:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from './mswServer';

// In your test
server.use(
  http.get(`${baseUrl}/athlete/i123/wellness`, () => {
    return HttpResponse.json([{ id: '2024-01-15' }]);
  }),
);
```

### Test Coverage Requirements

For each resource method, test AT MINIMUM:

1. **Happy path** - Valid response, correct parsing
2. **Schema validation** - Invalid response shape
3. **HTTP errors** - 401, 404, 429 (at least one)
4. **Query parameters** - Verify they're passed correctly
5. **Request body** - Verify it's sent correctly (for PUT/POST)

### Running Tests

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Watch mode
pnpm typecheck         # Type check without running tests
pnpm build             # Build the package
```

## API Design Patterns

### Athlete ID Parameter

Most endpoints take an `athleteId` parameter:

```typescript
// Use union type to accept both string and number
athleteId: string | number

// Default to 0 (current athlete) when optional
list(athleteId: string | number = 0, options?: ListOptions)

// Pass directly to URL
`athlete/${athleteId}/wellness`
```

### Date Parameters

Intervals.icu uses ISO-8601 local dates:

```typescript
// Accept as string (don't convert to Date objects)
date: string  // e.g., "2024-01-15"

// For date ranges
oldest?: string;  // Inclusive
newest?: string;  // Inclusive
```

### Pagination

Intervals.icu doesn't use cursor/offset pagination:

```typescript
// Just use limit + date range
{
  oldest?: string;
  newest?: string;
  limit?: number;
}
```

### Bulk Operations

For bulk create/update/delete:

```typescript
// Accept arrays
createMultiple(data: Event[]): Promise<Result<Event[], ApiError>>

// For bulk update, use array or specific DTO
updateBulk(data: Wellness[]): Promise<Result<void, ApiError>>
```

## OpenAPI Integration

The `docs/rapidoc/` directory contains OpenAPI specs for each resource:

- `intervals-activities.json`
- `intervals-events.json`
- `intervals-athletes.json`
- `intervals-wellness.json`
- `intervals-library.json`

**How to use:**
1. Open the spec file
2. Find the `operationId` you want to implement
3. Check parameters, request body, response schema
4. Implement the method following patterns above
5. Don't over-implement - focus on MVP operations first

## Common Pitfalls to Avoid

### ❌ Don't Do This

```typescript
// Don't throw exceptions
throw new Error('Failed to fetch');

// Don't use classes for data
class Wellness {
  constructor(public weight: number) {}
}

// Don't add unnecessary abstractions
class WellnessBuilder {
  withWeight(w: number) { ... }
}

// Don't use default exports
export default class WellnessResource { ... }

// Don't add dependencies for simple tasks
import _ from 'lodash'; // NO!

// Don't use any
function parse(data: any) { ... }

// Don't ignore schema validation
return this.http.requestJson(path); // Missing decoder!
```

### ✅ Do This

```typescript
// Return Result types
return ok(data);
return err(error);

// Use plain objects + types
type Wellness = {
  weight?: number;
};

// Keep it simple
const wellness = { weight: 70.5 };

// Use named exports
export class WellnessResource { ... }

// Use standard library
const items = array.filter(x => x.active);

// Use unknown + type guards
function parse(data: unknown) { ... }

// Always validate responses
return this.http.requestJson(path, {}, decodeWellness);
```

## Release Checklist

Before marking a phase as complete:

- [ ] All endpoints implemented
- [ ] Schemas defined with proper types
- [ ] Tests written (happy path + errors)
- [ ] All tests passing (`pnpm test`)
- [ ] Type checking passing (`pnpm typecheck`)
- [ ] Build successful (`pnpm build`)
- [ ] README updated with examples
- [ ] No linting errors
- [ ] Git commit with clear message

## Getting Help

- Check existing resources (`activities`, `events`, `athletes`) for patterns
- Read the OpenAPI spec in `docs/rapidoc/`
- Run tests in watch mode to iterate quickly
- Ask questions about design decisions (don't guess!)

## Philosophy Reminder

When in doubt, remember:

> **Thin, robust, modern.** Complete API coverage. Works everywhere. No magic.

If you're adding complexity, ask: *"Does this serve the user, or am I just being clever?"*

Keep it simple. Keep it focused. Ship it.
