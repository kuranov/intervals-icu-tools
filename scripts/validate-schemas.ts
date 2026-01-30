/**
 * Schema Validator
 *
 * Uses the IntervalsClient to make real API calls and reports any schema
 * validation errors in detail. This shows exactly which fields fail and why.
 *
 * Usage:
 *   pnpm tsx scripts/validate-schemas.ts
 *
 * Requires:
 *   - .env file with INTERVALS_API_KEY and INTERVALS_ATHLETE_ID
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { IntervalsClient } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
function loadEnv(): { apiKey: string; athleteId: string } {
  const envPath = resolve(__dirname, "../.env");

  if (!existsSync(envPath)) {
    console.error("Error: .env file not found");
    console.error("Create a .env file with INTERVALS_API_KEY and INTERVALS_ATHLETE_ID");
    process.exit(1);
  }

  const envContent = readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};

  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }

  const apiKey = env.INTERVALS_API_KEY;
  const athleteId = env.INTERVALS_ATHLETE_ID;

  if (!apiKey) {
    console.error("Error: INTERVALS_API_KEY not found in .env");
    process.exit(1);
  }

  if (!athleteId) {
    console.error("Error: INTERVALS_ATHLETE_ID not found in .env");
    process.exit(1);
  }

  return { apiKey, athleteId };
}

// Calculate date range (last 90 days)
function getDateRange(): { oldest: string; newest: string } {
  const now = new Date();
  const oldest = new Date(now);
  oldest.setDate(oldest.getDate() - 90);

  return {
    oldest: oldest.toISOString().split("T")[0],
    newest: now.toISOString().split("T")[0],
  };
}

interface TestResult {
  name: string;
  success: boolean;
  recordCount?: number;
  error?: {
    kind: string;
    message?: string;
    issueCount?: number;
    sampleIssues?: unknown[];
  };
}

async function main() {
  console.log("=== Schema Validation Test ===\n");

  const { apiKey, athleteId } = loadEnv();
  const { oldest, newest } = getDateRange();

  console.log(`Athlete ID: ${athleteId}`);
  console.log(`Date range: ${oldest} to ${newest}\n`);

  const client = new IntervalsClient({
    auth: { type: "apiKey", apiKey },
  });

  const results: TestResult[] = [];

  // Test 1: Athlete Profile
  console.log("[athlete.get]");
  const athleteResult = await client.athletes.get(athleteId);
  if (athleteResult.ok) {
    console.log("  Status: OK");
    results.push({ name: "athlete.get", success: true });
  } else {
    const error = athleteResult.error;
    console.log(`  Status: FAILED (${error.kind})`);
    if (error.kind === "Schema" && "issues" in error) {
      const issues = error.issues as unknown[];
      console.log(`  Issues: ${issues.length}`);
      console.log("  Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));
      results.push({
        name: "athlete.get",
        success: false,
        error: {
          kind: error.kind,
          issueCount: issues.length,
          sampleIssues: issues.slice(0, 5),
        },
      });
    } else {
      results.push({
        name: "athlete.get",
        success: false,
        error: { kind: error.kind, message: String(error) },
      });
    }
  }

  // Test 2: Activities List
  console.log("\n[activities.list]");
  const activitiesResult = await client.activities.list(athleteId, { oldest, newest });
  if (activitiesResult.ok) {
    console.log(`  Status: OK, Records: ${activitiesResult.value.length}`);
    results.push({
      name: "activities.list",
      success: true,
      recordCount: activitiesResult.value.length,
    });
  } else {
    const error = activitiesResult.error;
    console.log(`  Status: FAILED (${error.kind})`);
    if (error.kind === "Schema" && "issues" in error) {
      const issues = error.issues as unknown[];
      console.log(`  Issues: ${issues.length}`);
      console.log("  Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));
      results.push({
        name: "activities.list",
        success: false,
        error: {
          kind: error.kind,
          issueCount: issues.length,
          sampleIssues: issues.slice(0, 5),
        },
      });
    } else {
      results.push({
        name: "activities.list",
        success: false,
        error: { kind: error.kind, message: String(error) },
      });
    }
  }

  // Test 3: Events List
  console.log("\n[events.list]");
  const eventsResult = await client.events.list(athleteId, { oldest, newest });
  if (eventsResult.ok) {
    console.log(`  Status: OK, Records: ${eventsResult.value.length}`);
    results.push({
      name: "events.list",
      success: true,
      recordCount: eventsResult.value.length,
    });
  } else {
    const error = eventsResult.error;
    console.log(`  Status: FAILED (${error.kind})`);
    if (error.kind === "Schema" && "issues" in error) {
      const issues = error.issues as unknown[];
      console.log(`  Issues: ${issues.length}`);
      console.log("  Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));
      results.push({
        name: "events.list",
        success: false,
        error: {
          kind: error.kind,
          issueCount: issues.length,
          sampleIssues: issues.slice(0, 5),
        },
      });
    } else {
      results.push({
        name: "events.list",
        success: false,
        error: { kind: error.kind, message: String(error) },
      });
    }
  }

  // Test 4: Wellness List
  console.log("\n[wellness.list]");
  const wellnessResult = await client.wellness.list(athleteId, { oldest, newest });
  if (wellnessResult.ok) {
    console.log(`  Status: OK, Records: ${wellnessResult.value.length}`);
    results.push({
      name: "wellness.list",
      success: true,
      recordCount: wellnessResult.value.length,
    });
  } else {
    const error = wellnessResult.error;
    console.log(`  Status: FAILED (${error.kind})`);
    if (error.kind === "Schema" && "issues" in error) {
      const issues = error.issues as unknown[];
      console.log(`  Issues: ${issues.length}`);
      console.log("  Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));
      results.push({
        name: "wellness.list",
        success: false,
        error: {
          kind: error.kind,
          issueCount: issues.length,
          sampleIssues: issues.slice(0, 5),
        },
      });
    } else {
      results.push({
        name: "wellness.list",
        success: false,
        error: { kind: error.kind, message: String(error) },
      });
    }
  }

  // Test 5: Athlete Settings
  console.log("\n[athletes.getSettings]");
  const settingsResult = await client.athletes.getSettings(athleteId);
  if (settingsResult.ok) {
    console.log("  Status: OK");
    results.push({ name: "athletes.getSettings", success: true });
  } else {
    const error = settingsResult.error;
    console.log(`  Status: FAILED (${error.kind})`);
    if (error.kind === "Schema" && "issues" in error) {
      const issues = error.issues as unknown[];
      console.log(`  Issues: ${issues.length}`);
      console.log("  Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));
      results.push({
        name: "athletes.getSettings",
        success: false,
        error: {
          kind: error.kind,
          issueCount: issues.length,
          sampleIssues: issues.slice(0, 5),
        },
      });
    } else {
      results.push({
        name: "athletes.getSettings",
        success: false,
        error: { kind: error.kind, message: String(error) },
      });
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("=== Summary ===");
  console.log("=".repeat(60) + "\n");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalIssues = results
    .filter((r) => !r.success && r.error?.issueCount)
    .reduce((sum, r) => sum + (r.error?.issueCount || 0), 0);

  console.log(`Tests passed: ${passed}/${results.length}`);
  console.log(`Tests failed: ${failed}/${results.length}`);
  console.log(`Total schema issues: ${totalIssues}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    for (const result of results.filter((r) => !r.success)) {
      console.log(`  - ${result.name}: ${result.error?.kind} (${result.error?.issueCount || 0} issues)`);
    }
  }

  console.log("\nTo see which fields are causing issues:");
  console.log("  1. Run: pnpm tsx scripts/test-raw-api.ts");
  console.log("  2. Run: pnpm tsx scripts/analyze-nulls.ts");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
