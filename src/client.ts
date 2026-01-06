import type { IntervalsClientConfig } from "./config";
import { IntervalsHttpClient } from "./http/httpClient";
import { ActivitiesResource } from "./resources/activities";
import { EventsResource } from "./resources/events";
import { AthletesResource } from "./resources/athletes";

export class IntervalsClient {
  public readonly activities: ActivitiesResource;
  public readonly events: EventsResource;
  public readonly athletes: AthletesResource;

  constructor(config: IntervalsClientConfig) {
    const http = new IntervalsHttpClient(config);
    this.activities = new ActivitiesResource(http);
    this.events = new EventsResource(http);
    this.athletes = new AthletesResource(http);
  }
}
