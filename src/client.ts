import type { IntervalsClientConfig } from "./config";
import { IntervalsHttpClient } from "./http/httpClient";
import { ActivitiesResource } from "./resources/activities";

export class IntervalsClient {
  public readonly activities: ActivitiesResource;

  constructor(config: IntervalsClientConfig) {
    const http = new IntervalsHttpClient(config);
    this.activities = new ActivitiesResource(http);
  }
}
