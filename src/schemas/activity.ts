import * as v from "valibot";
import { transformKeys, type CamelCaseKeys } from "../utils/transform";

// StravaGear schema (equipment attached to activity)
const StravaGearSchemaRaw = v.looseObject({
  id: v.nullish(v.string()),
  name: v.nullish(v.string()),
  distance: v.nullish(v.number()),
  primary: v.nullish(v.boolean()),
});

export const StravaGearSchema = v.pipe(StravaGearSchemaRaw, v.transform(transformKeys));
export type StravaGear = CamelCaseKeys<v.InferOutput<typeof StravaGearSchemaRaw>>;

// Base Activity schema with commonly used fields (raw snake_case from API)
const ActivitySchemaRaw = v.looseObject({
  // Required fields (API always returns these)
  id: v.union([v.string(), v.number()]),
  type: v.string(), // Activity type is always present
  start_date_local: v.string(), // Activities always have a date

  // Optional fields
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  name: v.nullish(v.string()),
  description: v.nullish(v.string()),
  start_date: v.nullish(v.string()),
  created: v.nullish(v.string()),
  timezone: v.nullish(v.string()),

  // Basic metrics
  distance: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),
  elapsed_time: v.nullish(v.number()),
  total_elevation_gain: v.nullish(v.number()),
  calories: v.nullish(v.number()),

  // Training load & intensity
  icu_training_load: v.nullish(v.number()),
  icu_intensity: v.nullish(v.number()),
  icu_joules: v.nullish(v.number()),
  icu_efficiency_factor: v.nullish(v.number()),
  trimp: v.nullish(v.number()),

  // Heart rate metrics
  average_heartrate: v.nullish(v.number()),
  max_heartrate: v.nullish(v.number()),
  lthr: v.nullish(v.number()),
  icu_hr_zones: v.nullish(v.array(v.number())),
  icu_hr_zone_times: v.nullish(v.array(v.number())),

  // Power metrics
  average_watts: v.nullish(v.number()),
  weighted_average_watts: v.nullish(v.number()),
  max_watts: v.nullish(v.number()),
  p_max: v.nullish(v.number()),
  icu_power_zones: v.nullish(v.array(v.number())),
  icu_rolling_ftp: v.nullish(v.number()),
  icu_rolling_cp: v.nullish(v.number()),
  icu_power_hr: v.nullish(v.number()),

  // Speed & pace metrics
  average_speed: v.nullish(v.number()),
  max_speed: v.nullish(v.number()),
  threshold_pace: v.nullish(v.number()),
  gap: v.nullish(v.number()),
  icu_pace_zones: v.nullish(v.array(v.number())),

  // Cadence metrics
  average_cadence: v.nullish(v.number()),
  max_cadence: v.nullish(v.number()),

  // Subjective metrics
  feel: v.nullish(v.number()),
  perceived_exertion: v.nullish(v.number()),
  session_rpe: v.nullish(v.number()),
  icu_rpe: v.nullish(v.number()),

  // Activity metadata
  trainer: v.nullish(v.boolean()),
  commute: v.nullish(v.boolean()),
  race: v.nullish(v.boolean()),
  analyzed: v.nullish(v.string()), // date-time when activity was analyzed
  source: v.nullish(v.string()),
  external_id: v.nullish(v.string()),
  strava_id: v.nullish(v.union([v.string(), v.number()])),

  // Device & equipment
  device_name: v.nullish(v.string()),
  power_meter: v.nullish(v.string()),
  power_meter_battery: v.nullish(v.string()),
  device_watts: v.nullish(v.boolean()),
  gear: v.nullish(StravaGearSchema),

  // Advanced metrics
  decoupling: v.nullish(v.number()),
  icu_variability_index: v.nullish(v.number()),
  compliance: v.nullish(v.number()),
  icu_w_prime: v.nullish(v.number()),
  icu_max_wbal_depletion: v.nullish(v.number()),

  // Altitude & environment
  average_altitude: v.nullish(v.number()),
  max_altitude: v.nullish(v.number()),
  min_altitude: v.nullish(v.number()),

  // Weather data
  average_weather_temp: v.nullish(v.number()),
  average_temp: v.nullish(v.number()),
  max_temp: v.nullish(v.number()),
  min_temp: v.nullish(v.number()),
  average_wind_speed: v.nullish(v.number()),
  prevailing_wind_deg: v.nullish(v.number()),
  has_weather: v.nullish(v.boolean()),

  // Intervals & segments
  icu_intervals_edited: v.nullish(v.boolean()),
  icu_lap_count: v.nullish(v.number()),
  has_segments: v.nullish(v.boolean()),
  route_id: v.nullish(v.union([v.string(), v.number()])),

  // OAuth & integration
  oauth_client_id: v.nullish(v.union([v.string(), v.number()])),
  oauth_client_name: v.nullish(v.string()),

  // Time breakdowns
  icu_warmup_time: v.nullish(v.number()),
  icu_cooldown_time: v.nullish(v.number()),
  coasting_time: v.nullish(v.number()),
});

// Export the transformed schema (converts snake_case to camelCase)
export const ActivitySchema = v.pipe(ActivitySchemaRaw, v.transform(transformKeys));

export type Activity = CamelCaseKeys<v.InferOutput<typeof ActivitySchemaRaw>>;

export const ActivitiesSchema = v.array(ActivitySchema);
export type Activities = Activity[];

// Interval schema (raw snake_case from API)
const IntervalSchemaRaw = v.looseObject({
  id: v.nullish(v.number()),
  type: v.nullish(v.string()),
  start: v.nullish(v.number()),
  end: v.nullish(v.number()),
  distance: v.nullish(v.number()),
  duration: v.nullish(v.number()),
  average_watts: v.nullish(v.number()),
  average_heartrate: v.nullish(v.number()),
  average_cadence: v.nullish(v.number()),
  average_speed: v.nullish(v.number()),
  icu_training_load: v.nullish(v.number()),
});

// Export the transformed schema (converts snake_case to camelCase)
export const IntervalSchema = v.pipe(IntervalSchemaRaw, v.transform(transformKeys));

export type Interval = CamelCaseKeys<v.InferOutput<typeof IntervalSchemaRaw>>;

// IntervalsResponse schema (response from intervals endpoints, raw)
const IntervalsResponseSchemaRaw = v.looseObject({
  intervals: v.nullish(v.array(IntervalSchema)),
});

export const IntervalsResponseSchema = v.pipe(IntervalsResponseSchemaRaw, v.transform(transformKeys));
export type IntervalsResponse = CamelCaseKeys<v.InferOutput<typeof IntervalsResponseSchemaRaw>>;

// ActivityId schema (response from delete endpoint, raw)
const ActivityIdSchemaRaw = v.looseObject({
  id: v.union([v.string(), v.number()]),
});

export const ActivityIdSchema = v.pipe(ActivityIdSchemaRaw, v.transform(transformKeys));
export type ActivityId = CamelCaseKeys<v.InferOutput<typeof ActivityIdSchemaRaw>>;

// Anomaly schema (stream anomalies, raw)
const AnomalySchemaRaw = v.looseObject({
  start_index: v.nullish(v.number()),
  end_index: v.nullish(v.number()),
  value: v.nullish(v.number()),
  valueEnd: v.nullish(v.number()),
});

export const AnomalySchema = v.pipe(AnomalySchemaRaw, v.transform(transformKeys));
export type Anomaly = CamelCaseKeys<v.InferOutput<typeof AnomalySchemaRaw>>;

// ActivityStream schema (individual stream, raw)
const ActivityStreamSchemaRaw = v.looseObject({
  type: v.nullish(v.string()),
  name: v.nullish(v.string()),
  data: v.nullish(v.any()), // Object with index -> value mapping
  data2: v.nullish(v.any()), // Secondary data object
  valueTypeIsArray: v.nullish(v.boolean()),
  anomalies: v.nullish(v.array(AnomalySchema)),
  custom: v.nullish(v.boolean()),
  allNull: v.nullish(v.boolean()),
});

export const ActivityStreamSchema = v.pipe(ActivityStreamSchemaRaw, v.transform(transformKeys));
export type ActivityStream = CamelCaseKeys<v.InferOutput<typeof ActivityStreamSchemaRaw>>;

// ActivityStreams schema (array of streams)
export const ActivityStreamsSchema = v.array(ActivityStreamSchema);
export type ActivityStreams = ActivityStream[];

// UpdateStreamsResponse schema (response from PUT streams, raw)
const UpdateStreamsResponseSchemaRaw = v.looseObject({
  updated: v.nullish(v.array(v.string())),
  deleted: v.nullish(v.array(v.string())),
});

export const UpdateStreamsResponseSchema = v.pipe(UpdateStreamsResponseSchemaRaw, v.transform(transformKeys));
export type UpdateStreamsResponse = CamelCaseKeys<v.InferOutput<typeof UpdateStreamsResponseSchemaRaw>>;

// PowerCurve schema (raw)
const PowerCurveSchemaRaw = v.looseObject({
  id: v.nullish(v.string()),
  after_kj: v.nullish(v.number()),
  filters: v.nullish(v.array(v.any())),
  label: v.nullish(v.string()),
  filter_label: v.nullish(v.string()),
  percentile: v.nullish(v.number()),
  start_date_local: v.nullish(v.string()),
  end_date_local: v.nullish(v.string()),
  days: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),
  training_load: v.nullish(v.number()),
  weight: v.nullish(v.number()),
  secs: v.nullish(v.array(v.number())),
  values: v.nullish(v.array(v.number())),
  submax_values: v.nullish(v.array(v.array(v.number()))),
  submax_activity_id: v.nullish(v.array(v.array(v.string()))),
  start_index: v.nullish(v.array(v.number())),
  end_index: v.nullish(v.array(v.number())),
  activity_id: v.nullish(v.array(v.string())),
  watts_per_kg: v.nullish(v.array(v.number())),
  wkg_activity_id: v.nullish(v.array(v.string())),
  submax_watts_per_kg: v.nullish(v.array(v.array(v.number()))),
  submax_wkg_activity_id: v.nullish(v.array(v.array(v.string()))),
  powerModels: v.nullish(v.array(v.any())),
  ranks: v.nullish(v.any()),
  mapPlot: v.nullish(v.any()),
  stream_type: v.nullish(v.string()),
  stream_name: v.nullish(v.string()),
  watts: v.nullish(v.array(v.number())),
  vo2max_5m: v.nullish(v.number()),
  compound_score_5m: v.nullish(v.number()),
});

export const PowerCurveSchema = v.pipe(PowerCurveSchemaRaw, v.transform(transformKeys));
export type PowerCurve = CamelCaseKeys<v.InferOutput<typeof PowerCurveSchemaRaw>>;

// PaceCurve schema (raw)
const PaceCurveSchemaRaw = v.looseObject({
  id: v.nullish(v.string()),
  filters: v.nullish(v.array(v.any())),
  label: v.nullish(v.string()),
  filter_label: v.nullish(v.string()),
  percentile: v.nullish(v.number()),
  start_date_local: v.nullish(v.string()),
  end_date_local: v.nullish(v.string()),
  days: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),
  training_load: v.nullish(v.number()),
  weight: v.nullish(v.number()),
  distance: v.nullish(v.array(v.number())),
  values: v.nullish(v.array(v.number())),
  submax_values: v.nullish(v.array(v.array(v.number()))),
  submax_activity_id: v.nullish(v.array(v.array(v.string()))),
  start_index: v.nullish(v.array(v.number())),
  end_index: v.nullish(v.array(v.number())),
  activity_id: v.nullish(v.array(v.string())),
  type: v.nullish(v.picklist(["POWER", "HR", "PACE", "GAP"])),
  paceModels: v.nullish(v.array(v.any())),
});

export const PaceCurveSchema = v.pipe(PaceCurveSchemaRaw, v.transform(transformKeys));
export type PaceCurve = CamelCaseKeys<v.InferOutput<typeof PaceCurveSchemaRaw>>;

// HRCurve schema (raw)
const HRCurveSchemaRaw = v.looseObject({
  id: v.nullish(v.string()),
  filters: v.nullish(v.array(v.any())),
  label: v.nullish(v.string()),
  filter_label: v.nullish(v.string()),
  percentile: v.nullish(v.number()),
  start_date_local: v.nullish(v.string()),
  end_date_local: v.nullish(v.string()),
  days: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),
  training_load: v.nullish(v.number()),
  weight: v.nullish(v.number()),
  secs: v.nullish(v.array(v.number())),
  values: v.nullish(v.array(v.number())),
  submax_values: v.nullish(v.array(v.array(v.number()))),
  submax_activity_id: v.nullish(v.array(v.array(v.string()))),
  start_index: v.nullish(v.array(v.number())),
  end_index: v.nullish(v.array(v.number())),
  activity_id: v.nullish(v.array(v.string())),
});

export const HRCurveSchema = v.pipe(HRCurveSchemaRaw, v.transform(transformKeys));
export type HRCurve = CamelCaseKeys<v.InferOutput<typeof HRCurveSchemaRaw>>;

// Decoder functions (internal use)
export function decodeActivities(data: unknown): Activities {
  return v.parse(ActivitiesSchema, data);
}

export function decodeActivity(data: unknown): Activity {
  return v.parse(ActivitySchema, data);
}

export function decodeIntervalsResponse(data: unknown): IntervalsResponse {
  return v.parse(IntervalsResponseSchema, data);
}

export function decodeActivityId(data: unknown): ActivityId {
  return v.parse(ActivityIdSchema, data);
}

export function decodeActivityStreams(data: unknown): ActivityStreams {
  return v.parse(ActivityStreamsSchema, data);
}

export function decodeUpdateStreamsResponse(data: unknown): UpdateStreamsResponse {
  return v.parse(UpdateStreamsResponseSchema, data);
}

export function decodePowerCurve(data: unknown): PowerCurve {
  return v.parse(PowerCurveSchema, data);
}

export function decodePaceCurve(data: unknown): PaceCurve {
  return v.parse(PaceCurveSchema, data);
}

export function decodeHRCurve(data: unknown): HRCurve {
  return v.parse(HRCurveSchema, data);
}
