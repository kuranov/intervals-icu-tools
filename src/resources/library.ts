import type { ApiError } from "../errors";
import type { Result } from "../result";
import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeWorkout,
  decodeWorkouts,
  decodeFolder,
  decodeFolders,
  decodeWorkoutTags,
  type Workout,
  type Workouts,
  type Folder,
  type Folders,
  type WorkoutTags,
} from "../schemas/library";
import { transformKeysToSnake } from "../utils/transform";

/**
 * Library resource for managing workout library (workouts, folders, plans)
 */
export class LibraryResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  // ============================================================================
  // Workouts
  // ============================================================================

  /**
   * List all workouts in the athlete's library.
   */
  listWorkouts(athleteId: string | number): Promise<Result<Workouts, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts`,
      {},
      decodeWorkouts
    );
  }

  /**
   * Get a single workout by ID.
   */
  getWorkout(
    athleteId: string | number,
    workoutId: number
  ): Promise<Result<Workout, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts/${workoutId}`,
      {},
      decodeWorkout
    );
  }

  /**
   * Create a new workout in the athlete's library.
   * Accepts workouts in native Intervals.icu format (description field)
   * or file formats (file_contents or file_contents_base64).
   */
  createWorkout(
    athleteId: string | number,
    workout: Partial<Workout>
  ): Promise<Result<Workout, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts`,
      { method: "POST", json: transformKeysToSnake(workout) },
      decodeWorkout
    );
  }

  /**
   * Update a workout.
   */
  updateWorkout(
    athleteId: string | number,
    workoutId: number,
    workout: Partial<Workout>
  ): Promise<Result<Workout, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts/${workoutId}`,
      { method: "PUT", json: transformKeysToSnake(workout) },
      decodeWorkout
    );
  }

  /**
   * Delete a workout.
   */
  deleteWorkout(
    athleteId: string | number,
    workoutId: number
  ): Promise<Result<void, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts/${workoutId}`,
      { method: "DELETE" },
      () => undefined
    );
  }

  /**
   * Create multiple workouts at once.
   */
  createMultipleWorkouts(
    athleteId: string | number,
    workouts: Partial<Workout>[]
  ): Promise<Result<Workouts, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workouts/bulk`,
      { method: "POST", json: transformKeysToSnake(workouts) },
      decodeWorkouts
    );
  }

  // ============================================================================
  // Folders
  // ============================================================================

  /**
   * List all folders and plans (with their workouts).
   */
  listFolders(athleteId: string | number): Promise<Result<Folders, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/folders`,
      {},
      decodeFolders
    );
  }

  /**
   * Create a new folder or plan.
   */
  createFolder(
    athleteId: string | number,
    folder: Partial<Folder>
  ): Promise<Result<Folder, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/folders`,
      { method: "POST", json: transformKeysToSnake(folder) },
      decodeFolder
    );
  }

  /**
   * Update a folder or plan.
   */
  updateFolder(
    athleteId: string | number,
    folderId: number,
    folder: Partial<Folder>
  ): Promise<Result<Folder, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/folders/${folderId}`,
      { method: "PUT", json: transformKeysToSnake(folder) },
      decodeFolder
    );
  }

  /**
   * Delete a folder or plan.
   */
  deleteFolder(
    athleteId: string | number,
    folderId: number
  ): Promise<Result<void, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/folders/${folderId}`,
      { method: "DELETE" },
      () => undefined
    );
  }

  // ============================================================================
  // Tags
  // ============================================================================

  /**
   * List all tags that have been applied to workouts in the library.
   */
  listTags(athleteId: string | number): Promise<Result<WorkoutTags, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/workout-tags`,
      {},
      decodeWorkoutTags
    );
  }
}
