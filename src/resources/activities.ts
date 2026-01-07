import type { ApiError } from "../errors";
import type { Result } from "../result";

import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeActivities,
  decodeActivity,
  decodeIntervalsDTO,
  decodeActivityId,
  type Activities,
  type Activity,
  type IntervalsDTO,
  type ActivityId,
  type Interval,
} from "../schemas/activity";

export type ListActivitiesOptions = {
  /** Local ISO-8601 date or date and time (e.g., 2019-07-22T16:18:49 or 2019-07-22) */
  oldest?: string;
  /** Local ISO-8601 date or date and time (defaults to now) */
  newest?: string;
  /** Only return activities on this route */
  route_id?: number;
  /** Return at most this many activities */
  limit?: number;
  /** Comma separated list of field names to include (default is all) */
  fields?: string[];
};

export type GetActivityOptions = {
  /** Include interval data */
  intervals?: boolean;
};

export type UpdateIntervalsOptions = {
  /** Any existing intervals are replaced, otherwise a merge is done (default: true) */
  all?: boolean;
};

export class ActivitiesResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * List activities for a date range in desc date order.
   * An empty stub object is returned for Strava activities.
   */
  list(
    athleteId: string | number = 0,
    options?: ListActivitiesOptions
  ): Promise<Result<Activities, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.route_id !== undefined)
      searchParams.route_id = String(options.route_id);
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);
    if (options?.fields) searchParams.fields = options.fields.join(",");

    return this.http.requestJson(
      `athlete/${athleteId}/activities`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeActivities
    );
  }

  /**
   * Get a single activity by ID.
   * An empty stub object is returned for Strava activities.
   */
  get(
    id: string | number,
    options?: GetActivityOptions
  ): Promise<Result<Activity, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.intervals !== undefined)
      searchParams.intervals = String(options.intervals);

    return this.http.requestJson(
      `activity/${id}`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeActivity
    );
  }

  /**
   * Update an activity.
   * Strava activities cannot be updated.
   */
  update(
    id: string | number,
    data: Partial<Activity>
  ): Promise<Result<Activity, ApiError>> {
    return this.http.requestJson(
      `activity/${id}`,
      { method: "PUT", json: data },
      decodeActivity
    );
  }

  /**
   * Delete an activity.
   */
  delete(id: string | number): Promise<Result<ActivityId, ApiError>> {
    return this.http.requestJson(
      `activity/${id}`,
      { method: "DELETE" },
      decodeActivityId
    );
  }

  /**
   * Get activity intervals.
   */
  getIntervals(id: string | number): Promise<Result<IntervalsDTO, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/intervals`,
      {},
      decodeIntervalsDTO
    );
  }

  /**
   * Update intervals for an activity.
   * By default, any existing intervals are replaced (all=true).
   * Set all=false to merge with existing intervals.
   */
  updateIntervals(
    id: string | number,
    intervals: Interval[],
    options?: UpdateIntervalsOptions
  ): Promise<Result<IntervalsDTO, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.all !== undefined) searchParams.all = String(options.all);

    return this.http.requestJson(
      `activity/${id}/intervals`,
      {
        method: "PUT",
        json: intervals,
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeIntervalsDTO
    );
  }

  /**
   * Delete intervals from an activity.
   */
  deleteIntervals(
    id: string | number,
    intervals: Interval[]
  ): Promise<Result<IntervalsDTO, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/delete-intervals`,
      { method: "PUT", json: intervals },
      decodeIntervalsDTO
    );
  }

  /**
   * Update or create a specific interval.
   */
  updateInterval(
    id: string | number,
    intervalId: number,
    interval: Partial<Interval>
  ): Promise<Result<IntervalsDTO, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/intervals/${intervalId}`,
      { method: "PUT", json: interval },
      decodeIntervalsDTO
    );
  }

  /**
   * Split an interval at a specific index.
   */
  splitInterval(
    id: string | number,
    splitAt: number
  ): Promise<Result<IntervalsDTO, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/split-interval`,
      { method: "PUT", searchParams: { splitAt: String(splitAt) } },
      decodeIntervalsDTO
    );
  }
}
