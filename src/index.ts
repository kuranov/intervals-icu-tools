// Main client
export { IntervalsClient } from "./client";

// Configuration types
export type {
  IntervalsClientConfig,
  IntervalsAuth,
  RetryConfig,
} from "./config";

// Error types
export type { ApiError } from "./errors";

// Result type and helpers
export type { Result } from "./result";
export { err, ok } from "./result";

// Data types - Activities
export type {
  Activity,
  Activities,
  Interval,
  IntervalsDTO,
  ActivityId,
} from "./schemas/activity";

// Data types - Events
export type {
  Event,
  Events,
  EventEx,
  DoomedEvent,
  DeleteEventsResponse,
  EventTags,
} from "./schemas/event";

// Data types - Athletes
export type {
  Athlete,
  AthleteUpdateDTO,
  WithSportSettings,
  AthleteSettings,
  AthleteProfile,
  SummaryWithCats,
  AthleteSummary,
} from "./schemas/athlete";
