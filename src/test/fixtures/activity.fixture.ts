import type { Activity } from '../../schemas/activity';

/**
 * Realistic activity fixture representing a cycling workout with power data.
 * Based on actual Intervals.icu API responses.
 */
export const cyclingWorkoutActivity: Activity = {
  id: 123456,
  athlete_id: 1001,
  name: 'Morning Threshold Intervals',
  description: '5x5min @ FTP with 3min recovery',
  type: 'Ride',
  start_date_local: '2024-01-15T08:30:00',
  start_date: '2024-01-15T13:30:00Z',
  created: '2024-01-15T14:45:00Z',
  timezone: 'America/New_York',

  // Basic metrics
  distance: 42500, // meters
  moving_time: 5400, // seconds (90 min)
  elapsed_time: 5550,
  total_elevation_gain: 450,
  calories: 1250,

  // Training load & intensity
  icu_training_load: 185,
  icu_intensity: 0.92,
  icu_joules: 925000,
  icu_efficiency_factor: 1.15,
  trimp: 245,

  // Heart rate metrics
  average_heartrate: 158,
  max_heartrate: 182,
  lthr: 165,
  icu_hr_zones: [0.05, 0.15, 0.25, 0.35, 0.15, 0.05],
  icu_hr_zone_times: [270, 810, 1350, 1890, 810, 270],

  // Power metrics
  average_watts: 235,
  weighted_average_watts: 252,
  max_watts: 485,
  p_max: 1125,
  icu_power_zones: [0.02, 0.08, 0.18, 0.32, 0.28, 0.10, 0.02],
  icu_rolling_ftp: 265,
  icu_rolling_cp: 275,
  icu_power_hr: 1.59,

  // Speed & pace metrics
  average_speed: 7.87, // m/s
  max_speed: 14.2,
  threshold_pace: 420, // seconds per km
  gap: 8.1,

  // Cadence
  average_cadence: 88,
  max_cadence: 115,

  // Subjective metrics
  feel: 7,
  perceived_exertion: 8,
  session_rpe: 8,
  icu_rpe: 7.5,

  // Activity metadata
  trainer: false,
  commute: false,
  race: false,
  analyzed: true,
  source: 'GARMIN',
  external_id: 'garmin-activity-987654321',
  strava_id: 11223344556,

  // Device & equipment
  device_name: 'Garmin Edge 1040',
  power_meter: 'Quarq DZero',
  power_meter_battery: 85,
  device_watts: true,
  gear: 'Canyon Aeroad CF SLX',

  // Advanced metrics
  decoupling: 2.3,
  icu_variability_index: 1.08,
  compliance: 95,
  icu_w_prime: 18500,
  icu_max_wbal_depletion: 15200,

  // Altitude & environment
  average_altitude: 245,
  max_altitude: 380,
  min_altitude: 180,

  // Weather data
  average_weather_temp: 18,
  average_temp: 17.5,
  max_temp: 19,
  min_temp: 16,
  average_wind_speed: 3.2,
  prevailing_wind_deg: 225,
  has_weather: true,

  // Intervals & segments
  icu_intervals_edited: true,
  icu_lap_count: 5,
  has_segments: true,
  route_id: 789,

  // Time breakdowns
  icu_warmup_time: 900,
  icu_cooldown_time: 600,
  coasting_time: 120,
};

/**
 * Simple running activity fixture without power data.
 */
export const runningActivity: Activity = {
  id: 234567,
  athlete_id: 1001,
  name: 'Easy Recovery Run',
  type: 'Run',
  start_date_local: '2024-01-16T06:00:00',
  start_date: '2024-01-16T11:00:00Z',
  created: '2024-01-16T11:35:00Z',
  timezone: 'America/New_York',

  distance: 8000,
  moving_time: 2400, // 40 minutes
  elapsed_time: 2460,
  total_elevation_gain: 85,
  calories: 485,

  icu_training_load: 45,
  icu_intensity: 0.65,
  trimp: 78,

  average_heartrate: 138,
  max_heartrate: 152,
  lthr: 165,

  average_speed: 3.33, // m/s (5:00/km pace)
  max_speed: 4.2,
  threshold_pace: 240,
  gap: 3.45,

  average_cadence: 172,
  max_cadence: 185,

  feel: 6,
  perceived_exertion: 4,
  session_rpe: 3,

  trainer: false,
  commute: false,
  race: false,
  analyzed: true,
  source: 'GARMIN',

  device_name: 'Garmin Forerunner 965',
  gear: 'Nike Vaporfly 3',

  has_weather: true,
  average_weather_temp: 12,
};

/**
 * Indoor trainer activity fixture.
 */
export const trainerActivity: Activity = {
  id: 345678,
  athlete_id: 1001,
  name: 'Zwift - Watopia Figure 8',
  type: 'VirtualRide',
  start_date_local: '2024-01-17T18:00:00',
  start_date: '2024-01-17T23:00:00Z',
  created: '2024-01-17T23:50:00Z',
  timezone: 'America/New_York',

  distance: 35000,
  moving_time: 3600,
  elapsed_time: 3600,
  total_elevation_gain: 520,
  calories: 975,

  icu_training_load: 125,
  icu_intensity: 0.85,
  icu_joules: 685000,

  average_heartrate: 152,
  max_heartrate: 175,

  average_watts: 215,
  weighted_average_watts: 228,
  max_watts: 425,
  icu_rolling_ftp: 265,

  average_speed: 9.72,
  max_speed: 15.8,

  average_cadence: 92,
  max_cadence: 125,

  feel: 7,
  perceived_exertion: 7,

  trainer: true,
  commute: false,
  race: false,
  analyzed: true,
  source: 'ZWIFT',
  external_id: 'zwift-12345',

  device_name: 'Wahoo KICKR V6',
  power_meter: 'Wahoo KICKR V6',
  device_watts: true,

  icu_variability_index: 1.06,
};

export const activityFixtures = {
  cyclingWorkout: cyclingWorkoutActivity,
  running: runningActivity,
  trainer: trainerActivity,
};
