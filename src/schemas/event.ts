import * as v from "valibot";
import { transformKeys } from "../utils/transform";

// Base Event schema with commonly used fields (raw snake_case from API)
const EventSchemaRaw = v.looseObject({
  // Required fields (API always returns these)
  id: v.number(),
  start_date_local: v.string(), // Events always have a date

  // Optional fields
  athlete_id: v.optional(v.union([v.string(), v.number()])),
  category: v.optional(v.string()),
  end_date_local: v.optional(v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(v.string()),
  workout_type: v.optional(v.string()),
  workout_doc: v.optional(v.any()),

  // Basic metrics
  load: v.optional(v.number()),
  distance: v.optional(v.number()),
  duration: v.optional(v.number()),
  moving_time: v.optional(v.number()),

  // Training load & intensity
  icu_training_load: v.optional(v.number()),
  icu_intensity: v.optional(v.number()),
  load_target: v.optional(v.number()),
  time_target: v.optional(v.number()),
  distance_target: v.optional(v.number()),

  // Energy & power
  joules: v.optional(v.number()),
  joules_above_ftp: v.optional(v.number()),

  // Fitness model integration
  icu_ctl: v.optional(v.number()),
  icu_atl: v.optional(v.number()),
  ctl_days: v.optional(v.number()),
  atl_days: v.optional(v.number()),
  strain_score: v.optional(v.number()),
  show_on_ctl_line: v.optional(v.boolean()),

  // Power & performance targets
  ss_cp: v.optional(v.number()),
  ss_p_max: v.optional(v.number()),
  ss_w_prime: v.optional(v.number()),
  p_max: v.optional(v.number()),
  w_prime: v.optional(v.number()),
  icu_ftp: v.optional(v.number()),

  // Nutrition & hydration
  carbs_per_hour: v.optional(v.number()),
  carbs_used: v.optional(v.number()),

  // Metadata
  tags: v.optional(v.array(v.string())),
  uid: v.optional(v.string()),
  external_id: v.optional(v.string()),
  calendar_id: v.optional(v.number()),
  color: v.optional(v.string()),
  plan_applied: v.optional(v.string()),
  created: v.optional(v.string()),
  updated: v.optional(v.string()),

  // Permissions & visibility
  hide_from_athlete: v.optional(v.boolean()),
  athlete_cannot_edit: v.optional(v.boolean()),
  show_as_note: v.optional(v.boolean()),
  not_on_fitness_chart: v.optional(v.boolean()),
  structure_read_only: v.optional(v.boolean()),

  // Cross-references & planning
  plan_athlete_id: v.optional(v.union([v.string(), v.number()])),
  plan_folder_id: v.optional(v.union([v.string(), v.number()])),
  plan_workout_id: v.optional(v.union([v.string(), v.number()])),
  shared_event_id: v.optional(v.union([v.string(), v.number()])),
  created_by_id: v.optional(v.union([v.string(), v.number()])),

  // OAuth & integration
  oauth_client_id: v.optional(v.union([v.string(), v.number()])),

  // UI/Presentation
  entered: v.optional(v.boolean()),
  indoor: v.optional(v.boolean()),
  for_week: v.optional(v.string()),

  // Workout file conversion fields
  workout_filename: v.optional(v.string()),
  workout_file_base64: v.optional(v.string()),

  // Advanced attributes
  target: v.optional(v.number()),
  sub_type: v.optional(v.string()),
});

// Export the transformed schema (converts snake_case to camelCase)
export const EventSchema = v.pipe(EventSchemaRaw, v.transform(transformKeys));

export type Event = v.InferOutput<typeof EventSchema>;

export const EventsSchema = v.array(EventSchema);
export type Events = v.InferOutput<typeof EventsSchema>;

// EventEx schema (for create/update - includes file upload fields, raw)
const EventExSchemaRaw = v.looseObject({
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

export const EventExSchema = v.pipe(EventExSchemaRaw, v.transform(transformKeys));
export type EventEx = v.InferOutput<typeof EventExSchema>;

// DoomedEvent schema (for bulk delete, raw)
const DoomedEventSchemaRaw = v.looseObject({
  id: v.optional(v.number()),
  external_id: v.optional(v.string()),
});

export const DoomedEventSchema = v.pipe(DoomedEventSchemaRaw, v.transform(transformKeys));
export type DoomedEvent = v.InferOutput<typeof DoomedEventSchema>;

// DeleteEventsResponse schema (raw)
const DeleteEventsResponseSchemaRaw = v.looseObject({
  eventsDeleted: v.optional(v.number()),
});

export const DeleteEventsResponseSchema = v.pipe(DeleteEventsResponseSchemaRaw, v.transform(transformKeys));
export type DeleteEventsResponse = v.InferOutput<
  typeof DeleteEventsResponseSchema
>;

// Event tags schema
export const EventTagsSchema = v.array(v.string());
export type EventTags = v.InferOutput<typeof EventTagsSchema>;

// ApplyPlanDTO schema (for applying a plan to calendar, raw)
const ApplyPlanDTOSchemaRaw = v.looseObject({
  folder_id: v.number(),
  oldest: v.string(),
  newest: v.string(),
  delete_existing: v.optional(v.boolean()),
  update_plan_applied: v.optional(v.boolean()),
});

export const ApplyPlanDTOSchema = v.pipe(ApplyPlanDTOSchemaRaw, v.transform(transformKeys));
export type ApplyPlanDTO = v.InferOutput<typeof ApplyPlanDTOSchema>;

// DuplicateEventsDTO schema (for duplicating events, raw)
const DuplicateEventsDTOSchemaRaw = v.looseObject({
  event_ids: v.array(v.number()),
  offset_days: v.number(),
  copy_to_athlete_id: v.optional(v.union([v.string(), v.number()])),
});

export const DuplicateEventsDTOSchema = v.pipe(DuplicateEventsDTOSchemaRaw, v.transform(transformKeys));
export type DuplicateEventsDTO = v.InferOutput<typeof DuplicateEventsDTOSchema>;

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
