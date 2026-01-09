# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### Added

- **Core API Client** - Type-safe client for Intervals.icu API v1
- **Activities Resource** - Full CRUD operations for activities and intervals
- **Athletes Resource** - Athlete profile and settings management
- **Events Resource** - Calendar events (workouts, notes, races)
- **Wellness Resource** - Daily wellness tracking
- **Library Resource** - Workout library management (folders, plans, workouts)
- **Result Type Pattern** - No exceptions, all errors returned as values
- **Rate Limit Handling** - Automatic retry with exponential backoff and jitter
- **Request Hooks** - Observable lifecycle (onRequest, onResponse, onError, onRetry)
- **Runtime Agnostic** - Works in Node.js 18+, Bun, Deno, browsers
- **TypeScript** - Full type safety with Valibot schema validation
- **Dual Package** - ESM and CJS exports with TypeScript declarations

### Technical Details

- **Dependencies**: Only 2 runtime deps (ky, valibot) for minimal bundle size
- **Build**: Powered by tsdown/rolldown for fast builds
- **Test Coverage**: 115 tests with MSW for API mocking
- **Bundle Size**: ~8KB gzipped (ESM)

### Design Decisions

- Uses `looseObject` schemas for API flexibility
- Required fields (id, dates) are non-optional for better DX
- Retry only on 429 (rate limit), not on 5xx
- Hooks can fail requests (validation use case)

[1.0.0]: https://github.com/kuranov/intervals-client/releases/tag/v1.0.0
