import * as v from "valibot";
import { transformKeys, type CamelCaseKeys } from "../utils/transform";

// Base Athlete schema (raw snake_case from API)
const AthleteSchemaRaw = v.looseObject({
  // Required fields (API always returns these)
  id: v.union([v.string(), v.number()]),

  // Optional fields
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  ext_athlete_id: v.nullish(v.union([v.string(), v.number()])),

  // Profile information
  name: v.nullish(v.string()),
  firstname: v.nullish(v.string()),
  lastname: v.nullish(v.string()),
  email: v.nullish(v.string()),
  avatar_url: v.nullish(v.string()),
  profile_medium: v.nullish(v.string()),
  bio: v.nullish(v.string()),
  website: v.nullish(v.string()),
  visibility: v.nullish(v.string()),

  // Physical metrics
  gender: v.nullish(v.string()),
  sex: v.nullish(v.string()),
  weight: v.nullish(v.number()),
  height: v.nullish(v.number()),
  height_units: v.nullish(v.string()),
  weight_pref_lb: v.nullish(v.boolean()),
  date_of_birth: v.nullish(v.string()),
  icu_date_of_birth: v.nullish(v.string()),
  icu_resting_hr: v.nullish(v.number()),

  // Location & settings
  city: v.nullish(v.string()),
  state: v.nullish(v.string()),
  country: v.nullish(v.string()),
  timezone: v.nullish(v.string()),
  locale: v.nullish(v.string()),
  measurement_preference: v.nullish(v.string()),
  fahrenheit: v.nullish(v.boolean()),

  // Account & permissions
  icu_permission: v.nullish(v.string()),
  icu_activated: v.nullish(v.string()), // date-time string
  icu_admin: v.nullish(v.boolean()),
  icu_coach: v.nullish(v.boolean()),
  icu_email_verified: v.nullish(v.boolean()),
  has_password: v.nullish(v.boolean()),
  status: v.nullish(v.string()),
  status_updated: v.nullish(v.string()),

  // Training plan information
  plan: v.nullish(v.string()),
  plan_expires: v.nullish(v.string()),
  training_plan_id: v.nullish(v.union([v.string(), v.number()])),
  training_plan_start_date: v.nullish(v.string()),

  // Timestamps
  created: v.nullish(v.string()),
  updated: v.nullish(v.string()),
  icu_last_seen: v.nullish(v.string()),

  // Trial & pricing
  trial_end_date: v.nullish(v.string()),
  beta_user: v.nullish(v.boolean()),

  // Preferences
  currency: v.nullish(v.string()),
  icu_wellness_keys: v.nullish(v.array(v.string())),
});

export const AthleteSchema = v.pipe(AthleteSchemaRaw, v.transform(transformKeys));
export type Athlete = CamelCaseKeys<v.InferOutput<typeof AthleteSchemaRaw>>;

// AthleteUpdateDTO schema (raw)
const AthleteUpdateDTOSchemaRaw = v.looseObject({
  name: v.nullish(v.string()),
  email: v.nullish(v.string()),
  avatar_url: v.nullish(v.string()),
  gender: v.nullish(v.string()),
  weight: v.nullish(v.number()),
  date_of_birth: v.nullish(v.string()),
  city: v.nullish(v.string()),
  country: v.nullish(v.string()),
  timezone: v.nullish(v.string()),
});

export const AthleteUpdateDTOSchema = v.pipe(AthleteUpdateDTOSchemaRaw, v.transform(transformKeys));
export type AthleteUpdateDTO = CamelCaseKeys<v.InferOutput<typeof AthleteUpdateDTOSchemaRaw>>;

// WithSportSettings schema (athlete with sport settings, raw)
const WithSportSettingsSchemaRaw = v.looseObject({
  id: v.nullish(v.union([v.string(), v.number()])),
  name: v.nullish(v.string()),
  email: v.nullish(v.string()),
  avatar_url: v.nullish(v.string()),
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  ext_athlete_id: v.nullish(v.union([v.string(), v.number()])),
  gender: v.nullish(v.string()),
  weight: v.nullish(v.number()),
  date_of_birth: v.nullish(v.string()),
  city: v.nullish(v.string()),
  country: v.nullish(v.string()),
  timezone: v.nullish(v.string()),
  created: v.nullish(v.string()),
  updated: v.nullish(v.string()),
  sportSettings: v.nullish(v.any()),
  custom_items: v.nullish(v.any()),
});

export const WithSportSettingsSchema = v.pipe(WithSportSettingsSchemaRaw, v.transform(transformKeys));
export type WithSportSettings = CamelCaseKeys<v.InferOutput<typeof WithSportSettingsSchemaRaw>>;

// AthleteSettings schema (dynamic key-value for device settings, raw)
const AthleteSettingsSchemaRaw = v.looseObject({});

export const AthleteSettingsSchema = v.pipe(AthleteSettingsSchemaRaw, v.transform(transformKeys));
export type AthleteSettings = CamelCaseKeys<v.InferOutput<typeof AthleteSettingsSchemaRaw>>;

// AthleteProfile schema (raw)
const AthleteProfileSchemaRaw = v.looseObject({
  id: v.nullish(v.union([v.string(), v.number()])),
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  name: v.nullish(v.string()),
  avatar_url: v.nullish(v.string()),
  weight: v.nullish(v.number()),
  max_heartrate: v.nullish(v.number()),
  resting_heartrate: v.nullish(v.number()),
  lthr: v.nullish(v.number()),
  threshold_power: v.nullish(v.number()),
  ftp: v.nullish(v.number()),
  critical_power: v.nullish(v.number()),
  w_prime: v.nullish(v.number()),
  threshold_pace: v.nullish(v.number()),
  critical_swim_pace: v.nullish(v.number()),
  d_prime: v.nullish(v.number()),
});

export const AthleteProfileSchema = v.pipe(AthleteProfileSchemaRaw, v.transform(transformKeys));
export type AthleteProfile = CamelCaseKeys<v.InferOutput<typeof AthleteProfileSchemaRaw>>;

// SummaryWithCats schema (summary for followed athletes, raw)
const SummaryWithCatsSchemaRaw = v.looseObject({
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  athlete_name: v.nullish(v.string()),
  start_date_local: v.nullish(v.string()),
  ctl: v.nullish(v.number()),
  atl: v.nullish(v.number()),
  tsb: v.nullish(v.number()),
  load: v.nullish(v.number()),
  training_volume: v.nullish(v.number()),
  avg_watts: v.nullish(v.number()),
  avg_hr: v.nullish(v.number()),
  avg_pace: v.nullish(v.number()),
  calories: v.nullish(v.number()),
  activities: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),
  elapsed_time: v.nullish(v.number()),
  categories: v.nullish(v.any()),
});

export const SummaryWithCatsSchema = v.pipe(SummaryWithCatsSchemaRaw, v.transform(transformKeys));
export type SummaryWithCats = CamelCaseKeys<v.InferOutput<typeof SummaryWithCatsSchemaRaw>>;

export const AthleteSummarySchema = v.array(SummaryWithCatsSchema);
export type AthleteSummary = SummaryWithCats[];

// Decoder functions (internal use)
export function decodeAthlete(data: unknown): Athlete {
  return v.parse(AthleteSchema, data);
}

export function decodeWithSportSettings(data: unknown): WithSportSettings {
  return v.parse(WithSportSettingsSchema, data);
}

export function decodeAthleteSettings(data: unknown): AthleteSettings {
  return v.parse(AthleteSettingsSchema, data);
}

export function decodeAthleteProfile(data: unknown): AthleteProfile {
  return v.parse(AthleteProfileSchema, data);
}

export function decodeAthleteSummary(data: unknown): AthleteSummary {
  return v.parse(AthleteSummarySchema, data);
}
