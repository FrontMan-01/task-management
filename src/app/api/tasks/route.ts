import { NextRequest, NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const searchParams = req.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") !== "false";

    const res = await query(
      `SELECT * FROM tasks WHERE active = $1 ORDER BY id ASC`,
      [activeOnly]
    );

    return NextResponse.json({ tasks: res.rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const body = await req.json();
    const {
      title,
      category = "Projects",
      priority = "medium",
      is_recurring = false,
      recurrence_rule = null,
      default_duration_minutes = 30,
      notes = null,
      schedule_for_today = true,
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const insertTaskRes = await query(
      `INSERT INTO tasks (title, category, priority, is_recurring, recurrence_rule, default_duration_minutes, notes, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [
        title,
        category,
        priority,
        Boolean(is_recurring),
        recurrence_rule,
        default_duration_minutes,
        notes,
      ]
    );

    const createdTask = insertTaskRes.rows[0];

    // If requested or non-recurring, create today's instance
    if (schedule_for_today || !is_recurring) {
      const today = getTodayDateString();
      await query(
        `INSERT INTO task_instances (task_id, scheduled_date, status, roll_count)
         VALUES ($1, $2, 'pending', 0)`,
        [createdTask.id, today]
      );
    }

    return NextResponse.json({ task: createdTask }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create task", details: err.message },
      { status: 500 }
    );
  }
}
