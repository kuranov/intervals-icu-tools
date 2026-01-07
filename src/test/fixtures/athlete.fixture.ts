import type { Athlete, WithSportSettings, AthleteProfile, SummaryWithCats } from '../../schemas/athlete';

/**
 * Realistic athlete fixture representing a typical user.
 * Based on actual Intervals.icu API responses.
 */
export const basicAthlete: Athlete = {
  id: 1001,
  athlete_id: 1001,
  ext_athlete_id: 'ext-athlete-12345',

  // Profile information
  name: 'John Cyclist',
  firstname: 'John',
  lastname: 'Cyclist',
  email: 'john.cyclist@example.com',
  avatar_url: 'https://example.com/avatars/john.jpg',
  profile_medium: 'https://example.com/avatars/john-medium.jpg',
  bio: 'Cyclist and triathlete training for my first Ironman',
  website: 'https://johncyclist.com',
  visibility: 'PUBLIC',

  // Physical metrics
  gender: 'M',
  sex: 'M',
  weight: 72,
  height: 180,
  height_units: 'cm',
  weight_pref_lb: false,
  date_of_birth: '1985-05-15',
  icu_date_of_birth: '1985-05-15',
  icu_resting_hr: 45,

  // Location & settings
  city: 'Boulder',
  state: 'CO',
  country: 'USA',
  timezone: 'America/Denver',
  locale: 'en',
  measurement_preference: 'METRIC',
  fahrenheit: false,

  // Account & permissions
  icu_permission: 'USER',
  icu_activated: true,
  icu_admin: false,
  icu_coach: false,
  icu_email_verified: true,
  has_password: true,
  status: 'ACTIVE',
  status_updated: '2024-01-01T00:00:00Z',

  // Training plan information
  plan: 'Base Building 12-Week',
  plan_expires: '2024-04-15',
  training_plan_id: 567,
  training_plan_start_date: '2024-01-08',

  // Timestamps
  created: '2022-06-15T10:30:00Z',
  updated: '2024-01-15T14:22:00Z',
  icu_last_seen: '2024-01-18T08:45:00Z',

  // Trial & pricing
  trial_end_date: '2022-07-15',
  beta_user: false,

  // Preferences
  currency: 'USD',
  icu_wellness_keys: ['weight', 'sleep', 'hrv', 'rhr'],
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
      w_prime: 20000,
      max_hr: 190,
      lthr: 165,
      resting_hr: 45,
      cycling_weight: 72,
    },
    run: {
      threshold_pace: 240, // seconds per km (4:00/km)
      critical_swim_pace: 95, // seconds per 100m
      d_prime: 200,
      max_hr: 190,
      lthr: 165,
    },
  },
  custom_items: {
    preferred_sport: 'cycling',
    coach_name: 'Jane Coach',
    goals: '2024 Ironman Boulder',
  },
};

/**
 * Athlete profile fixture with performance metrics.
 */
export const athleteProfile: AthleteProfile = {
  id: 1001,
  athlete_id: 1001,
  name: 'John Cyclist',
  avatar_url: 'https://example.com/avatars/john.jpg',
  weight: 72,
  max_heartrate: 190,
  resting_heartrate: 45,
  lthr: 165,
  threshold_power: 265,
  ftp: 265,
  critical_power: 275,
  w_prime: 20000,
  threshold_pace: 240,
  critical_swim_pace: 95,
  d_prime: 200,
};

/**
 * Athlete summary fixture with training metrics.
 */
export const athleteSummary: SummaryWithCats = {
  athlete_id: 1001,
  athlete_name: 'John Cyclist',
  start_date_local: '2024-01-15',
  ctl: 95,
  atl: 102,
  tsb: -7,
  load: 450,
  training_volume: 12.5, // hours
  avg_watts: 235,
  avg_hr: 152,
  avg_pace: 255, // seconds per km
  calories: 5250,
  activities: 6,
  moving_time: 45000, // seconds
  elapsed_time: 46800,
  categories: {
    Ride: {
      count: 4,
      load: 380,
      moving_time: 32400,
    },
    Run: {
      count: 2,
      load: 70,
      moving_time: 10800,
    },
  },
};

/**
 * Coach athlete fixture with elevated permissions.
 */
export const coachAthlete: Athlete = {
  ...basicAthlete,
  id: 2001,
  athlete_id: 2001,
  name: 'Jane Coach',
  firstname: 'Jane',
  lastname: 'Coach',
  email: 'jane.coach@example.com',
  icu_permission: 'COACH',
  icu_coach: true,
  status: 'ACTIVE',
};

export const athleteFixtures = {
  basic: basicAthlete,
  withSettings: athleteWithSettings,
  profile: athleteProfile,
  summary: athleteSummary,
  coach: coachAthlete,
};
