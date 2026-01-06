import * as v from "valibot";

// Base Athlete schema
export const AthleteSchema = v.looseObject({
  id: v.optional(v.union([v.string(), v.number()])),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  avatar_url: v.optional(v.string()),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  ext_athlete_id: v.optional(v.union([v.string(), v.number()])),
  gender: v.optional(v.string()),
  weight: v.optional(v.number()),
  date_of_birth: v.optional(v.string()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  timezone: v.optional(v.string()),
  created: v.optional(v.string()),
  updated: v.optional(v.string()),
});

export type Athlete = v.InferOutput<typeof AthleteSchema>;

// AthleteUpdateDTO schema
export const AthleteUpdateDTOSchema = v.looseObject({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  avatar_url: v.optional(v.string()),
  gender: v.optional(v.string()),
  weight: v.optional(v.number()),
  date_of_birth: v.optional(v.string()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  timezone: v.optional(v.string()),
});

export type AthleteUpdateDTO = v.InferOutput<typeof AthleteUpdateDTOSchema>;

// WithSportSettings schema (athlete with sport settings)
export const WithSportSettingsSchema = v.looseObject({
  id: v.optional(v.union([v.string(), v.number()])),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  avatar_url: v.optional(v.string()),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  ext_athlete_id: v.optional(v.union([v.string(), v.number()])),
  gender: v.optional(v.string()),
  weight: v.optional(v.number()),
  date_of_birth: v.optional(v.string()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  timezone: v.optional(v.string()),
  created: v.optional(v.string()),
  updated: v.optional(v.string()),
  sportSettings: v.optional(v.any()),
  custom_items: v.optional(v.any()),
});

export type WithSportSettings = v.InferOutput<typeof WithSportSettingsSchema>;

// AthleteSettings schema (dynamic key-value for device settings)
export const AthleteSettingsSchema = v.looseObject({});

export type AthleteSettings = v.InferOutput<typeof AthleteSettingsSchema>;

// AthleteProfile schema
export const AthleteProfileSchema = v.looseObject({
  id: v.optional(v.union([v.string(), v.number()])),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  name: v.optional(v.string()),
  avatar_url: v.optional(v.string()),
  weight: v.optional(v.number()),
  max_heartrate: v.optional(v.number()),
  resting_heartrate: v.optional(v.number()),
  lthr: v.optional(v.number()),
  threshold_power: v.optional(v.number()),
  ftp: v.optional(v.number()),
  critical_power: v.optional(v.number()),
  w_prime: v.optional(v.number()),
  threshold_pace: v.optional(v.number()),
  critical_swim_pace: v.optional(v.number()),
  d_prime: v.optional(v.number()),
});

export type AthleteProfile = v.InferOutput<typeof AthleteProfileSchema>;

// SummaryWithCats schema (summary for followed athletes)
export const SummaryWithCatsSchema = v.looseObject({
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  athlete_name: v.optional(v.string()),
  start_date_local: v.optional(v.string()),
  ctl: v.optional(v.number()),
  atl: v.optional(v.number()),
  tsb: v.optional(v.number()),
  load: v.optional(v.number()),
  training_volume: v.optional(v.number()),
  avg_watts: v.optional(v.number()),
  avg_hr: v.optional(v.number()),
  avg_pace: v.optional(v.number()),
  calories: v.optional(v.number()),
  activities: v.optional(v.number()),
  moving_time: v.optional(v.number()),
  elapsed_time: v.optional(v.number()),
  categories: v.optional(v.any()),
});

export type SummaryWithCats = v.InferOutput<typeof SummaryWithCatsSchema>;

export const AthleteSummarySchema = v.array(SummaryWithCatsSchema);
export type AthleteSummary = v.InferOutput<typeof AthleteSummarySchema>;

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
