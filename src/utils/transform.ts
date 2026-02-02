/**
 * Convert snake_case string to camelCase
 * Examples: start_date_local → startDateLocal, average_hr → averageHr
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert snake_case string literal to camelCase (type-level)
 * Examples: "start_date_local" → "startDateLocal"
 */
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

/**
 * Transform object keys from snake_case to camelCase (type-level)
 * Preserves value types, handles nested objects and arrays
 */
export type CamelCaseKeys<T> = T extends (infer U)[]
  ? CamelCaseKeys<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T as SnakeToCamel<K & string>]: CamelCaseKeys<T[K]> }
    : T;

/**
 * Convert camelCase string to snake_case
 * Examples: startDateLocal → start_date_local, averageHr → average_hr
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 * Handles nested objects and arrays recursively
 * Preserves null/undefined values
 */
export function transformKeys<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (typeof obj !== "object") return obj;

  const result: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = toCamelCase(key);
    const value = obj[key];
    result[camelKey] = transformKeys(value);
  }
  return result;
}

/**
 * Transform object keys from camelCase to snake_case
 * Handles nested objects and arrays recursively
 * Used for mutations (PUT/POST) to convert user input back to API format
 */
export function transformKeysToSnake<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeysToSnake);
  if (typeof obj !== "object") return obj;

  const result: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = toSnakeCase(key);
    const value = obj[key];
    result[snakeKey] = transformKeysToSnake(value);
  }
  return result;
}
