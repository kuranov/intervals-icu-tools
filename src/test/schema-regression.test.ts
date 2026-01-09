import { describe, expect, test } from 'vitest';
import { decodeActivities, decodeActivity } from '../schemas/activity';
import { decodeEvents, decodeEvent } from '../schemas/event';
import { decodeAthlete, decodeWithSportSettings, decodeAthleteProfile, decodeAthleteSummary } from '../schemas/athlete';
import {
  activityFixtures,
  eventFixtures,
  athleteFixtures,
} from './fixtures';

describe('Schema Regression Tests', () => {
  describe('Activity Schema', () => {
    test('parses cycling workout fixture', () => {
      expect(() => decodeActivity(activityFixtures.cyclingWorkout)).not.toThrow();
      const result = decodeActivity(activityFixtures.cyclingWorkout);
      expect(result.id).toBe(123456);
      expect(result.name).toBe('Morning Threshold Intervals');
      expect(result.icu_training_load).toBe(185);
      expect(result.icu_power_zones).toBeDefined();
    });

    test('parses running activity fixture', () => {
      expect(() => decodeActivity(activityFixtures.running)).not.toThrow();
      const result = decodeActivity(activityFixtures.running);
      expect(result.id).toBe(234567);
      expect(result.type).toBe('Run');
      expect(result.average_speed).toBe(3.33);
    });

    test('parses trainer activity fixture', () => {
      expect(() => decodeActivity(activityFixtures.trainer)).not.toThrow();
      const result = decodeActivity(activityFixtures.trainer);
      expect(result.id).toBe(345678);
      expect(result.trainer).toBe(true);
      expect(result.source).toBe('ZWIFT');
    });

    test('parses array of activities', () => {
      const activities = [
        activityFixtures.cyclingWorkout,
        activityFixtures.running,
        activityFixtures.trainer,
      ];
      expect(() => decodeActivities(activities)).not.toThrow();
      const result = decodeActivities(activities);
      expect(result).toHaveLength(3);
    });

    test('validates required id field', () => {
      const invalidActivity = { ...activityFixtures.cyclingWorkout };
      delete (invalidActivity as any).id;
      expect(() => decodeActivity(invalidActivity)).toThrow();
    });
  });

  describe('Event Schema', () => {
    test('parses planned workout fixture', () => {
      expect(() => decodeEvent(eventFixtures.plannedWorkout)).not.toThrow();
      const result = decodeEvent(eventFixtures.plannedWorkout);
      expect(result.id).toBe(789012);
      expect(result.category).toBe('WORKOUT');
      expect(result.icu_training_load).toBe(120);
      expect(result.icu_ftp).toBe(265);
    });

    test('parses note event fixture', () => {
      expect(() => decodeEvent(eventFixtures.note)).not.toThrow();
      const result = decodeEvent(eventFixtures.note);
      expect(result.id).toBe(890123);
      expect(result.category).toBe('NOTE');
      expect(result.show_as_note).toBe(true);
    });

    test('parses race event fixture', () => {
      expect(() => decodeEvent(eventFixtures.race)).not.toThrow();
      const result = decodeEvent(eventFixtures.race);
      expect(result.id).toBe(901234);
      expect(result.workout_type).toBe('Race');
      expect(result.icu_intensity).toBe(1.05);
    });

    test('parses zwift workout with file data', () => {
      expect(() => decodeEvent(eventFixtures.zwiftWorkout)).not.toThrow();
      const result = decodeEvent(eventFixtures.zwiftWorkout);
      expect(result.id).toBe(912345);
      expect(result.indoor).toBe(true);
      expect(result.workout_filename).toBe('vo2max-intervals.zwo');
    });

    test('parses array of events', () => {
      const events = [
        eventFixtures.plannedWorkout,
        eventFixtures.note,
        eventFixtures.race,
      ];
      expect(() => decodeEvents(events)).not.toThrow();
      const result = decodeEvents(events);
      expect(result).toHaveLength(3);
    });
  });

  describe('Athlete Schema', () => {
    test('parses basic athlete fixture', () => {
      expect(() => decodeAthlete(athleteFixtures.basic)).not.toThrow();
      const result = decodeAthlete(athleteFixtures.basic);
      expect(result.id).toBe(1001);
      expect(result.name).toBe('John Cyclist');
      expect(result.weight).toBe(72);
      expect(result.icu_resting_hr).toBe(45);
    });

    test('parses athlete with sport settings', () => {
      expect(() => decodeWithSportSettings(athleteFixtures.withSettings)).not.toThrow();
      const result = decodeWithSportSettings(athleteFixtures.withSettings);
      expect(result.id).toBe(1001);
      expect(result.sportSettings).toBeDefined();
      expect(result.custom_items).toBeDefined();
    });

    test('parses athlete profile fixture', () => {
      expect(() => decodeAthleteProfile(athleteFixtures.profile)).not.toThrow();
      const result = decodeAthleteProfile(athleteFixtures.profile);
      expect(result.athlete_id).toBe(1001);
      expect(result.ftp).toBe(265);
      expect(result.threshold_pace).toBe(240);
      expect(result.w_prime).toBe(20000);
    });

    test('parses athlete summary fixture', () => {
      expect(() => decodeAthleteSummary([athleteFixtures.summary])).not.toThrow();
      const result = decodeAthleteSummary([athleteFixtures.summary]);
      expect(result).toHaveLength(1);
      expect(result[0]?.ctl).toBe(95);
      expect(result[0]?.atl).toBe(102);
      expect(result[0]?.tsb).toBe(-7);
    });

    test('parses coach athlete fixture', () => {
      expect(() => decodeAthlete(athleteFixtures.coach)).not.toThrow();
      const result = decodeAthlete(athleteFixtures.coach);
      expect(result.id).toBe(2001);
      expect(result.icu_coach).toBe(true);
      expect(result.icu_permission).toBe('COACH');
    });
  });

  describe('Schema Backwards Compatibility', () => {
    test('handles minimal activity data', () => {
      const minimalActivity = {
        id: 99999,
        name: 'Minimal Activity',
        type: 'Run',
        start_date_local: '2024-01-15T10:00:00',
      };
      expect(() => decodeActivity(minimalActivity)).not.toThrow();
      const result = decodeActivity(minimalActivity);
      expect(result.id).toBe(99999);
      expect(result.icu_training_load).toBeUndefined();
    });

    test('handles minimal event data', () => {
      const minimalEvent = {
        id: 99999,
        category: 'NOTE',
        start_date_local: '2024-01-20',
        name: 'Test Note',
      };
      expect(() => decodeEvent(minimalEvent)).not.toThrow();
      const result = decodeEvent(minimalEvent);
      expect(result.id).toBe(99999);
    });

    test('handles minimal athlete data', () => {
      const minimalAthlete = {
        id: 99999,
        name: 'Test Athlete',
      };
      expect(() => decodeAthlete(minimalAthlete)).not.toThrow();
      const result = decodeAthlete(minimalAthlete);
      expect(result.id).toBe(99999);
    });
  });

  describe('Schema allows extra fields (looseObject)', () => {
    test('activity schema ignores unknown fields', () => {
      const activityWithExtra = {
        ...activityFixtures.cyclingWorkout,
        unknown_field_123: 'test',
        future_api_field: 42,
      };
      expect(() => decodeActivity(activityWithExtra)).not.toThrow();
      const result = decodeActivity(activityWithExtra);
      expect(result.id).toBe(123456);
    });

    test('event schema ignores unknown fields', () => {
      const eventWithExtra = {
        ...eventFixtures.plannedWorkout,
        unknown_field_456: 'test',
      };
      expect(() => decodeEvent(eventWithExtra)).not.toThrow();
    });

    test('athlete schema ignores unknown fields', () => {
      const athleteWithExtra = {
        ...athleteFixtures.basic,
        unknown_field_789: 'test',
      };
      expect(() => decodeAthlete(athleteWithExtra)).not.toThrow();
    });
  });
});
