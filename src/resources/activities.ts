import type { ApiError } from '../errors';
import type { Result } from '../result';

import type { IntervalsHttpClient } from '../http/httpClient';
import { decodeActivities, type Activities } from '../schemas/activity';

export class ActivitiesResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  list(athleteId: string | number = 0): Promise<Result<Activities, ApiError>> {
    return this.http.requestJson(`athlete/${athleteId}/activities`, {}, decodeActivities);
  }
}


