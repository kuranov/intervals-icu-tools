import type { ApiError } from "../errors";
import type { Result } from "../result";
import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeWellness,
  decodeWellnessList,
  type Wellness,
  type WellnessList,
} from "../schemas/wellness";
import { transformKeysToSnake } from "../utils/transform";

export type ListWellnessOptions = {
  /** Local date of oldest record (ISO-8601) */
  oldest?: string;
  /** Local date of newest record (ISO-8601), inclusive */
  newest?: string;
  /** Comma separated list of field names to include (default is all) */
  fields?: string[];
};

/**
 * Wellness resource for managing daily wellness records
 * (weight, HR, HRV, sleep, soreness, etc.)
 */
export class WellnessResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * List wellness records for date range.
   * Returns JSON format (for CSV, use the API directly with .csv extension).
   */
  list(
    athleteId: string | number,
    options?: ListWellnessOptions
  ): Promise<Result<WellnessList, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.fields) searchParams.fields = options.fields.join(",");

    return this.http.requestJson(
      `athlete/${athleteId}/wellness`,
      { searchParams },
      decodeWellnessList
    );
  }

  /**
   * Get wellness record for a specific date.
   */
  get(
    athleteId: string | number,
    date: string
  ): Promise<Result<Wellness, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness/${date}`,
      {},
      decodeWellness
    );
  }

  /**
   * Update wellness record for a specific date.
   * Only fields provided are changed.
   */
  update(
    athleteId: string | number,
    date: string,
    data: Partial<Wellness>
  ): Promise<Result<Wellness, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness/${date}`,
      { method: "PUT", json: transformKeysToSnake(data) },
      decodeWellness
    );
  }

  /**
   * Update multiple wellness records at once.
   * Each record's id field should be the ISO-8601 date.
   * Only fields provided in each record are changed.
   */
  updateBulk(
    athleteId: string | number,
    records: Partial<Wellness>[]
  ): Promise<Result<void, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/wellness-bulk`,
      { method: "PUT", json: transformKeysToSnake(records) },
      () => undefined
    );
  }
}
