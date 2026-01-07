# Schema Design & Validation Philosophy

This document explains the schema design decisions, validation approach, and philosophy behind the intervals-icu-client library.

## Core Principles

### 1. Loose Validation (looseObject)

All schemas use Valibot's `looseObject` instead of strict objects. This design choice provides:

**Benefits:**
- **Forward compatibility**: API can add new fields without breaking the client
- **Resilience**: Unknown fields are silently ignored rather than causing errors
- **Flexibility**: Developers can access new API fields immediately through TypeScript's index signatures

**Example:**
```typescript
// ✅ Works even if API adds new fields
const activity = await client.activities.get(123);
// TypeScript knows about typed fields:
console.log(activity.value.icu_training_load);
// But also allows unknown fields:
console.log(activity.value.future_new_field); // No runtime error
```

### 2. Optional Fields

Nearly all fields are optional (`v.optional()`):

**Rationale:**
- **Sparse data**: Intervals.icu API returns different fields based on activity type, device, and analysis status
- **Partial responses**: Some endpoints support field filtering
- **Graceful degradation**: Missing data shouldn't break the application

**Example:**
```typescript
// Power data only exists for cycling/smart trainer activities
if (activity.value.average_watts) {
  console.log(`Average power: ${activity.value.average_watts}W`);
}

// HR data might be missing if no HR monitor was used
if (activity.value.average_heartrate) {
  console.log(`Average HR: ${activity.value.average_heartrate}bpm`);
}
```

### 3. Union Types for IDs

IDs accept both `string | number`:

**Rationale:**
- **API inconsistency**: Some endpoints return numeric IDs, others return strings
- **External IDs**: Third-party integrations may use string identifiers
- **Future-proofing**: Allows API to evolve ID format without breaking changes

```typescript
export const ActivitySchema = v.looseObject({
  id: v.union([v.string(), v.number()]),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  // ...
});
```

### 4. Minimal Required Fields

Only essential fields are required. Currently:

**Activities:**
- `id` - The only truly required field

**Events:**
- No strictly required fields (all optional)

**Athletes:**
- No strictly required fields (all optional)

**Rationale:**
- Different endpoints return different subsets of data
- Flexibility for future API changes
- Prevents validation failures on legitimate API responses

## Schema Coverage Strategy

### Prioritization

Fields are prioritized for inclusion based on:

1. **Frequency of use**: Commonly requested data across use cases
2. **Analytics value**: Training metrics, performance indicators
3. **Integration needs**: OAuth, device sync, external IDs
4. **User experience**: Metadata that affects UI/UX

### Coverage Levels

**Level 1 - Essential (100% coverage):**
- Core identifiers (id, athlete_id)
- Basic metrics (distance, time, speed)
- Training load indicators
- Date/time fields

**Level 2 - Standard (80% coverage):**
- Performance metrics (power, HR, pace)
- Zone distributions
- Device metadata
- Weather data

**Level 3 - Advanced (50% coverage):**
- Detailed analytics (decoupling, efficiency)
- Integration metadata (OAuth, external IDs)
- Advanced power metrics (W', CP models)
- Specialized fields (swimming, strength training)

**Level 4 - Specialized (<30% coverage):**
- Rare use case fields
- Admin/internal fields
- Legacy compatibility fields

## Schema Expansion Process

When adding new fields:

1. **Check API documentation** - Verify field exists in OpenAPI spec
2. **Add to schema** - Use appropriate Valibot type with `v.optional()`
3. **Add to fixtures** - Include realistic example in test fixtures
4. **Document if needed** - Add inline comments for complex/specialized fields
5. **Run regression tests** - Ensure backwards compatibility

Example:
```typescript
// Adding a new field to ActivitySchema
export const ActivitySchema = v.looseObject({
  // ... existing fields ...

  // New field - describe purpose if not obvious
  icu_training_load: v.optional(v.number()),

  // Complex field - add comment explaining structure
  icu_power_zones: v.optional(v.array(v.number())), // Array of zone percentages
});
```

## Validation Error Handling

### Error Types

Schema validation failures produce `ApiError` with `kind: "Schema"`:

```typescript
const result = await client.activities.get(123);

if (!result.ok && result.error.kind === 'Schema') {
  // Access validation issues
  console.error('Validation failed:', result.error.issues);
  console.error('Message:', result.error.message);
}
```

### Schema Error Structure

```typescript
{
  kind: 'Schema',
  message: 'Response validation failed',
  issues?: unknown,  // Valibot validation issues
  cause?: unknown    // Original error
}
```

## Testing Strategy

### Regression Tests

**Purpose**: Ensure schema changes don't break existing functionality

**Location**: `src/test/schema-regression.test.ts`

**Coverage**:
- Parse realistic API responses (fixtures)
- Handle minimal data (backwards compatibility)
- Ignore unknown fields (forward compatibility)
- Validate required fields

### Fixtures

**Purpose**: Provide realistic, reusable test data

**Location**: `src/test/fixtures/`

**Types**:
- `activity.fixture.ts` - Activities (cycling, running, trainer)
- `event.fixture.ts` - Events (workouts, notes, races)
- `athlete.fixture.ts` - Athletes (basic, with settings, profiles)

**Usage in tests**:
```typescript
import { activityFixtures } from './fixtures';

test('parses cycling workout', () => {
  const activity = decodeActivity(activityFixtures.cyclingWorkout);
  expect(activity.icu_training_load).toBe(185);
});
```

## Strict vs Loose Posture

### Current Approach: Loose Everywhere

All schemas use `v.looseObject()`:

**Advantages:**
- Maximum flexibility
- Forward compatibility
- Resilient to API changes

**Trade-offs:**
- No warnings about typos in field names
- Can't catch "extra" fields that might indicate bugs
- Less documentation value (schema doesn't enumerate all possible fields)

### When to Use Strict Validation

Consider `v.strictObject()` for:

- **Request payloads** - Catch typos before sending to API
- **Critical operations** - Where field correctness is essential
- **Internal DTOs** - Data you control completely

Currently **NOT** used because:
1. API responses vary significantly by endpoint and context
2. API continues to evolve with new fields
3. We want maximum resilience to API changes

### Future Considerations

If needed, we could offer dual schemas:

```typescript
// Loose for most use cases (current)
export const ActivitySchema = v.looseObject({ /* ... */ });

// Strict variant for development/debugging
export const ActivitySchemaStrict = v.strictObject({ /* ... */ });
```

## Schema Maintenance

### When API Changes

**New field added by API:**
- ✅ No action needed (loose validation handles it)
- 📝 Optionally add to schema if commonly used
- ✅ Update fixtures if field is important

**Field removed by API:**
- ⚠️ Mark as deprecated in comments
- ✅ Keep in schema (no harm, API will just not return it)
- 📝 Update documentation

**Field type changed by API:**
- ⚠️ **Breaking change** - requires schema update
- ✅ Use union types if both formats exist in the wild
- 📝 Add migration guide in changelog

### Versioning

Schema changes follow semver:

- **Patch** (1.0.x): Add optional fields, update fixtures
- **Minor** (1.x.0): Add required fields (rare), deprecate fields
- **Major** (x.0.0): Remove fields, change types, change validation strictness

## Best Practices for Consumers

### Type Safety

```typescript
// ✅ Good - check field existence
if (activity.value.average_watts) {
  const watts = activity.value.average_watts;
  console.log(`Power: ${watts}W`);
}

// ❌ Bad - assume field exists
const watts = activity.value.average_watts!;
console.log(`Power: ${watts}W`); // Might be undefined!
```

### Error Handling

```typescript
// ✅ Good - handle schema errors
const result = await client.activities.get(123);
if (!result.ok) {
  if (result.error.kind === 'Schema') {
    // Validation failed - API might have changed
    console.error('Schema validation failed:', result.error.issues);
  } else {
    // HTTP, network, or other error
    console.error('API error:', result.error);
  }
  return;
}

// Use validated data
const activity = result.value;
```

### Type Narrowing

```typescript
// ✅ Good - narrow types based on activity characteristics
const activity = result.value;

if (activity.type === 'Ride' && activity.average_watts) {
  // TypeScript knows average_watts is number here
  analyzePowerData(activity.average_watts);
}

if (activity.trainer) {
  // Indoor workout - certain fields more reliable
  if (activity.device_name?.includes('Zwift')) {
    // Zwift-specific logic
  }
}
```

## Summary

The intervals-icu-client uses a **loose validation** approach that prioritizes:

1. ✅ **Resilience** - API changes won't break the client
2. ✅ **Flexibility** - Developers can access any API field
3. ✅ **Developer Experience** - TypeScript provides guidance for known fields
4. ✅ **Future-proofing** - New API features work immediately

This design aligns with the library's goal of being a **stable, long-lived** client for a **rapidly evolving** API.
