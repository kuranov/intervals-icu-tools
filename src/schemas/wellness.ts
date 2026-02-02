import * as v from "valibot";
import { transformKeys, type CamelCaseKeys } from "../utils/transform";

/**
 * Menstrual phase enum
 */
export const MenstrualPhaseSchema = v.nullish(
  v.picklist(["PERIOD", "FOLLICULAR", "OVULATING", "LUTEAL", "NONE"])
);

/**
 * SportInfo for per-sport fitness data (raw)
 */
const SportInfoSchemaRaw = v.looseObject({
  type: v.nullish(v.string()),
  eftp: v.nullish(v.number()),
  wPrime: v.nullish(v.number()),
  pMax: v.nullish(v.number()),
});

export const SportInfoSchema = v.pipe(SportInfoSchemaRaw, v.transform(transformKeys));
export type SportInfo = CamelCaseKeys<v.InferOutput<typeof SportInfoSchemaRaw>>;

/**
 * Wellness record schema (raw)
 * Uses looseObject to allow extra fields from the API
 */
const WellnessSchemaRaw = v.looseObject({
  id: v.string(), // ISO-8601 date (e.g., "2024-01-15")

  // Fitness metrics
  ctl: v.nullish(v.number()),
  atl: v.nullish(v.number()),
  rampRate: v.nullish(v.number()),
  ctlLoad: v.nullish(v.number()),
  atlLoad: v.nullish(v.number()),
  sportInfo: v.nullish(v.array(SportInfoSchema)),
  updated: v.nullish(v.string()), // ISO-8601 timestamp

  // Body metrics
  weight: v.nullish(v.number()),
  bodyFat: v.nullish(v.number()),
  abdomen: v.nullish(v.number()),

  // Heart metrics
  restingHR: v.nullish(v.number()),
  hrv: v.nullish(v.number()),
  hrvSDNN: v.nullish(v.number()),
  avgSleepingHR: v.nullish(v.number()),

  // Menstrual tracking
  menstrualPhase: MenstrualPhaseSchema,
  menstrualPhasePredicted: MenstrualPhaseSchema,

  // Nutrition
  kcalConsumed: v.nullish(v.number()),
  hydration: v.nullish(v.number()),
  hydrationVolume: v.nullish(v.number()),

  // Sleep
  sleepSecs: v.nullish(v.number()),
  sleepScore: v.nullish(v.number()),
  sleepQuality: v.nullish(v.number()),

  // Subjective metrics (typically 1-10 scale)
  soreness: v.nullish(v.number()),
  fatigue: v.nullish(v.number()),
  stress: v.nullish(v.number()),
  mood: v.nullish(v.number()),
  motivation: v.nullish(v.number()),
  injury: v.nullish(v.number()),
  readiness: v.nullish(v.number()),

  // Other health metrics
  spO2: v.nullish(v.number()),
  systolic: v.nullish(v.number()),
  diastolic: v.nullish(v.number()),
  baevskySI: v.nullish(v.number()),
  bloodGlucose: v.nullish(v.number()),
  lactate: v.nullish(v.number()),
  vo2max: v.nullish(v.number()),
  respiration: v.nullish(v.number()),
  steps: v.nullish(v.number()),

  // Notes
  comments: v.nullish(v.string()),

  // Flags
  locked: v.nullish(v.boolean()),
  tempWeight: v.nullish(v.boolean()),
});

export const WellnessSchema = v.pipe(WellnessSchemaRaw, v.transform(transformKeys));
export type Wellness = CamelCaseKeys<v.InferOutput<typeof WellnessSchemaRaw>>;

/**
 * Array of wellness records
 */
export const WellnessListSchema = v.array(WellnessSchema);
export type WellnessList = Wellness[];

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
