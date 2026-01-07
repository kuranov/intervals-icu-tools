import type { Event } from '../../schemas/event';

/**
 * Realistic event fixture representing a planned workout.
 * Based on actual Intervals.icu API responses.
 */
export const plannedWorkoutEvent: Event = {
  id: 789012,
  athlete_id: 1001,
  category: 'WORKOUT',
  start_date_local: '2024-01-20T08:00:00',
  end_date_local: '2024-01-20T09:30:00',
  name: 'Sweet Spot Intervals',
  description: '3x15min @ 88-93% FTP\n\nWarmup 15min\nWork: 3x (15min @ 240W, 5min easy)\nCooldown 10min',
  type: 'Ride',
  workout_type: 'Intervals',

  // Basic metrics
  load: 120,
  distance: 45000,
  duration: 5400,
  moving_time: 5250,

  // Training load & intensity
  icu_training_load: 120,
  icu_intensity: 0.88,
  load_target: 120,
  time_target: 5400,
  distance_target: 45000,

  // Energy & power
  joules: 750000,
  joules_above_ftp: 125000,

  // Fitness model integration
  icu_ctl: 95,
  icu_atl: 102,
  ctl_days: 42,
  atl_days: 7,
  strain_score: 118,
  show_on_ctl_line: true,

  // Power & performance targets
  ss_cp: 265,
  ss_p_max: 1050,
  ss_w_prime: 19500,
  p_max: 1100,
  w_prime: 20000,
  icu_ftp: 265,

  // Nutrition & hydration
  carbs_per_hour: 60,
  carbs_used: 90,

  // Metadata
  tags: ['sweet-spot', 'base', 'structured'],
  uid: 'workout-2024-01-20-sweet-spot',
  calendar_id: 1,
  color: '#FF6B35',
  plan_applied: '2024-01-01T00:00:00Z',
  created: '2024-01-15T10:00:00Z',
  updated: '2024-01-16T14:30:00Z',

  // Permissions & visibility
  hide_from_athlete: false,
  athlete_cannot_edit: false,
  show_as_note: false,
  not_on_fitness_chart: false,
  structure_read_only: false,

  // Cross-references & planning
  plan_athlete_id: 1001,
  plan_folder_id: 42,
  plan_workout_id: 156,

  // UI/Presentation
  entered: false,
  indoor: false,
  for_week: '2024-W03',

  // Advanced attributes
  target: 265,
};

/**
 * Simple note event fixture.
 */
export const noteEvent: Event = {
  id: 890123,
  athlete_id: 1001,
  category: 'NOTE',
  start_date_local: '2024-01-21T00:00:00',
  name: 'Rest Day',
  description: 'Focus on recovery. Light stretching and foam rolling.',
  tags: ['recovery', 'rest'],
  color: '#4ECDC4',
  created: '2024-01-20T20:00:00Z',
  show_as_note: true,
  not_on_fitness_chart: true,
  entered: true,
};

/**
 * Race event fixture.
 */
export const raceEvent: Event = {
  id: 901234,
  athlete_id: 1001,
  category: 'WORKOUT',
  start_date_local: '2024-02-10T09:00:00',
  end_date_local: '2024-02-10T13:30:00',
  name: 'Spring Classic Century',
  description: '100-mile road race',
  type: 'Ride',
  workout_type: 'Race',

  load: 350,
  distance: 160000,
  duration: 16200,
  moving_time: 15800,

  icu_training_load: 350,
  icu_intensity: 1.05,

  tags: ['race', 'century', 'goal'],
  color: '#FF0000',
  created: '2024-01-01T00:00:00Z',

  hide_from_athlete: false,
  athlete_cannot_edit: true,
  show_as_note: false,
  not_on_fitness_chart: false,

  entered: true,
  indoor: false,
  for_week: '2024-W06',
};

/**
 * Zwift workout event with file conversion data.
 */
export const zwiftWorkoutEvent: Event = {
  id: 912345,
  athlete_id: 1001,
  category: 'WORKOUT',
  start_date_local: '2024-01-22T18:00:00',
  name: 'Zwift - VO2 Max Intervals',
  description: '4x4min @ 120% FTP',
  type: 'VirtualRide',
  workout_type: 'Intervals',

  load: 95,
  duration: 3600,

  icu_training_load: 95,
  icu_intensity: 1.15,
  icu_ftp: 265,

  tags: ['zwift', 'vo2max', 'indoor'],
  color: '#FF7F00',
  created: '2024-01-18T12:00:00Z',

  indoor: true,
  entered: false,

  workout_filename: 'vo2max-intervals.zwo',
  workout_file_base64: 'PHdvcmtvdXRfZmlsZT4uLi48L3dvcmtvdXRfZmlsZT4=',
};

export const eventFixtures = {
  plannedWorkout: plannedWorkoutEvent,
  note: noteEvent,
  race: raceEvent,
  zwiftWorkout: zwiftWorkoutEvent,
};
