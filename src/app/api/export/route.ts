import { NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    await initDatabase();

    const tasksRes = await query(`SELECT * FROM tasks ORDER BY id ASC`);
    const instancesRes = await query(`SELECT * FROM task_instances ORDER BY scheduled_date ASC, id ASC`);
    const notesRes = await query(`SELECT * FROM daily_notes ORDER BY date ASC`);
    const settingsRes = await query(`SELECT * FROM app_settings ORDER BY key ASC`);

    const exportPayload = {
      app: "DO OR DIE",
      version: "2.0.0",
      exported_at: new Date().toISOString(),
      data: {
        tasks: tasksRes.rows,
        task_instances: instancesRes.rows,
        daily_notes: notesRes.rows,
        app_settings: settingsRes.rows,
      },
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="do-or-die-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to export data", details: err.message },
      { status: 500 }
    );
  }
}
