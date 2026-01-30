import type { Athlete, WithSportSettings, AthleteProfile, SummaryWithCats } from '../../schemas/athlete';

/**
 * Realistic athlete fixture representing a typical user.
 * Based on actual Intervals.icu API responses.
 */
export const basicAthlete: Athlete = {
  id: 1001,
  athleteId: 1001,
  extAthleteId: 'ext-athlete-12345',

  // Profile information
  name: 'John Cyclist',
  firstname: 'John',
  lastname: 'Cyclist',
  email: 'john.cyclist@example.com',
  avatarUrl: 'https://example.com/avatars/john.jpg',
  profileMedium: 'https://example.com/avatars/john-medium.jpg',
  bio: 'Cyclist and triathlete training for my first Ironman',
  website: 'https://johncyclist.com',
  visibility: 'PUBLIC',

  // Physical metrics
  gender: 'M',
  sex: 'M',
  weight: 72,
  height: 180,
  heightUnits: 'cm',
  weightPrefLb: false,
  dateOfBirth: '1985-05-15',
  icuDateOfBirth: '1985-05-15',
  icuRestingHr: 45,

  // Location & settings
  city: 'Boulder',
  state: 'CO',
  country: 'USA',
  timezone: 'America/Denver',
  locale: 'en',
  measurementPreference: 'METRIC',
  fahrenheit: false,

  // Account & permissions
  icuPermission: 'USER',
  icuActivated: '2022-06-15T10:30:00Z', // date-time string per OpenAPI spec
  icuAdmin: false,
  icuCoach: false,
  icuEmailVerified: true,
  hasPassword: true,
  status: 'ACTIVE',
  statusUpdated: '2024-01-01T00:00:00Z',

  // Training plan information
  plan: 'Base Building 12-Week',
  planExpires: '2024-04-15',
  trainingPlanId: 567,
  trainingPlanStartDate: '2024-01-08',

  // Timestamps
  created: '2022-06-15T10:30:00Z',
  updated: '2024-01-15T14:22:00Z',
  icuLastSeen: '2024-01-18T08:45:00Z',

  // Trial & pricing
  trialEndDate: '2022-07-15',
  betaUser: false,

  // Preferences
  currency: 'USD',
  icuWellnessKeys: ['weight', 'sleep', 'hrv', 'rhr'],
};

/**
 * Athlete with sport settings fixture.
 */
export const athleteWithSettings: WithSportSettings = {
  ...basicAthlete,
  sportSettings: {
    bike: {
      ftp: 265,
      cp: 275,
      wPrime: 20000,
      maxHr: 190,
      lthr: 165,
      restingHr: 45,
      cyclingWeight: 72,
    },
    run: {
      thresholdPace: 240, // seconds per km (4:00/km)
      criticalSwimPace: 95, // seconds per 100m
      dPrime: 200,
      maxHr: 190,
      lthr: 165,
    },
  },
  customItems: {
    preferredSport: 'cycling',
    coachName: 'Jane Coach',
    goals: '2024 Ironman Boulder',
  },
};

/**
 * Athlete profile fixture with performance metrics.
 */
export const athleteProfile: AthleteProfile = {
  id: 1001,
  athleteId: 1001,
  name: 'John Cyclist',
  avatarUrl: 'https://example.com/avatars/john.jpg',
  weight: 72,
  maxHeartrate: 190,
  restingHeartrate: 45,
  lthr: 165,
  thresholdPower: 265,
  ftp: 265,
  criticalPower: 275,
  wPrime: 20000,
  thresholdPace: 240,
  criticalSwimPace: 95,
  dPrime: 200,
};

/**
 * Athlete summary fixture with training metrics.
 */
export const athleteSummary: SummaryWithCats = {
  athleteId: 1001,
  athleteName: 'John Cyclist',
  startDateLocal: '2024-01-15',
  ctl: 95,
  atl: 102,
  tsb: -7,
  load: 450,
  trainingVolume: 12.5, // hours
  avgWatts: 235,
  avgHr: 152,
  avgPace: 255, // seconds per km
  calories: 5250,
  activities: 6,
  movingTime: 45000, // seconds
  elapsedTime: 46800,
  categories: {
    Ride: {
      count: 4,
      load: 380,
      movingTime: 32400,
    },
    Run: {
      count: 2,
      load: 70,
      movingTime: 10800,
    },
  },
};

/**
 * Coach athlete fixture with elevated permissions.
 */
export const coachAthlete: Athlete = {
  ...basicAthlete,
  id: 2001,
  athleteId: 2001,
  name: 'Jane Coach',
  firstname: 'Jane',
  lastname: 'Coach',
  email: 'jane.coach@example.com',
  icuPermission: 'COACH',
  icuCoach: true,
  status: 'ACTIVE',
};

export const athleteFixtures = {
  basic: basicAthlete,
  withSettings: athleteWithSettings,
  profile: athleteProfile,
  summary: athleteSummary,
  coach: coachAthlete,
};
