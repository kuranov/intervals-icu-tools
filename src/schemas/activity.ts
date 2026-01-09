import * as v from "valibot";

// Base Activity schema with commonly used fields
export const ActivitySchema = v.looseObject({
  // Required fields (API always returns these)
  id: v.union([v.string(), v.number()]),
  type: v.string(), // Activity type is always present
  start_date_local: v.string(), // Activities always have a date

  // Optional fields
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  start_date: v.optional(v.string()),
  created: v.optional(v.string()),
  timezone: v.optional(v.string()),

  // Basic metrics
  distance: v.optional(v.number()),
  moving_time: v.optional(v.number()),
  elapsed_time: v.optional(v.number()),
  total_elevation_gain: v.optional(v.number()),
  calories: v.optional(v.number()),

  // Training load & intensity
  icu_training_load: v.optional(v.number()),
  icu_intensity: v.optional(v.number()),
  icu_joules: v.optional(v.number()),
  icu_efficiency_factor: v.optional(v.number()),
  trimp: v.optional(v.number()),

  // Heart rate metrics
  average_heartrate: v.optional(v.number()),
  max_heartrate: v.optional(v.number()),
  lthr: v.optional(v.number()),
  icu_hr_zones: v.optional(v.array(v.number())),
  icu_hr_zone_times: v.optional(v.array(v.number())),

  // Power metrics
  average_watts: v.optional(v.number()),
  weighted_average_watts: v.optional(v.number()),
  max_watts: v.optional(v.number()),
  p_max: v.optional(v.number()),
  icu_power_zones: v.optional(v.array(v.number())),
  icu_rolling_ftp: v.optional(v.number()),
  icu_rolling_cp: v.optional(v.number()),
  icu_power_hr: v.optional(v.number()),

  // Speed & pace metrics
  average_speed: v.optional(v.number()),
  max_speed: v.optional(v.number()),
  threshold_pace: v.optional(v.number()),
  gap: v.optional(v.number()),
  icu_pace_zones: v.optional(v.array(v.number())),

  // Cadence metrics
  average_cadence: v.optional(v.number()),
  max_cadence: v.optional(v.number()),

  // Subjective metrics
  feel: v.optional(v.number()),
  perceived_exertion: v.optional(v.number()),
  session_rpe: v.optional(v.number()),
  icu_rpe: v.optional(v.number()),

  // Activity metadata
  trainer: v.optional(v.boolean()),
  commute: v.optional(v.boolean()),
  race: v.optional(v.boolean()),
  analyzed: v.optional(v.boolean()),
  source: v.optional(v.string()),
  external_id: v.optional(v.string()),
  strava_id: v.optional(v.union([v.string(), v.number()])),

  // Device & equipment
  device_name: v.optional(v.string()),
  power_meter: v.optional(v.string()),
  power_meter_battery: v.optional(v.number()),
  device_watts: v.optional(v.boolean()),
  gear: v.optional(v.string()),

  // Advanced metrics
  decoupling: v.optional(v.number()),
  icu_variability_index: v.optional(v.number()),
  compliance: v.optional(v.number()),
  icu_w_prime: v.optional(v.number()),
  icu_max_wbal_depletion: v.optional(v.number()),

  // Altitude & environment
  average_altitude: v.optional(v.number()),
  max_altitude: v.optional(v.number()),
  min_altitude: v.optional(v.number()),

  // Weather data
  average_weather_temp: v.optional(v.number()),
  average_temp: v.optional(v.number()),
  max_temp: v.optional(v.number()),
  min_temp: v.optional(v.number()),
  average_wind_speed: v.optional(v.number()),
  prevailing_wind_deg: v.optional(v.number()),
  has_weather: v.optional(v.boolean()),

  // Intervals & segments
  icu_intervals_edited: v.optional(v.boolean()),
  icu_lap_count: v.optional(v.number()),
  has_segments: v.optional(v.boolean()),
  route_id: v.optional(v.union([v.string(), v.number()])),

  // OAuth & integration
  oauth_client_id: v.optional(v.union([v.string(), v.number()])),
  oauth_client_name: v.optional(v.string()),

  // Time breakdowns
  icu_warmup_time: v.optional(v.number()),
  icu_cooldown_time: v.optional(v.number()),
  coasting_time: v.optional(v.number()),
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
