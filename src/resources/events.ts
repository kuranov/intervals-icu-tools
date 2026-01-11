import type { ApiError } from "../errors";
import type { Result } from "../result";

import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeEvents,
  decodeEvent,
  decodeDeleteEventsResponse,
  decodeEventTags,
  type Events,
  type Event,
  type EventEx,
  type DoomedEvent,
  type DeleteEventsResponse,
  type EventTags,
  type ApplyPlanDTO,
  type DuplicateEventsDTO,
} from "../schemas/event";
import { transformKeysToSnake } from "../utils/transform";
import { decodeActivity, type Activity } from "../schemas/activity";

export type ListEventsOptions = {
  /** Local date (ISO-8601) for oldest event to return */
  oldest?: string;
  /** Local date (ISO-8601) for newest event to return inclusive */
  newest?: string;
  /** Comma-separated list of categories to filter (e.g., WORKOUT, NOTES) */
  category?: string[];
  /** Max number of events to return */
  limit?: number;
  /** Calendar ID filter */
  calendar_id?: number;
  /** Convert workouts to format (zwo, mrc, erg, or fit) */
  ext?: string;
  /** Percentage for converting fixed power targets into range (default: 2.5) */
  powerRange?: number;
  /** Percentage for converting fixed HR targets into range (default: 1.5) */
  hrRange?: number;
  /** Percentage for converting fixed pace targets into range (default: 2.5) */
  paceRange?: number;
  /** Locale (en, es, de, etc.) for workouts with multilingual steps */
  locale?: string;
  /** Resolve power, heart rate, and pace targets to watts, bpm, and m/s */
  resolve?: boolean;
};

export type CreateEventOptions = {
  /** Update event with matching uid instead of creating a new one */
  upsertOnUid?: boolean;
};

export type DeleteEventOptions = {
  /** If true then other events added at the same time are also deleted */
  others?: boolean;
  /** Do not delete other events on the calendar before this local date */
  notBefore?: string;
};

export type CreateMultipleEventsOptions = {
  /** Update events with matching external_id and created by the same OAuth application */
  upsert?: boolean;
  /** Update events with matching uid instead of creating new ones */
  upsertOnUid?: boolean;
  /** Give all events created or updated the same new plan_applied date (now) */
  updatePlanApplied?: boolean;
};

export type UpdateEventsOptions = {
  /** Local date (ISO-8601) of oldest event to update */
  oldest: string;
  /** Local date (ISO-8601) of newest event to update (inclusive) */
  newest: string;
};

export class EventsResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * List events (planned workouts, notes etc.) on the athlete's calendar.
   */
  list(
    athleteId: string | number = 0,
    options?: ListEventsOptions
  ): Promise<Result<Events, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.category)
      searchParams.category = options.category.join(",");
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);
    if (options?.calendar_id !== undefined)
      searchParams.calendar_id = String(options.calendar_id);
    if (options?.ext) searchParams.ext = options.ext;
    if (options?.powerRange !== undefined)
      searchParams.powerRange = String(options.powerRange);
    if (options?.hrRange !== undefined)
      searchParams.hrRange = String(options.hrRange);
    if (options?.paceRange !== undefined)
      searchParams.paceRange = String(options.paceRange);
    if (options?.locale) searchParams.locale = options.locale;
    if (options?.resolve !== undefined)
      searchParams.resolve = String(options.resolve);

    return this.http.requestJson(
      `athlete/${athleteId}/events`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeEvents
    );
  }

  /**
   * Get a single event (planned workout, note etc.) by ID.
   */
  get(
    athleteId: string | number,
    eventId: number
  ): Promise<Result<Event, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/events/${eventId}`,
      {},
      decodeEvent
    );
  }

  /**
   * Create an event (planned workout, note etc.) on the athlete's calendar.
   * Accepts workouts in native Intervals.icu format ('description' field)
   * as well as zwo, mrc, erg and fit files (use 'file_contents' or 'file_contents_base64').
   */
  create(
    athleteId: string | number,
    event: EventEx,
    options?: CreateEventOptions
  ): Promise<Result<Event, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.upsertOnUid !== undefined)
      searchParams.upsertOnUid = String(options.upsertOnUid);

    return this.http.requestJson(
      `athlete/${athleteId}/events`,
      {
        method: "POST",
        json: transformKeysToSnake(event),
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeEvent
    );
  }

  /**
   * Update an event (planned workout, note etc.).
   */
  update(
    athleteId: string | number,
    eventId: number,
    event: Partial<EventEx>
  ): Promise<Result<Event, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/events/${eventId}`,
      { method: "PUT", json: transformKeysToSnake(event) },
      decodeEvent
    );
  }

  /**
   * Delete an event (planned workout, notes etc.) from an athlete's calendar.
   */
  delete(
    athleteId: string | number,
    eventId: number,
    options?: DeleteEventOptions
  ): Promise<Result<unknown, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.others !== undefined)
      searchParams.others = String(options.others);
    if (options?.notBefore) searchParams.notBefore = options.notBefore;

    return this.http.requestJson(`athlete/${athleteId}/events/${eventId}`, {
      method: "DELETE",
      searchParams: Object.keys(searchParams).length
        ? searchParams
        : undefined,
    });
  }

  /**
   * Create multiple events (planned workouts, notes etc.) on the athlete's calendar.
   * Accepts workouts in native Intervals.icu format as well as zwo, mrc, erg and fit files.
   */
  createMultiple(
    athleteId: string | number,
    events: EventEx[],
    options?: CreateMultipleEventsOptions
  ): Promise<Result<Events, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.upsert !== undefined)
      searchParams.upsert = String(options.upsert);
    if (options?.upsertOnUid !== undefined)
      searchParams.upsertOnUid = String(options.upsertOnUid);
    if (options?.updatePlanApplied !== undefined)
      searchParams.updatePlanApplied = String(options.updatePlanApplied);

    return this.http.requestJson(
      `athlete/${athleteId}/events/bulk`,
      {
        method: "POST",
        json: transformKeysToSnake(events),
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeEvents
    );
  }

  /**
   * Delete events from an athlete's calendar by id or external_id.
   * If external_id is supplied then the event must have been created by the calling OAuth application.
   * Events that do not exist are ignored.
   */
  deleteBulk(
    athleteId: string | number,
    events: DoomedEvent[]
  ): Promise<Result<DeleteEventsResponse, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/events/bulk-delete`,
      { method: "PUT", json: transformKeysToSnake(events) },
      decodeDeleteEventsResponse
    );
  }

  /**
   * Update all events for a date range at once.
   * Only hide_from_athlete and athlete_cannot_edit can be updated.
   */
  updateMultiple(
    athleteId: string | number,
    event: Partial<Event>,
    options: UpdateEventsOptions
  ): Promise<Result<Events, ApiError>> {
    const searchParams: Record<string, string> = {
      oldest: options.oldest,
      newest: options.newest,
    };

    return this.http.requestJson(
      `athlete/${athleteId}/events`,
      {
        method: "PUT",
        json: transformKeysToSnake(event),
        searchParams,
      },
      decodeEvents
    );
  }

  /**
   * List all tags that have been applied to events on the athlete's calendar.
   */
  listTags(
    athleteId: string | number = 0
  ): Promise<Result<EventTags, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/event-tags`,
      {},
      decodeEventTags
    );
  }

  /**
   * Download workouts as a ZIP file containing workout files.
   */
  downloadWorkoutsZip(
    athleteId: string | number = 0,
    options?: {
      oldest?: string;
      newest?: string;
      ext?: "zwo" | "mrc" | "erg" | "fit";
    }
  ): Promise<Result<ArrayBuffer, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.ext) searchParams.ext = options.ext;

    return this.http.requestArrayBuffer(
      `athlete/${athleteId}/workouts.zip`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      }
    );
  }

  /**
   * Download a single workout in the specified format.
   */
  downloadWorkout(
    athleteId: string | number,
    eventId: number,
    ext: "zwo" | "mrc" | "erg" | "fit"
  ): Promise<Result<ArrayBuffer, ApiError>> {
    return this.http.requestArrayBuffer(
      `athlete/${athleteId}/events/${eventId}/download.${ext}`,
      {}
    );
  }

  /**
   * Apply a workout plan from a folder to the athlete's calendar.
   */
  applyPlan(
    athleteId: string | number,
    data: ApplyPlanDTO
  ): Promise<Result<Events, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/events/apply-plan`,
      { method: "POST", json: transformKeysToSnake(data) },
      decodeEvents
    );
  }

  /**
   * Duplicate events by shifting them by a number of days.
   */
  duplicateEvents(
    athleteId: string | number,
    data: DuplicateEventsDTO
  ): Promise<Result<Events, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/duplicate-events`,
      { method: "POST", json: transformKeysToSnake(data) },
      decodeEvents
    );
  }

  /**
   * List events that influence the fitness model within a date range.
   */
  listFitnessModelEvents(
    athleteId: string | number = 0,
    options?: { oldest?: string; newest?: string }
  ): Promise<Result<Events, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;

    return this.http.requestJson(
      `athlete/${athleteId}/fitness-model-events`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeEvents
    );
  }

  /**
   * Delete all events within a date range.
   */
  deleteRange(
    athleteId: string | number,
    oldest: string,
    newest: string
  ): Promise<Result<DeleteEventsResponse, ApiError>> {
    const searchParams: Record<string, string> = {
      oldest,
      newest,
    };

    return this.http.requestJson(
      `athlete/${athleteId}/events`,
      { method: "DELETE", searchParams },
      decodeDeleteEventsResponse
    );
  }

  /**
   * List events as CSV format.
   */
  listCsv(
    athleteId: string | number = 0,
    options?: ListEventsOptions
  ): Promise<Result<string, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.category)
      searchParams.category = options.category.join(",");
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestText(
      `athlete/${athleteId}/events.csv`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      }
    );
  }

  /**
   * Mark an event as done by creating an activity from it.
   */
  markDone(
    athleteId: string | number,
    eventId: number
  ): Promise<Result<Activity, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/events/${eventId}/mark-done`,
      { method: "POST" },
      decodeActivity
    );
  }
}
