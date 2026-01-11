import type { IntervalsClientConfig } from "./config";
import { IntervalsHttpClient } from "./http/httpClient";
import { ActivitiesResource } from "./resources/activities";
import { EventsResource } from "./resources/events";
import { AthletesResource } from "./resources/athletes";
import { WellnessResource } from "./resources/wellness";
import { LibraryResource } from "./resources/library";
import { ChatsResource } from "./resources/chats";

export class IntervalsClient {
  public readonly activities: ActivitiesResource;
  public readonly events: EventsResource;
  public readonly athletes: AthletesResource;
  public readonly wellness: WellnessResource;
  public readonly library: LibraryResource;
  public readonly chats: ChatsResource;

  constructor(config: IntervalsClientConfig) {
    const http = new IntervalsHttpClient(config);
    this.activities = new ActivitiesResource(http);
    this.events = new EventsResource(http);
    this.athletes = new AthletesResource(http);
    this.wellness = new WellnessResource(http);
    this.library = new LibraryResource(http);
    this.chats = new ChatsResource(http);
  }
}
