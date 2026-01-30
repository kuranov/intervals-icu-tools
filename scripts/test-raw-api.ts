/**
 * Raw API Tester
 *
 * Makes direct HTTP calls to the Intervals.icu API (bypassing our schema validation)
 * to capture raw response structures. This helps identify fields that return `null`
 * which our current schemas may not handle correctly.
 *
 * Usage:
 *   pnpm tsx scripts/test-raw-api.ts
 *
 * Requires:
 *   - .env file with INTERVALS_API_KEY and INTERVALS_ATHLETE_ID
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "output");

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

// Make authenticated request to Intervals.icu API
async function fetchApi(
  apiKey: string,
  endpoint: string
): Promise<{ status: number; data: unknown }> {
  const baseUrl = "https://intervals.icu/api/v1";
  const url = `${baseUrl}${endpoint}`;

  const token = Buffer.from(`API_KEY:${apiKey}`).toString("base64");

  console.log(`  Fetching: ${endpoint}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Save response to file
function saveResponse(name: string, data: unknown): void {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filePath = resolve(OUTPUT_DIR, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Saved: ${filePath}`);
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

interface EndpointConfig {
  name: string;
  path: string;
}

async function main() {
  console.log("=== Intervals.icu Raw API Tester ===\n");

  const { apiKey, athleteId } = loadEnv();
  const { oldest, newest } = getDateRange();

  console.log(`Athlete ID: ${athleteId}`);
  console.log(`Date range: ${oldest} to ${newest}\n`);

  const endpoints: EndpointConfig[] = [
    {
      name: "athlete-profile",
      path: `/athlete/${athleteId}`,
    },
    {
      name: "activities",
      path: `/athlete/${athleteId}/activities?oldest=${oldest}&newest=${newest}`,
    },
    {
      name: "events",
      path: `/athlete/${athleteId}/events?oldest=${oldest}&newest=${newest}`,
    },
    {
      name: "wellness",
      path: `/athlete/${athleteId}/wellness?oldest=${oldest}&newest=${newest}`,
    },
    {
      name: "athlete-settings",
      path: `/athlete/${athleteId}/settings`,
    },
  ];

  const results: Record<string, { status: number; recordCount?: number }> = {};

  for (const endpoint of endpoints) {
    console.log(`\n[${endpoint.name}]`);
    try {
      const { status, data } = await fetchApi(apiKey, endpoint.path);
      results[endpoint.name] = { status };

      if (Array.isArray(data)) {
        results[endpoint.name].recordCount = data.length;
        console.log(`  Status: ${status}, Records: ${data.length}`);
      } else {
        console.log(`  Status: ${status}`);
      }

      saveResponse(endpoint.name, data);
    } catch (error) {
      console.error(`  Error: ${error instanceof Error ? error.message : error}`);
      results[endpoint.name] = { status: -1 };
    }
  }

  // Save summary
  console.log("\n=== Summary ===");
  saveResponse("_summary", {
    timestamp: new Date().toISOString(),
    athleteId,
    dateRange: { oldest, newest },
    results,
  });

  console.log("\nDone! Raw API responses saved to scripts/output/");
  console.log("Next steps:");
  console.log("  1. Run: pnpm tsx scripts/analyze-nulls.ts");
  console.log("  2. Run: pnpm tsx scripts/validate-schemas.ts");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
