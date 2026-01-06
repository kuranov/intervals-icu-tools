import * as v from "valibot";

export const ActivitySchema = v.looseObject({
  id: v.union([v.string(), v.number()]),
  name: v.optional(v.string()),
  type: v.optional(v.string()),
  start_date: v.optional(v.string()),
  start_date_local: v.optional(v.string()),
});

export type Activity = v.InferOutput<typeof ActivitySchema>;

export const ActivitiesSchema = v.array(ActivitySchema);
export type Activities = v.InferOutput<typeof ActivitiesSchema>;

export function decodeActivities(data: unknown): Activities {
  // `valibot.parse` throws an error that carries `issues`, which the HTTP layer
  // surfaces consistently as an `ApiError(kind="Schema")`.
  return v.parse(ActivitiesSchema, data);
}
