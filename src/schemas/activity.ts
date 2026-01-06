import * as v from "valibot";

// Base Activity schema with commonly used fields
export const ActivitySchema = v.looseObject({
  id: v.union([v.string(), v.number()]),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(v.string()),
  start_date_local: v.optional(v.string()),
  start_date: v.optional(v.string()),
  distance: v.optional(v.number()),
  moving_time: v.optional(v.number()),
  elapsed_time: v.optional(v.number()),
  total_elevation_gain: v.optional(v.number()),
  icu_training_load: v.optional(v.number()),
  icu_intensity: v.optional(v.number()),
  icu_joules: v.optional(v.number()),
  average_heartrate: v.optional(v.number()),
  max_heartrate: v.optional(v.number()),
  average_watts: v.optional(v.number()),
  weighted_average_watts: v.optional(v.number()),
  max_watts: v.optional(v.number()),
  average_speed: v.optional(v.number()),
  max_speed: v.optional(v.number()),
  average_cadence: v.optional(v.number()),
  max_cadence: v.optional(v.number()),
  calories: v.optional(v.number()),
  feel: v.optional(v.number()),
  perceived_exertion: v.optional(v.number()),
});

export type Activity = v.InferOutput<typeof ActivitySchema>;

export const ActivitiesSchema = v.array(ActivitySchema);
export type Activities = v.InferOutput<typeof ActivitiesSchema>;

// Interval schema
export const IntervalSchema = v.looseObject({
  id: v.optional(v.number()),
  type: v.optional(v.string()),
  start: v.optional(v.number()),
  end: v.optional(v.number()),
  distance: v.optional(v.number()),
  duration: v.optional(v.number()),
  average_watts: v.optional(v.number()),
  average_heartrate: v.optional(v.number()),
  average_cadence: v.optional(v.number()),
  average_speed: v.optional(v.number()),
  icu_training_load: v.optional(v.number()),
});

export type Interval = v.InferOutput<typeof IntervalSchema>;

// IntervalsDTO schema (response from intervals endpoints)
export const IntervalsDTOSchema = v.looseObject({
  intervals: v.optional(v.array(IntervalSchema)),
});

export type IntervalsDTO = v.InferOutput<typeof IntervalsDTOSchema>;

// ActivityId schema (response from delete endpoint)
export const ActivityIdSchema = v.looseObject({
  id: v.union([v.string(), v.number()]),
});

export type ActivityId = v.InferOutput<typeof ActivityIdSchema>;

// Decoder functions (internal use)
export function decodeActivities(data: unknown): Activities {
  return v.parse(ActivitiesSchema, data);
}

export function decodeActivity(data: unknown): Activity {
  return v.parse(ActivitySchema, data);
}

export function decodeIntervalsDTO(data: unknown): IntervalsDTO {
  return v.parse(IntervalsDTOSchema, data);
}

export function decodeActivityId(data: unknown): ActivityId {
  return v.parse(ActivityIdSchema, data);
}
