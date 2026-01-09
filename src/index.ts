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

// Data types - Wellness
export type {
  Wellness,
  WellnessList,
  SportInfo,
} from "./schemas/wellness";

// Data types - Library
export type {
  Workout,
  Workouts,
  Folder,
  Folders,
  WorkoutTags,
} from "./schemas/library";

// Common schemas
export { ActivityTypeSchema } from "./schemas/common";
export type { ActivityType } from "./schemas/common";
