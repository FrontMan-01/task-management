// Seed runner script
import { runSeeder } from "../src/lib/task-service.ts";

async function main() {
  console.log("Starting DO OR DIE Database Seeder...");
  try {
    const res = await runSeeder();
    console.log("Seeder completed:", res);
    process.exit(0);
  } catch (err) {
    console.error("Seeder failed:", err);
    process.exit(1);
  }
}

main();
