import { NextRequest, NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";
import { getTodayDateString, parseYYYYMMDD } from "@/lib/utils";
import { sendNotificationToAll } from "@/lib/push";

export async function GET(req: NextRequest) {
  return handleReminder(req);
}

export async function POST(req: NextRequest) {
  return handleReminder(req);
}

async function handleReminder(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDatabase();
    const today = getTodayDateString();
    const dateObj = parseYYYYMMDD(today);
    const isSunday = dateObj.getDay() === 0;

    const typeParam = req.nextUrl.searchParams.get("type"); // 'evening' | 'sunday' | auto

    const results: any = {};

    // 1. Sunday Catch-up Reminder
    if (isSunday || typeParam === "sunday") {
      const rolledRes = await query(
        `SELECT COUNT(*) as count FROM task_instances
         WHERE scheduled_date = $1 AND rolled_from_date IS NOT NULL AND status = 'pending'`,
        [today]
      );
      const count = parseInt(rolledRes.rows[0]?.count || "0", 10);
      if (count > 0) {
        results.sundayCatchup = await sendNotificationToAll({
          title: "🎯 Sunday Catch-up: Focus Hour",
          body: `${count} rolled-over tasks are waiting for you today. Clear your debt!`,
          url: "/",
        });
      }
    }

    // 2. Evening Pending Check
    if (typeParam === "evening" || !isSunday || results.sundayCatchup === undefined) {
      const pendingRes = await query(
        `SELECT COUNT(*) as count FROM task_instances
         WHERE scheduled_date = $1 AND status = 'pending'`,
        [today]
      );
      const pendingCount = parseInt(pendingRes.rows[0]?.count || "0", 10);
      if (pendingCount > 0) {
        results.eveningReminder = await sendNotificationToAll({
          title: "⚡ DO OR DIE: Evening Check",
          body: `You have ${pendingCount} task${pendingCount === 1 ? "" : "s"} pending for today. Finish strong!`,
          url: "/",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: any) {
    console.error("Reminder cron error:", err);
    return NextResponse.json(
      { error: "Failed to send reminders", details: err.message },
      { status: 500 }
    );
  }
}
