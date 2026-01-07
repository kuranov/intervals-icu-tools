---
name: Entity-by-entity roadmap
overview: Extend the phased roadmap to be driven directly by the per-entity Rapidoc specs, with explicit MVP (v0.1) endpoint lists for Activities, Events, and Athletes (Node 18+, writes included).
todos:
  - id: phase1-contract
    content: "Phase 1: harden core contract (request helpers, consistent errors, 429 retry tests, conventions)"
    status: pending
  - id: phase2a-activities-mvp
    content: "Phase 2A: implement MVP Activities operations (list/get/update/delete + intervals operations) with schemas + MSW tests"
    status: pending
    dependencies:
      - phase1-contract
  - id: phase2b-events-mvp
    content: "Phase 2B: implement MVP Events CRUD + bulk utilities + tags with schemas + MSW tests"
    status: pending
    dependencies:
      - phase1-contract
      - phase2a-activities-mvp
  - id: phase2c-athletes-mvp
    content: "Phase 2C: implement MVP Athletes endpoints (get/update/settings/profile/summary) with schemas + MSW tests"
    status: pending
    dependencies:
      - phase1-contract
  - id: phase3-schemas
    content: "Phase 3: schema expansion + fixtures + strict/loose documentation"
    status: pending
    dependencies:
      - phase2a-activities-mvp
      - phase2b-events-mvp
      - phase2c-athletes-mvp
  - id: phase5-wellness-library
    content: "Phase 5: implement Wellness + Library resources from Rapidoc files"
    status: pending
    dependencies:
      - phase3-schemas
  - id: phase6-release
    content: "Phase 6: changesets + CI + publish workflow"
    status: pending
    dependencies:
      - phase1-contract
---

# Entity-by-entity phased development plan (Rapidoc-driven)

## Scope decisions (confirmed)

- **Runtime**: Node.js 18+ only.
- **v0.1 includes**: write endpoints (POST/PUT/DELETE) where supported.
- **v0.1 entities**: Activities, Events, Athletes.
- **Phase 2 order**: Activities first.

## How we’ll use your Rapidoc files

We will treat each file as the source for the endpoint backlog:

- [`docs/rapidoc/intervals-activities.json`](docs/rapidoc/intervals-activities.json)
- [`docs/rapidoc/intervals-events.json`](docs/rapidoc/intervals-events.json)
- [`docs/rapidoc/intervals-athletes.json`](docs/rapidoc/intervals-athletes.json)
- (Later) [`docs/rapidoc/intervals-wellness.json`](docs/rapidoc/intervals-wellness.json), [`docs/rapidoc/intervals-library.json`](docs/rapidoc/intervals-library.json)

For **each operationId** we implement:

- A resource method under `src/resources/<entity>.ts`
- A minimal-but-safe Valibot decoder under `src/schemas/<entity>/*.ts`
- MSW tests: happy path + at least one error path (401/429/schema)

## Phase 0 — Foundation (done)

- Repo scaffold, Result + ApiError, Ky HTTP client + retry, initial Activities list + tests.

## Phase 1 — Core contract hardening (pre-v0.1)

**Goal**: make the client stable for scaling endpoints.

- Standardize request helpers (json vs text vs binary) and response decoding.
- Confirm error shapes are consistent (especially schema issues).
- Add explicit tests for rate limit retry behavior (429 with and without `Retry-After`).
- Decide resource method naming conventions and parameter shaping.
- **Public surface audit**
- Ensure exports are stable and minimal (avoid leaking internals).
- Establish naming conventions and resource/module layout.
- **Error model hardening**
- Standardize `ApiError` shapes (consistent `message`, `status` presence, optional `body`).
- Ensure schema errors carry `issues` consistently.
- **HTTP behavior correctness**
- Confirm Base URL conventions (`/api/v1`) across endpoints.
- Add support for common request options (query params, headers).
- Add tests for rate-limit retry behavior (429 with/without `Retry-After`).
- **Resource pattern standardization**
- Create a consistent pattern for: `list/get/create/update/delete`.
- Prefer small decode helpers per endpoint.

## Phase 2 — MVP endpoint coverage (v0.1)

### Phase 2A — Activities (first)

**Goal**: cover the core lifecycle: list → get → update/delete + key interval operations.**From `intervals-activities.json`** (selected MVP operations):

- **List**
- `listActivities` (GET `/api/v1/athlete/{id}/activities`) — supports query params like `oldest`, `newest`, `limit`, `fields`.
- **Single activity CRUD**
- `getActivity` (GET `/api/v1/activity/{id}`)
- `updateActivity` (PUT `/api/v1/activity/{id}`)
- `deleteActivity` (DELETE `/api/v1/activity/{id}`)
- **Intervals (core write workflows)**
- `getIntervals` (GET `/api/v1/activity/{id}/intervals`)
- `updateIntervals` (PUT `/api/v1/activity/{id}/intervals`)
- `deleteIntervals` (PUT `/api/v1/activity/{id}/delete-intervals`)
- `updateInterval` (PUT `/api/v1/activity/{id}/intervals/{intervalId}`)
- `splitInterval` (PUT `/api/v1/activity/{id}/split-interval`)

**Deferred (still in Activities file, but not v0.1)**

- Uploads / multipart: `uploadActivity`, `uploadActivityStreamsCSV` (Phase “binary/uploads”).
- Streams/CSV, downloads (fit/gpx/original), power/pace/hr curves endpoints (Phase “advanced data”).

### Phase 2B — Events (second)

**Goal**: calendar CRUD and the most common bulk flows.**From `intervals-events.json`** (selected MVP operations):

- `listEvents` (GET)
- `showEvent` (GET)
- `createEvent` (POST)
- `updateEvent` (PUT)
- `deleteEvent` (DELETE)
- Bulk utilities (as needed for practical usage):
- `createMultipleEvents` (POST)
- `deleteEventsBulk` (POST)
- `updateEvents` (PUT)
- Small quality-of-life:
- `listTags_1` (GET)

**Deferred (post-v0.1)**

- Workout download/apply/duplicate flows: `downloadWorkouts`, `downloadWorkout_1`, `applyPlan`, `duplicateEvents`.

### Phase 2C — Athletes (third)

**Goal**: support fetching/updating current athlete and key settings/profile.**From `intervals-athletes.json`** (selected MVP operations):

- `getAthlete` (GET)
- `updateAthlete` (PUT)
- `getSettings` (GET)
- `getAthleteProfile` (GET)
- `getAthleteSummary` (GET)

**Deferred (post-v0.1)**

- Training plan endpoints: `getAthleteTrainingPlan`, `updateAthletePlan`, `updateAthletePlans`.

## Phase 3 — Schema maturity + fixtures

- Expand schemas per endpoint, prioritize fields that consumers actually use.
- Add payload fixtures for regression tests.
- Document strict-vs-loose validation posture per endpoint.

## Phase 4 — Robustness & ergonomics (DONE)

- ✅ Retry with jitter (prevent thundering herd)
- ✅ Request hooks for observability (onRequest, onResponse, onError, onRetry)
- ❌ Concurrency control (removed - keep library thin)

## Phase 5 — Wellness + Library resources

### Phase 5A — Wellness (first)

**Goal**: Daily wellness tracking (weight, HR, HRV, sleep, soreness, etc.)

**From `intervals-wellness.json`** (selected MVP operations):

- `getRecord` (GET `/api/v1/athlete/{id}/wellness/{date}`) — Get wellness for specific date
- `updateWellness` (PUT `/api/v1/athlete/{id}/wellness/{date}`) — Update wellness for date
- `updateWellnessBulk` (PUT `/api/v1/athlete/{id}/wellness-bulk`) — Update multiple records
- `listWellnessRecords` (GET `/api/v1/athlete/{id}/wellness`) — List records for date range (JSON)

**Deferred (post-v0.1)**:

- `uploadWellness` (POST with CSV) — Multipart upload
- CSV export (`.csv` extension on list endpoint)

### Phase 5B — Library (second)

**Goal**: Workout library management (folders, workouts, plans)

**From `intervals-library.json`** (selected MVP operations):

**Workouts (core CRUD):**

- `listWorkouts` (GET `/api/v1/athlete/{id}/workouts`) — List all workouts
- `showWorkout` (GET `/api/v1/athlete/{id}/workouts/{workoutId}`) — Get single workout
- `createWorkout` (POST `/api/v1/athlete/{id}/workouts`) — Create workout
- `updateWorkout` (PUT `/api/v1/athlete/{id}/workouts/{workoutId}`) — Update workout
- `deleteWorkout` (DELETE `/api/v1/athlete/{id}/workouts/{workoutId}`) — Delete workout
- `createMultipleWorkouts` (POST `/api/v1/athlete/{id}/workouts/bulk`) — Bulk create

**Folders (organize workouts):**

- `listFolders` (GET `/api/v1/athlete/{id}/folders`) — List folders/plans with workouts
- `createFolder` (POST `/api/v1/athlete/{id}/folders`) — Create folder or plan
- `updateFolder` (PUT `/api/v1/athlete/{id}/folders/{folderId}`) — Update folder/plan
- `deleteFolder` (DELETE `/api/v1/athlete/{id}/folders/{folderId}`) — Delete folder/plan

**Tags:**

- `listTags` (GET `/api/v1/athlete/{id}/workout-tags`) — List all workout tags

**Deferred (post-v0.1)**:

- File operations: `importWorkoutFile`, `downloadWorkout`, `downloadWorkoutForAthlete`
- Sharing: `listFolderSharedWith`, `updateFolderSharedWith`
- Plan operations: `updatePlanWorkouts`, `duplicateWorkouts`, `applyCurrentPlanChanges`

## Phase 6 — Release preparation

- Changesets for changelog generation
- CI/CD pipeline (tests, typecheck, build)
- NPM publish workflow