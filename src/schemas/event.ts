import * as v from "valibot";

// Base Event schema with commonly used fields
export const EventSchema = v.looseObject({
  id: v.optional(v.number()),
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  category: v.optional(v.string()),
  start_date_local: v.optional(v.string()),
  end_date_local: v.optional(v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(v.string()),
  workout_type: v.optional(v.string()),
  workout_doc: v.optional(v.any()),
  load: v.optional(v.number()),
  distance: v.optional(v.number()),
  duration: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
  uid: v.optional(v.string()),
  external_id: v.optional(v.string()),
  calendar_id: v.optional(v.number()),
  hide_from_athlete: v.optional(v.boolean()),
  athlete_cannot_edit: v.optional(v.boolean()),
  color: v.optional(v.string()),
  plan_applied: v.optional(v.string()),
  created: v.optional(v.string()),
  updated: v.optional(v.string()),
  // Workout file conversion fields
  workout_filename: v.optional(v.string()),
  workout_file_base64: v.optional(v.string()),
});

export type Event = v.InferOutput<typeof EventSchema>;

export const EventsSchema = v.array(EventSchema);
export type Events = v.InferOutput<typeof EventsSchema>;

// EventEx schema (for create/update - includes file upload fields)
export const EventExSchema = v.looseObject({
  // Base event fields
  category: v.optional(v.string()),
  start_date_local: v.optional(v.string()),
  end_date_local: v.optional(v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(v.string()),
  workout_type: v.optional(v.string()),
  workout_doc: v.optional(v.any()),
  load: v.optional(v.number()),
  distance: v.optional(v.number()),
  duration: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
  uid: v.optional(v.string()),
  external_id: v.optional(v.string()),
  calendar_id: v.optional(v.number()),
  hide_from_athlete: v.optional(v.boolean()),
  athlete_cannot_edit: v.optional(v.boolean()),
  color: v.optional(v.string()),
  // File upload fields
  file_contents: v.optional(v.string()),
  file_contents_base64: v.optional(v.string()),
});

export type EventEx = v.InferOutput<typeof EventExSchema>;

// DoomedEvent schema (for bulk delete)
export const DoomedEventSchema = v.looseObject({
  id: v.optional(v.number()),
  external_id: v.optional(v.string()),
});

export type DoomedEvent = v.InferOutput<typeof DoomedEventSchema>;

// DeleteEventsResponse schema
export const DeleteEventsResponseSchema = v.looseObject({
  eventsDeleted: v.optional(v.number()),
});

export type DeleteEventsResponse = v.InferOutput<
  typeof DeleteEventsResponseSchema
>;

// Event tags schema
export const EventTagsSchema = v.array(v.string());
export type EventTags = v.InferOutput<typeof EventTagsSchema>;

// Decoder functions (internal use)
export function decodeEvents(data: unknown): Events {
  return v.parse(EventsSchema, data);
}

export function decodeEvent(data: unknown): Event {
  return v.parse(EventSchema, data);
}

export function decodeDeleteEventsResponse(
  data: unknown
): DeleteEventsResponse {
  return v.parse(DeleteEventsResponseSchema, data);
}

export function decodeEventTags(data: unknown): EventTags {
  return v.parse(EventTagsSchema, data);
}
