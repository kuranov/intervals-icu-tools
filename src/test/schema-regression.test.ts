import { describe, expect, test } from 'vitest';
import { decodeActivities, decodeActivity } from '../schemas/activity';
import { decodeEvents, decodeEvent } from '../schemas/event';
import { decodeAthlete, decodeWithSportSettings, decodeAthleteProfile, decodeAthleteSummary } from '../schemas/athlete';
import {
  activityFixtures,
  eventFixtures,
  athleteFixtures,
} from './fixtures';
import { transformKeysToSnake } from '../utils/transform';

describe('Schema Regression Tests', () => {
  describe('Activity Schema', () => {
    test('parses cycling workout fixture', () => {
      const rawFixture = transformKeysToSnake(activityFixtures.cyclingWorkout);
      expect(() => decodeActivity(rawFixture)).not.toThrow();
      const result = decodeActivity(rawFixture);
      expect(result.id).toBe(123456);
      expect(result.name).toBe('Morning Threshold Intervals');
      expect(result.icuTrainingLoad).toBe(185);
      expect(result.icuPowerZones).toBeDefined();
    });

    test('parses running activity fixture', () => {
      const rawFixture = transformKeysToSnake(activityFixtures.running);
      expect(() => decodeActivity(rawFixture)).not.toThrow();
      const result = decodeActivity(rawFixture);
      expect(result.id).toBe(234567);
      expect(result.type).toBe('Run');
      expect(result.averageSpeed).toBe(3.33);
    });

    test('parses trainer activity fixture', () => {
      const rawFixture = transformKeysToSnake(activityFixtures.trainer);
      expect(() => decodeActivity(rawFixture)).not.toThrow();
      const result = decodeActivity(rawFixture);
      expect(result.id).toBe(345678);
      expect(result.trainer).toBe(true);
      expect(result.source).toBe('ZWIFT');
    });

    test('parses array of activities', () => {
      const activities = [
        transformKeysToSnake(activityFixtures.cyclingWorkout),
        transformKeysToSnake(activityFixtures.running),
        transformKeysToSnake(activityFixtures.trainer),
      ];
      expect(() => decodeActivities(activities)).not.toThrow();
      const result = decodeActivities(activities);
      expect(result).toHaveLength(3);
    });

    test('validates required id field', () => {
      const rawFixture = transformKeysToSnake(activityFixtures.cyclingWorkout);
      const invalidActivity = { ...rawFixture };
      delete (invalidActivity as any).id;
      expect(() => decodeActivity(invalidActivity)).toThrow();
    });
  });

  describe('Event Schema', () => {
    test('parses planned workout fixture', () => {
      const rawFixture = transformKeysToSnake(eventFixtures.plannedWorkout);
      expect(() => decodeEvent(rawFixture)).not.toThrow();
      const result = decodeEvent(rawFixture);
      expect(result.id).toBe(789012);
      expect(result.category).toBe('WORKOUT');
      expect(result.icuTrainingLoad).toBe(120);
      expect(result.icuFtp).toBe(265);
    });

    test('parses note event fixture', () => {
      const rawFixture = transformKeysToSnake(eventFixtures.note);
      expect(() => decodeEvent(rawFixture)).not.toThrow();
      const result = decodeEvent(rawFixture);
      expect(result.id).toBe(890123);
      expect(result.category).toBe('NOTE');
      expect(result.showAsNote).toBe(true);
    });

    test('parses race event fixture', () => {
      const rawFixture = transformKeysToSnake(eventFixtures.race);
      expect(() => decodeEvent(rawFixture)).not.toThrow();
      const result = decodeEvent(rawFixture);
      expect(result.id).toBe(901234);
      expect(result.workoutType).toBe('Race');
      expect(result.icuIntensity).toBe(1.05);
    });

    test('parses zwift workout with file data', () => {
      const rawFixture = transformKeysToSnake(eventFixtures.zwiftWorkout);
      expect(() => decodeEvent(rawFixture)).not.toThrow();
      const result = decodeEvent(rawFixture);
      expect(result.id).toBe(912345);
      expect(result.indoor).toBe(true);
      expect(result.workoutFilename).toBe('vo2max-intervals.zwo');
    });

    test('parses array of events', () => {
      const events = [
        transformKeysToSnake(eventFixtures.plannedWorkout),
        transformKeysToSnake(eventFixtures.note),
        transformKeysToSnake(eventFixtures.race),
      ];
      expect(() => decodeEvents(events)).not.toThrow();
      const result = decodeEvents(events);
      expect(result).toHaveLength(3);
    });
  });

  describe('Athlete Schema', () => {
    test('parses basic athlete fixture', () => {
      const rawFixture = transformKeysToSnake(athleteFixtures.basic);
      expect(() => decodeAthlete(rawFixture)).not.toThrow();
      const result = decodeAthlete(rawFixture);
      expect(result.id).toBe(1001);
      expect(result.name).toBe('John Cyclist');
      expect(result.weight).toBe(72);
      expect(result.icuRestingHr).toBe(45);
    });

    test('parses athlete with sport settings', () => {
      const rawFixture = transformKeysToSnake(athleteFixtures.withSettings);
      expect(() => decodeWithSportSettings(rawFixture)).not.toThrow();
      const result = decodeWithSportSettings(rawFixture);
      expect(result.id).toBe(1001);
      expect(result.sportSettings).toBeDefined();
      expect(result.customItems).toBeDefined();
    });

    test('parses athlete profile fixture', () => {
      const rawFixture = transformKeysToSnake(athleteFixtures.profile);
      expect(() => decodeAthleteProfile(rawFixture)).not.toThrow();
      const result = decodeAthleteProfile(rawFixture);
      expect(result.athleteId).toBe(1001);
      expect(result.ftp).toBe(265);
      expect(result.thresholdPace).toBe(240);
      expect(result.wPrime).toBe(20000);
    });

    test('parses athlete summary fixture', () => {
      const rawFixtures = transformKeysToSnake([athleteFixtures.summary]);
      expect(() => decodeAthleteSummary(rawFixtures)).not.toThrow();
      const result = decodeAthleteSummary(rawFixtures);
      expect(result).toHaveLength(1);
      expect(result[0]?.ctl).toBe(95);
      expect(result[0]?.atl).toBe(102);
      expect(result[0]?.tsb).toBe(-7);
    });

    test('parses coach athlete fixture', () => {
      const rawFixture = transformKeysToSnake(athleteFixtures.coach);
      expect(() => decodeAthlete(rawFixture)).not.toThrow();
      const result = decodeAthlete(rawFixture);
      expect(result.id).toBe(2001);
      expect(result.icuCoach).toBe(true);
      expect(result.icuPermission).toBe('COACH');
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
      expect(result.icuTrainingLoad).toBeUndefined();
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
        ...transformKeysToSnake(activityFixtures.cyclingWorkout),
        unknown_field_123: 'test',
        future_api_field: 42,
      };
      expect(() => decodeActivity(activityWithExtra)).not.toThrow();
      const result = decodeActivity(activityWithExtra);
      expect(result.id).toBe(123456);
    });

    test('event schema ignores unknown fields', () => {
      const eventWithExtra = {
        ...transformKeysToSnake(eventFixtures.plannedWorkout),
        unknown_field_456: 'test',
      };
      expect(() => decodeEvent(eventWithExtra)).not.toThrow();
    });

    test('athlete schema ignores unknown fields', () => {
      const athleteWithExtra = {
        ...transformKeysToSnake(athleteFixtures.basic),
        unknown_field_789: 'test',
      };
      expect(() => decodeAthlete(athleteWithExtra)).not.toThrow();
    });
  });
});
