import type { Workout, Folder } from '../../schemas/library';

/**
 * Basic cycling workout
 */
export const basicWorkout: Workout = {
  id: 1,
  name: '5x5min @ FTP',
  description: '5 x 5min @ FTP, 3min recovery between intervals',
  folder_id: 10,
  activity_type: 'Ride',
  tags: ['intervals', 'ftp', 'cycling'],
};

/**
 * Running workout
 */
export const runningWorkout: Workout = {
  id: 2,
  name: 'Tempo Run',
  description: '10min warmup, 20min @ threshold, 10min cooldown',
  folder_id: 11,
  activity_type: 'Run',
  tags: ['threshold', 'running'],
};

/**
 * Swimming workout
 */
export const swimmingWorkout: Workout = {
  id: 3,
  name: 'Endurance Swim',
  description: '3000m continuous at aerobic pace',
  folder_id: 12,
  activity_type: 'Swim',
  tags: ['endurance', 'swimming'],
};

/**
 * Workout with file contents (structured workout)
 */
export const structuredWorkout: Workout = {
  id: 4,
  name: 'Sweet Spot Intervals',
  description: '4 x 10min @ 88-94% FTP',
  folder_id: 10,
  activity_type: 'Ride',
  tags: ['sweet-spot', 'cycling'],
  file_contents: '<workout_tc><name>Sweet Spot Intervals</name>...</workout_tc>',
};

/**
 * Basic folder
 */
export const basicFolder: Folder = {
  id: 10,
  type: 'FOLDER',
  name: 'Cycling Workouts',
  description: 'My collection of cycling workouts',
  visibility: 'PRIVATE',
  children: [basicWorkout, structuredWorkout],
};

/**
 * Training plan folder
 */
export const trainingPlan: Folder = {
  id: 20,
  type: 'PLAN',
  name: 'Base Building Plan',
  description: '12-week aerobic base building plan',
  visibility: 'PUBLIC',
  start_date_local: '2024-01-01',
  rollout_weeks: 12,
  auto_rollout_day: 1, // Monday
  read_only_workouts: true,
  starting_ctl: 50,
  starting_atl: 40,
  activity_types: ['Ride', 'Run'],
  children: [
    {
      id: 100,
      name: 'Week 1 - Easy Ride',
      description: '60min Z2',
      activity_type: 'Ride',
    },
    {
      id: 101,
      name: 'Week 1 - Recovery Run',
      description: '30min easy',
      activity_type: 'Run',
    },
  ],
};

/**
 * Running-focused folder
 */
export const runningFolder: Folder = {
  id: 11,
  type: 'FOLDER',
  name: 'Running Workouts',
  description: 'Marathon training workouts',
  visibility: 'PRIVATE',
  children: [runningWorkout],
};

/**
 * Array of workouts for testing
 */
export const workoutArray: Workout[] = [
  basicWorkout,
  runningWorkout,
  swimmingWorkout,
  structuredWorkout,
];

/**
 * Array of folders for testing
 */
export const folderArray: Folder[] = [
  basicFolder,
  runningFolder,
  trainingPlan,
];

/**
 * Workout tags array
 */
export const workoutTags: string[] = [
  'intervals',
  'ftp',
  'threshold',
  'sweet-spot',
  'endurance',
  'recovery',
  'cycling',
  'running',
  'swimming',
];
