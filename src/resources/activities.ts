import type { ApiError } from "../errors";
import type { Result } from "../result";

import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeActivities,
  decodeActivity,
  decodeIntervalsResponse,
  decodeActivityId,
  decodeActivityStreams,
  decodeUpdateStreamsResponse,
  decodePowerCurve,
  decodePaceCurve,
  decodeHRCurve,
  type Activities,
  type Activity,
  type IntervalsResponse,
  type ActivityId,
  type Interval,
  type ActivityStreams,
  type ActivityStream,
  type UpdateStreamsResponse,
  type PowerCurve,
  type PaceCurve,
  type HRCurve,
} from "../schemas/activity";
import { transformKeysToSnake } from "../utils/transform";

export type ListActivitiesOptions = {
  /** Local ISO-8601 date or date and time (e.g., 2019-07-22T16:18:49 or 2019-07-22) */
  oldest?: string;
  /** Local ISO-8601 date or date and time (defaults to now) */
  newest?: string;
  /** Only return activities on this route */
  routeId?: number;
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

export type GetStreamsOptions = {
  /** Streams required (e.g., 'watts', 'heartrate', 'cadence') */
  types?: string[];
  /** Include default streams in addition to any specified in types */
  includeDefaults?: boolean;
};

export type CurveOptions = {
  /** Use kj0 or kj1 to get one of the athlete's predefined fatigued power curves */
  fatigue?: string;
};

export type AthleteCurvesOptions = {
  /** Local ISO-8601 date (defaults to now) */
  newest?: string;
  /** Comma separated list of curves to return (default last year) */
  curves?: string[];
  /** Only consider activities matching the sport type */
  type: string;
  /** Include ranks */
  includeRanks?: boolean;
  /** Number of sub-maximal efforts to include */
  subMaxEfforts?: number;
  /** Current local date (ISO-8601) */
  now?: string;
};

export type SearchActivitiesOptions = {
  /** Maximum number of results */
  limit?: number;
};

export type ActivitiesAroundOptions = {
  /** Number of activities before */
  before?: number;
  /** Number of activities after */
  after?: number;
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
    if (options?.routeId !== undefined)
      searchParams.route_id = String(options.routeId);
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
      { method: "PUT", json: transformKeysToSnake(data) },
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
  getIntervals(id: string | number): Promise<Result<IntervalsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/intervals`,
      {},
      decodeIntervalsResponse
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
  ): Promise<Result<IntervalsResponse, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.all !== undefined) searchParams.all = String(options.all);

    return this.http.requestJson(
      `activity/${id}/intervals`,
      {
        method: "PUT",
        json: transformKeysToSnake(intervals),
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeIntervalsResponse
    );
  }

  /**
   * Delete intervals from an activity.
   */
  deleteIntervals(
    id: string | number,
    intervals: Interval[]
  ): Promise<Result<IntervalsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/delete-intervals`,
      { method: "PUT", json: transformKeysToSnake(intervals) },
      decodeIntervalsResponse
    );
  }

  /**
   * Update or create a specific interval.
   */
  updateInterval(
    id: string | number,
    intervalId: number,
    interval: Partial<Interval>
  ): Promise<Result<IntervalsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/intervals/${intervalId}`,
      { method: "PUT", json: transformKeysToSnake(interval) },
      decodeIntervalsResponse
    );
  }

  /**
   * Split an interval at a specific index.
   */
  splitInterval(
    id: string | number,
    splitAt: number
  ): Promise<Result<IntervalsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/split-interval`,
      { method: "PUT", searchParams: { splitAt: String(splitAt) } },
      decodeIntervalsResponse
    );
  }

  /**
   * Get streams for the activity.
   * Returns JSON format. Use ext parameter for CSV.
   */
  getStreams(
    id: string | number,
    options?: GetStreamsOptions
  ): Promise<Result<ActivityStreams, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.types) searchParams.types = options.types.join(",");
    if (options?.includeDefaults !== undefined)
      searchParams.includeDefaults = String(options.includeDefaults);

    return this.http.requestJson(
      `activity/${id}/streams.json`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeActivityStreams
    );
  }

  /**
   * Get streams for the activity in CSV format.
   */
  getStreamsCsv(
    id: string | number,
    options?: GetStreamsOptions
  ): Promise<Result<string, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.types) searchParams.types = options.types.join(",");
    if (options?.includeDefaults !== undefined)
      searchParams.includeDefaults = String(options.includeDefaults);

    return this.http.requestText(
      `activity/${id}/streams.csv`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      }
    );
  }

  /**
   * Update streams for the activity from JSON.
   */
  updateStreams(
    id: string | number,
    streams: ActivityStream[]
  ): Promise<Result<UpdateStreamsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/streams`,
      { method: "PUT", json: transformKeysToSnake(streams) },
      decodeUpdateStreamsResponse
    );
  }

  /**
   * Update streams for the activity from CSV.
   */
  updateStreamsCsv(
    id: string | number,
    csv: string
  ): Promise<Result<UpdateStreamsResponse, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/streams.csv`,
      {
        method: "PUT",
        headers: { "Content-Type": "text/csv" },
        body: csv,
      },
      decodeUpdateStreamsResponse
    );
  }

  /**
   * Get power curve for a single activity.
   */
  getPowerCurve(
    id: string | number,
    options?: CurveOptions
  ): Promise<Result<PowerCurve, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.fatigue) searchParams.fatigue = options.fatigue;

    return this.http.requestJson(
      `activity/${id}/power-curve.json`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodePowerCurve
    );
  }

  /**
   * Get pace curve for a single activity.
   */
  getPaceCurve(
    id: string | number
  ): Promise<Result<PaceCurve, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/pace-curve.json`,
      {},
      decodePaceCurve
    );
  }

  /**
   * Get heart rate curve for a single activity.
   */
  getHRCurve(
    id: string | number
  ): Promise<Result<HRCurve, ApiError>> {
    return this.http.requestJson(
      `activity/${id}/hr-curve.json`,
      {},
      decodeHRCurve
    );
  }

  /**
   * Get power curves for multiple streams in a single activity.
   */
  getPowerCurves(
    id: string | number
  ): Promise<Result<PowerCurve[], ApiError>> {
    return this.http.requestJson(
      `activity/${id}/power-curves.json`,
      {},
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of power curves");
        }
        return data.map(decodePowerCurve);
      }
    );
  }

  /**
   * List best power curves for an athlete across activities.
   */
  listAthletePowerCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<PowerCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/power-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of power curves");
        }
        return data.map(decodePowerCurve);
      }
    );
  }

  /**
   * List best pace curves for an athlete across activities.
   */
  listAthletePaceCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<PaceCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/pace-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of pace curves");
        }
        return data.map(decodePaceCurve);
      }
    );
  }

  /**
   * List best heart rate curves for an athlete across activities.
   */
  listAthleteHRCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<HRCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/hr-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of HR curves");
        }
        return data.map(decodeHRCurve);
      }
    );
  }

  /**
   * Get best power for durations in date range.
   */
  getActivityPowerCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<PowerCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/activity-power-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of power curves");
        }
        return data.map(decodePowerCurve);
      }
    );
  }

  /**
   * Get best pace for distances in date range.
   */
  getActivityPaceCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<PaceCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/activity-pace-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of pace curves");
        }
        return data.map(decodePaceCurve);
      }
    );
  }

  /**
   * Get best HR for durations in date range.
   */
  getActivityHRCurves(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<HRCurve[], ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/activity-hr-curves.json`,
      { searchParams },
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of HR curves");
        }
        return data.map(decodeHRCurve);
      }
    );
  }

  /**
   * Get power vs heart rate curve for date range.
   */
  getPowerHRCurve(
    athleteId: string | number = 0,
    options: AthleteCurvesOptions
  ): Promise<Result<PowerCurve, ApiError>> {
    const searchParams: Record<string, string> = {
      type: options.type,
    };
    if (options.newest) searchParams.newest = options.newest;
    if (options.curves) searchParams.curves = options.curves.join(",");
    if (options.includeRanks !== undefined)
      searchParams.includeRanks = String(options.includeRanks);
    if (options.subMaxEfforts !== undefined)
      searchParams.subMaxEfforts = String(options.subMaxEfforts);
    if (options.now) searchParams.now = options.now;

    return this.http.requestJson(
      `athlete/${athleteId}/power-hr-curve`,
      { searchParams },
      decodePowerCurve
    );
  }

  /**
   * Search for activities by name or tag (returns summary info).
   * Use # prefix for exact tag search (e.g., "#race").
   */
  search(
    athleteId: string | number = 0,
    query: string,
    options?: SearchActivitiesOptions
  ): Promise<Result<Activities, ApiError>> {
    const searchParams: Record<string, string> = { q: query };
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestJson(
      `athlete/${athleteId}/activities/search`,
      { searchParams },
      decodeActivities
    );
  }

  /**
   * Search for activities by name or tag (returns full data).
   * Use # prefix for exact tag search (e.g., "#race").
   */
  searchFull(
    athleteId: string | number = 0,
    query: string,
    options?: SearchActivitiesOptions
  ): Promise<Result<Activities, ApiError>> {
    const searchParams: Record<string, string> = { q: query };
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestJson(
      `athlete/${athleteId}/activities/search-full`,
      { searchParams },
      decodeActivities
    );
  }

  /**
   * Find activities with matching intervals.
   */
  searchIntervals(
    athleteId: string | number = 0,
    query: string,
    options?: SearchActivitiesOptions
  ): Promise<Result<Activities, ApiError>> {
    const searchParams: Record<string, string> = { q: query };
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestJson(
      `athlete/${athleteId}/activities/interval-search`,
      { searchParams },
      decodeActivities
    );
  }

  /**
   * List all activity tags for the athlete.
   */
  listTags(athleteId: string | number = 0): Promise<Result<string[], ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/activity-tags`,
      {},
      (data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected array of tags");
        }
        return data as string[];
      }
    );
  }

  /**
   * List activities before and after another activity.
   */
  listAround(
    athleteId: string | number = 0,
    activityId: number,
    options?: ActivitiesAroundOptions
  ): Promise<Result<Activities, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.before !== undefined)
      searchParams.before = String(options.before);
    if (options?.after !== undefined)
      searchParams.after = String(options.after);

    return this.http.requestJson(
      `athlete/${athleteId}/activities-around`,
      {
        searchParams: Object.keys(searchParams).length
          ? { ...searchParams, id: String(activityId) }
          : { id: String(activityId) },
      },
      decodeActivities
    );
  }

  /** Get activity map data */
  getMap(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/map`, {}, (data) => data);
  }

  /** Get activity segments */
  getSegments(id: string | number): Promise<Result<unknown[], ApiError>> {
    return this.http.requestJson(`activity/${id}/segments`, {}, (data) => data as unknown[]);
  }

  /** Get weather summary for activity */
  getWeatherSummary(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/weather-summary`, {}, (data) => data);
  }

  /** Get best efforts in activity */
  getBestEfforts(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/best-efforts`, {}, (data) => data);
  }

  /** Get power histogram */
  getPowerHistogram(id: string | number): Promise<Result<unknown[], ApiError>> {
    return this.http.requestJson(`activity/${id}/power-histogram`, {}, (data) => data as unknown[]);
  }

  /** Get pace histogram */
  getPaceHistogram(id: string | number): Promise<Result<unknown[], ApiError>> {
    return this.http.requestJson(`activity/${id}/pace-histogram`, {}, (data) => data as unknown[]);
  }

  /** Get gradient adjusted pace histogram */
  getGapHistogram(id: string | number): Promise<Result<unknown[], ApiError>> {
    return this.http.requestJson(`activity/${id}/gap-histogram`, {}, (data) => data as unknown[]);
  }

  /** Get heart rate histogram */
  getHRHistogram(id: string | number): Promise<Result<unknown[], ApiError>> {
    return this.http.requestJson(`activity/${id}/hr-histogram`, {}, (data) => data as unknown[]);
  }

  /** Get power vs HR data */
  getPowerVsHR(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/power-vs-hr.json`, {}, (data) => data);
  }

  /** Get time at heart rate data */
  getTimeAtHR(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/time-at-hr`, {}, (data) => data);
  }

  /** Get power spike model for activity */
  getPowerSpikeModel(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/power-spike-model`, {}, (data) => data);
  }

  /** Get HR load model for activity */
  getHRLoadModel(id: string | number): Promise<Result<unknown, ApiError>> {
    return this.http.requestJson(`activity/${id}/hr-load-model`, {}, (data) => data);
  }

  /** Download activity FIT file */
  downloadFitFile(id: string | number): Promise<Result<ArrayBuffer, ApiError>> {
    return this.http.requestArrayBuffer(`activity/${id}/fit-file`, {});
  }

  /** Download activity GPX file */
  downloadGpxFile(id: string | number): Promise<Result<ArrayBuffer, ApiError>> {
    return this.http.requestArrayBuffer(`activity/${id}/gpx-file`, {});
  }

  /** Download original activity file */
  downloadFile(id: string | number): Promise<Result<ArrayBuffer, ApiError>> {
    return this.http.requestArrayBuffer(`activity/${id}/file`, {});
  }

  /** Download activities as CSV */
  downloadActivitiesCsv(
    athleteId: string | number = 0,
    options?: ListActivitiesOptions
  ): Promise<Result<string, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestText(
      `athlete/${athleteId}/activities.csv`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      }
    );
  }

  /** Bulk download FIT files as zip archive */
  downloadFitFiles(
    athleteId: string | number = 0,
    activityIds: (string | number)[]
  ): Promise<Result<ArrayBuffer, ApiError>> {
    return this.http.requestArrayBuffer(
      `athlete/${athleteId}/download-fit-files`,
      {
        method: "POST",
        json: { activity_ids: activityIds },
      }
    );
  }

  /** Upload an activity file (FIT, TCX, GPX, etc.) */
  uploadActivity(
    athleteId: string | number = 0,
    fileData: ArrayBuffer | Blob,
    options?: { filename?: string }
  ): Promise<Result<Activity, ApiError>> {
    const formData = new FormData();
    const blob = fileData instanceof Blob
      ? fileData
      : new Blob([fileData]);

    formData.append("file", blob, options?.filename || "activity.fit");

    return this.http.requestJson(
      `athlete/${athleteId}/activities`,
      {
        method: "POST",
        body: formData,
      },
      decodeActivity
    );
  }
}
