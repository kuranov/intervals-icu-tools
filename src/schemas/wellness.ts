import * as v from "valibot";

/**
 * Menstrual phase enum
 */
export const MenstrualPhaseSchema = v.optional(
  v.picklist(["PERIOD", "FOLLICULAR", "OVULATING", "LUTEAL", "NONE"])
);

/**
 * SportInfo for per-sport fitness data
 */
export const SportInfoSchema = v.looseObject({
  type: v.optional(v.string()),
  eftp: v.optional(v.number()),
  wPrime: v.optional(v.number()),
  pMax: v.optional(v.number()),
});

export type SportInfo = v.InferOutput<typeof SportInfoSchema>;

/**
 * Wellness record schema
 * Uses looseObject to allow extra fields from the API
 */
export const WellnessSchema = v.looseObject({
  id: v.string(), // ISO-8601 date (e.g., "2024-01-15")

  // Fitness metrics
  ctl: v.optional(v.number()),
  atl: v.optional(v.number()),
  rampRate: v.optional(v.number()),
  ctlLoad: v.optional(v.number()),
  atlLoad: v.optional(v.number()),
  sportInfo: v.optional(v.array(SportInfoSchema)),
  updated: v.optional(v.string()), // ISO-8601 timestamp

  // Body metrics
  weight: v.optional(v.number()),
  bodyFat: v.optional(v.number()),
  abdomen: v.optional(v.number()),

  // Heart metrics
  restingHR: v.optional(v.number()),
  hrv: v.optional(v.number()),
  hrvSDNN: v.optional(v.number()),
  avgSleepingHR: v.optional(v.number()),

  // Menstrual tracking
  menstrualPhase: MenstrualPhaseSchema,
  menstrualPhasePredicted: MenstrualPhaseSchema,

  // Nutrition
  kcalConsumed: v.optional(v.number()),
  hydration: v.optional(v.number()),
  hydrationVolume: v.optional(v.number()),

  // Sleep
  sleepSecs: v.optional(v.number()),
  sleepScore: v.optional(v.number()),
  sleepQuality: v.optional(v.number()),

  // Subjective metrics (typically 1-10 scale)
  soreness: v.optional(v.number()),
  fatigue: v.optional(v.number()),
  stress: v.optional(v.number()),
  mood: v.optional(v.number()),
  motivation: v.optional(v.number()),
  injury: v.optional(v.number()),
  readiness: v.optional(v.number()),

  // Other health metrics
  spO2: v.optional(v.number()),
  systolic: v.optional(v.number()),
  diastolic: v.optional(v.number()),
  baevskySI: v.optional(v.number()),
  bloodGlucose: v.optional(v.number()),
  lactate: v.optional(v.number()),
  vo2max: v.optional(v.number()),
  respiration: v.optional(v.number()),
  steps: v.optional(v.number()),

  // Notes
  comments: v.optional(v.string()),

  // Flags
  locked: v.optional(v.boolean()),
  tempWeight: v.optional(v.boolean()),
});

export type Wellness = v.InferOutput<typeof WellnessSchema>;

/**
 * Array of wellness records
 */
export const WellnessListSchema = v.array(WellnessSchema);
export type WellnessList = v.InferOutput<typeof WellnessListSchema>;

/**
 * Decode a single wellness record
 */
export function decodeWellness(data: unknown): Wellness {
  return v.parse(WellnessSchema, data);
}

/**
 * Decode an array of wellness records
 */
export function decodeWellnessList(data: unknown): WellnessList {
  return v.parse(WellnessListSchema, data);
}
