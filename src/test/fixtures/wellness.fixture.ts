import type { Wellness } from '../../schemas/wellness';

/**
 * Realistic wellness fixture representing a typical daily record.
 * Based on actual Intervals.icu API responses.
 */
export const basicWellness: Wellness = {
  id: '2024-01-15',

  // Fitness metrics
  ctl: 85.5,
  atl: 42.3,
  rampRate: 5.2,
  ctlLoad: 120.5,
  atlLoad: 65.3,
  updated: '2024-01-15T08:30:00Z',

  // Body metrics
  weight: 70.5,
  bodyFat: 12.5,

  // Heart metrics
  restingHR: 55,
  hrv: 65.3,
  hrvSDNN: 72.1,
  avgSleepingHR: 48.5,

  // Sleep
  sleepSecs: 28800, // 8 hours
  sleepScore: 85,
  sleepQuality: 8,

  // Subjective metrics (1-10 scale)
  soreness: 3,
  fatigue: 2,
  stress: 4,
  mood: 8,
  motivation: 7,
  injury: 0,
  readiness: 85,

  // Nutrition
  kcalConsumed: 2500,
  hydration: 8,
  hydrationVolume: 3.5,

  // Other health metrics
  spO2: 98.5,
  systolic: 120,
  diastolic: 80,
  steps: 8500,

  // Notes
  comments: 'Feeling strong today. Good recovery from yesterday.',
  locked: false,
};

/**
 * Minimal wellness record with only weight
 */
export const minimalWellness: Wellness = {
  id: '2024-01-16',
  weight: 70.3,
};

/**
 * Wellness record with menstrual tracking
 */
export const wellnessWithMenstrualPhase: Wellness = {
  id: '2024-01-17',
  weight: 70.0,
  restingHR: 54,
  menstrualPhase: 'FOLLICULAR',
  menstrualPhasePredicted: 'FOLLICULAR',
  comments: 'Feeling energetic',
};

/**
 * Wellness record with advanced metrics
 */
export const wellnessWithAdvancedMetrics: Wellness = {
  id: '2024-01-18',
  weight: 70.2,
  restingHR: 56,
  hrv: 63.5,
  baevskySI: 75.2,
  bloodGlucose: 95.5,
  lactate: 2.1,
  vo2max: 58.5,
  respiration: 14.5,
  abdomen: 82.5,
};

/**
 * Array of wellness records for testing list endpoints
 */
export const wellnessArray: Wellness[] = [
  basicWellness,
  minimalWellness,
  wellnessWithMenstrualPhase,
  wellnessWithAdvancedMetrics,
];
