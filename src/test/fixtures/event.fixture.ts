import type { Event } from '../../schemas/event';

/**
 * Realistic event fixture representing a planned workout.
 * Based on actual Intervals.icu API responses.
 */
export const plannedWorkoutEvent: Event = {
  id: 789012,
  athleteId: 1001,
  category: 'WORKOUT',
  startDateLocal: '2024-01-20T08:00:00',
  endDateLocal: '2024-01-20T09:30:00',
  name: 'Sweet Spot Intervals',
  description: '3x15min @ 88-93% FTP\n\nWarmup 15min\nWork: 3x (15min @ 240W, 5min easy)\nCooldown 10min',
  type: 'Ride',
  workoutType: 'Intervals',

  // Basic metrics
  load: 120,
  distance: 45000,
  duration: 5400,
  movingTime: 5250,

  // Training load & intensity
  icuTrainingLoad: 120,
  icuIntensity: 0.88,
  loadTarget: 120,
  timeTarget: 5400,
  distanceTarget: 45000,

  // Energy & power
  joules: 750000,
  joulesAboveFtp: 125000,

  // Fitness model integration
  icuCtl: 95,
  icuAtl: 102,
  ctlDays: 42,
  atlDays: 7,
  strainScore: 118,
  showOnCtlLine: true,

  // Power & performance targets
  ssCp: 265,
  ssPMax: 1050,
  ssWPrime: 19500,
  pMax: 1100,
  wPrime: 20000,
  icuFtp: 265,

  // Nutrition & hydration
  carbsPerHour: 60,
  carbsUsed: 90,

  // Metadata
  tags: ['sweet-spot', 'base', 'structured'],
  uid: 'workout-2024-01-20-sweet-spot',
  calendarId: 1,
  color: '#FF6B35',
  planApplied: '2024-01-01T00:00:00Z',
  created: '2024-01-15T10:00:00Z',
  updated: '2024-01-16T14:30:00Z',

  // Permissions & visibility
  hideFromAthlete: false,
  athleteCannotEdit: false,
  showAsNote: false,
  notOnFitnessChart: false,
  structureReadOnly: false,

  // Cross-references & planning
  planAthleteId: 1001,
  planFolderId: 42,
  planWorkoutId: 156,

  // UI/Presentation
  entered: false,
  indoor: false,
  forWeek: false, // boolean per OpenAPI spec

  // Advanced attributes
  target: '265', // string per OpenAPI spec
};

/**
 * Simple note event fixture.
 */
export const noteEvent: Event = {
  id: 890123,
  athleteId: 1001,
  category: 'NOTE',
  startDateLocal: '2024-01-21T00:00:00',
  name: 'Rest Day',
  description: 'Focus on recovery. Light stretching and foam rolling.',
  tags: ['recovery', 'rest'],
  color: '#4ECDC4',
  created: '2024-01-20T20:00:00Z',
  showAsNote: true,
  notOnFitnessChart: true,
  entered: true,
};

/**
 * Race event fixture.
 */
export const raceEvent: Event = {
  id: 901234,
  athleteId: 1001,
  category: 'WORKOUT',
  startDateLocal: '2024-02-10T09:00:00',
  endDateLocal: '2024-02-10T13:30:00',
  name: 'Spring Classic Century',
  description: '100-mile road race',
  type: 'Ride',
  workoutType: 'Race',

  load: 350,
  distance: 160000,
  duration: 16200,
  movingTime: 15800,

  icuTrainingLoad: 350,
  icuIntensity: 1.05,

  tags: ['race', 'century', 'goal'],
  color: '#FF0000',
  created: '2024-01-01T00:00:00Z',

  hideFromAthlete: false,
  athleteCannotEdit: true,
  showAsNote: false,
  notOnFitnessChart: false,

  entered: true,
  indoor: false,
  forWeek: true, // boolean per OpenAPI spec
};

/**
 * Zwift workout event with file conversion data.
 */
export const zwiftWorkoutEvent: Event = {
  id: 912345,
  athleteId: 1001,
  category: 'WORKOUT',
  startDateLocal: '2024-01-22T18:00:00',
  name: 'Zwift - VO2 Max Intervals',
  description: '4x4min @ 120% FTP',
  type: 'VirtualRide',
  workoutType: 'Intervals',

  load: 95,
  duration: 3600,

  icuTrainingLoad: 95,
  icuIntensity: 1.15,
  icuFtp: 265,

  tags: ['zwift', 'vo2max', 'indoor'],
  color: '#FF7F00',
  created: '2024-01-18T12:00:00Z',

  indoor: true,
  entered: false,

  workoutFilename: 'vo2max-intervals.zwo',
  workoutFileBase64: 'PHdvcmtvdXRfZmlsZT4uLi48L3dvcmtvdXRfZmlsZT4=',
};

export const eventFixtures = {
  plannedWorkout: plannedWorkoutEvent,
  note: noteEvent,
  race: raceEvent,
  zwiftWorkout: zwiftWorkoutEvent,
};
