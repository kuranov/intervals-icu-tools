import * as v from "valibot";
import { ActivityTypeSchema } from "./common";

/**
 * Folder/Plan type enum
 */
export const FolderTypeSchema = v.picklist(["FOLDER", "PLAN"]);

/**
 * Visibility enum for folders/plans
 */
export const VisibilitySchema = v.picklist(["PRIVATE", "PUBLIC"]);

/**
 * Workout schema (minimal fields, allows extra via looseObject)
 * The API doesn't fully document all workout fields in the OpenAPI spec,
 * so we use looseObject to accept whatever the API returns.
 */
export const WorkoutSchema = v.looseObject({
  // Required fields (API always returns these for existing workouts)
  id: v.number(),
  name: v.string(),

  // Optional fields
  description: v.optional(v.string()),
  folder_id: v.optional(v.number()),
  activity_type: v.optional(ActivityTypeSchema),
  file_contents: v.optional(v.string()),
  file_contents_base64: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export type Workout = v.InferOutput<typeof WorkoutSchema>;

/**
 * Array of workouts
 */
export const WorkoutsSchema = v.array(WorkoutSchema);
export type Workouts = v.InferOutput<typeof WorkoutsSchema>;

/**
 * Folder schema for organizing workouts
 */
export const FolderSchema = v.looseObject({
  // Required fields (API always returns these)
  id: v.number(),
  type: FolderTypeSchema,
  name: v.string(),

  // Optional fields
  athlete_id: v.optional(v.string()),
  description: v.optional(v.string()),
  children: v.optional(v.array(WorkoutSchema)),
  visibility: v.optional(VisibilitySchema),
  start_date_local: v.optional(v.string()),
  rollout_weeks: v.optional(v.number()),
  auto_rollout_day: v.optional(v.number()),
  read_only_workouts: v.optional(v.boolean()),
  starting_ctl: v.optional(v.number()),
  starting_atl: v.optional(v.number()),
  activity_types: v.optional(v.array(v.optional(ActivityTypeSchema))),
});

export type Folder = v.InferOutput<typeof FolderSchema>;

/**
 * Array of folders
 */
export const FoldersSchema = v.array(FolderSchema);
export type Folders = v.InferOutput<typeof FoldersSchema>;

/**
 * Workout tags (simple string array)
 */
export const WorkoutTagsSchema = v.array(v.string());
export type WorkoutTags = v.InferOutput<typeof WorkoutTagsSchema>;

/**
 * Decode a single workout
 */
export function decodeWorkout(data: unknown): Workout {
  return v.parse(WorkoutSchema, data);
}

/**
 * Decode an array of workouts
 */
export function decodeWorkouts(data: unknown): Workouts {
  return v.parse(WorkoutsSchema, data);
}

/**
 * Decode a single folder
 */
export function decodeFolder(data: unknown): Folder {
  return v.parse(FolderSchema, data);
}

/**
 * Decode an array of folders
 */
export function decodeFolders(data: unknown): Folders {
  return v.parse(FoldersSchema, data);
}

/**
 * Decode workout tags
 */
export function decodeWorkoutTags(data: unknown): WorkoutTags {
  return v.parse(WorkoutTagsSchema, data);
}
