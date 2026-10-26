import { NextRequest, NextResponse } from "next/server";
import { query, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    await initDatabase();
    const res = await query(`SELECT key, value, updated_at FROM app_settings`);
    const settings: Record<string, string> = {};
    for (const row of res.rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch settings", details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await initDatabase();
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const valStr = String(value);

    // SQLite / Postgres upsert
    await query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, valStr]
    );

    return NextResponse.json({ success: true, key, value: valStr });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update setting", details: err.message },
      { status: 500 }
    );
  }
}
