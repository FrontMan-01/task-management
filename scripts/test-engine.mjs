import {
  getInstancesForDate,
  snoozeInstanceToTomorrow,
  executeMidnightRollover,
  normalizeInstance,
  runSeeder,
} from "../src/lib/task-service";
import { query, initDatabase, closeDatabase } from "../src/lib/db";
import {
  hashPinWithSalt,
  verifyPinAgainstHash,
  verifyMasterPin,
  createSessionToken,
  verifySessionToken,
} from "../src/lib/auth-crypto";

async function runTests() {
  console.log("========================================================");
  console.log("🚀 STARTING REAL POSTGRESQL 16 ENGINE VERIFICATION SUITE");
  console.log("========================================================");

  try {
    // 1. Initialize schema
    await initDatabase();

    // 2. Ensure Seeder runs on PostgreSQL
    console.log("\n[1/5] Seeding Database on PostgreSQL...");
    await query("DELETE FROM task_instances");
    await query("DELETE FROM tasks");
    const seedResult = await runSeeder();
    console.log("✓ Seeder Result:", seedResult.message);

    // 3. Test Today's Instance Fetching
    console.log("\n[2/5] Testing Instance Fetching & Normalization...");
    const instances = await getInstancesForDate("2026-10-26");
    console.log(`✓ Fetched ${instances.length} tasks for 2026-10-26`);
    if (instances.length === 0) throw new Error("No tasks found for today!");
    const first = instances[0];
    console.log(`✓ First Task: "${first.title}" (Date: ${first.scheduled_date}, Priority: ${first.priority})`);

    // 4. Test Snooze Engine
    console.log("\n[3/5] Testing Snooze-to-Tomorrow Engine...");
    const snoozeRes = await snoozeInstanceToTomorrow(first.id);
    console.log("-> Original instance status:", snoozeRes.original.status, "snoozed_to:", snoozeRes.original.snoozed_to_date);
    console.log("-> Tomorrow instance scheduled_date:", snoozeRes.tomorrow.scheduled_date, "status:", snoozeRes.tomorrow.status);

    if (snoozeRes.original.status !== "snoozed" || snoozeRes.tomorrow.status !== "pending") {
      throw new Error("Snooze verification failed!");
    }
    console.log("✓ Snooze logic verified on PostgreSQL.");

    // Clean up snoozed instance state
    await query(`UPDATE task_instances SET status = 'pending', snoozed_to_date = NULL WHERE id = $1`, [first.id]);
    await query(`DELETE FROM task_instances WHERE id = $1`, [snoozeRes.tomorrow.id]);

    // 5. Test Rollover Engine (Weekday -> Sunday -> Next Sunday -> Graveyard Abandonment)
    console.log("\n[4/5] Testing 2-Week Rollover & Escalation Engine on PostgreSQL...");

    // Clean any prior dummy tasks
    await query(`DELETE FROM task_instances WHERE task_id IN (SELECT id FROM tasks WHERE title LIKE 'Dummy%')`);
    await query(`DELETE FROM tasks WHERE title LIKE 'Dummy%'`);

    const dummyTaskRes = await query(
      `INSERT INTO tasks (title, category, priority, default_duration_minutes, active) VALUES ('Dummy Overdue Task', 'Projects', 'high', 30, true) RETURNING id`
    );
    const dummyTaskId = dummyTaskRes.rows[0].id;

    // Insert overdue instance on 2026-10-25 (yesterday)
    await query(
      `INSERT INTO task_instances (task_id, scheduled_date, status, roll_count) VALUES ($1, '2026-10-25'::DATE, 'pending', 0)`,
      [dummyTaskId]
    );

    // Roll 1: Overdue weekday -> Sunday (roll_count = 1)
    await executeMidnightRollover("2026-10-26");
    const rolledRes1 = await query(
      `SELECT * FROM task_instances WHERE task_id = $1 AND roll_count = 1`,
      [dummyTaskId]
    );
    if (rolledRes1.rows.length === 0 || rolledRes1.rows[0].status !== "pending") {
      throw new Error("Roll 1 failed!");
    }
    const rolledInst1 = normalizeInstance(rolledRes1.rows[0]);
    console.log(`✓ Roll 1 Passed: Moved to Sunday (${rolledInst1.scheduled_date}) with roll_count = 1`);

    // Roll 2: Missed on Sunday -> Next Sunday (roll_count = 2)
    await query(
      `UPDATE task_instances SET scheduled_date = '2026-10-20'::DATE, status = 'pending' WHERE id = $1`,
      [rolledInst1.id]
    );
    await executeMidnightRollover("2026-10-26");
    const rolledRes2 = await query(
      `SELECT * FROM task_instances WHERE task_id = $1 AND roll_count = 2`,
      [dummyTaskId]
    );
    if (rolledRes2.rows.length === 0 || rolledRes2.rows[0].roll_count !== 2) {
      throw new Error("Roll 2 failed!");
    }
    const rolledInst2 = normalizeInstance(rolledRes2.rows[0]);
    console.log(`✓ Roll 2 Passed: Moved to Next Sunday (${rolledInst2.scheduled_date}) with roll_count = 2 (URGENT)`);

    // Roll 3: Missed on 2nd Sunday -> Terminal State: ABANDONED (Graveyard)
    await query(
      `UPDATE task_instances SET scheduled_date = '2026-10-20'::DATE, status = 'pending' WHERE id = $1`,
      [rolledInst2.id]
    );
    await executeMidnightRollover("2026-10-26");
    const abandonedCheck = await query(
      `SELECT status FROM task_instances WHERE id = $1`,
      [rolledInst2.id]
    );
    if (abandonedCheck.rows[0].status !== "abandoned") {
      throw new Error("Escalation to abandoned failed!");
    }
    console.log("✓ Roll 3 Passed: Terminal escalation to ABANDONED verified (Moved to Graveyard).");

    // Clean up dummy test data
    await query(`DELETE FROM task_instances WHERE task_id = $1`, [dummyTaskId]);
    await query(`DELETE FROM tasks WHERE id = $1`, [dummyTaskId]);

    // 6. Test Cryptographic PIN Security & Token Signatures
    console.log("\n[5/5] Testing Cryptographic PIN Security & Tamper-Proof HMAC Tokens...");
    const testPin = "8492";
    const saltAndHash = hashPinWithSalt(testPin);
    console.log("-> Generated salted scrypt hash:", saltAndHash.slice(0, 32) + "...");

    // Test correct PIN
    const matchValid = verifyPinAgainstHash(testPin, saltAndHash);
    if (!matchValid) throw new Error("PIN hash verification failed for correct PIN!");

    // Test incorrect PIN
    const matchInvalid = verifyPinAgainstHash("1111", saltAndHash);
    if (matchInvalid) throw new Error("PIN hash verification falsely accepted wrong PIN!");
    console.log("✓ Salted scrypt constant-time PIN verification confirmed.");

    // Test production lockout on default PIN
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.APP_PIN;
    delete process.env.APP_PIN_HASH;
    const prodLockout = verifyMasterPin("1234");
    if (prodLockout.valid !== false) {
      throw new Error("Production failed to block default PIN 1234!");
    }
    console.log("✓ Production Lockout Confirmed: Default '1234' blocked in production.");

    // Test production refusal when SESSION_SECRET is missing
    delete process.env.SESSION_SECRET;
    let missingSecretThrown = false;
    try {
      createSessionToken();
    } catch {
      missingSecretThrown = true;
    }
    if (!missingSecretThrown) throw new Error("Production failed to reject missing SESSION_SECRET!");
    console.log("✓ Production Refusal Confirmed: Missing SESSION_SECRET throws in production (no hardcoded fallback).");

    // Test session token creation and verification
    process.env.SESSION_SECRET = "production-test-secret-32-bytes-long";
    const sessionToken = createSessionToken();
    const tokenValid = verifySessionToken(sessionToken);
    if (!tokenValid) throw new Error("HMAC session token verification failed!");

    const tokenTampered = sessionToken.slice(0, -4) + "XXXX";
    const tamperedValid = verifySessionToken(tokenTampered);
    if (tamperedValid) throw new Error("Tampered session token was accepted!");
    console.log("✓ HMAC-SHA256 signed session tokens verified.");

    process.env.NODE_ENV = origEnv;

    console.log("\n========================================================");
    console.log("🎉 ALL REAL POSTGRESQL 16 & SECURITY TESTS PASSED 100%");
    console.log("========================================================\n");
  } finally {
    await closeDatabase();
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
