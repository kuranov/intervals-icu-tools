/**
 * Null Field Analyzer
 *
 * Analyzes saved JSON responses from test-raw-api.ts and reports all fields
 * that contain `null` values. This helps identify which schema fields need
 * to be changed from `v.optional()` to `v.nullish()`.
 *
 * Usage:
 *   pnpm tsx scripts/analyze-nulls.ts
 *
 * Requires:
 *   - Run test-raw-api.ts first to generate response files
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "output");

interface NullFieldInfo {
  count: number;
  sampleValues: (null | undefined)[];
  parentType: string;
}

type NullFieldsMap = Map<string, NullFieldInfo>;

// Recursively scan an object for null fields
function scanForNulls(
  obj: unknown,
  path: string,
  nullFields: NullFieldsMap,
  parentType: string
): void {
  if (obj === null) {
    const existing = nullFields.get(path);
    if (existing) {
      existing.count++;
    } else {
      nullFields.set(path, {
        count: 1,
        sampleValues: [null],
        parentType,
      });
    }
    return;
  }

  if (obj === undefined) {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      scanForNulls(obj[i], `${path}[]`, nullFields, parentType);
    }
    return;
  }

  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      scanForNulls(value, newPath, nullFields, parentType);
    }
  }
}

// Convert snake_case to camelCase (to match our schema field names)
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Format field path with camelCase conversion
function formatFieldPath(path: string): string {
  return path
    .split(".")
    .map((part) => {
      if (part === "[]") return "[]";
      return toCamelCase(part);
    })
    .join(".");
}

function main() {
  console.log("=== Null Field Analyzer ===\n");

  if (!existsSync(OUTPUT_DIR)) {
    console.error("Error: Output directory not found");
    console.error("Run test-raw-api.ts first: pnpm tsx scripts/test-raw-api.ts");
    process.exit(1);
  }

  const files = readdirSync(OUTPUT_DIR).filter(
    (f) => f.endsWith(".json") && !f.startsWith("_")
  );

  if (files.length === 0) {
    console.error("Error: No JSON response files found");
    console.error("Run test-raw-api.ts first: pnpm tsx scripts/test-raw-api.ts");
    process.exit(1);
  }

  const allNullFields: NullFieldsMap = new Map();
  const fileStats: Record<string, { records: number; nullFields: number }> = {};

  for (const file of files) {
    const filePath = resolve(OUTPUT_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    const resourceName = file.replace(".json", "");

    console.log(`\n[${resourceName}]`);

    const nullFields: NullFieldsMap = new Map();

    if (Array.isArray(data)) {
      console.log(`  Records: ${data.length}`);
      for (const item of data) {
        scanForNulls(item, "", nullFields, resourceName);
      }
    } else {
      console.log("  Records: 1 (single object)");
      scanForNulls(data, "", nullFields, resourceName);
    }

    fileStats[resourceName] = {
      records: Array.isArray(data) ? data.length : 1,
      nullFields: nullFields.size,
    };

    console.log(`  Fields with null: ${nullFields.size}`);

    // Merge into global map
    for (const [path, info] of nullFields) {
      const existing = allNullFields.get(path);
      if (existing) {
        existing.count += info.count;
      } else {
        allNullFields.set(path, { ...info });
      }
    }
  }

  // Sort by count (most frequent first)
  const sortedFields = [...allNullFields.entries()].sort(
    (a, b) => b[1].count - a[1].count
  );

  console.log("\n" + "=".repeat(60));
  console.log("=== Fields That Return NULL ===");
  console.log("=".repeat(60) + "\n");

  console.log("These fields need to be changed from v.optional() to v.nullish():\n");

  // Group by resource type
  const byResource = new Map<string, { path: string; count: number }[]>();

  for (const [path, info] of sortedFields) {
    const resource = info.parentType;
    if (!byResource.has(resource)) {
      byResource.set(resource, []);
    }
    byResource.get(resource)!.push({ path, count: info.count });
  }

  for (const [resource, fields] of byResource) {
    console.log(`\n--- ${resource} ---`);
    for (const { path, count } of fields) {
      const camelPath = formatFieldPath(path);
      console.log(`  ${camelPath}: null (${count}x)`);
    }
  }

  // Generate recommended schema changes
  console.log("\n" + "=".repeat(60));
  console.log("=== Recommended Schema Changes ===");
  console.log("=".repeat(60) + "\n");

  console.log("For each field listed above, change:");
  console.log("  FROM: v.optional(v.string())");
  console.log("  TO:   v.nullish(v.string())\n");

  console.log("Or for number fields:");
  console.log("  FROM: v.optional(v.number())");
  console.log("  TO:   v.nullish(v.number())\n");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("=== Summary ===");
  console.log("=".repeat(60) + "\n");

  console.log(`Total unique fields with null values: ${allNullFields.size}`);
  console.log(`Total null occurrences: ${sortedFields.reduce((sum, [, info]) => sum + info.count, 0)}`);

  console.log("\nFile breakdown:");
  for (const [resource, stats] of Object.entries(fileStats)) {
    console.log(`  ${resource}: ${stats.records} records, ${stats.nullFields} null fields`);
  }
}

main();
