import type { Activity, ActivityStreams, UpdateStreamsResponse } from '../../schemas/activity';

/**
 * Realistic activity fixture representing a cycling workout with power data.
 * Based on actual Intervals.icu API responses.
 */
export const cyclingWorkoutActivity: Activity = {
  id: 123456,
  athleteId: 1001,
  name: 'Morning Threshold Intervals',
  description: '5x5min @ FTP with 3min recovery',
  type: 'Ride',
  startDateLocal: '2024-01-15T08:30:00',
  startDate: '2024-01-15T13:30:00Z',
  created: '2024-01-15T14:45:00Z',
  timezone: 'America/New_York',

  // Basic metrics
  distance: 42500, // meters
  movingTime: 5400, // seconds (90 min)
  elapsedTime: 5550,
  totalElevationGain: 450,
  calories: 1250,

  // Training load & intensity
  icuTrainingLoad: 185,
  icuIntensity: 0.92,
  icuJoules: 925000,
  icuEfficiencyFactor: 1.15,
  trimp: 245,

  // Heart rate metrics
  averageHeartrate: 158,
  maxHeartrate: 182,
  lthr: 165,
  icuHrZones: [0.05, 0.15, 0.25, 0.35, 0.15, 0.05],
  icuHrZoneTimes: [270, 810, 1350, 1890, 810, 270],

  // Power metrics
  averageWatts: 235,
  weightedAverageWatts: 252,
  maxWatts: 485,
  pMax: 1125,
  icuPowerZones: [0.02, 0.08, 0.18, 0.32, 0.28, 0.10, 0.02],
  icuRollingFtp: 265,
  icuRollingCp: 275,
  icuPowerHr: 1.59,

  // Speed & pace metrics
  averageSpeed: 7.87, // m/s
  maxSpeed: 14.2,
  thresholdPace: 420, // seconds per km
  gap: 8.1,

  // Cadence
  averageCadence: 88,
  maxCadence: 115,

  // Subjective metrics
  feel: 7,
  perceivedExertion: 8,
  sessionRpe: 8,
  icuRpe: 7.5,

  // Activity metadata
  trainer: false,
  commute: false,
  race: false,
  analyzed: '2024-01-15T14:45:00Z', // date-time string per OpenAPI spec
  source: 'GARMIN',
  externalId: 'garmin-activity-987654321',
  stravaId: 11223344556,

  // Device & equipment
  deviceName: 'Garmin Edge 1040',
  powerMeter: 'Quarq DZero',
  powerMeterBattery: '85%', // string per OpenAPI spec
  deviceWatts: true,
  gear: { id: 'b123456', name: 'Canyon Aeroad CF SLX', distance: 12500.5, primary: true }, // StravaGear object per OpenAPI spec

  // Advanced metrics
  decoupling: 2.3,
  icuVariabilityIndex: 1.08,
  compliance: 95,
  icuWPrime: 18500,
  icuMaxWbalDepletion: 15200,

  // Altitude & environment
  averageAltitude: 245,
  maxAltitude: 380,
  minAltitude: 180,

  // Weather data
  averageWeatherTemp: 18,
  averageTemp: 17.5,
  maxTemp: 19,
  minTemp: 16,
  averageWindSpeed: 3.2,
  prevailingWindDeg: 225,
  hasWeather: true,

  // Intervals & segments
  icuIntervalsEdited: true,
  icuLapCount: 5,
  hasSegments: true,
  routeId: 789,

  // Time breakdowns
  icuWarmupTime: 900,
  icuCooldownTime: 600,
  coastingTime: 120,
};

/**
 * Simple running activity fixture without power data.
 */
export const runningActivity: Activity = {
  id: 234567,
  athleteId: 1001,
  name: 'Easy Recovery Run',
  type: 'Run',
  startDateLocal: '2024-01-16T06:00:00',
  startDate: '2024-01-16T11:00:00Z',
  created: '2024-01-16T11:35:00Z',
  timezone: 'America/New_York',

  distance: 8000,
  movingTime: 2400, // 40 minutes
  elapsedTime: 2460,
  totalElevationGain: 85,
  calories: 485,

  icuTrainingLoad: 45,
  icuIntensity: 0.65,
  trimp: 78,

  averageHeartrate: 138,
  maxHeartrate: 152,
  lthr: 165,

  averageSpeed: 3.33, // m/s (5:00/km pace)
  maxSpeed: 4.2,
  thresholdPace: 240,
  gap: 3.45,

  averageCadence: 172,
  maxCadence: 185,

  feel: 6,
  perceivedExertion: 4,
  sessionRpe: 3,

  trainer: false,
  commute: false,
  race: false,
  analyzed: '2024-01-16T11:35:00Z',
  source: 'GARMIN',

  deviceName: 'Garmin Forerunner 965',
  gear: { id: 's789012', name: 'Nike Vaporfly 3', distance: 450000, primary: true },

  hasWeather: true,
  averageWeatherTemp: 12,
};

/**
 * Indoor trainer activity fixture.
 */
export const trainerActivity: Activity = {
  id: 345678,
  athleteId: 1001,
  name: 'Zwift - Watopia Figure 8',
  type: 'VirtualRide',
  startDateLocal: '2024-01-17T18:00:00',
  startDate: '2024-01-17T23:00:00Z',
  created: '2024-01-17T23:50:00Z',
  timezone: 'America/New_York',

  distance: 35000,
  movingTime: 3600,
  elapsedTime: 3600,
  totalElevationGain: 520,
  calories: 975,

  icuTrainingLoad: 125,
  icuIntensity: 0.85,
  icuJoules: 685000,

  averageHeartrate: 152,
  maxHeartrate: 175,

  averageWatts: 215,
  weightedAverageWatts: 228,
  maxWatts: 425,
  icuRollingFtp: 265,

  averageSpeed: 9.72,
  maxSpeed: 15.8,

  averageCadence: 92,
  maxCadence: 125,

  feel: 7,
  perceivedExertion: 7,

  trainer: true,
  commute: false,
  race: false,
  analyzed: '2024-01-17T23:50:00Z',
  source: 'ZWIFT',
  externalId: 'zwift-12345',

  deviceName: 'Wahoo KICKR V6',
  powerMeter: 'Wahoo KICKR V6',
  deviceWatts: true,

  icuVariabilityIndex: 1.06,
};

/**
 * Activity streams fixture with sample power, heartrate, and cadence data.
 */
export const activityStreams: ActivityStreams = [
  {
    type: 'watts',
    name: 'Power',
    data: {
      '0': 210,
      '1': 215,
      '2': 220,
      '3': 225,
      '4': 230,
      '5': 235,
      '10': 240,
      '20': 245,
    },
    valueTypeIsArray: false,
    custom: false,
    allNull: false,
  },
  {
    type: 'heartrate',
    name: 'Heart Rate',
    data: {
      '0': 145,
      '1': 148,
      '2': 152,
      '3': 155,
      '4': 158,
      '5': 160,
      '10': 162,
      '20': 165,
    },
    valueTypeIsArray: false,
    custom: false,
    allNull: false,
  },
  {
    type: 'cadence',
    name: 'Cadence',
    data: {
      '0': 85,
      '1': 87,
      '2': 88,
      '3': 89,
      '4': 90,
      '5': 90,
      '10': 91,
      '20': 92,
    },
    valueTypeIsArray: false,
    custom: false,
    allNull: false,
  },
];

/**
 * Update streams response fixture showing updated and deleted streams.
 */
export const updateStreamsResponse: UpdateStreamsResponse = {
  updated: ['watts', 'heartrate', 'cadence'],
  deleted: ['old_stream'],
};

export const activityFixtures = {
  cyclingWorkout: cyclingWorkoutActivity,
  running: runningActivity,
  trainer: trainerActivity,
  streams: activityStreams,
  updateResponse: updateStreamsResponse,
};
