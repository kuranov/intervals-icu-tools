import type { ApiError } from "../errors";
import type { Result } from "../result";

import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeAthlete,
  decodeWithSportSettings,
  decodeAthleteSettings,
  decodeAthleteProfile,
  decodeAthleteSummary,
  type Athlete,
  type AthleteUpdateDTO,
  type WithSportSettings,
  type AthleteSettings,
  type AthleteProfile,
  type AthleteSummary,
} from "../schemas/athlete";
import { transformKeysToSnake } from "../utils/transform";

export type GetAthleteSummaryOptions = {
  /** Local date and optional time (ISO-8601) for oldest data to return (default: 6 days ago) */
  start?: string;
  /** Local date and optional time (ISO-8601) for newest data to return (default: today) */
  end?: string;
  /** Optional list of athlete tags, only athletes with one of these tags are returned */
  tags?: string[];
};

export class AthletesResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * Get the athlete with sportSettings and custom_items.
   */
  get(id: string | number = 0): Promise<Result<WithSportSettings, ApiError>> {
    return this.http.requestJson(
      `athlete/${id}`,
      {},
      decodeWithSportSettings
    );
  }

  /**
   * Update an athlete.
   */
  update(
    id: string | number,
    data: Partial<AthleteUpdateDTO>
  ): Promise<Result<Athlete, ApiError>> {
    return this.http.requestJson(
      `athlete/${id}`,
      { method: "PUT", json: transformKeysToSnake(data) },
      decodeAthlete
    );
  }

  /**
   * Get the athlete's settings for phone, tablet or desktop.
   */
  getSettings(
    id: string | number,
    deviceClass: string
  ): Promise<Result<AthleteSettings, ApiError>> {
    return this.http.requestJson(
      `athlete/${id}/settings/${deviceClass}`,
      {},
      decodeAthleteSettings
    );
  }

  /**
   * Get athlete profile info.
   */
  getProfile(
    id: string | number = 0
  ): Promise<Result<AthleteProfile, ApiError>> {
    return this.http.requestJson(
      `athlete/${id}/profile`,
      {},
      decodeAthleteProfile
    );
  }

  /**
   * Get summary information for followed athletes.
   * Note that when this endpoint is called with a bearer token then only
   * the athlete the token is for is returned.
   */
  getSummary(
    id: string | number = 0,
    options?: GetAthleteSummaryOptions
  ): Promise<Result<AthleteSummary, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.start) searchParams.start = options.start;
    if (options?.end) searchParams.end = options.end;
    if (options?.tags) searchParams.tags = options.tags.join(",");

    return this.http.requestJson(
      `athlete/${id}/athlete-summary`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeAthleteSummary
    );
  }
}
