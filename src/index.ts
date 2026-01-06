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

// Data types
export type { Activity, Activities } from "./schemas/activity";
