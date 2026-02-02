/**
 * Quick test of the library with camelCase types
 */

import { IntervalsClient } from "../src/index";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(): { apiKey: string } {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) {
    console.error("Error: .env file not found");
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

  return { apiKey: env.INTERVALS_API_KEY! };
}

async function main() {
  const { apiKey } = loadEnv();
  const athleteId = "i251940";

  const client = new IntervalsClient({ auth: { type: "apiKey", apiKey } });

  // === ATHLETE PROFILE ===
  console.log("=== ATHLETE PROFILE ===\n");
  const athleteResult = await client.athletes.get(athleteId);
  if (!athleteResult.ok) {
    console.error("Error fetching athlete:", athleteResult.error);
  } else {
    const athlete = athleteResult.value;
    console.log(`Name: ${athlete.name}`);
    console.log(`Email: ${athlete.email}`);
    console.log(`Timezone: ${athlete.timezone}`);
    console.log(`Weight: ${athlete.weight}`);
    console.log(`dateOfBirth: ${athlete.dateOfBirth}`);  // camelCase!
    console.log(`icuRestingHr: ${athlete.icuRestingHr}`);  // camelCase!
    console.log(`icuDateOfBirth: ${athlete.icuDateOfBirth}`);  // camelCase!
    console.log();
  }

  // === ATHLETE SETTINGS ===
  console.log("=== ATHLETE SETTINGS ===\n");
  const settingsResult = await client.athletes.getSettings(athleteId);
  if (!settingsResult.ok) {
    console.error("Error fetching settings:", settingsResult.error);
  } else {
    const settings = settingsResult.value;
    console.log("Settings keys:", Object.keys(settings).slice(0, 10).join(", "), "...");
    console.log();
  }

  // === EVENTS (last 2 weeks) ===
  console.log("=== EVENTS (last 2 weeks) ===\n");
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oldest = twoWeeksAgo.toISOString().split("T")[0];
  const newest = now.toISOString().split("T")[0];

  const eventsResult = await client.events.list(athleteId, { oldest, newest });
  if (!eventsResult.ok) {
    console.error("Error fetching events:", eventsResult.error);
  } else {
    const events = eventsResult.value;
    console.log(`Found ${events.length} events\n`);

    for (const event of events.slice(0, 3)) {
      console.log(`- ${event.name || "(no name)"}`);
      console.log(`  id: ${event.id}`);
      console.log(`  category: ${event.category}`);
      console.log(`  startDateLocal: ${event.startDateLocal}`);  // camelCase!
      if (event.externalId) {
        console.log(`  externalId: ${event.externalId}`);  // camelCase!
      }
      console.log();
    }
  }

  // === ACTIVITIES (last 2 weeks) ===
  console.log("=== ACTIVITIES (last 2 weeks) ===\n");
  const activitiesResult = await client.activities.list(athleteId, { oldest, newest });
  if (!activitiesResult.ok) {
    console.error("Error fetching activities:", activitiesResult.error);
  } else {
    const activities = activitiesResult.value;
    console.log(`Found ${activities.length} activities\n`);

    for (const activity of activities.slice(0, 3)) {
      console.log(`- ${activity.name}`);
      console.log(`  id: ${activity.id}`);
      console.log(`  type: ${activity.type}`);
      console.log(`  startDateLocal: ${activity.startDateLocal}`);  // camelCase!
      console.log(`  movingTime: ${activity.movingTime}`);  // camelCase!
      console.log(`  icuTrainingLoad: ${activity.icuTrainingLoad}`);  // camelCase!
      console.log();
    }
  }

  console.log("=== ALL TESTS PASSED ===");
}

main().catch(console.error);
