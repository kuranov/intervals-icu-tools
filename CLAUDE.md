# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**intervals-icu-client** is a type-safe TypeScript client library for the Intervals.icu API. The library is designed to be thin yet functional, runtime-agnostic (Node.js 18+, Bun, Deno), and production-ready with robust error handling.

**Core Philosophy:** Minimal abstraction over the API. No over-engineering. Only add what's directly needed. Small bundle size matters.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Development workflow
pnpm typecheck           # Type check without running tests
pnpm test               # Run all tests once
pnpm test:watch         # Run tests in watch mode
pnpm build              # Build the package (outputs to dist/)

# Testing specific files
pnpm test src/test/activities.test.ts
```

## Architecture Overview

### Core Layers

1. **Client Layer** (`src/client.ts`, `src/index.ts`)
   - `IntervalsClient` is the main entry point
   - Instantiates resource classes and provides them as public properties
   - Each resource (activities, events, athletes) is accessed via `client.resourceName`

2. **HTTP Layer** (`src/http/httpClient.ts`)
   - `IntervalsHttpClient` handles all HTTP communication
   - Provides three methods: `requestJson()`, `requestText()`, `requestArrayBuffer()`
   - Implements retry logic with exponential backoff and jitter for 429 (rate limit) responses
   - Supports lifecycle hooks (onRequest, onResponse, onError, onRetry) for observability
   - **Key feature**: Automatically retries rate-limited requests using Retry-After header or exponential backoff

3. **Resource Layer** (`src/resources/`)
   - One class per API resource (ActivitiesResource, EventsResource, AthletesResource)
   - Each resource class takes `IntervalsHttpClient` in constructor
   - Methods correspond to API endpoints (list, get, update, delete, etc.)
   - **All methods return `Promise<Result<T, ApiError>>`** - never throw exceptions

4. **Schema Layer** (`src/schemas/`)
   - Uses Valibot for runtime validation of API responses
   - Each schema file exports:
     - Schema definition (e.g., `WellnessSchema`)
     - Inferred TypeScript types (e.g., `type Wellness`)
     - Decoder functions (e.g., `decodeWellness()`)
   - **Use `v.looseObject()`** for API responses (Intervals.icu returns extra fields)
   - Schemas are passed to `requestJson()` for automatic validation

5. **Error Handling** (`src/errors.ts`, `src/result.ts`)
   - **Result Type Pattern**: All API methods return `Result<T, ApiError>` instead of throwing
   - `{ ok: true, value: T }` on success
   - `{ ok: false, error: ApiError }` on failure
   - ApiError is a discriminated union with kinds: Unauthorized, Forbidden, NotFound, RateLimit, Schema, Http, Timeout, Network, Unknown
   - Consumers use type narrowing: `if (result.ok) { result.value } else { result.error }`

### Key Design Patterns

**Authentication**
- Supports two auth types: `apiKey` (Basic auth) and `accessToken` (Bearer OAuth)
- Auth is configured once at client instantiation
- `buildAuthorizationHeader()` converts auth config to HTTP header

**Retry with Jitter**
- Rate limit (429) responses are automatically retried
- Respects `Retry-After` header if present (no jitter applied)
- Falls back to exponential backoff with jitter to prevent thundering herd
- Configurable via `RetryConfig` (limit, initialDelayMs, maxDelayMs, jitter, jitterFactor)

**Schema Validation**
- Every JSON response is validated against a Valibot schema
- Validation errors return `{ ok: false, error: { kind: "Schema", issues: ... } }`
- Use `v.optional()` for nullable fields
- Use `v.union([v.string(), v.number()])` for inconsistent API fields (e.g., IDs)

**Testing with MSW**
- All tests use Mock Service Worker (MSW) to intercept HTTP requests
- Setup in `src/test/mswServer.ts` and `src/test/setup.ts`
- Each resource has a corresponding test file that mocks endpoints and validates behavior
- Test coverage requires: happy path, schema error, HTTP errors (401/404/429), query params, request bodies

## Adding New Resources

When implementing a new API resource (e.g., `wellness`), follow this entity-by-entity workflow:

1. **Create Schema** (`src/schemas/wellness.ts`)
   - Define `WellnessSchema` using `v.looseObject()`
   - Export inferred type: `export type Wellness = v.InferOutput<typeof WellnessSchema>`
   - Create decoder: `export function decodeWellness(data: unknown): Wellness`
   - For list endpoints, create `WellnessListSchema` and `decodeWellnessList()`

2. **Create Resource** (`src/resources/wellness.ts`)
   - Create `WellnessResource` class with constructor taking `IntervalsHttpClient`
   - Implement methods that call `this.http.requestJson(path, options, decoder)`
   - All methods return `Promise<Result<T, ApiError>>`
   - Export option types for complex parameters

3. **Update Main Client** (`src/client.ts`)
   - Add `readonly wellness: WellnessResource` property
   - Instantiate in constructor: `this.wellness = new WellnessResource(http)`
   - Export types in `src/index.ts`

4. **Write Tests** (`src/test/wellness.test.ts`)
   - Use MSW to mock API responses
   - Test happy path, schema errors, HTTP errors
   - Verify query parameters and request bodies are sent correctly

5. **Update Documentation** (README.md)
   - Add usage examples showing how to use the new resource

Refer to `CONTRIBUTING.md` for detailed step-by-step implementation guide with code examples.

## Critical Development Rules

1. **Never throw exceptions** - Use Result types for all operations that can fail
2. **Always validate API responses** - Pass decoder to `requestJson()`
3. **Use looseObject for schemas** - API returns extra fields we don't model
4. **Test thoroughly** - Every method needs: happy path + schema error + HTTP error tests
5. **Keep it thin** - Only add features directly needed, avoid over-engineering
6. **No unnecessary dependencies** - Only `ky` and `valibot` allowed at runtime

## Important Implementation Details

**Athlete ID Convention**
- Most endpoints accept `athleteId: string | number`
- `0` or `"i{id}"` format for current athlete
- Pass through to URL as-is: `athlete/${athleteId}/wellness`

**Date Handling**
- Intervals.icu uses ISO-8601 local dates (e.g., `"2024-01-15"`)
- Always accept dates as strings, never convert to Date objects
- Date range parameters: `oldest` and `newest` (both inclusive)

**HTTP Methods via httpClient**
```typescript
// Most common: JSON endpoint
this.http.requestJson<T>(path, options, decoderFunction)

// Text/CSV endpoint
this.http.requestText<T>(path, options, (text) => parseText(text))

// Binary endpoint (files)
this.http.requestArrayBuffer(path, options)
```

**Request Options Structure**
```typescript
{
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  searchParams?: Record<string, any>,  // Query parameters
  json?: any,                           // Request body (JSON)
  body?: string | FormData,             // Raw body
  headers?: Record<string, string>      // Custom headers
}
```

## Tech Stack

**Runtime Dependencies:**
- `ky` - Modern HTTP client (works in all runtimes)
- `valibot` - Lightweight schema validation

**Dev Dependencies:**
- `vitest` - Test runner
- `msw` - API mocking for tests
- `tsup` - Zero-config bundler
- TypeScript 5.7+

**Build Output:**
- ESM + CJS dual exports
- `sideEffects: false` for tree-shaking
- Exports: types, ESM (`.mjs`), CJS (`.cjs`)

## Common Pitfalls to Avoid

- ❌ Don't throw exceptions - use Result types
- ❌ Don't use `any` - use `unknown` with type guards
- ❌ Don't skip schema validation - always pass decoder to `requestJson()`
- ❌ Don't use `v.object()` - use `v.looseObject()` for API responses
- ❌ Don't add unnecessary abstractions (builders, factories, etc.)
- ❌ Don't add runtime dependencies without strong justification
- ❌ Don't create classes for data - use plain objects with types

## File Organization Reference

```
src/
├── client.ts              # Main IntervalsClient class
├── index.ts               # Public API exports
├── config.ts              # Configuration types
├── errors.ts              # ApiError types
├── result.ts              # Result<T, E> type
├── http/
│   └── httpClient.ts      # HTTP layer with retry/hooks
├── resources/             # API resource implementations
│   ├── activities.ts
│   ├── events.ts
│   ├── athletes.ts
│   └── wellness.ts        # Next to implement
├── schemas/               # Valibot schemas + types
│   ├── activity.ts
│   ├── event.ts
│   ├── athlete.ts
│   └── wellness.ts
└── test/                  # Tests mirror resources
    ├── activities.test.ts
    ├── events.test.ts
    ├── athletes.test.ts
    ├── mswServer.ts       # MSW setup
    ├── setup.ts           # Test hooks
    └── fixtures/          # Test data
```

## Additional Resources

- `CONTRIBUTING.md` - Comprehensive guide for AI agents with detailed patterns and examples
- `README.md` - User-facing documentation with usage examples
- `docs/rapidoc/` - OpenAPI specifications for each resource
- `package.json` - All available npm scripts
