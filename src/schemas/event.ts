import * as v from "valibot";
import { transformKeys, type CamelCaseKeys } from "../utils/transform";

// Base Event schema with commonly used fields (raw snake_case from API)
const EventSchemaRaw = v.looseObject({
  // Required fields (API always returns these)
  id: v.number(),
  start_date_local: v.string(), // Events always have a date

  // Optional fields
  athlete_id: v.nullish(v.union([v.string(), v.number()])),
  category: v.nullish(v.string()),
  end_date_local: v.nullish(v.string()),
  name: v.nullish(v.string()),
  description: v.nullish(v.string()),
  type: v.nullish(v.string()),
  workout_type: v.nullish(v.string()),
  workout_doc: v.nullish(v.any()),

  // Basic metrics
  load: v.nullish(v.number()),
  distance: v.nullish(v.number()),
  duration: v.nullish(v.number()),
  moving_time: v.nullish(v.number()),

  // Training load & intensity
  icu_training_load: v.nullish(v.number()),
  icu_intensity: v.nullish(v.number()),
  load_target: v.nullish(v.number()),
  time_target: v.nullish(v.number()),
  distance_target: v.nullish(v.number()),

  // Energy & power
  joules: v.nullish(v.number()),
  joules_above_ftp: v.nullish(v.number()),

  // Fitness model integration
  icu_ctl: v.nullish(v.number()),
  icu_atl: v.nullish(v.number()),
  ctl_days: v.nullish(v.number()),
  atl_days: v.nullish(v.number()),
  strain_score: v.nullish(v.number()),
  show_on_ctl_line: v.nullish(v.boolean()),

  // Power & performance targets
  ss_cp: v.nullish(v.number()),
  ss_p_max: v.nullish(v.number()),
  ss_w_prime: v.nullish(v.number()),
  p_max: v.nullish(v.number()),
  w_prime: v.nullish(v.number()),
  icu_ftp: v.nullish(v.number()),

  // Nutrition & hydration
  carbs_per_hour: v.nullish(v.number()),
  carbs_used: v.nullish(v.number()),

  // Metadata
  tags: v.nullish(v.array(v.string())),
  uid: v.nullish(v.string()),
  external_id: v.nullish(v.string()),
  calendar_id: v.nullish(v.number()),
  color: v.nullish(v.string()),
  plan_applied: v.nullish(v.string()),
  created: v.nullish(v.string()),
  updated: v.nullish(v.string()),

  // Permissions & visibility
  hide_from_athlete: v.nullish(v.boolean()),
  athlete_cannot_edit: v.nullish(v.boolean()),
  show_as_note: v.nullish(v.boolean()),
  not_on_fitness_chart: v.nullish(v.boolean()),
  structure_read_only: v.nullish(v.boolean()),

  // Cross-references & planning
  plan_athlete_id: v.nullish(v.union([v.string(), v.number()])),
  plan_folder_id: v.nullish(v.union([v.string(), v.number()])),
  plan_workout_id: v.nullish(v.union([v.string(), v.number()])),
  shared_event_id: v.nullish(v.union([v.string(), v.number()])),
  created_by_id: v.nullish(v.union([v.string(), v.number()])),

  // OAuth & integration
  oauth_client_id: v.nullish(v.union([v.string(), v.number()])),

  // UI/Presentation
  entered: v.nullish(v.boolean()),
  indoor: v.nullish(v.boolean()),
  for_week: v.nullish(v.boolean()),

  // Workout file conversion fields
  workout_filename: v.nullish(v.string()),
  workout_file_base64: v.nullish(v.string()),

  // Advanced attributes
  target: v.nullish(v.string()),
  sub_type: v.nullish(v.string()),
});

// Export the transformed schema (converts snake_case to camelCase)
export const EventSchema = v.pipe(EventSchemaRaw, v.transform(transformKeys));

export type Event = CamelCaseKeys<v.InferOutput<typeof EventSchemaRaw>>;

export const EventsSchema = v.array(EventSchema);
export type Events = Event[];

// EventInput schema (for create/update - includes file upload fields, raw)
const EventInputSchemaRaw = v.looseObject({
  // Base event fields
  category: v.nullish(v.string()),
  start_date_local: v.nullish(v.string()),
  end_date_local: v.nullish(v.string()),
  name: v.nullish(v.string()),
  description: v.nullish(v.string()),
  type: v.nullish(v.string()),
  workout_type: v.nullish(v.string()),
  workout_doc: v.nullish(v.any()),
  load: v.nullish(v.number()),
  distance: v.nullish(v.number()),
  duration: v.nullish(v.number()),
  tags: v.nullish(v.array(v.string())),
  uid: v.nullish(v.string()),
  external_id: v.nullish(v.string()),
  calendar_id: v.nullish(v.number()),
  hide_from_athlete: v.nullish(v.boolean()),
  athlete_cannot_edit: v.nullish(v.boolean()),
  color: v.nullish(v.string()),
  // File upload fields
  file_contents: v.nullish(v.string()),
  file_contents_base64: v.nullish(v.string()),
});

export const EventInputSchema = v.pipe(EventInputSchemaRaw, v.transform(transformKeys));
export type EventInput = CamelCaseKeys<v.InferOutput<typeof EventInputSchemaRaw>>;

// DeleteEventInput schema (for bulk delete, raw)
const DeleteEventInputSchemaRaw = v.looseObject({
  id: v.nullish(v.number()),
  external_id: v.nullish(v.string()),
});

export const DeleteEventInputSchema = v.pipe(DeleteEventInputSchemaRaw, v.transform(transformKeys));
export type DeleteEventInput = CamelCaseKeys<v.InferOutput<typeof DeleteEventInputSchemaRaw>>;

// DeleteEventsResponse schema (raw)
const DeleteEventsResponseSchemaRaw = v.looseObject({
  eventsDeleted: v.nullish(v.number()),
});

export const DeleteEventsResponseSchema = v.pipe(DeleteEventsResponseSchemaRaw, v.transform(transformKeys));
export type DeleteEventsResponse = CamelCaseKeys<v.InferOutput<typeof DeleteEventsResponseSchemaRaw>>;

// Event tags schema
export const EventTagsSchema = v.array(v.string());
export type EventTags = v.InferOutput<typeof EventTagsSchema>;

// ApplyPlanInput schema (for applying a plan to calendar, raw)
const ApplyPlanInputSchemaRaw = v.looseObject({
  folder_id: v.number(),
  oldest: v.string(),
  newest: v.string(),
  delete_existing: v.nullish(v.boolean()),
  update_plan_applied: v.nullish(v.boolean()),
});

export const ApplyPlanInputSchema = v.pipe(ApplyPlanInputSchemaRaw, v.transform(transformKeys));
export type ApplyPlanInput = CamelCaseKeys<v.InferOutput<typeof ApplyPlanInputSchemaRaw>>;

// DuplicateEventsInput schema (for duplicating events, raw)
const DuplicateEventsInputSchemaRaw = v.looseObject({
  event_ids: v.array(v.number()),
  offset_days: v.number(),
  copy_to_athlete_id: v.nullish(v.union([v.string(), v.number()])),
});

export const DuplicateEventsInputSchema = v.pipe(DuplicateEventsInputSchemaRaw, v.transform(transformKeys));
export type DuplicateEventsInput = CamelCaseKeys<v.InferOutput<typeof DuplicateEventsInputSchemaRaw>>;

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
