import * as v from "valibot";
import { ActivityTypeSchema } from "./common";
import { transformKeys, type CamelCaseKeys } from "../utils/transform";

/**
 * Folder/Plan type enum
 */
export const FolderTypeSchema = v.picklist(["FOLDER", "PLAN"]);

/**
 * Visibility enum for folders/plans
 */
export const VisibilitySchema = v.picklist(["PRIVATE", "PUBLIC"]);

/**
 * Workout schema (minimal fields, allows extra via looseObject, raw)
 * The API doesn't fully document all workout fields in the OpenAPI spec,
 * so we use looseObject to accept whatever the API returns.
 */
const WorkoutSchemaRaw = v.looseObject({
  // Required fields (API always returns these for existing workouts)
  id: v.number(),
  name: v.string(),

  // Optional fields
  description: v.nullish(v.string()),
  folder_id: v.nullish(v.number()),
  activity_type: v.nullish(ActivityTypeSchema),
  file_contents: v.nullish(v.string()),
  file_contents_base64: v.nullish(v.string()),
  tags: v.nullish(v.array(v.string())),
});

export const WorkoutSchema = v.pipe(WorkoutSchemaRaw, v.transform(transformKeys));
export type Workout = CamelCaseKeys<v.InferOutput<typeof WorkoutSchemaRaw>>;

/**
 * Array of workouts
 */
export const WorkoutsSchema = v.array(WorkoutSchema);
export type Workouts = Workout[];

/**
 * Folder schema for organizing workouts (raw)
 */
const FolderSchemaRaw = v.looseObject({
  // Required fields (API always returns these)
  id: v.number(),
  type: FolderTypeSchema,
  name: v.string(),

  // Optional fields
  athlete_id: v.nullish(v.string()),
  description: v.nullish(v.string()),
  children: v.nullish(v.array(WorkoutSchema)),
  visibility: v.nullish(VisibilitySchema),
  start_date_local: v.nullish(v.string()),
  rollout_weeks: v.nullish(v.number()),
  auto_rollout_day: v.nullish(v.number()),
  read_only_workouts: v.nullish(v.boolean()),
  starting_ctl: v.nullish(v.number()),
  starting_atl: v.nullish(v.number()),
  activity_types: v.nullish(v.array(v.nullish(ActivityTypeSchema))),
});

export const FolderSchema = v.pipe(FolderSchemaRaw, v.transform(transformKeys));
export type Folder = CamelCaseKeys<v.InferOutput<typeof FolderSchemaRaw>>;

/**
 * Array of folders
 */
export const FoldersSchema = v.array(FolderSchema);
export type Folders = Folder[];

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
